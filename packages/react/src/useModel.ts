import type { Model, ModelCtor } from "@strator/core";
import { useCallback, useDebugValue, useEffect, useRef, useSyncExternalStore } from "react";
import { useStratorContext } from "./Provider.tsx";
import { createSnapshot, deepEqual } from "./snapshot.ts";
import type { Selector } from "./types.ts";

interface SnapshotCache<TModel, TResult> {
  instance: TModel;
  version: number;
  selector: Selector<any, TResult>;
  value: TResult;
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
  // Looked up on every render (a cached Map lookup) so the instance follows `key` changes.
  const instance = ctx.getModel(key, model);

  useDebugValue(instance);

  const cacheRef = useRef<SnapshotCache<TModel, TResult> | null>(null);

  const hasSelector = selector !== undefined;
  const subscribe = useCallback(
    (onStoreChange: () => void) => (hasSelector ? ctx.subscribeToModel(instance, onStoreChange) : () => {}),
    [ctx, instance, hasSelector],
  );

  const getSnapshot = (): TResult | undefined => {
    if (!selector) return undefined;
    const version = ctx.getModelVersion(instance);
    const cache = cacheRef.current;
    if (cache && cache.instance === instance && cache.version === version && cache.selector === selector) {
      return cache.value;
    }
    const next = createSnapshot(selector(instance.getState()));
    // Keep the previous reference when nothing observable changed, so memoised children stay stable.
    const value = cache && cache.instance === instance && deepEqual(cache.value, next) ? cache.value : next;
    cacheRef.current = { instance, version, selector, value };
    return value;
  };

  const selectedState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    ctx.retainModel(key, instance);
    return () => {
      ctx.releaseModel(key);
    };
  }, [ctx, key, instance]);

  return [instance, selectedState];
}
