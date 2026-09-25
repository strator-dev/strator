import { Model, type ModelCtor } from "@strator/core";
import React, { createContext, type PropsWithChildren, type RefObject, useContext, useMemo, useRef } from "react";
import { ReactDispatcher } from "./ReactDispatcher.ts";

interface Context {
  dispatcher: RefObject<ReactDispatcher>;
  models: RefObject<Map<string, Model<any>>>;
  getModel<T extends object, TModel extends Model<T>>(key: string, ctor: ModelCtor<T, TModel>): TModel;
  subscribeToStateChange(key: string, callback: () => void): () => void;
}

const context = createContext<Context | undefined>(undefined);

export function Provider({ children }: PropsWithChildren) {
  const dispatcher = useRef(new ReactDispatcher());
  const models = useRef<Map<string, Model<any>>>(new Map());

  const ctx = useMemo<Context>(
    () => ({
      dispatcher,
      models,
      getModel<T extends object, TModel extends Model<T>>(key: string, ctor: ModelCtor<T, TModel>): TModel {
        if (models.current.has(key)) {
          return models.current.get(key) as TModel;
        }
        const instance = Model.withInternalState(ctor, ctor.initialState, dispatcher.current.getDispatcher(key));
        models.current.set(key, instance);
        return instance;
      },
      subscribeToStateChange(key: string, callback: () => void): () => void {
        return dispatcher.current.subscribe(key, callback);
      },
    }),
    [],
  );

  return <context.Provider value={ctx}>{children}</context.Provider>;
}

export function useStratorContext() {
  const ctx = useContext(context);

  if (!ctx) {
    throw new Error(`useStratorContext must be used inside a StratorProvider`);
  }

  return ctx;
}
