import { afterEach, describe, expect, test } from "vite-plus/test";
import type { Dispatcher } from "../src/Dispatcher.ts";
import { type DevtoolsHook, setDevtoolsHook } from "../src/devtools.ts";
import { Model } from "../src/Model.ts";

interface CartState {
  items: string[];
  status: string;
}

class CartModel extends Model<CartState> {
  static initialState: CartState = { items: [], status: "idle" };

  public add(sku: string) {
    this.state.items.push(sku);
    return this.state.items.length;
  }

  public addTwice(sku: string) {
    this.add(sku);
    this.add(sku);
  }

  public fail() {
    throw new Error("nope");
  }

  public async checkout() {
    this.state.status = "submitting";
    await Promise.resolve();
    this.state.status = "done";
    return "ok";
  }

  public async declined() {
    await Promise.resolve();
    throw new Error("card_declined");
  }

  public get count() {
    return this.state.items.length;
  }

  public arrow = () => this.state.items.length;
}

function recordingDispatcher() {
  const events: Array<Record<string, unknown>> = [];
  const dispatcher: Dispatcher = {
    dispatchAction: p => events.push({ type: "action", ...p }),
    dispatchActionFinish: p => events.push({ type: "finish", ...p }),
    dispatchActionError: p => events.push({ type: "error", ...p }),
    dispatchStateChange: () => events.push({ type: "change" }),
  };
  return { events, dispatcher };
}

function recordingHook() {
  const calls: Array<[string, ...unknown[]]> = [];
  const hook: DevtoolsHook = {
    registerModel: h => calls.push(["register", h]),
    disposeModel: i => calls.push(["dispose", i]),
    actionStart: (_, e) => calls.push(["start", e]),
    actionEnd: (_, e) => calls.push(["end", e]),
    stateChange: (_, e) => calls.push(["change", e]),
    addSubscriber: () => () => {},
    registerContainer: () => () => {},
  };
  return { calls, hook };
}

afterEach(() => {
  setDevtoolsHook(undefined);
});

describe("method instrumentation", () => {
  test("reports sync calls with arguments and results", () => {
    const { events, dispatcher } = recordingDispatcher();
    const cart = Model.withInternalState(CartModel, { items: [], status: "idle" }, dispatcher);

    expect(cart.add("tee")).toBe(1);
    expect(events).toEqual([
      { type: "action", action: "add", payload: ["tee"], id: expect.any(Number) },
      { type: "change" },
      { type: "finish", action: "add", result: 1, id: events[0]!.id },
    ]);
  });

  test("reports and rethrows errors", () => {
    const { events, dispatcher } = recordingDispatcher();
    const cart = Model.withInternalState(CartModel, { items: [], status: "idle" }, dispatcher);

    expect(() => cart.fail()).toThrow("nope");
    expect(events.map(e => e.type)).toEqual(["action", "error"]);
    expect((events[1]!.error as Error).message).toBe("nope");
  });

  test("reports async completion and rejection after the promise settles", async () => {
    const { events, dispatcher } = recordingDispatcher();
    const cart = Model.withInternalState(CartModel, { items: [], status: "idle" }, dispatcher);

    await expect(cart.checkout()).resolves.toBe("ok");
    expect(events.map(e => e.type)).toEqual(["action", "change", "change", "finish"]);
    expect(events[3]!.result).toBe("ok");

    events.length = 0;
    await expect(cart.declined()).rejects.toThrow("card_declined");
    expect(events.map(e => e.type)).toEqual(["action", "error"]);
  });

  test("leaves getters alone and wraps arrow-function fields", () => {
    const { events, dispatcher } = recordingDispatcher();
    const cart = Model.withInternalState(CartModel, { items: ["a"], status: "idle" }, dispatcher);

    expect(cart.count).toBe(1);
    expect(events).toEqual([]);
    expect(cart.arrow()).toBe(1);
    expect(events.map(e => e.action)).toEqual(["arrow", "arrow"]);
  });

  test("does not wrap Model's own methods or add enumerable keys", () => {
    const { events, dispatcher } = recordingDispatcher();
    const cart = Model.withInternalState(CartModel, { items: [], status: "idle" }, dispatcher);

    cart.getState();
    expect(events).toEqual([]);
    expect(Object.keys(cart)).not.toContain("add");
  });

  test("plain construction stays uninstrumented", () => {
    const cart = new CartModel({ items: [], status: "idle" });
    expect(Object.hasOwn(cart, "add")).toBe(false);
  });
});

describe("devtools hook", () => {
  test("receives the model, nested calls and attributed state changes", () => {
    const { calls, hook } = recordingHook();
    setDevtoolsHook(hook);
    const { dispatcher } = recordingDispatcher();
    const cart = Model.withInternalState(CartModel, { items: [], status: "idle" }, dispatcher, {
      key: "cart",
      scope: "global",
    });

    const [kind, handle] = calls[0] as [string, { meta: unknown; getState(): CartState; ctor: unknown }];
    expect(kind).toBe("register");
    expect(handle.meta).toEqual({ key: "cart", scope: "global" });
    expect(handle.ctor).toBe(CartModel);

    calls.length = 0;
    cart.addTwice("tee");
    const starts = calls.filter(c => c[0] === "start").map(c => c[1] as { id: number; parentId?: number });
    expect(starts).toHaveLength(3);
    expect(starts[1]!.parentId).toBe(starts[0]!.id);
    const changes = calls.filter(c => c[0] === "change").map(c => c[1] as { actionId?: number });
    expect(changes.map(c => c.actionId)).toEqual([starts[1]!.id, starts[2]!.id]);
  });

  test("replaceState swaps the state and notifies the dispatcher", () => {
    const { calls, hook } = recordingHook();
    setDevtoolsHook(hook);
    const { events, dispatcher } = recordingDispatcher();
    const cart = Model.withInternalState(CartModel, { items: ["a"], status: "idle" }, dispatcher);
    const handle = calls[0]![1] as { replaceState(next: CartState): void };

    handle.replaceState({ items: ["x", "y"], status: "done" });
    expect(cart.getState()).toEqual({ items: ["x", "y"], status: "done" });
    expect(cart.add("z")).toBe(3);
    expect(events.filter(e => e.type === "change").length).toBe(2);
  });

  test("a throwing hook does not break the model", () => {
    const { hook } = recordingHook();
    hook.actionStart = () => {
      throw new Error("devtools bug");
    };
    setDevtoolsHook(hook);
    const original = console.error;
    console.error = () => {};
    try {
      const { dispatcher } = recordingDispatcher();
      const cart = Model.withInternalState(CartModel, { items: [], status: "idle" }, dispatcher);
      expect(cart.add("a")).toBe(1);
    } finally {
      console.error = original;
    }
  });
});
