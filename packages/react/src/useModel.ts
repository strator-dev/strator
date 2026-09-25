import type { Model, ModelCtor } from "@strator/core";
import { useState, useDebugValue, useEffect, useRef } from "react";
import { useStratorContext } from "./Provider.tsx";
import type { Selector } from "./types.ts";
import { shallowEqual } from "./shallowEqual.ts";

export function useModel<T extends object, TModel extends Model<T>, TResult>(
  key: string,
  model: ModelCtor<T, TModel>,
  selector: Selector<T, TResult>,
): [TModel, TResult];
export function useModel<T extends object, TModel extends Model<T>>(
  key: string,
  model: ModelCtor<T, TModel>,
): [TModel, undefined];
export function useModel<T extends object, TModel extends Model<T>, TResult>(
  key: string,
  model: ModelCtor<T, TModel>,
  selector?: Selector<T, TResult>,
): [TModel, TResult | undefined];
export function useModel<T extends object, TModel extends Model<T>, TResult>(
  key: string,
  model: ModelCtor<T, TModel>,
  selector?: Selector<T, TResult>,
): [TModel, TResult | undefined] {
  const ctx = useStratorContext();
  const [instance] = useState<TModel>(() => ctx.getModel(key, model));

  useDebugValue(instance);

  const [selectedState, setSelectedState] = useState<TResult | undefined>(
    selector ? selector(instance.getState()) : undefined,
  );
  const selectedStateRef = useRef<TResult | undefined>(selectedState);

  useEffect(() => {
    if (!selector) return undefined;

    return ctx.subscribeToStateChange(key, () => {
      const newSelectedState = selector(instance.getState());

      if (shallowEqual(newSelectedState, selectedStateRef.current)) return;
      setSelectedState(newSelectedState);
      selectedStateRef.current = newSelectedState;
    });
  }, [instance, key, selector, ctx]);

  return [instance, selectedState];
}
