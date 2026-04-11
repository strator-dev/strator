import { AsyncModel, type Model } from "@strator/core";
import { type RefObject, useEffect, useRef, useState } from "react";

type Selector<TDeps extends Model<any>[], TResult> = (...models: [...TDeps]) => TResult | Promise<TResult>;
type State<TResult> = { value: TResult | undefined; loading: boolean };
type Resolver<TResult> = {
  promise: Promise<void> | undefined;
  handler: (result: TResult) => void;
};

export function useSelector<TDeps extends Model<any>[], TResult>(
  deps: [...TDeps],
  selector: Selector<TDeps, TResult>,
): [TResult | undefined, boolean] {
  const resolver = useRef<Resolver<TResult>>({
    promise: undefined,
    handler(result) {
      setState({ value: result, loading: false });
      resolver.current.promise = undefined;
    },
  });

  const [state, setState] = useState(() => resolveState(deps, selector, resolver));

  useEffect(() => {
    // todo: create subscription
  }, [deps, selector]);

  return [state.value, state.loading];
}

function resolveState<TDeps extends Model<any>[], TResult>(
  deps: TDeps,
  selector: Selector<TDeps, TResult>,
  resolver: RefObject<Resolver<TResult>>,
): State<TResult> {
  const result: State<TResult> = {
    value: undefined,
    loading: false,
  };
  const isAsync = deps.some(it => it instanceof AsyncModel);
  const value = selector(...deps);
  if (isAsync || value instanceof Promise) {
    resolver.current.promise = Promise.resolve(value).then(resolver.current.handler);
    result.loading = true;
  } else {
    result.value = value;
  }

  return result;
}
