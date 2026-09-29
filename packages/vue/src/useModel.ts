import type { Model, ModelCtor } from "@strator/core";
import { computed } from "vue";
import { useStratorContext } from "./context.ts";
import {
  createModelResult,
  createModelSelectorResult,
  type ModelResult,
  type ModelSelectorResult,
  type Selector,
} from "./types.ts";

export function useModel<T extends object, TModel extends Model<T>, TResult>(
  key: string,
  model: ModelCtor<T, TModel>,
  selector: Selector<T, TResult>,
): ModelSelectorResult<TModel, TResult>;
export function useModel<T extends object, TModel extends Model<T>>(
  key: string,
  model: ModelCtor<T, TModel>,
): ModelResult<TModel, T>;
export function useModel<T extends object, TModel extends Model<T>, TResult>(
  key: string,
  model: ModelCtor<T, TModel>,
  selector?: Selector<T, TResult>,
): ModelResult<TModel, T> | ModelSelectorResult<TModel, TResult>;
export function useModel<T extends object, TModel extends Model<T>, TResult>(
  key: string,
  model: ModelCtor<T, TModel>,
  selector?: Selector<T, TResult>,
): ModelResult<TModel, T> | ModelSelectorResult<TModel, TResult> {
  const ctx = useStratorContext();
  const instance = ctx.getModel(key, model);
  const reactiveState = ctx.getReactiveState<T>(key);

  if (selector) {
    const selected = computed(() => selector(reactiveState));
    return createModelSelectorResult(instance, selected);
  }

  return createModelResult(instance, reactiveState);
}
