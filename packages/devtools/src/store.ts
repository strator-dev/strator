import {
  type DevtoolsActionEnd,
  type DevtoolsActionStart,
  type DevtoolsContainer,
  type DevtoolsHook,
  type DevtoolsModelHandle,
  type DevtoolsStateChange,
  type DevtoolsSubscriber,
  getDevtoolsHook,
  type ModelScope,
  setDevtoolsHook,
} from "@strator/core";
import { cloneValue, diffValues, type StateChange, toJSONValue } from "./values.ts";

export type ActionStatus = "pending" | "done" | "threw" | "lifecycle" | "external";

export interface InstanceRecord {
  /** Stable id inside devtools. */
  uid: number;
  handle: DevtoolsModelHandle;
  model: string;
  key: string;
  scope: ModelScope;
  source?: string;
  /** Number of state writes since creation. */
  version: number;
  createdAt: number;
  disposed: boolean;
  disposedAt?: number;
  /** Subscribers at the moment of disposal, for the inspector. */
  subscribersAtDispose?: number;
  subscribers: Set<DevtoolsSubscriber>;
  /** Last captured copy of the state. */
  snapshot: unknown;
}

export interface ActionRecord {
  id: number;
  instanceUid: number;
  method: string;
  args: unknown[];
  status: ActionStatus;
  isAsync: boolean;
  parentId?: number;
  depth: number;
  /** Milliseconds since devtools were installed. */
  time: number;
  /** Wall clock (`Date.now()`). */
  timestamp: number;
  duration?: number;
  result?: unknown;
  error?: { name: string; message: string; stack?: string };
  /** Leaf changes in the order they were written. */
  changes: StateChange[];
  /** State of the instance right before the call. */
  before: unknown;
  /** State once the call finished. */
  after?: unknown;
  /** Lifecycle / external entries: what happened. */
  note?: string;
}

interface InternalInstance extends InstanceRecord {
  dirty: boolean;
  dirtyAction?: number;
  flushScheduled: boolean;
}

export interface DevtoolsStoreOptions {
  /** Oldest entries are dropped beyond this. Default 1000. */
  maxActions?: number;
  /** Disposed instances kept around for inspection. Default 30. */
  maxDisposed?: number;
}

const now = (): number => (typeof performance !== "undefined" ? performance.now() : Date.now());

function errorInfo(error: unknown): ActionRecord["error"] {
  if (error instanceof Error) return { name: error.name, message: error.message, stack: error.stack };
  return { name: "Thrown value", message: String(toJSONValue(error) ?? error) };
}

/**
 * Collects everything Strator reports while devtools are installed: model instances, method calls and
 * the state changes they cause. Framework-agnostic; the panel renders from it.
 */
export class DevtoolsStore implements DevtoolsHook {
  public instances: InstanceRecord[] = [];
  public actions: ActionRecord[] = [];
  public containers: DevtoolsContainer[] = [];
  public recording = true;
  /** Changes on every update; use it as a snapshot marker. */
  public revision = 0;

  private readonly byInstance = new WeakMap<object, InternalInstance>();
  private readonly actionsById = new Map<number, ActionRecord>();
  private readonly listeners = new Set<() => void>();
  private readonly startedAt = now();
  private nextUid = 1;
  private nextLocalId = -1;
  private notifyScheduled = false;
  private replacing?: string;
  private readonly maxActions: number;
  private readonly maxDisposed: number;

  public constructor(options: DevtoolsStoreOptions = {}) {
    this.maxActions = options.maxActions ?? 1000;
    this.maxDisposed = options.maxDisposed ?? 30;
  }

  // ------------------------------------------------------------------ subscription

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public getRevision = (): number => this.revision;

  private notify(): void {
    this.revision += 1;
    if (this.notifyScheduled) return;
    this.notifyScheduled = true;
    // Batched: hooks are called during the app's renders, where updating another tree is not allowed.
    queueMicrotask(() => {
      this.notifyScheduled = false;
      for (const listener of this.listeners) listener();
    });
  }

  // ------------------------------------------------------------------ DevtoolsHook

  public registerModel(handle: DevtoolsModelHandle): void {
    if (this.byInstance.has(handle.instance)) return;
    const record: InternalInstance = {
      uid: this.nextUid++,
      handle,
      model: handle.ctor.name || "AnonymousModel",
      key: handle.meta.key ?? handle.ctor.name ?? "",
      scope: handle.meta.scope ?? "standalone",
      source: handle.meta.source,
      version: 0,
      createdAt: now() - this.startedAt,
      disposed: false,
      subscribers: new Set(),
      snapshot: cloneValue(handle.getState()),
      dirty: false,
      flushScheduled: false,
    };
    this.byInstance.set(handle.instance, record);
    this.instances.push(record);
    this.notify();
  }

  public disposeModel(instance: object): void {
    const record = this.byInstance.get(instance);
    if (!record || record.disposed) return;
    this.flush(record);
    record.disposed = true;
    record.disposedAt = now() - this.startedAt;
    record.subscribersAtDispose = record.subscribers.size;
    if (this.recording) {
      this.pushAction({
        id: this.nextLocalId--,
        instanceUid: record.uid,
        method: "dispose",
        args: [],
        status: "lifecycle",
        isAsync: false,
        depth: 0,
        time: record.disposedAt,
        timestamp: Date.now(),
        changes: [],
        before: record.snapshot,
        after: record.snapshot,
        note: "The last consumer released the instance; this is its final state.",
      });
    }
    this.pruneDisposed();
    this.notify();
  }

  public actionStart(instance: object, event: DevtoolsActionStart): void {
    const record = this.byInstance.get(instance);
    if (!record) return;
    this.flush(record);
    if (!this.recording) return;
    const parent = event.parentId === undefined ? undefined : this.actionsById.get(event.parentId);
    this.pushAction({
      id: event.id,
      instanceUid: record.uid,
      method: event.action,
      args: cloneValue(event.args),
      status: "pending",
      isAsync: false,
      parentId: parent?.id,
      depth: parent ? parent.depth + 1 : 0,
      time: now() - this.startedAt,
      timestamp: Date.now(),
      changes: [],
      before: record.snapshot,
    });
    this.notify();
  }

  public actionEnd(instance: object, event: DevtoolsActionEnd): void {
    const record = this.byInstance.get(instance);
    if (!record) return;
    this.flush(record);
    const action = this.actionsById.get(event.id);
    if (!action) return;
    action.status = event.status;
    action.isAsync = event.async;
    action.duration = now() - this.startedAt - action.time;
    if (event.status === "done") action.result = cloneValue(event.result);
    else action.error = errorInfo(event.error);
    action.after = record.snapshot;
    this.notify();
  }

  public stateChange(instance: object, event: DevtoolsStateChange): void {
    const record = this.byInstance.get(instance);
    if (!record) return;
    record.version += 1;
    if (record.dirty && event.actionId !== undefined && event.actionId !== record.dirtyAction) {
      // A different action started writing before the previous batch was captured.
      this.flush(record);
    }
    if (!record.dirty) {
      record.dirty = true;
      record.dirtyAction = event.actionId ?? this.pendingAsyncAction(record);
    }
    if (!record.flushScheduled) {
      record.flushScheduled = true;
      queueMicrotask(() => {
        record.flushScheduled = false;
        this.flush(record);
      });
    }
    this.notify();
  }

  public addSubscriber(instance: object, subscriber: DevtoolsSubscriber): () => void {
    const record = this.byInstance.get(instance);
    if (!record) return () => {};
    record.subscribers.add(subscriber);
    this.notify();
    return () => {
      record.subscribers.delete(subscriber);
      this.notify();
    };
  }

  public registerContainer(container: DevtoolsContainer): () => void {
    this.containers.push(container);
    this.notify();
    return () => {
      this.containers = this.containers.filter(c => c !== container);
      this.notify();
    };
  }

  // ------------------------------------------------------------------ change capture

  /** The most recent still-running async call of this instance: where awaited writes belong. */
  private pendingAsyncAction(record: InternalInstance): number | undefined {
    for (let i = this.actions.length - 1; i >= 0; i--) {
      const action = this.actions[i]!;
      if (action.instanceUid === record.uid && action.status === "pending") return action.id;
    }
    return undefined;
  }

  private flush(record: InternalInstance): void {
    if (!record.dirty) return;
    record.dirty = false;
    const actionId = record.dirtyAction;
    record.dirtyAction = undefined;
    const next = cloneValue(record.handle.getState());
    const changes = diffValues(record.snapshot, next);
    const previous = record.snapshot;
    record.snapshot = next;
    if (changes.length === 0) return;

    const action = actionId === undefined ? undefined : this.actionsById.get(actionId);
    if (action) {
      // Nested calls on the same instance also count towards their callers.
      for (let current: ActionRecord | undefined = action; current;) {
        if (current.instanceUid === record.uid) current.changes.push(...changes);
        current = current.parentId === undefined ? undefined : this.actionsById.get(current.parentId);
      }
    } else if (this.recording) {
      this.pushAction({
        id: this.nextLocalId--,
        instanceUid: record.uid,
        method: this.replacing ?? "(external update)",
        args: [],
        status: "external",
        isAsync: false,
        depth: 0,
        time: now() - this.startedAt,
        timestamp: Date.now(),
        changes,
        before: previous,
        after: next,
        note: this.replacing
          ? "State replaced from devtools."
          : "State changed outside a model method, e.g. an external store or a replaced state.",
      });
    }
    this.notify();
  }

  private pushAction(action: ActionRecord): void {
    this.actions.push(action);
    this.actionsById.set(action.id, action);
    if (this.actions.length > this.maxActions) {
      const removed = this.actions.splice(0, this.actions.length - this.maxActions);
      for (const old of removed) this.actionsById.delete(old.id);
    }
  }

  private pruneDisposed(): void {
    const disposed = this.instances.filter(i => i.disposed);
    if (disposed.length <= this.maxDisposed) return;
    const drop = new Set(disposed.slice(0, disposed.length - this.maxDisposed).map(i => i.uid));
    this.instances = this.instances.filter(i => !drop.has(i.uid));
    this.actions = this.actions.filter(a => {
      if (!drop.has(a.instanceUid)) return true;
      this.actionsById.delete(a.id);
      return false;
    });
  }

  // ------------------------------------------------------------------ commands from the panel

  public getInstance(uid: number): InstanceRecord | undefined {
    return this.instances.find(i => i.uid === uid);
  }

  public getAction(id: number): ActionRecord | undefined {
    return this.actionsById.get(id);
  }

  public setRecording(recording: boolean): void {
    this.recording = recording;
    this.notify();
  }

  public clear(): void {
    this.actions = [];
    this.actionsById.clear();
    this.instances = this.instances.filter(i => !i.disposed);
    this.notify();
  }

  /** Replaces the instance's state, e.g. to jump back to the state before an action. */
  public replaceState(uid: number, state: unknown, label = "devtools: replace state"): boolean {
    const record = this.getInstance(uid) as InternalInstance | undefined;
    if (!record || record.disposed || !record.handle.replaceState) return false;
    this.flush(record);
    this.replacing = label;
    try {
      record.handle.replaceState(cloneValue(state) as object);
      this.flush(record);
    } finally {
      this.replacing = undefined;
    }
    return true;
  }

  /** Calls the action's method again with a copy of its original arguments. */
  public dispatchAgain(actionId: number): unknown {
    const action = this.getAction(actionId);
    const record = action && this.getInstance(action.instanceUid);
    if (!action || !record || record.disposed) return undefined;
    const method = (record.handle.instance as Record<string, unknown>)[action.method];
    if (typeof method !== "function") return undefined;
    return method.apply(record.handle.instance, cloneValue(action.args));
  }

  /** Everything captured, JSON-safe, for "Export session". */
  public exportSession(): unknown {
    return {
      exportedAt: new Date().toISOString(),
      instances: this.instances.map(i => ({
        uid: i.uid,
        model: i.model,
        key: i.key,
        scope: i.scope,
        source: i.source,
        version: i.version,
        disposed: i.disposed,
        subscribers: i.subscribers.size,
        state: toJSONValue(i.snapshot),
      })),
      actions: this.actions.map(a => ({
        id: a.id,
        instance: a.instanceUid,
        method: a.method,
        args: toJSONValue(a.args),
        status: a.status,
        async: a.isAsync,
        parentId: a.parentId,
        time: Math.round(a.time * 1000) / 1000,
        duration: a.duration === undefined ? undefined : Math.round(a.duration * 1000) / 1000,
        result: toJSONValue(a.result),
        error: a.error,
        changes: a.changes.map(c => ({ path: c.path, before: toJSONValue(c.before), after: toJSONValue(c.after) })),
        note: a.note,
      })),
    };
  }
}

const STORE_KEY = Symbol.for("strator.devtools.store");

/**
 * Installs the devtools hook (once per page) and returns the store collecting the data. Models created
 * before this runs are not tracked, so import `@strator/devtools` before rendering the app.
 */
export function installDevtools(options?: DevtoolsStoreOptions): DevtoolsStore {
  const globals = globalThis as Record<symbol, DevtoolsStore | undefined>;
  let store = globals[STORE_KEY];
  if (!store) {
    store = new DevtoolsStore(options);
    globals[STORE_KEY] = store;
  }
  if (getDevtoolsHook() !== store) setDevtoolsHook(store);
  return store;
}

/** Removes the hook; the store keeps what it already captured. */
export function uninstallDevtools(): void {
  const globals = globalThis as Record<symbol, DevtoolsStore | undefined>;
  if (getDevtoolsHook() === globals[STORE_KEY]) setDevtoolsHook(undefined);
}
