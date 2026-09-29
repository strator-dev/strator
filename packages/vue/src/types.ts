import type { Model, ModelCtor } from "@strator/core";
import type { ComputedRef } from "vue";
import type { VueDispatcher } from "./dispatcher.ts";

export type Selector<TState extends object, TResult> = (state: TState) => TResult;

export type InitialStateRecord = Record<string, any>;
export type InitialStateMap = InitialStateRecord | Map<string | ModelCtor<any, any>, any>;

export interface StratorContextValue {
  dispatcher: VueDispatcher;
  models: Map<string, Model<any>>;
  getModel<T extends object, TModel extends Model<T>>(key: string, ctor: ModelCtor<T, TModel>): TModel;
  getReactiveState<T extends object>(key: string): T;
  subscribeToStateChange(key: string, callback: () => void): () => void;
  getState(): Record<string, any>;
  disposeModel(key: string): void;
}

export interface StratorPluginOptions {
  initialState?: InitialStateMap;
}

export type ModelResult<TModel, TState> = [model: TModel, state: TState] & {
  model: TModel;
  state: TState;
};

export type ModelSelectorResult<TModel, TResult> = [model: TModel, state: ComputedRef<TResult>] & {
  model: TModel;
  state: ComputedRef<TResult>;
};

export function createModelResult<TModel, TState>(model: TModel, state: TState): ModelResult<TModel, TState> {
  const result = [model, state] as unknown as ModelResult<TModel, TState>;
  result.model = model;
  result.state = state;
  return result;
}

export function createModelSelectorResult<TModel, TResult>(
  model: TModel,
  state: ComputedRef<TResult>,
): ModelSelectorResult<TModel, TResult> {
  const result = [model, state] as unknown as ModelSelectorResult<TModel, TResult>;
  result.model = model;
  result.state = state;
  return result;
}
