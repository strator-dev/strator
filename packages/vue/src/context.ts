import { Model, type ModelCtor } from "@strator/core";
import { inject, type InjectionKey, provide, reactive } from "vue";
import { cloneState, VueDispatcher } from "./dispatcher.ts";
import type { InitialStateMap, InitialStateRecord, StratorContextValue } from "./types.ts";

export const STRATOR_CONTEXT_KEY: InjectionKey<StratorContextValue> = Symbol("STRATOR_CONTEXT_KEY");

export function createStratorContext(initialState?: InitialStateMap): StratorContextValue {
  const dispatcher = new VueDispatcher();
  const models = new Map<string, Model<any>>();

  const getInitialStateFor = <T extends object, TModel extends Model<T>>(
    key: string,
    ctor: ModelCtor<T, TModel>,
  ): T => {
    let stateFromProps: unknown;

    if (initialState) {
      if (initialState instanceof Map) {
        stateFromProps =
          initialState.get(key) ?? initialState.get(ctor) ?? (ctor?.name ? initialState.get(ctor.name) : undefined);
      } else if (typeof initialState === "object") {
        if (key in initialState) {
          stateFromProps = (initialState as InitialStateRecord)[key];
        } else if (ctor?.name && ctor.name in initialState) {
          stateFromProps = (initialState as InitialStateRecord)[ctor.name];
        }
      }
    }

    if (stateFromProps !== undefined) {
      if (
        typeof ctor.initialState === "object" &&
        ctor.initialState !== null &&
        typeof stateFromProps === "object" &&
        stateFromProps !== null &&
        !Array.isArray(ctor.initialState) &&
        !Array.isArray(stateFromProps)
      ) {
        return { ...ctor.initialState, ...stateFromProps };
      }
      return (
        typeof stateFromProps === "object" && stateFromProps !== null
          ? Array.isArray(stateFromProps)
            ? [...stateFromProps]
            : { ...stateFromProps }
          : stateFromProps
      ) as T;
    }

    if (typeof ctor.initialState === "object" && ctor.initialState !== null) {
      return (Array.isArray(ctor.initialState) ? [...ctor.initialState] : { ...ctor.initialState }) as T;
    }

    return ctor.initialState;
  };

  const getModel = <T extends object, TModel extends Model<T>>(key: string, ctor: ModelCtor<T, TModel>): TModel => {
    if (models.has(key)) {
      return models.get(key) as TModel;
    }
    const state = getInitialStateFor(key, ctor);
    const modelDispatcher = dispatcher.getDispatcher(key);
    const reactiveState = reactive(cloneState(state)) as T;
    const instance = Model.withInternalState(ctor, state, modelDispatcher);
    modelDispatcher.setReactiveState(reactiveState, () => instance.getState());
    models.set(key, instance);
    return instance;
  };

  const getReactiveState = <T extends object>(key: string): T => {
    const modelDispatcher = dispatcher.getDispatcher(key);
    return modelDispatcher.reactiveState as T;
  };

  const subscribeToStateChange = (key: string, callback: () => void): (() => void) => {
    return dispatcher.subscribe(key, callback);
  };

  const getState = (): Record<string, any> => {
    const result: Record<string, any> = {};
    for (const [k, model] of models.entries()) {
      result[k] = model.getState();
    }
    return result;
  };

  const disposeModel = (key: string): void => {
    models.delete(key);
    dispatcher.removeDispatcher(key);
  };

  return {
    dispatcher,
    models,
    getModel,
    getReactiveState,
    subscribeToStateChange,
    getState,
    disposeModel,
  };
}

export function provideStratorContext(initialState?: InitialStateMap): StratorContextValue {
  const ctx = createStratorContext(initialState);
  provide(STRATOR_CONTEXT_KEY, ctx);
  return ctx;
}

export function useStratorContext(): StratorContextValue {
  const ctx = inject(STRATOR_CONTEXT_KEY, null);
  if (!ctx) {
    throw new Error(
      "Strator context not found. Make sure to use createStrator plugin (app.use(createStrator())) or wrap your components in <StratorProvider> / provideStratorContext().",
    );
  }
  return ctx;
}
