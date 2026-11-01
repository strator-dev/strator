function isPlainObject(value: unknown): value is Record<PropertyKey, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Objects whose state lives in internal slots (Map, Set, Date, typed arrays, ...) cannot be copied by
 * copying their own properties. They are kept by reference.
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
    value instanceof Error ||
    ArrayBuffer.isView(value) ||
    value instanceof ArrayBuffer
  );
}

/**
 * Deep-copies arrays, plain objects and ordinary class instances (keeping their prototype) so that a
 * snapshot handed to React never shares mutable references with the model state, which is mutated in
 * place. Exotic built-ins are kept by reference. Circular references are preserved.
 */
export function createSnapshot<T>(value: T, seen: WeakMap<object, unknown> = new WeakMap()): T {
  if (typeof value !== "object" || value === null || isExoticObject(value)) {
    return value;
  }
  if (seen.has(value)) {
    return seen.get(value) as T;
  }
  if (Array.isArray(value)) {
    const result: unknown[] = [];
    seen.set(value, result);
    for (const item of value) {
      result.push(createSnapshot(item, seen));
    }
    return result as T;
  }
  const result = Object.create(Object.getPrototypeOf(value)) as Record<PropertyKey, unknown>;
  seen.set(value, result);
  for (const key of Object.keys(value)) {
    result[key] = createSnapshot((value as Record<PropertyKey, unknown>)[key], seen);
  }
  return result as T;
}

/**
 * Structural equality for arrays, plain objects and ordinary class instances (which must share a
 * prototype); `Object.is` for everything else. Handles circular references.
 */
export function deepEqual(a: unknown, b: unknown, seen: WeakMap<object, object> = new WeakMap()): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) return false;
  if (isExoticObject(a) || isExoticObject(b)) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (!isPlainObject(a) && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  if (seen.get(a) === b) return true;
  seen.set(a, b);

  if (Array.isArray(a)) {
    const arrB = b as unknown[];
    if (a.length !== arrB.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], arrB[i], seen)) return false;
    }
    return true;
  }

  const objA = a as Record<PropertyKey, unknown>;
  const objB = b as Record<PropertyKey, unknown>;
  const keysA = Object.keys(objA);
  if (keysA.length !== Object.keys(objB).length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key) || !deepEqual(objA[key], objB[key], seen)) return false;
  }
  return true;
}
