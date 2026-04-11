import type { Dispatcher } from "@strator/core";

export class ReactDispatcher implements Dispatcher {
  public dispatchAction(action: string, payload?: unknown): void {}

  public dispatchActionError(action: string, error: unknown): void {}

  public dispatchActionFinish(action: string, result?: unknown): void {}

  public dispatchStateChange(path: string[], value: unknown): void {}
}
