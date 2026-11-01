import { Model, type ModelCtor } from "@strator/core";
import React, { createContext, type RefObject, useContext, useMemo, useRef } from "react";
import { ReactDispatcher, type ReactModelDispatcher } from "./ReactDispatcher.ts";

export type InitialStateRecord = Record<string, any>;
export type InitialStateMap = InitialStateRecord | Map<string | ModelCtor<any, any>, any>;

export interface ProviderProps {
  children?: React.ReactNode;
  initialState?: InitialStateMap;
}

export interface StratorContext {
  dispatcher: RefObject<ReactDispatcher>;
  models: RefObject<Map<string, Model<any>>>;
  refCounts: RefObject<Map<string, number>>;
  getModel<T extends object, TModel extends Model<T>>(key: string, ctor: ModelCtor<T, TModel>): TModel;
  subscribeToStateChange(key: string, callback: () => void): () => void;
  /** Subscribes to changes of a specific model instance, regardless of whether its key is still registered. */
  subscribeToModel(instance: Model<any>, callback: () => void): () => void;
  /** Monotonic change counter of a specific model instance. */
  getModelVersion(instance: Model<any>): number;
  getState(): Record<string, any>;
  /**
   * Marks `key` as used by one more consumer and returns the instance registered for it. When `instance`
   * is passed and the key was disposed in the meantime (e.g. a hidden Suspense/Activity subtree), the
   * instance is registered again. A returned instance other than `instance` means the caller is stale.
   */
  retainModel(key: string, instance?: Model<any>): Model<any> | undefined;
  /**
   * Marks `key` as used by one consumer less. When nobody uses it anymore it is disposed in a microtask,
   * unless it was retained again in the meantime (e.g. React StrictMode's simulated unmount/remount).
   */
  releaseModel(key: string): void;
  /** Immediately removes the model; mounted consumers are notified and re-create it on their next render. */
  disposeModel(key: string): void;
}

const context = createContext<StratorContext | undefined>(undefined);

export function Provider({ children, initialState }: ProviderProps) {
  const dispatcher = useRef(new ReactDispatcher());
  const models = useRef<Map<string, Model<any>>>(new Map());
  const refCounts = useRef<Map<string, number>>(new Map());
  const modelDispatchers = useRef<WeakMap<Model<any>, ReactModelDispatcher>>(new WeakMap());
  const initialStateRef = useRef<InitialStateMap | undefined>(initialState);
  initialStateRef.current = initialState;

  const getInitialStateFor = <T extends object, TModel extends Model<T>>(
    key: string,
    ctor: ModelCtor<T, TModel>,
  ): T => {
    const currentInitialState = initialStateRef.current;
    let stateFromProps: unknown;

    if (currentInitialState) {
      if (currentInitialState instanceof Map) {
        stateFromProps =
          currentInitialState.get(key) ??
          currentInitialState.get(ctor) ??
          (ctor?.name ? currentInitialState.get(ctor.name) : undefined);
      } else if (typeof currentInitialState === "object") {
        if (key in currentInitialState) {
          stateFromProps = (currentInitialState as InitialStateRecord)[key];
        } else if (ctor?.name && ctor.name in currentInitialState) {
          stateFromProps = (currentInitialState as InitialStateRecord)[ctor.name];
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

  const ctx = useMemo<StratorContext>(() => {
    const disposeModel = (key: string): void => {
      const instance = models.current.get(key);
      models.current.delete(key);
      dispatcher.current.removeDispatcher(key);
      refCounts.current.delete(key);
      if (instance) {
        modelDispatchers.current.get(instance)?.notify();
      }
    };

    const retainModel = (key: string, instance?: Model<any>): Model<any> | undefined => {
      if (instance && !models.current.has(key)) {
        const modelDispatcher = modelDispatchers.current.get(instance);
        if (modelDispatcher) {
          // Keep listeners that subscribed by key while the model was not registered.
          const pending = dispatcher.current.peekDispatcher(key);
          if (pending && pending !== modelDispatcher) {
            modelDispatcher.adoptListeners(pending);
          }
          models.current.set(key, instance);
          dispatcher.current.setDispatcher(key, modelDispatcher);
        }
      }
      const current = refCounts.current.get(key) ?? 0;
      refCounts.current.set(key, current + 1);
      return models.current.get(key);
    };

    const releaseModel = (key: string): void => {
      const current = refCounts.current.get(key) ?? 0;
      if (current > 1) {
        refCounts.current.set(key, current - 1);
        return;
      }
      refCounts.current.set(key, 0);
      const instance = models.current.get(key);
      queueMicrotask(() => {
        if ((refCounts.current.get(key) ?? 0) === 0 && models.current.get(key) === instance) {
          disposeModel(key);
        }
      });
    };

    return {
      dispatcher,
      models,
      refCounts,
      getModel<T extends object, TModel extends Model<T>>(key: string, ctor: ModelCtor<T, TModel>): TModel {
        if (models.current.has(key)) {
          return models.current.get(key) as TModel;
        }
        const state = getInitialStateFor(key, ctor);
        const modelDispatcher = dispatcher.current.getDispatcher(key);
        const instance = Model.withInternalState(ctor, state, modelDispatcher);
        models.current.set(key, instance);
        modelDispatchers.current.set(instance, modelDispatcher);
        return instance;
      },
      subscribeToStateChange(key: string, callback: () => void): () => void {
        return dispatcher.current.subscribe(key, callback);
      },
      subscribeToModel(instance: Model<any>, callback: () => void): () => void {
        const modelDispatcher = modelDispatchers.current.get(instance);
        return modelDispatcher ? modelDispatcher.subscribe(callback) : () => {};
      },
      getModelVersion(instance: Model<any>): number {
        return modelDispatchers.current.get(instance)?.version ?? 0;
      },
      getState(): Record<string, any> {
        const result: Record<string, any> = {};
        for (const [k, model] of models.current.entries()) {
          result[k] = model.getState();
        }
        return result;
      },
      retainModel,
      releaseModel,
      disposeModel,
    };
  }, []);

  return <context.Provider value={ctx}>{children}</context.Provider>;
}

export function useStratorContext(): StratorContext {
  const ctx = useContext(context);

  if (!ctx) {
    throw new Error(`useStratorContext must be used inside a StratorProvider`);
  }

  return ctx;
}
