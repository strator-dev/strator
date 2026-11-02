// @vitest-environment happy-dom
import { Model, setDevtoolsHook } from "@strator/core";
import { afterEach, beforeEach, describe, expect, test } from "vite-plus/test";
import type { Port } from "../src/extension/browser.ts";
import { startPageBridge } from "../src/extension/bridge.ts";
import { decodeValue, encodeValue, ENVELOPE } from "../src/extension/protocol.ts";
import { RemoteDevtoolsSource } from "../src/extension/RemoteDevtoolsSource.ts";
import { DevtoolsStore } from "../src/store.ts";
import { formatValue } from "../src/values.ts";

class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

describe("value encoding", () => {
  test("round-trips what JSON cannot carry", () => {
    const cyclic: Record<string, unknown> = { name: "loop" };
    cyclic.self = cyclic;
    const value = {
      missing: undefined,
      nan: Number.NaN,
      big: 10n,
      date: new Date(0),
      map: new Map([["a", { n: 1 }]]),
      set: new Set([1, 2]),
      point: new Point(1, 2),
      fn: function namedFn() {},
      cyclic,
      shared: [cyclic, cyclic],
    };
    const decoded = decodeValue(JSON.parse(JSON.stringify(encodeValue(value)))) as typeof value;

    expect("missing" in decoded && decoded.missing === undefined).toBe(true);
    expect(decoded.nan).toBeNaN();
    expect(decoded.big).toBe(10n);
    expect(decoded.date.getTime()).toBe(0);
    expect(decoded.map.get("a")).toEqual({ n: 1 });
    expect([...decoded.set]).toEqual([1, 2]);
    expect(formatValue(decoded.point)).toBe("Point { x: 1, y: 2 }");
    expect(formatValue((decoded as Record<string, unknown>).fn)).toBe("ƒ namedFn()");
    expect(formatValue(decoded.cyclic)).toBe('{ name: "loop", self: Circular {} }');
    // Shared (non-cyclic) references are not mistaken for cycles.
    expect(formatValue(decoded.shared[1])).toBe('{ name: "loop", self: Circular {} }');
  });

  test("plain objects with a $t key survive", () => {
    expect(decodeValue(encodeValue({ $t: "u", v: 1 }))).toEqual({ $t: "u", v: 1 });
  });
});

interface CounterState {
  count: number;
}

class CounterModel extends Model<CounterState> {
  static initialState: CounterState = { count: 0 };

  public increase(by: number) {
    this.state.count += by;
  }
}

const dispatcher = {
  dispatchAction() {},
  dispatchActionFinish() {},
  dispatchActionError() {},
  dispatchStateChange() {},
};

/** Wires a RemoteDevtoolsSource to the page bridge through window messages, like the content relay. */
function connect(): { source: RemoteDevtoolsSource; disconnect: () => void } {
  const listeners: Array<(message: unknown) => void> = [];
  const port: Port = {
    name: "test",
    postMessage: message => window.postMessage({ [ENVELOPE]: "panel", message }, "*"),
    disconnect() {},
    onMessage: { addListener: l => listeners.push(l as (message: unknown) => void) },
    onDisconnect: { addListener() {} },
  };
  const onPage = (event: MessageEvent) => {
    const data = event.data as Record<string, unknown> | null;
    if (data?.[ENVELOPE] === "page") for (const l of listeners) l(data.message);
  };
  window.addEventListener("message", onPage);
  const source = new RemoteDevtoolsSource(port);
  return { source, disconnect: () => window.removeEventListener("message", onPage) };
}

const wait = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

async function until(check: () => boolean) {
  for (let i = 0; i < 100 && !check(); i++) await wait(20);
  expect(check()).toBe(true);
}

let store: DevtoolsStore;
let stopBridge: () => void;

// happy-dom does not deliver window.postMessage; deliver it the way browsers do, asynchronously.
window.postMessage = ((data: unknown) => {
  setTimeout(() => window.dispatchEvent(new MessageEvent("message", { data, source: window })));
}) as typeof window.postMessage;

beforeEach(() => {
  store = new DevtoolsStore();
  setDevtoolsHook(store);
  stopBridge = startPageBridge(store);
});

afterEach(() => {
  stopBridge();
  setDevtoolsHook(undefined);
});

describe("page bridge ↔ remote source", () => {
  test("mirrors instances and actions, and carries commands back", async () => {
    const counter = Model.withInternalState(CounterModel, { count: 0 }, dispatcher, { key: "c", scope: "local" });
    counter.increase(2);

    const { source, disconnect } = connect();
    source.init();
    await until(() => source.actions.length === 1);

    expect(source.instances[0]).toMatchObject({ model: "CounterModel", key: "c", scope: "local", canReplace: true });
    expect(source.instances[0]!.snapshot).toEqual({ count: 2 });
    expect(source.actions[0]).toMatchObject({ method: "increase", args: [2], status: "done" });
    expect(source.actions[0]!.changes).toEqual([{ path: "count", before: 0, after: 2 }]);

    // Incremental sync picks up new calls.
    counter.increase(3);
    await until(() => source.actions.length === 2);

    // Commands run in the page.
    source.jumpBefore(source.actions[1]!.id);
    await until(() => counter.getState().count === 2);
    source.dispatchAgain(source.actions[0]!.id);
    await until(() => counter.getState().count === 4);

    const exported = (await source.exportSession()) as { actions: unknown[] };
    expect(exported.actions.length).toBeGreaterThanOrEqual(4);

    source.clear();
    await until(() => source.actions.length === 0);

    source.setRecording(false);
    await until(() => !store.recording);
    disconnect();
  });
});
