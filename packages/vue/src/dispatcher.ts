import type { Dispatcher, Path } from "@strator/core";

export function cloneState<T>(val: T): T {
  if (val === null || typeof val !== "object") {
    return val;
  }
  if (Array.isArray(val)) {
    return val.map(item => cloneState(item)) as unknown as T;
  }
  const copy = {} as Record<string, any>;
  for (const key of Object.keys(val)) {
    copy[key] = cloneState((val as Record<string, any>)[key]);
  }
  return copy as T;
}

export function syncState(source: any, target: any): void {
  if (source === target) return;
  if (typeof source !== "object" || source === null || typeof target !== "object" || target === null) {
    return;
  }

  if (Array.isArray(source) && Array.isArray(target)) {
    target.length = source.length;
    for (let i = 0; i < source.length; i++) {
      if (typeof source[i] === "object" && source[i] !== null && typeof target[i] === "object" && target[i] !== null) {
        syncState(source[i], target[i]);
      } else {
        target[i] = source[i];
      }
    }
    return;
  }

  const sourceKeys = Object.keys(source);
  for (const key of sourceKeys) {
    const srcVal = source[key];
    const tgtVal = target[key];

    if (typeof srcVal === "object" && srcVal !== null) {
      if (Array.isArray(srcVal)) {
        if (!Array.isArray(tgtVal)) {
          target[key] = cloneState(srcVal);
        } else {
          syncState(srcVal, tgtVal);
        }
      } else {
        if (typeof tgtVal !== "object" || tgtVal === null || Array.isArray(tgtVal)) {
          target[key] = cloneState(srcVal);
        } else {
          syncState(srcVal, tgtVal);
        }
      }
    } else {
      if (tgtVal !== srcVal) {
        target[key] = srcVal;
      }
    }
  }

  const targetKeys = Object.keys(target);
  for (const key of targetKeys) {
    if (!(key in source)) {
      delete target[key];
    }
  }
}

export class VueModelDispatcher<T extends object = any> implements Dispatcher {
  protected listeners: Set<() => void> = new Set();
  protected _reactiveState?: T;
  protected _getState?: () => T;

  public constructor(public readonly key: string) {}

  public setReactiveState(state: T, getState: () => T): void {
    this._reactiveState = state;
    this._getState = getState;
  }

  public get reactiveState(): T | undefined {
    return this._reactiveState;
  }

  public dispatchAction(_payload?: { action: string; payload?: unknown }): void {}
  public dispatchActionError(_payload?: { action: string; error: unknown }): void {}
  public dispatchActionFinish(_payload?: { action: string; result?: unknown }): void {}

  public dispatchStateChange(_payload?: { path: Path; isArray?: boolean }): void {
    if (this._reactiveState && this._getState) {
      syncState(this._getState(), this._reactiveState);
    }
    for (const listener of this.listeners) {
      listener();
    }
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  public clear(): void {
    this.listeners.clear();
    this._reactiveState = undefined;
    this._getState = undefined;
  }
}

export class VueDispatcher {
  protected dispatchers: Map<string, VueModelDispatcher> = new Map();

  public getDispatcher(key: string): VueModelDispatcher {
    if (this.dispatchers.has(key)) return this.dispatchers.get(key)!;
    const result = new VueModelDispatcher(key);
    this.dispatchers.set(key, result);
    return result;
  }

  public subscribe(key: string, callback: () => void): () => void {
    const dispatcher = this.getDispatcher(key);
    return dispatcher.subscribe(callback);
  }

  public removeDispatcher(key: string): void {
    const dispatcher = this.dispatchers.get(key);
    if (dispatcher) {
      dispatcher.clear();
      this.dispatchers.delete(key);
    }
  }
}
