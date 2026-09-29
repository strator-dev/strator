import type { Model, ModelCtor } from "@strator/core";
import { useState, useDebugValue, useEffect, useRef } from "react";
import { useStratorContext } from "./Provider.tsx";
import type { Selector } from "./types.ts";
import { shallowEqual } from "./shallowEqual.ts";

function createSnapshot<T>(val: T): T {
  if (Array.isArray(val)) {
    return [...val] as unknown as T;
  }
  if (typeof val === "object" && val !== null) {
    return { ...val };
  }
  return val;
}

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

  const [, setTick] = useState(0);
  const selectedState = selector ? selector(instance.getState()) : undefined;
  const snapshotRef = useRef<TResult | undefined>(createSnapshot(selectedState));

  useEffect(() => {
    if (!selector) return undefined;

    return ctx.subscribeToStateChange(key, () => {
      const newSelectedState = selector(instance.getState());

      if (shallowEqual(newSelectedState, snapshotRef.current)) return;
      snapshotRef.current = createSnapshot(newSelectedState);
      setTick(t => t + 1);
    });
  }, [instance, key, selector, ctx]);

  return [instance, selectedState];
}
