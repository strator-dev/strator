import type { Model, ModelCtor } from "@strator/core";
import type { ModelResult, ModelSelectorResult, Selector } from "./types.ts";
import { useModel } from "./useModel.ts";

export function useGlobalModel<T extends object, TModel extends Model<T>, TResult>(
  model: ModelCtor<T, TModel>,
  selector: Selector<T, TResult>,
): ModelSelectorResult<TModel, TResult>;
export function useGlobalModel<T extends object, TModel extends Model<T>>(
  model: ModelCtor<T, TModel>,
): ModelResult<TModel, T>;
export function useGlobalModel<T extends object, TModel extends Model<T>, TResult>(
  model: ModelCtor<T, TModel>,
  selector?: Selector<T, TResult>,
): ModelResult<TModel, T> | ModelSelectorResult<TModel, TResult>;
export function useGlobalModel<T extends object, TModel extends Model<T>, TResult>(
  model: ModelCtor<T, TModel>,
  selector?: Selector<T, TResult>,
): ModelResult<TModel, T> | ModelSelectorResult<TModel, TResult> {
  const key = model.name || `__strator_global_${model.toString()}__`;
  return (useModel as any)(key, model, selector);
}
