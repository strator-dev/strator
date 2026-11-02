import type { ActionRecord, DevtoolsSource, InstanceView } from "../store.ts";
import type { Port } from "./browser.ts";
import {
  type ConnectionMessage,
  decodeValue,
  encodeValue,
  type PageMessage,
  type PanelMessage,
  type WireAction,
  type WireInstance,
} from "./protocol.ts";

function decodeInstance(wire: WireInstance): InstanceView {
  return { ...wire, subscribers: new Set(wire.subscribers), snapshot: decodeValue(wire.snapshot) };
}

function decodeAction(wire: WireAction): ActionRecord {
  return {
    ...wire,
    args: decodeValue(wire.args) as unknown[],
    result: decodeValue(wire.result),
    before: decodeValue(wire.before),
    after: decodeValue(wire.after),
    changes: wire.changes.map(c => ({ path: c.path, before: decodeValue(c.before), after: decodeValue(c.after) })),
  };
}

/** A mirror of the inspected page's store, kept in sync over the extension's messaging. */
export class RemoteDevtoolsSource implements DevtoolsSource {
  public instances: InstanceView[] = [];
  public actions: ActionRecord[] = [];
  public containers: Array<{ source: string }> = [];
  public recording = true;
  public host?: string = "waiting for page…";
  public connected = false;

  private revision = 0;
  private readonly byId = new Map<number, ActionRecord>();
  private readonly listeners = new Set<() => void>();
  private readonly exports = new Map<number, (data: unknown) => void>();
  private nextRequest = 1;

  public constructor(private readonly port: Port) {
    port.onMessage.addListener((message: PageMessage | ConnectionMessage) => this.receive(message));
  }

  private send(message: PanelMessage): void {
    this.port.postMessage(message);
  }

  private changed(): void {
    this.revision += 1;
    for (const listener of this.listeners) listener();
  }

  /** Asks the page for everything it has. */
  public init(): void {
    this.send({ kind: "init" });
  }

  public receive(message: PageMessage | ConnectionMessage): void {
    switch (message.kind) {
      case "page-connected":
      case "hello":
        this.connected = true;
        this.init();
        break;
      case "page-disconnected":
        this.connected = false;
        this.host = "page reloaded or closed";
        this.changed();
        break;
      case "sync": {
        if (message.reset) this.byId.clear();
        for (const wire of message.actions) this.byId.set(wire.id, decodeAction(wire));
        const ids = new Set(message.actionIds);
        for (const id of this.byId.keys()) if (!ids.has(id)) this.byId.delete(id);
        this.actions = message.actionIds.map(id => this.byId.get(id)).filter((a): a is ActionRecord => !!a);
        this.instances = message.instances.map(decodeInstance);
        this.containers = message.containers;
        this.recording = message.recording;
        this.host = message.host;
        this.connected = true;
        this.changed();
        break;
      }
      case "export":
        this.exports.get(message.requestId)?.(message.data);
        this.exports.delete(message.requestId);
        break;
    }
  }

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public getRevision = (): number => this.revision;

  public getAction(id: number): ActionRecord | undefined {
    return this.byId.get(id);
  }

  public setRecording(recording: boolean): void {
    this.recording = recording;
    this.changed();
    this.send({ kind: "setRecording", recording });
  }

  public clear(): void {
    this.send({ kind: "clear" });
  }

  public replaceState(uid: number, state: unknown, label?: string): void {
    this.send({ kind: "replaceState", uid, state: encodeValue(state), label });
  }

  public jumpBefore(actionId: number): void {
    this.send({ kind: "jumpBefore", actionId });
  }

  public dispatchAgain(actionId: number): void {
    this.send({ kind: "dispatchAgain", actionId });
  }

  public exportSession(): Promise<unknown> {
    const requestId = this.nextRequest++;
    return new Promise(resolve => {
      this.exports.set(requestId, resolve);
      this.send({ kind: "export", requestId });
    });
  }
}
