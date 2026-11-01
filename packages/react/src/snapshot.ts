function isPlainObject(value: unknown): value is Record<PropertyKey, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Deep-copies plain objects and arrays so that a snapshot handed to React never
 * shares mutable references with the model state (which is mutated in place).
 * Class instances, Maps, Dates and other exotic objects are kept by reference.
 */
export function createSnapshot<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(item => createSnapshot(item)) as unknown as T;
  }
  if (isPlainObject(value)) {
    const result: Record<PropertyKey, unknown> = {};
    for (const key of Object.keys(value)) {
      result[key] = createSnapshot(value[key]);
    }
    return result as T;
  }
  return value;
}

/** Structural equality for plain objects and arrays; `Object.is` for everything else. */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (isPlainObject(a)) {
    if (!isPlainObject(b)) return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key) || !deepEqual(a[key], b[key])) return false;
    }
    return true;
  }
  return false;
}
