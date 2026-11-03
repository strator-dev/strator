/** Helpers for copying, comparing and printing model state inside devtools. */

function isExotic(value: object): boolean {
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
 * Deep copy that keeps prototypes, Maps, Sets and Dates, preserves cycles and keeps functions by
 * reference. Used for the snapshots devtools keep, since models mutate their state in place.
 */
export function cloneValue<T>(value: T, seen: WeakMap<object, unknown> = new WeakMap()): T {
  if (typeof value !== "object" || value === null) return value;
  if (seen.has(value)) return seen.get(value) as T;
  if (value instanceof Date) return new Date(value.getTime()) as T;
  if (value instanceof Map) {
    const result = new Map();
    seen.set(value, result);
    for (const [k, v] of value) result.set(cloneValue(k, seen), cloneValue(v, seen));
    return result as T;
  }
  if (value instanceof Set) {
    const result = new Set();
    seen.set(value, result);
    for (const v of value) result.add(cloneValue(v, seen));
    return result as T;
  }
  if (isExotic(value)) return value;
  if (Array.isArray(value)) {
    const result: unknown[] = [];
    seen.set(value, result);
    for (const item of value) result.push(cloneValue(item, seen));
    return result as T;
  }
  const result = Object.create(Object.getPrototypeOf(value)) as Record<string, unknown>;
  seen.set(value, result);
  for (const key of Object.keys(value)) {
    result[key] = cloneValue((value as Record<string, unknown>)[key], seen);
  }
  return result as T;
}

export function isPlainContainer(value: unknown): value is Record<string, unknown> | unknown[] {
  return typeof value === "object" && value !== null && !isExotic(value);
}

export function childPath(parent: string, key: string | number, isArray: boolean): string {
  if (isArray) return `${parent}[${key}]`;
  const name = String(key);
  const safe = /^[A-Za-z_$][\w$]*$/.test(name) ? name : JSON.stringify(name);
  if (safe === name) return parent ? `${parent}.${name}` : name;
  return `${parent}[${safe}]`;
}

export interface StateChange {
  path: string;
  before: unknown;
  after: unknown;
}

const MAX_CHANGES = 100;

/** Leaf-level differences between two snapshots, e.g. `items[0].qty: 1 → 2`. */
export function diffValues(before: unknown, after: unknown, path = "", out: StateChange[] = []): StateChange[] {
  if (out.length >= MAX_CHANGES || Object.is(before, after)) return out;
  if (
    isPlainContainer(before) &&
    isPlainContainer(after) &&
    Array.isArray(before) === Array.isArray(after) &&
    Object.getPrototypeOf(before) === Object.getPrototypeOf(after)
  ) {
    const isArray = Array.isArray(before);
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    for (const key of keys) {
      diffValues(
        (before as Record<string, unknown>)[key],
        (after as Record<string, unknown>)[key],
        childPath(path, isArray ? Number(key) : key, isArray),
        out,
      );
      if (out.length >= MAX_CHANGES) break;
    }
    return out;
  }
  if (formatValue(before, Infinity) === formatValue(after, Infinity) && typeof before === "object") return out;
  out.push({ path: path || "(state)", before, after });
  return out;
}

function className(value: object): string | undefined {
  const proto = Object.getPrototypeOf(value);
  if (proto === null || proto === Object.prototype || proto === Array.prototype) return undefined;
  return proto.constructor?.name || undefined;
}

/** A short, JS-like rendering of a value: `{ sku: "STR-TEE", qty: 2 }`. */
export function formatValue(value: unknown, maxLength = 120, seen: Set<object> = new Set()): string {
  const text = formatInner(value, seen, maxLength);
  return text.length > maxLength ? `${text.slice(0, Math.max(1, maxLength - 1))}…` : text;
}

function formatInner(value: unknown, seen: Set<object>, budget: number): string {
  switch (typeof value) {
    case "string":
      return JSON.stringify(value);
    case "bigint":
      return `${value}n`;
    case "symbol":
      return value.toString();
    case "function":
      return `ƒ ${value.name || "anonymous"}()`;
    case "undefined":
      return "undefined";
    case "object":
      break;
    default:
      return String(value);
  }
  if (value === null) return "null";
  if (seen.has(value)) return "[Circular]";
  if (value instanceof Date) return `Date(${Number.isNaN(value.getTime()) ? "Invalid" : value.toISOString()})`;
  if (value instanceof RegExp) return String(value);
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  seen.add(value);
  try {
    const parts: string[] = [];
    let length = 0;
    const push = (part: string): boolean => {
      parts.push(part);
      length += part.length + 2;
      return length < budget;
    };
    if (value instanceof Map) {
      for (const [k, v] of value)
        if (!push(`${formatInner(k, seen, budget)} => ${formatInner(v, seen, budget)}`)) break;
      return `Map(${value.size}) {${parts.length ? ` ${parts.join(", ")} ` : ""}}`;
    }
    if (value instanceof Set) {
      for (const v of value) if (!push(formatInner(v, seen, budget))) break;
      return `Set(${value.size}) {${parts.length ? ` ${parts.join(", ")} ` : ""}}`;
    }
    if (Array.isArray(value)) {
      for (const item of value) if (!push(formatInner(item, seen, budget))) break;
      if (parts.length < value.length) parts.push("…");
      return `[${parts.join(", ")}]`;
    }
    if (isExotic(value)) return className(value) ?? "Object";
    const keys = Object.keys(value);
    for (const key of keys) {
      const label = /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
      if (!push(`${label}: ${formatInner((value as Record<string, unknown>)[key], seen, budget)}`)) break;
    }
    if (parts.length < keys.length) parts.push("…");
    const name = className(value);
    const body = parts.length ? `{ ${parts.join(", ")} }` : "{}";
    return name ? `${name} ${body}` : body;
  } finally {
    seen.delete(value);
  }
}

/** Source code that re-creates `value`, pretty printed, for the generated unit test. */
export function toCode(value: unknown, indent = "", seen: Set<object> = new Set()): string {
  switch (typeof value) {
    case "string":
      return JSON.stringify(value);
    case "bigint":
      return `${value}n`;
    case "undefined":
      return "undefined";
    case "function":
    case "symbol":
      return `undefined /* ${String(formatValue(value))} */`;
    case "number":
      return Number.isFinite(value)
        ? String(value)
        : Number.isNaN(value)
          ? "NaN"
          : value > 0
            ? "Infinity"
            : "-Infinity";
    case "object":
      break;
    default:
      return String(value);
  }
  if (value === null) return "null";
  if (seen.has(value)) return "undefined /* circular */";
  if (value instanceof Date) return `new Date(${JSON.stringify(value.toISOString())})`;
  if (value instanceof RegExp) return String(value);
  const inner = `${indent}  `;
  seen.add(value);
  try {
    if (value instanceof Map) {
      if (value.size === 0) return "new Map()";
      const entries = [...value].map(([k, v]) => `${inner}[${toCode(k, inner, seen)}, ${toCode(v, inner, seen)}]`);
      return `new Map([\n${entries.join(",\n")},\n${indent}])`;
    }
    if (value instanceof Set) {
      if (value.size === 0) return "new Set()";
      return `new Set(${toCode([...value], indent, seen)})`;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return "[]";
      const items = value.map(item => toCode(item, inner, seen));
      const flat = `[${items.join(", ")}]`;
      if (flat.length + indent.length <= 80 && !flat.includes("\n")) return flat;
      return `[\n${items.map(item => inner + item).join(",\n")},\n${indent}]`;
    }
    const keys = Object.keys(value);
    if (keys.length === 0) return "{}";
    const entries = keys.map(key => {
      const label = /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
      return `${label}: ${toCode((value as Record<string, unknown>)[key], inner, seen)}`;
    });
    const flat = `{ ${entries.join(", ")} }`;
    if (flat.length + indent.length <= 80 && !flat.includes("\n")) return flat;
    return `{\n${entries.map(entry => inner + entry).join(",\n")},\n${indent}}`;
  } finally {
    seen.delete(value);
  }
}

/** JSON-safe form of a snapshot, for "Copy JSON" and session export. */
export function toJSONValue(value: unknown, seen: Set<object> = new Set()): unknown {
  switch (typeof value) {
    case "bigint":
      return `${value}n`;
    case "function":
    case "symbol":
      return formatValue(value);
    case "undefined":
      return undefined;
    case "number":
      return Number.isFinite(value) ? value : String(value);
    case "object":
      break;
    default:
      return value;
  }
  if (value === null) return null;
  if (seen.has(value)) return "[Circular]";
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Error) return { name: value.name, message: value.message };
  seen.add(value);
  try {
    if (value instanceof Map) return Object.fromEntries([...value].map(([k, v]) => [String(k), toJSONValue(v, seen)]));
    if (value instanceof Set) return [...value].map(v => toJSONValue(v, seen));
    if (Array.isArray(value)) return value.map(v => toJSONValue(v, seen) ?? null);
    if (!isPlainContainer(value)) return formatValue(value);
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value)) result[key] = toJSONValue((value as Record<string, unknown>)[key], seen);
    return result;
  } finally {
    seen.delete(value);
  }
}

/** Whether a JSON round trip keeps `value` unchanged, i.e. the state can be edited as JSON. */
export function isJSONCompatible(value: unknown, seen: Set<object> = new Set()): boolean {
  if (value === null) return true;
  switch (typeof value) {
    case "string":
    case "boolean":
      return true;
    case "number":
      return Number.isFinite(value);
    case "object":
      break;
    default:
      return false;
  }
  if (seen.has(value)) return false;
  if (Array.isArray(value)) {
    seen.add(value);
    return value.every(item => isJSONCompatible(item, seen));
  }
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) return false;
  seen.add(value);
  return Object.values(value).every(item => isJSONCompatible(item, seen));
}
