import type { Model, ModelCtor } from "@strator/core";
import type { Selector } from "./types.ts";
import { useScopedModel } from "./useScopedModel.ts";
export function useModel<T extends object, TModel extends Model<T>, TResult>(
  key: string,
  model: ModelCtor<T, TModel>,
  selector: Selector<T, TResult>,
): [TModel, TResult];
export function useModel<T extends object, TModel extends Model<T>>(
  key: string,
  model: ModelCtor<T, TModel>,
): [TModel, undefined];
export function useModel<T extends object, TModel extends Model<T>, TResult>(
  key: string,
  model: ModelCtor<T, TModel>,
  selector?: Selector<T, TResult>,
): [TModel, TResult | undefined];
export function useModel<T extends object, TModel extends Model<T>, TResult>(
  key: string,
  model: ModelCtor<T, TModel>,
  selector?: Selector<T, TResult>,
): [TModel, TResult | undefined] {
  return useScopedModel(key, model, selector, "shared", "useModel");
}
