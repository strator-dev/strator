import { createModelState, type Observer as StateObserver } from "./ModelState.ts";
import type { Dispatcher } from "./Dispatcher.ts";
import { type DevtoolsModelHandle, type ModelMeta, reportToDevtools } from "./devtools.ts";
import { currentActionOf, instrumentMethods } from "./instrument.ts";
import type { Path } from "./types.ts";

function stateObserver(dispatcher: Dispatcher, getInstance: () => object | undefined): StateObserver {
  const changed = (path: Path, isArray?: boolean) => {
    dispatcher.dispatchStateChange(isArray ? { path, isArray } : { path });
    const instance = getInstance();
    if (instance) {
      reportToDevtools(hook => hook.stateChange(instance, { path, isArray, actionId: currentActionOf(instance) }));
    }
  };
  return {
    onChange: path => changed(path),
    onArrayItemChange: path => changed(path, true),
    onArrayItemAdd: path => changed(path, true),
    onArrayItemRemove: path => changed(path, true),
  };
}

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

  /**
   * Creates a model whose state writes are reported to `dispatcher`, and whose method calls are reported
   * through its action methods. `meta` describes the instance for devtools.
   */
  public static withInternalState<T extends object, TModel extends Model<T>>(
    model: ModelCtor<T, TModel>,
    initialState: T,
    dispatcher: Dispatcher,
    meta: ModelMeta = {},
  ): TModel {
    let instance: TModel | undefined;
    const modelState = createModelState(
      initialState,
      stateObserver(dispatcher, () => instance),
    );
    const result = new model(modelState.target, modelState.proxy);
    instrumentMethods(result, Model.prototype, dispatcher);
    instance = result;

    const handle: DevtoolsModelHandle = {
      instance: result,
      ctor: model,
      meta,
      getState: () => result._internalState.target,
      replaceState: next => {
        modelState.target = next as T;
        result._internalState.target = next as T;
        dispatcher.dispatchStateChange({ path: [] });
        reportToDevtools(hook => hook.stateChange(result, { path: [] }));
      },
    };
    reportToDevtools(hook => hook.registerModel(handle));
    return result;
  }

  public static withExternalState<T extends object, TModel extends Model<T>>(
    model: ModelCtor<T, TModel>,
    initialState: T,
    dispatcher: Dispatcher,
    observer: Observer<T>,
    meta: ModelMeta = {},
  ): TModel {
    let instance: TModel | undefined;
    const modelState = createModelState(
      initialState,
      stateObserver(dispatcher, () => instance),
    );
    const result = new model(modelState.target, modelState.proxy);
    instrumentMethods(result, Model.prototype, dispatcher);
    instance = result;

    observer.observe(() => {
      const next = observer.getValue();
      modelState.target = next;
      // Keep getState() in step with the proxy, and let bindings know the whole state was replaced.
      result._internalState.target = next;
      dispatcher.dispatchStateChange({ path: [] });
      reportToDevtools(hook => hook.stateChange(result, { path: [] }));
    });

    reportToDevtools(hook =>
      hook.registerModel({
        instance: result,
        ctor: model,
        meta,
        getState: () => result._internalState.target,
      }),
    );
    return result;
  }
}

export type InferModelState<TModel extends Model<any>> = TModel extends Model<infer TState> ? TState : never;

export interface ModelCtor<T extends object, TModel extends Model<T>> {
  initialState: T;
  /**
   * Stable key used by `useGlobalModel` instead of the class name. Set it when your build minifies class
   * names, otherwise two different models can end up with the same name.
   */
  modelKey?: string;
  new (state: T, proxy?: T): TModel;
}
