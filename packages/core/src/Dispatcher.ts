import type { Path } from "./types.ts";

/**
 * Receives what a model does. `Model.withInternalState` / `withExternalState` call the action methods
 * around every method call of the model (`id` correlates start, finish and error of one call) and
 * `dispatchStateChange` whenever state is written.
 */
export interface Dispatcher {
  /** A model method was called; `payload` holds its arguments. */
  dispatchAction(payload?: { action: string; payload?: unknown; id?: number }): void;
  /** A model method returned, or the promise it returned resolved. */
  dispatchActionFinish(payload?: { action: string; result?: unknown; id?: number }): void;
  /** A model method threw, or the promise it returned rejected. */
  dispatchActionError(payload?: { action: string; error: unknown; id?: number }): void;
  dispatchStateChange(payload?: { path: Path; isArray?: boolean }): void;
}
