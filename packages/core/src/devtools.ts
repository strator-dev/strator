import type { Path } from "./types.ts";

/** How a binding scoped a model instance. `standalone` is anything created outside a binding hook. */
export type ModelScope = "global" | "shared" | "local" | "standalone";

/** What a binding knows about an instance it creates. Every field is optional. */
export interface ModelMeta {
  /** The key the binding stores the instance under. */
  key?: string;
  scope?: ModelScope;
  /** The binding that created it, e.g. `@strator/react`. */
  source?: string;
  /** Identity of the provider / app that owns the instance. */
  container?: object;
}

/** Handed to the devtools hook when an instance is created through `Model.withInternalState` / `withExternalState`. */
export interface DevtoolsModelHandle {
  instance: object;
  /** The model class. */
  ctor: Function;
  meta: ModelMeta;
  /** Raw (unproxied) current state. */
  getState(): object;
  /** Replaces the whole state and notifies bindings. Missing for models backed by external state. */
  replaceState?(next: object): void;
}

export interface DevtoolsActionStart {
  id: number;
  action: string;
  args: unknown[];
  /** The action that was running (synchronously) when this one was called. */
  parentId?: number;
}

export interface DevtoolsActionEnd {
  id: number;
  status: "done" | "threw";
  result?: unknown;
  error?: unknown;
  /** The method returned a promise; `result` / `error` is what it settled with. */
  async: boolean;
}

export interface DevtoolsStateChange {
  path: Path;
  isArray?: boolean;
  /** The innermost running action of this instance, when the change happened inside one synchronously. */
  actionId?: number;
}

/** Information a binding reports about one consumer (a component) of an instance. */
export interface DevtoolsSubscriber {
  /** Hook that was used, e.g. `useGlobalModel`. */
  hook: string;
  /** Best-effort component name. */
  component?: string;
  /** Best-effort source location of the component. */
  file?: string;
  /** Source of the selector function, if any. */
  selector?: string;
  /** Number of renders; bindings may mutate this field in place. */
  renders: number;
}

/** A provider / app instance that owns models. */
export interface DevtoolsContainer {
  source: string;
  id: object;
}

/**
 * Receives everything Strator does while devtools are installed. Installed by `@strator/devtools`;
 * nothing is reported (and nothing extra is computed) while no hook is set.
 */
export interface DevtoolsHook {
  registerModel(handle: DevtoolsModelHandle): void;
  disposeModel(instance: object): void;
  actionStart(instance: object, event: DevtoolsActionStart): void;
  actionEnd(instance: object, event: DevtoolsActionEnd): void;
  stateChange(instance: object, event: DevtoolsStateChange): void;
  /** Returns a function that removes the subscriber. */
  addSubscriber(instance: object, subscriber: DevtoolsSubscriber): () => void;
  /** Returns a function that removes the container. */
  registerContainer(container: DevtoolsContainer): () => void;
}

// Symbol.for so that duplicated copies of @strator/core in one app share the hook.
const HOOK_KEY = Symbol.for("strator.devtools.hook");

export function getDevtoolsHook(): DevtoolsHook | undefined {
  return (globalThis as Record<symbol, DevtoolsHook | undefined>)[HOOK_KEY];
}

/** Installs (or with `undefined`, removes) the devtools hook. Returns the previous hook. */
export function setDevtoolsHook(hook: DevtoolsHook | undefined): DevtoolsHook | undefined {
  const previous = getDevtoolsHook();
  (globalThis as Record<symbol, DevtoolsHook | undefined>)[HOOK_KEY] = hook;
  return previous;
}

/** Calls the hook, never letting a devtools failure break the app. */
export function reportToDevtools(report: (hook: DevtoolsHook) => void): void {
  const hook = getDevtoolsHook();
  if (!hook) return;
  try {
    report(hook);
  } catch (error) {
    console.error("[strator] devtools hook failed", error);
  }
}
