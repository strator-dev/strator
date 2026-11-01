import type { Path } from "./types.ts";

export interface Observer {
  onChange?(path: Path): void;
  onArrayItemChange?(path: Path, indexes: number[]): void;
  onArrayItemRemove?(path: Path, indexes: number[]): void;
  onArrayItemAdd?(path: Path, indexes: number[]): void;
}

/**
 * Built-ins whose data lives in internal slots. Their methods throw when called on a proxy, so they are
 * handed out unwrapped (mutating them through their own methods is therefore not tracked).
 */
function isExoticObject(value: object): boolean {
  return (
    value instanceof Map ||
    value instanceof Set ||
    value instanceof WeakMap ||
    value instanceof WeakSet ||
    value instanceof Date ||
    value instanceof RegExp ||
    value instanceof Promise ||
    ArrayBuffer.isView(value) ||
    value instanceof ArrayBuffer
  );
}

/** Array methods that read elements and hand them to callbacks or callers; run against the proxy. */
const ELEMENT_READING_METHODS = new Set<PropertyKey>([
  "at",
  "entries",
  "every",
  "filter",
  "find",
  "findIndex",
  "findLast",
  "findLastIndex",
  "flatMap",
  "forEach",
  "map",
  "reduce",
  "reduceRight",
  "some",
  "values",
  Symbol.iterator,
]);

function wrapValue(value: unknown, getValue: () => unknown, path: Path, observer: Observer): unknown {
  if (Array.isArray(value)) {
    return createProxyForArray(getValue as () => unknown[], path, observer);
  }
  if (typeof value === "object" && value !== null && !isExoticObject(value)) {
    return createProxyForObject(getValue as () => object, path, observer);
  }
  return value;
}

function getOwnPropertyDescriptor(target: object, propName: PropertyKey): PropertyDescriptor | undefined {
  const descriptor = Reflect.getOwnPropertyDescriptor(target, propName);
  // The proxy's own target is an empty placeholder, so every reported property must be configurable.
  if (descriptor) descriptor.configurable = true;
  return descriptor;
}

function createProxyForObject<T extends object>(getTarget: () => T, path: Path, observer: Observer): T {
  return new Proxy({} as unknown as T, {
    get: (_, propName, receiver) => {
      const target = getTarget();
      // Pass the proxy as receiver so getters and methods of class instances go through tracking.
      const value = Reflect.get(target, propName, receiver);
      return wrapValue(value, () => Reflect.get(getTarget(), propName), [...path, propName], observer);
    },
    has: (_, propName) => Reflect.has(getTarget(), propName),
    ownKeys: () => Reflect.ownKeys(getTarget()),
    getOwnPropertyDescriptor: (_, propName) => getOwnPropertyDescriptor(getTarget(), propName),
    getPrototypeOf: () => Reflect.getPrototypeOf(getTarget()),
    set: (_, propName, newValue) => {
      const result = Reflect.set(getTarget(), propName, newValue);

      if (result) observer.onChange?.(path);

      return result;
    },
    deleteProperty: (_, propName) => {
      const result = Reflect.deleteProperty(getTarget(), propName);

      if (result) observer.onChange?.(path);

      return result;
    },
  });
}

function createProxyForArray<T>(getTarget: () => T[], path: Path, observer: Observer): T[] {
  // An array placeholder makes Array.isArray(proxy) true.
  return new Proxy([] as T[], {
    has: (_, key) => Reflect.has(getTarget(), key),
    ownKeys: () => Reflect.ownKeys(getTarget()),
    getOwnPropertyDescriptor: (_, key) => {
      const descriptor = Reflect.getOwnPropertyDescriptor(getTarget(), key);
      if (!descriptor) return undefined;
      // `length` is non-configurable on both the real array and the placeholder; everything else must be
      // reported configurable because the placeholder does not have it.
      if (key === "length") {
        return { ...descriptor, configurable: false, value: getTarget().length };
      }
      descriptor.configurable = true;
      return descriptor;
    },
    get(_, key, receiver) {
      if (key === "push") {
        return (...items: T[]) => {
          const target = getTarget();
          const startIndex = target.length;
          const result = target.push(...items);
          if (items.length > 0) {
            const indexes = Array.from({ length: items.length }, (_, i) => startIndex + i);
            observer.onArrayItemAdd?.(path, indexes);
          }
          return result;
        };
      }

      if (key === "pop") {
        return () => {
          const target = getTarget();
          if (target.length === 0) {
            return target.pop();
          }
          const removedIndex = target.length - 1;
          const result = target.pop();
          observer.onArrayItemRemove?.(path, [removedIndex]);
          return result;
        };
      }

      if (key === "shift") {
        return () => {
          const target = getTarget();
          if (target.length === 0) {
            return target.shift();
          }
          const result = target.shift();
          observer.onArrayItemRemove?.(path, [0]);
          return result;
        };
      }

      if (key === "unshift") {
        return (...items: T[]) => {
          const target = getTarget();
          const result = target.unshift(...items);
          if (items.length > 0) {
            const indexes = Array.from({ length: items.length }, (_, i) => i);
            observer.onArrayItemAdd?.(path, indexes);
          }
          return result;
        };
      }

      if (key === "splice") {
        return (start: number, deleteCount?: number, ...items: T[]) => {
          const target = getTarget();
          const len = target.length;
          let actualStart = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
          if (Number.isNaN(actualStart)) {
            actualStart = 0;
          }
          const deleted =
            deleteCount === undefined ? target.splice(start) : target.splice(start, deleteCount, ...items);

          if (deleted.length > 0) {
            const removedIndexes = Array.from({ length: deleted.length }, (_, i) => actualStart + i);
            observer.onArrayItemRemove?.(path, removedIndexes);
          }
          if (items.length > 0) {
            const addedIndexes = Array.from({ length: items.length }, (_, i) => actualStart + i);
            observer.onArrayItemAdd?.(path, addedIndexes);
          }
          return deleted;
        };
      }

      if (key === "sort") {
        return (compareFn?: (a: T, b: T) => number) => {
          const target = getTarget();
          const result = target.sort(compareFn);
          if (target.length > 0) {
            const indexes = Array.from({ length: target.length }, (_, i) => i);
            observer.onArrayItemChange?.(path, indexes);
          }
          return result;
        };
      }

      if (key === "reverse") {
        return () => {
          const target = getTarget();
          const result = target.reverse();
          if (target.length > 0) {
            const indexes = Array.from({ length: target.length }, (_, i) => i);
            observer.onArrayItemChange?.(path, indexes);
          }
          return result;
        };
      }

      if (key === "fill") {
        return (value: T, start?: number, end?: number) => {
          const target = getTarget();
          const len = target.length;
          const k = start === undefined ? 0 : start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
          const final = end === undefined ? len : end < 0 ? Math.max(len + end, 0) : Math.min(end, len);
          const result = target.fill(value, start, end);
          if (k < final) {
            const indexes = Array.from({ length: final - k }, (_, i) => k + i);
            observer.onArrayItemChange?.(path, indexes);
          }
          return result;
        };
      }

      if (key === "copyWithin") {
        return (targetIndex: number, start: number, end?: number) => {
          const target = getTarget();
          const len = target.length;
          const to = targetIndex < 0 ? Math.max(len + targetIndex, 0) : Math.min(targetIndex, len);
          const from = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
          const final = end === undefined ? len : end < 0 ? Math.max(len + end, 0) : Math.min(end, len);
          const count = Math.min(final - from, len - to);
          const result = target.copyWithin(targetIndex, start, end);
          if (count > 0) {
            const indexes = Array.from({ length: count }, (_, i) => to + i);
            observer.onArrayItemChange?.(path, indexes);
          }
          return result;
        };
      }

      const target = getTarget();
      const value = Reflect.get(target, key);

      if (typeof value === "function") {
        // Element-reading methods run against the proxy so callbacks receive tracked elements;
        // everything else (indexOf, includes, join, slice, ...) runs against the raw array.
        return value.bind(ELEMENT_READING_METHODS.has(key) ? receiver : target);
      }
      return wrapValue(value, () => Reflect.get(getTarget(), key), [...path, key], observer);
    },
    set(_, key, newValue) {
      const target = getTarget();
      if (typeof key === "string" && /^\d+$/.test(key)) {
        const index = Number(key);
        const isExisting = index < target.length;
        const result = Reflect.set(target, key, newValue);
        if (result) {
          if (isExisting) {
            observer.onArrayItemChange?.(path, [index]);
          } else {
            observer.onArrayItemAdd?.(path, [index]);
          }
        }
        return result;
      }
      if (key === "length") {
        const oldLen = target.length;
        const result = Reflect.set(target, key, newValue);
        const newLen = target.length;
        if (result) {
          if (newLen < oldLen) {
            const removedIndexes = Array.from({ length: oldLen - newLen }, (_, i) => newLen + i);
            observer.onArrayItemRemove?.(path, removedIndexes);
          } else if (newLen > oldLen) {
            const addedIndexes = Array.from({ length: newLen - oldLen }, (_, i) => oldLen + i);
            observer.onArrayItemAdd?.(path, addedIndexes);
          }
        }
        return result;
      }
      const result = Reflect.set(target, key, newValue);
      if (result) observer.onChange?.(path);
      return result;
    },
    deleteProperty(_, key) {
      const target = getTarget();
      if (typeof key === "string" && /^\d+$/.test(key)) {
        const index = Number(key);
        const result = Reflect.deleteProperty(target, key);
        if (result) observer.onArrayItemChange?.(path, [index]);
        return result;
      }
      const result = Reflect.deleteProperty(target, key);
      if (result) observer.onChange?.(path);
      return result;
    },
  });
}

export function createModelState<T extends object>(target: T, observer: Observer): { target: T; proxy: T } {
  const result: { target: T; proxy: T } = {
    target,
    proxy: createProxyForObject(() => result.target, [], observer),
  };
  return result;
}
