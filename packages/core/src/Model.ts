import { createModelState } from "./ModelState.ts";
import type { Dispatcher } from "./Dispatcher.ts";

export interface Observer<T extends object> {
  observe(subscription: () => void): void;
  getValue(): T;
}

export abstract class Model<T extends object> {
  private _internalState: { target: T; proxy?: T };

  public getState(): T {
    return this._internalState.target;
  }

  protected get state(): T {
    return this._internalState.proxy ?? this._internalState.target;
  }

  public constructor(state: T, proxy?: T) {
    this._internalState = { target: state };
    if (proxy) {
      this._internalState.proxy = proxy;
    }
  }

  public static withInternalState<T extends object, TModel extends Model<T>>(
    model: ModelCtor<T, TModel>,
    initialState: T,
    dispatcher: Dispatcher,
  ): TModel {
    const modelState = createModelState(initialState, {
      onChange: path => dispatcher.dispatchStateChange({ path }),
      onArrayItemChange: path => dispatcher.dispatchStateChange({ path, isArray: true }),
      onArrayItemAdd: path => dispatcher.dispatchStateChange({ path, isArray: true }),
      onArrayItemRemove: path => dispatcher.dispatchStateChange({ path, isArray: true }),
    });
    return new model(modelState.target, modelState.proxy);
  }

  public static withExternalState<T extends object, TModel extends Model<T>>(
    model: ModelCtor<T, TModel>,
    initialState: T,
    dispatcher: Dispatcher,
    observer: Observer<T>,
  ): TModel {
    const modelState = createModelState(initialState, {
      onChange: path => dispatcher.dispatchStateChange({ path }),
      onArrayItemChange: path => dispatcher.dispatchStateChange({ path, isArray: true }),
      onArrayItemAdd: path => dispatcher.dispatchStateChange({ path, isArray: true }),
      onArrayItemRemove: path => dispatcher.dispatchStateChange({ path, isArray: true }),
    });
    const result = new model(modelState.target, modelState.proxy);

    observer.observe(() => {
      modelState.target = observer.getValue();
    });

    return result;
  }
}

export type InferModelState<TModel extends Model<any>> = TModel extends Model<infer TState> ? TState : never;

export interface ModelCtor<T extends object, TModel extends Model<T>> {
  initialState: T;
  new (state: T, proxy?: T): TModel;
}
