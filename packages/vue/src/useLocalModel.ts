import type { Model, ModelCtor } from "@strator/core";
import { getCurrentInstance, getCurrentScope, onScopeDispose, useId } from "vue";
import { useStratorContext } from "./context.ts";
import type { ModelResult, ModelSelectorResult, Selector } from "./types.ts";
import { useModel } from "./useModel.ts";

let fallbackLocalId = 0;

export function useLocalModel<T extends object, TModel extends Model<T>, TResult>(
  model: ModelCtor<T, TModel>,
  selector: Selector<T, TResult>,
): ModelSelectorResult<TModel, TResult>;
export function useLocalModel<T extends object, TModel extends Model<T>>(
  model: ModelCtor<T, TModel>,
): ModelResult<TModel, T>;
export function useLocalModel<T extends object, TModel extends Model<T>, TResult>(
  model: ModelCtor<T, TModel>,
  selector?: Selector<T, TResult>,
): ModelResult<TModel, T> | ModelSelectorResult<TModel, TResult>;
export function useLocalModel<T extends object, TModel extends Model<T>, TResult>(
  model: ModelCtor<T, TModel>,
  selector?: Selector<T, TResult>,
): ModelResult<TModel, T> | ModelSelectorResult<TModel, TResult> {
  // Vue's useId() does not throw outside a component; it warns and returns undefined.
  const id = (getCurrentInstance() ? useId() : undefined) || `__strator_local_${++fallbackLocalId}__`;

  const ctx = useStratorContext();

  if (getCurrentScope()) {
    onScopeDispose(() => {
      ctx.disposeModel(id);
    });
  }

  return (useModel as any)(id, model, selector);
}
