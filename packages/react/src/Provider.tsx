import type { Model } from "@strator/core";
import React, { createContext, type PropsWithChildren, type RefObject, useContext, useMemo, useRef } from "react";
import type { ModelCtor } from "./types.ts";

interface Context {
  models: RefObject<Map<string, Model<any>>>;
  getOrCreate<TModel extends Model<any>, TArgs extends any[]>(
    key: string,
    ctor: ModelCtor<TModel, TArgs>,
    ...args: TArgs
  ): TModel;
}

const context = createContext<Context | undefined>(undefined);

export function Provider({ children }: PropsWithChildren) {
  const models = useRef<Map<string, Model<any>>>(new Map());
  const ctx = useMemo<Context>(
    () => ({
      models,
      getOrCreate<TModel extends Model<any>, TArgs extends any[]>(
        key: string,
        ctor: ModelCtor<TModel, TArgs>,
        ...args: TArgs
      ): TModel {
        if (models.current.has(key)) {
          return models.current.get(key) as TModel;
        }
        const instance = new ctor(...args);
        // todo: inject correct dispatcher
        models.current.set(key, instance);
        return instance;
      },
    }),
    [models],
  );

  return <context.Provider value={ctx}>{children}</context.Provider>;
}

export function useStratorContext() {
  const ctx = useContext(context);

  if (!ctx) {
    throw new Error(`useStratorProvider must be used inside a Provider`);
  }

  return ctx;
}
