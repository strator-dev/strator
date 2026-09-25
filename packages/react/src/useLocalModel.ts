import type { Model, ModelCtor } from "@strator/core";
import { useId } from "react";
import type { Selector } from "./types.ts";
import { useModel } from "./useModel.ts";

export function useLocalModel<T extends object, TModel extends Model<T>, TResult>(
  model: ModelCtor<T, TModel>,
  selector: Selector<T, TResult>,
): [TModel, TResult];
export function useLocalModel<T extends object, TModel extends Model<T>>(
  model: ModelCtor<T, TModel>,
): [TModel, undefined];
export function useLocalModel<T extends object, TModel extends Model<T>, TResult>(
  model: ModelCtor<T, TModel>,
  selector?: Selector<T, TResult>,
): [TModel, TResult | undefined];
export function useLocalModel<T extends object, TModel extends Model<T>, TResult>(
  model: ModelCtor<T, TModel>,
  selector?: Selector<T, TResult>,
): [TModel, TResult | undefined] {
  const id = useId();

  return useModel(id, model, selector);
}
