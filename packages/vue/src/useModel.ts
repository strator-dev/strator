import { type DevtoolsSubscriber, getDevtoolsHook, type Model, type ModelCtor, type ModelScope } from "@strator/core";
import { computed, getCurrentInstance, onBeforeUpdate, onScopeDispose } from "vue";
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
  return useScopedModel(key, model, selector, "shared", "useModel");
}

/** Shared implementation of all model composables; `scope` and `hookName` only describe the instance to devtools. */
export function useScopedModel<T extends object, TModel extends Model<T>, TResult>(
  key: string,
  model: ModelCtor<T, TModel>,
  selector: Selector<T, TResult> | undefined,
  scope: ModelScope,
  hookName: string,
): ModelResult<TModel, T> | ModelSelectorResult<TModel, TResult> {
  const ctx = useStratorContext();
  const instance = ctx.getModel(key, model, { scope });
  const reactiveState = ctx.getReactiveState<T>(key);

  reportSubscriber(instance, hookName, selector);

  if (selector) {
    const selected = computed(() => selector(reactiveState));
    return createModelSelectorResult(instance, selected);
  }

  return createModelResult(instance, reactiveState);
}

function reportSubscriber(instance: Model<any>, hookName: string, selector: Function | undefined): void {
  const component = getCurrentInstance();
  const hook = getDevtoolsHook();
  if (!component || !hook) return;
  const type = component.type as { name?: string; __name?: string; __file?: string };
  const record: DevtoolsSubscriber = {
    hook: hookName,
    component: type.name ?? type.__name,
    file: type.__file?.split("/").pop(),
    selector: selector ? String(selector) : undefined,
    renders: 1,
  };
  let remove: (() => void) | undefined;
  try {
    remove = hook.addSubscriber(instance, record);
  } catch {
    return;
  }
  onBeforeUpdate(() => {
    record.renders += 1;
  });
  onScopeDispose(() => remove?.());
}
