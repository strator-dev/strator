import { type DevtoolsSubscriber, getDevtoolsHook, type Model, type ModelCtor, type ModelScope } from "@strator/core";
import { useCallback, useDebugValue, useEffect, useReducer, useRef, useSyncExternalStore } from "react";
import { createSubscriberRecord } from "./devtools.ts";
import { useStratorContext } from "./Provider.tsx";
import { createSnapshot, deepEqual } from "./snapshot.ts";
import type { Selector } from "./types.ts";

interface SnapshotCache<TModel, TResult> {
  instance: TModel;
  version: number;
  raw: TResult;
  value: TResult;
}

/** Shared implementation of all model hooks; `scope` and `hookName` only describe the instance to devtools. */
export function useScopedModel<T extends object, TModel extends Model<T>, TResult>(
  key: string,
  model: ModelCtor<T, TModel>,
  selector: Selector<T, TResult> | undefined,
  scope: ModelScope,
  hookName: string,
): [TModel, TResult | undefined] {
  const ctx = useStratorContext();
  // Looked up on every render (a cached Map lookup) so the instance follows `key` changes.
  const instance = ctx.getModel(key, model, { scope });

  useDebugValue(instance);

  const cacheRef = useRef<SnapshotCache<TModel, TResult> | null>(null);

  // Devtools only: who uses this instance and how often it renders.
  const subscriberRef = useRef<DevtoolsSubscriber | null | undefined>(undefined);
  if (subscriberRef.current === undefined) {
    subscriberRef.current = createSubscriberRecord(hookName, selector);
  }
  if (subscriberRef.current) subscriberRef.current.renders += 1;

  const [, forceRender] = useReducer((n: number) => n + 1, 0);
  const hasSelector = selector !== undefined;
  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      ctx.subscribeToModel(instance, () => {
        // The model was disposed (or replaced) under us: re-render so getModel hands out the current one.
        if (ctx.models.current.get(key) !== instance) {
          forceRender();
        } else if (hasSelector) {
          onStoreChange();
        }
      }),
    [ctx, instance, key, hasSelector],
  );

  const getSnapshot = (): TResult | undefined => {
    if (!selector) return undefined;
    const version = ctx.getModelVersion(instance);
    const cache = cacheRef.current;
    const raw = selector(instance.getState());
    // Same instance, no state change since the last snapshot and the selector picked the same thing:
    // skip the deep copy. This keeps inline selectors cheap on unrelated re-renders.
    if (cache && cache.instance === instance && cache.version === version && Object.is(cache.raw, raw)) {
      return cache.value;
    }
    const next = createSnapshot(raw);
    // Keep the previous reference when nothing observable changed, so memoised children stay stable.
    const value = cache && cache.instance === instance && deepEqual(cache.value, next) ? cache.value : next;
    cacheRef.current = { instance, version, raw, value };
    return value;
  };

  const selectedState = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    // Another instance took over this key while we were not mounted: re-render to pick it up.
    if (ctx.retainModel(key, instance) !== instance) forceRender();
    return () => {
      ctx.releaseModel(key);
    };
  }, [ctx, key, instance]);

  useEffect(() => {
    const record = subscriberRef.current;
    const hook = getDevtoolsHook();
    if (!record || !hook) return;
    try {
      return hook.addSubscriber(instance, record);
    } catch {
      return undefined;
    }
  }, [instance]);

  return [instance, selectedState];
}
