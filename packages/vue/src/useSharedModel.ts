import type { Model, ModelCtor } from "@strator/core";
import type { ModelResult, ModelSelectorResult, Selector } from "./types.ts";
import { useScopedModel } from "./useModel.ts";

export function useSharedModel<T extends object, TModel extends Model<T>, TResult>(
  key: string,
  model: ModelCtor<T, TModel>,
  selector: Selector<T, TResult>,
): ModelSelectorResult<TModel, TResult>;
export function useSharedModel<T extends object, TModel extends Model<T>>(
  key: string,
  model: ModelCtor<T, TModel>,
): ModelResult<TModel, T>;
export function useSharedModel<T extends object, TModel extends Model<T>, TResult>(
  key: string,
  model: ModelCtor<T, TModel>,
  selector?: Selector<T, TResult>,
): ModelResult<TModel, T> | ModelSelectorResult<TModel, TResult>;
export function useSharedModel<T extends object, TModel extends Model<T>, TResult>(
  key: string,
  model: ModelCtor<T, TModel>,
  selector?: Selector<T, TResult>,
): ModelResult<TModel, T> | ModelSelectorResult<TModel, TResult> {
  return useScopedModel(key, model, selector, "shared", "useSharedModel");
}
