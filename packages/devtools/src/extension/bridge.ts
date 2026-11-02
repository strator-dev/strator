import { type ActionRecord, type DevtoolsStore, type InstanceRecord, installDevtools } from "../store.ts";
import {
  decodeValue,
  ENVELOPE,
  encodeValue,
  type PageMessage,
  type PanelMessage,
  type WireAction,
  type WireInstance,
} from "./protocol.ts";

function wireInstance(instance: InstanceRecord): WireInstance {
  return {
    uid: instance.uid,
    model: instance.model,
    key: instance.key,
    scope: instance.scope,
    source: instance.source,
    version: instance.version,
    createdAt: instance.createdAt,
    disposed: instance.disposed,
    disposedAt: instance.disposedAt,
    subscribersAtDispose: instance.subscribersAtDispose,
    subscribers: [...instance.subscribers].map(s => ({ ...s })),
    snapshot: encodeValue(instance.snapshot),
    canReplace: instance.canReplace,
  };
}

function wireAction(action: ActionRecord): WireAction {
  return {
    ...action,
    args: encodeValue(action.args),
    result: encodeValue(action.result),
    before: encodeValue(action.before),
    after: encodeValue(action.after),
    changes: action.changes.map(c => ({ path: c.path, before: encodeValue(c.before), after: encodeValue(c.after) })),
  };
}

const SYNC_INTERVAL = 100;

/**
 * Runs in the inspected page (the extension injects it before the app's scripts). Installs the devtools
 * hook and, once a panel asks, streams what the store captures and carries out the panel's commands.
 */
export function startPageBridge(store: DevtoolsStore = installDevtools()): () => void {
  let connected = false;
  let lastRev = 0;
  let lastActionCount = -1;
  let forceReset = true;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let announced = false;

  const post = (message: PageMessage) => {
    window.postMessage({ [ENVELOPE]: "page", message }, "*");
  };

  const sync = () => {
    timer = undefined;
    if (!connected) return;
    // A shrinking log means it was cleared or trimmed; a reset keeps the panel's copy exact.
    const reset = forceReset || store.actions.length < lastActionCount;
    forceReset = false;
    const changed = store.actions.filter(a => reset || (a.rev ?? 0) > lastRev);
    for (const action of store.actions) lastRev = Math.max(lastRev, action.rev ?? 0);
    lastActionCount = store.actions.length;
    post({
      kind: "sync",
      reset,
      host: location.host,
      recording: store.recording,
      containers: store.containers.map(c => ({ source: c.source })),
      instances: (store.instances as InstanceRecord[]).map(wireInstance),
      actionIds: store.actions.map(a => a.id),
      actions: changed.map(wireAction),
    });
  };

  const schedule = () => {
    if (timer === undefined) timer = setTimeout(sync, SYNC_INTERVAL);
  };

  const unsubscribe = store.subscribe(() => {
    if (!announced && store.instances.length > 0) {
      // Only pages that actually use Strator talk to the extension.
      announced = true;
      post({ kind: "hello" });
    }
    if (connected) schedule();
  });

  const onMessage = (event: MessageEvent) => {
    if (event.source !== window) return;
    const data = event.data as Record<string, unknown> | null;
    if (!data || data[ENVELOPE] !== "panel") return;
    const message = data.message as PanelMessage;
    switch (message.kind) {
      case "init":
        connected = true;
        forceReset = true;
        lastRev = 0;
        sync();
        break;
      case "setRecording":
        store.setRecording(message.recording);
        break;
      case "clear":
        store.clear();
        break;
      case "replaceState":
        // Only JSON state is editable, so decoding gives back exactly what the panel showed.
        store.replaceState(message.uid, decodeValue(message.state), message.label);
        break;
      case "jumpBefore":
        store.jumpBefore(message.actionId);
        break;
      case "dispatchAgain":
        try {
          const result = store.dispatchAgain(message.actionId);
          if (result instanceof Promise) result.catch(() => {});
        } catch {
          // Captured in the log like any other failing call.
        }
        break;
      case "export":
        post({ kind: "export", requestId: message.requestId, data: store.exportSession() });
        break;
    }
  };
  window.addEventListener("message", onMessage);

  if (store.instances.length > 0) {
    announced = true;
    post({ kind: "hello" });
  }

  return () => {
    unsubscribe();
    window.removeEventListener("message", onMessage);
    if (timer !== undefined) clearTimeout(timer);
  };
}
