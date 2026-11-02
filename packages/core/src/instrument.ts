import type { Dispatcher } from "./Dispatcher.ts";
import { reportToDevtools } from "./devtools.ts";

interface RunningAction {
  id: number;
  instance: object;
}

let nextActionId = 1;
/** Actions whose synchronous part is executing, innermost last. */
const running: RunningAction[] = [];

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    (typeof value === "object" || typeof value === "function") &&
    value !== null &&
    typeof (value as { then?: unknown }).then === "function"
  );
}

/** The innermost running action of `instance`, used to attribute state changes. */
export function currentActionOf(instance: object): number | undefined {
  for (let i = running.length - 1; i >= 0; i--) {
    if (running[i]!.instance === instance) return running[i]!.id;
  }
  return undefined;
}

function wrapMethod(
  instance: object,
  name: string,
  original: (...args: unknown[]) => unknown,
  dispatcher: Dispatcher,
): (...args: unknown[]) => unknown {
  const wrapped = function (this: unknown, ...args: unknown[]): unknown {
    const id = nextActionId++;
    const parentId = running.length > 0 ? running[running.length - 1]!.id : undefined;
    dispatcher.dispatchAction({ action: name, payload: args, id });
    reportToDevtools(hook => hook.actionStart(instance, { id, action: name, args, parentId }));

    const finish = (result: unknown, async: boolean) => {
      dispatcher.dispatchActionFinish({ action: name, result, id });
      reportToDevtools(hook => hook.actionEnd(instance, { id, status: "done", result, async }));
    };
    const fail = (error: unknown, async: boolean) => {
      dispatcher.dispatchActionError({ action: name, error, id });
      reportToDevtools(hook => hook.actionEnd(instance, { id, status: "threw", error, async }));
    };

    let result: unknown;
    running.push({ id, instance });
    try {
      result = original.apply(this, args);
    } catch (error) {
      fail(error, false);
      throw error;
    } finally {
      const index = running.findIndex(entry => entry.id === id);
      if (index !== -1) running.splice(index, 1);
    }

    if (result instanceof Promise) {
      // Hand back a promise that settles the same way, so an unhandled rejection stays unhandled.
      return result.then(
        value => {
          finish(value, true);
          return value;
        },
        error => {
          fail(error, true);
          throw error;
        },
      );
    }
    if (isPromiseLike(result)) {
      // A custom thenable is returned as is and only observed.
      result.then(
        value => finish(value, true),
        error => fail(error, true),
      );
    } else {
      finish(result, false);
    }
    return result;
  };
  Object.defineProperty(wrapped, "name", { value: name, configurable: true });
  return wrapped;
}

/**
 * Wraps every method of `instance` (its class methods up to, but not including, `stopAt`, plus function
 * valued own fields such as arrow-function class fields) so that calls are reported through
 * `dispatchAction` / `dispatchActionFinish` / `dispatchActionError` and to the devtools hook. Return
 * values, thrown errors and returned promises are passed through untouched.
 */
export function instrumentMethods(instance: object, stopAt: object, dispatcher: Dispatcher): void {
  const seen = new Set<string>();

  for (const name of Object.getOwnPropertyNames(instance)) {
    const descriptor = Object.getOwnPropertyDescriptor(instance, name)!;
    if (typeof descriptor.value !== "function" || !descriptor.writable) continue;
    seen.add(name);
    Object.defineProperty(instance, name, {
      ...descriptor,
      value: wrapMethod(instance, name, descriptor.value, dispatcher),
    });
  }

  let proto: object | null = Object.getPrototypeOf(instance);
  while (proto && proto !== stopAt && proto !== Object.prototype) {
    for (const name of Object.getOwnPropertyNames(proto)) {
      if (name === "constructor" || seen.has(name)) continue;
      seen.add(name);
      const descriptor = Object.getOwnPropertyDescriptor(proto, name)!;
      // Getters / setters are reads, not actions.
      if (typeof descriptor.value !== "function") continue;
      Object.defineProperty(instance, name, {
        configurable: true,
        enumerable: false,
        writable: true,
        value: wrapMethod(instance, name, descriptor.value, dispatcher),
      });
    }
    proto = Object.getPrototypeOf(proto);
  }
}
