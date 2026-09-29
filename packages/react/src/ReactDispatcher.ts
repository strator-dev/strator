import type { Dispatcher, Path } from "@strator/core";

export class ReactModelDispatcher implements Dispatcher {
  protected listeners: Set<() => void> = new Set();

  public constructor(public readonly key: string) {}

  public dispatchAction(_payload?: { action: string; payload?: unknown }): void {}

  public dispatchActionError(_payload?: { action: string; error: unknown }): void {}

  public dispatchActionFinish(_payload?: { action: string; result?: unknown }): void {}

  public dispatchStateChange(_payload?: { path: Path; isArray?: boolean }): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

export class ReactDispatcher {
  protected dispatchers: Map<string, ReactModelDispatcher> = new Map();

  public getDispatcher(key: string): ReactModelDispatcher {
    if (this.dispatchers.has(key)) return this.dispatchers.get(key)!;
    const result = new ReactModelDispatcher(key);
    this.dispatchers.set(key, result);
    return result;
  }

  public subscribe(key: string, callback: () => void): () => void {
    const dispatcher = this.getDispatcher(key);
    return dispatcher.subscribe(callback);
  }

  public removeDispatcher(key: string): void {
    this.dispatchers.delete(key);
  }
}
