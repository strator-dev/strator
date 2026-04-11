import type { Dispatcher } from "./Dispatcher.ts";
import type { Model } from "./Model.ts";

export interface InternalModel<T extends object> extends Model<T> {
  $dispatcher: Dispatcher;
}

export function hasDispatcher<T extends object>(it: Model<T>): it is InternalModel<T> {
  return !!it && "$dispatcher" in it && it.$dispatcher !== null && it.$dispatcher !== undefined;
}
