export interface Dispatcher {
  dispatchAction(action: string, payload?: unknown): void;
  dispatchActionFinish(action: string, result?: unknown): void;
  dispatchActionError(action: string, error: unknown): void;
  dispatchStateChange(path: string[], value: unknown): void;
}
