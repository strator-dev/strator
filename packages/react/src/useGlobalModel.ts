import type { Model, ModelCtor } from "@strator/core";
import type { Selector } from "./types.ts";
import { useScopedModel } from "./useScopedModel.ts";

export function useGlobalModel<T extends object, TModel extends Model<T>, TResult>(
  model: ModelCtor<T, TModel>,
  selector: Selector<T, TResult>,
): [TModel, TResult];
export function useGlobalModel<T extends object, TModel extends Model<T>>(
  model: ModelCtor<T, TModel>,
): [TModel, undefined];
export function useGlobalModel<T extends object, TModel extends Model<T>, TResult>(
  model: ModelCtor<T, TModel>,
  selector?: Selector<T, TResult>,
): [TModel, TResult | undefined];
export function useGlobalModel<T extends object, TModel extends Model<T>, TResult>(
  model: ModelCtor<T, TModel>,
  selector?: Selector<T, TResult>,
): [TModel, TResult | undefined] {
  return useScopedModel(model.modelKey ?? model.name, model, selector, "global", "useGlobalModel");
}
