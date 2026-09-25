import type { Path } from "./types.ts";

export interface Dispatcher {
  dispatchAction(payload?: { action: string; payload?: unknown }): void;
  dispatchActionFinish(payload?: { action: string; result?: unknown }): void;
  dispatchActionError(payload?: { action: string; error: unknown }): void;
  dispatchStateChange(payload?: { path: Path; isArray?: boolean }): void;
}
