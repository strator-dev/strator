/**
 * Messages between the inspected page and the extension panel. Values are encoded into JSON-safe tagged
 * form, because extension messaging only carries JSON, while model state can hold Maps, Dates, class
 * instances, `undefined` and cycles.
 */
import type { ActionRecord, InstanceView } from "../store.ts";
import { formatValue } from "../values.ts";

export type Encoded = unknown;

interface Tagged {
  $t: string;
  [key: string]: unknown;
}

function className(value: object): string | undefined {
  const proto = Object.getPrototypeOf(value);
  if (proto === null || proto === Object.prototype) return undefined;
  return proto.constructor?.name || undefined;
}

export function encodeValue(value: unknown, ancestors: Set<object> = new Set()): Encoded {
  switch (typeof value) {
    case "undefined":
      return { $t: "u" };
    case "number":
      return Number.isFinite(value) ? value : { $t: "n", v: String(value) };
    case "bigint":
      return { $t: "b", v: value.toString() };
    case "symbol":
      return { $t: "s", v: value.toString() };
    case "function":
      return { $t: "f", v: value.name };
    case "object":
      break;
    default:
      return value;
  }
  if (value === null) return null;
  if (ancestors.has(value)) return { $t: "c" };
  if (value instanceof Date) return { $t: "d", v: value.getTime() };
  if (value instanceof RegExp) return { $t: "r", v: String(value) };
  if (value instanceof Error) return { $t: "e", name: value.name, message: value.message, stack: value.stack };
  ancestors.add(value);
  try {
    if (Array.isArray(value)) return value.map(item => encodeValue(item, ancestors));
    if (value instanceof Map) {
      return { $t: "m", v: [...value].map(([k, v]) => [encodeValue(k, ancestors), encodeValue(v, ancestors)]) };
    }
    if (value instanceof Set) return { $t: "set", v: [...value].map(v => encodeValue(v, ancestors)) };
    if (
      value instanceof WeakMap ||
      value instanceof WeakSet ||
      value instanceof Promise ||
      ArrayBuffer.isView(value) ||
      value instanceof ArrayBuffer
    ) {
      return { $t: "x", v: formatValue(value) };
    }
    const entries: Record<string, Encoded> = {};
    for (const key of Object.keys(value)) {
      entries[key] = encodeValue((value as Record<string, unknown>)[key], ancestors);
    }
    const name = className(value);
    return name ? { $t: "o", c: name, v: entries } : { $t: "o", v: entries };
  } finally {
    ancestors.delete(value);
  }
}

const prototypes = new Map<string, object>();

/** A stand-in prototype so decoded class instances still print as `ClassName { … }`. */
function prototypeFor(name: string): object {
  let proto = prototypes.get(name);
  if (!proto) {
    proto = Object.create(null, { constructor: { value: { name }, enumerable: false } }) as object;
    prototypes.set(name, proto);
  }
  return proto;
}

export function decodeValue(value: Encoded): unknown {
  if (Array.isArray(value)) return value.map(decodeValue);
  if (typeof value !== "object" || value === null) return value;
  const tagged = value as Tagged;
  switch (tagged.$t) {
    case "u":
      return undefined;
    case "n":
      return Number(tagged.v);
    case "b":
      return BigInt(tagged.v as string);
    case "s":
      return Symbol((tagged.v as string).replace(/^Symbol\((.*)\)$/, "$1"));
    case "f": {
      const fn = function () {};
      Object.defineProperty(fn, "name", { value: tagged.v });
      return fn;
    }
    case "c":
      return Object.create(prototypeFor("Circular"));
    case "d":
      return new Date(tagged.v as number);
    case "r": {
      const match = /^\/(.*)\/([a-z]*)$/s.exec(tagged.v as string);
      return match ? new RegExp(match[1]!, match[2]) : tagged.v;
    }
    case "e": {
      const error = new Error(tagged.message as string);
      error.name = tagged.name as string;
      error.stack = tagged.stack as string | undefined;
      return error;
    }
    case "m":
      return new Map((tagged.v as Array<[Encoded, Encoded]>).map(([k, v]) => [decodeValue(k), decodeValue(v)]));
    case "set":
      return new Set((tagged.v as Encoded[]).map(decodeValue));
    case "x":
      return Object.create(prototypeFor(String(tagged.v)));
    case "o": {
      const result = (tagged.c ? Object.create(prototypeFor(tagged.c as string)) : {}) as Record<string, unknown>;
      for (const [key, v] of Object.entries(tagged.v as Record<string, Encoded>)) result[key] = decodeValue(v);
      return result;
    }
    default:
      return value;
  }
}

/** An instance as sent to the panel: subscribers as an array, state encoded. */
export interface WireInstance extends Omit<InstanceView, "subscribers" | "snapshot"> {
  subscribers: Array<InstanceView["subscribers"] extends Set<infer S> ? S : never>;
  snapshot: Encoded;
}

export interface WireAction extends Omit<ActionRecord, "args" | "result" | "before" | "after" | "changes"> {
  args: Encoded;
  result: Encoded;
  before: Encoded;
  after: Encoded;
  changes: Array<{ path: string; before: Encoded; after: Encoded }>;
}

/** Page → panel. */
export type PageMessage =
  | { kind: "hello" }
  | {
      kind: "sync";
      /** The panel must drop what it has (first sync after `init`, or the log was cleared). */
      reset: boolean;
      host: string;
      recording: boolean;
      containers: Array<{ source: string }>;
      instances: WireInstance[];
      /** Every action id the page holds, in order. */
      actionIds: number[];
      /** Actions that are new or changed since the last sync. */
      actions: WireAction[];
    }
  | { kind: "export"; requestId: number; data: unknown };

/** Panel → page. */
export type PanelMessage =
  | { kind: "init" }
  | { kind: "setRecording"; recording: boolean }
  | { kind: "clear" }
  | { kind: "replaceState"; uid: number; state: Encoded; label?: string }
  | { kind: "jumpBefore"; actionId: number }
  | { kind: "dispatchAgain"; actionId: number }
  | { kind: "export"; requestId: number };

/** Background → panel, about the inspected page's connection. */
export type ConnectionMessage = { kind: "page-connected" } | { kind: "page-disconnected" };

/** Marker on `window.postMessage` envelopes between the page bridge and the content script. */
export const ENVELOPE = "__strator_devtools__";
export const CONTENT_PORT = "strator-content";
export const PANEL_PORT_PREFIX = "strator-panel:";
