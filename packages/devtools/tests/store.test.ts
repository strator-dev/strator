import { Model } from "@strator/core";
import { afterEach, beforeEach, describe, expect, test } from "vite-plus/test";
import { DevtoolsStore, installDevtools, uninstallDevtools } from "../src/store.ts";
import { testSnippet } from "../src/snippet.ts";
import { diffValues, formatValue, toCode } from "../src/values.ts";
import { setDevtoolsHook } from "@strator/core";

interface Item {
  sku: string;
  qty: number;
}
interface CartState {
  items: Item[];
  status: string;
  lastError: string | null;
}

class CartModel extends Model<CartState> {
  static initialState: CartState = { items: [], status: "idle", lastError: null };

  public addItem(sku: string) {
    this.state.items.push({ sku, qty: 1 });
  }

  public updateQty(sku: string, qty: number) {
    const item = this.state.items.find(i => i.sku === sku);
    if (item) item.qty = qty;
  }

  public setStatus(status: string) {
    this.state.status = status;
  }

  public async checkout() {
    this.setStatus("submitting");
    await Promise.resolve();
    this.state.lastError = "card_declined";
    this.setStatus("idle");
    throw new Error("card_declined");
  }

  public count() {
    return this.state.items.length;
  }
}

const noopDispatcher = {
  dispatchAction() {},
  dispatchActionFinish() {},
  dispatchActionError() {},
  dispatchStateChange() {},
};

const tick = () => new Promise(resolve => setTimeout(resolve, 0));

let store: DevtoolsStore;

beforeEach(() => {
  store = new DevtoolsStore();
  setDevtoolsHook(store);
});

afterEach(() => {
  setDevtoolsHook(undefined);
});

function createCart() {
  return Model.withInternalState(CartModel, { items: [], status: "idle", lastError: null }, noopDispatcher, {
    key: "cart",
    scope: "global",
    source: "@strator/react",
  });
}

describe("DevtoolsStore", () => {
  test("tracks instances with key, scope and version", () => {
    const cart = createCart();
    cart.addItem("tee");
    cart.addItem("mug");

    expect(store.instances).toHaveLength(1);
    const [instance] = store.instances;
    expect(instance).toMatchObject({ model: "CartModel", key: "cart", scope: "global", version: 2 });
  });

  test("records sync calls with args, result and leaf diffs", () => {
    const cart = createCart();
    cart.addItem("tee");
    cart.updateQty("tee", 2);
    expect(cart.count()).toBe(1);

    const [add, update, count] = store.actions;
    expect(add).toMatchObject({ method: "addItem", args: ["tee"], status: "done", isAsync: false });
    expect(add!.changes).toEqual([{ path: "items[0]", before: undefined, after: { sku: "tee", qty: 1 } }]);
    expect(update!.changes).toEqual([{ path: "items[0].qty", before: 1, after: 2 }]);
    expect(update!.before).toEqual({ items: [{ sku: "tee", qty: 1 }], status: "idle", lastError: null });
    expect(update!.after).toEqual({ items: [{ sku: "tee", qty: 2 }], status: "idle", lastError: null });
    expect(count).toMatchObject({ method: "count", result: 1, changes: [] });
  });

  test("attributes awaited writes to the pending async call and nests inner calls", async () => {
    const cart = createCart();
    await expect(cart.checkout()).rejects.toThrow("card_declined");
    await tick();

    const checkout = store.actions.find(a => a.method === "checkout")!;
    expect(checkout).toMatchObject({ status: "threw", isAsync: true, error: { message: "card_declined" } });
    expect(checkout.changes.map(c => `${c.path}: ${String(c.before)} → ${String(c.after)}`)).toEqual([
      "status: idle → submitting",
      "lastError: null → card_declined",
    ]);
    const inner = store.actions.filter(a => a.method === "setStatus");
    expect(inner).toHaveLength(2);
    // Called synchronously from checkout: nested under it.
    expect(inner[0]!.parentId).toBe(checkout.id);
    expect(inner[0]!.depth).toBe(1);
    // Called after an await: the call stack is gone, so it is logged on its own.
    expect(inner[1]!.parentId).toBeUndefined();
    expect(inner[1]!.changes).toEqual([{ path: "status", before: "submitting", after: "idle" }]);
  });

  test("pausing stops capturing actions but keeps counting versions", () => {
    const cart = createCart();
    store.setRecording(false);
    cart.addItem("tee");
    expect(store.actions).toHaveLength(0);
    expect(store.instances[0]!.version).toBe(1);
    store.setRecording(true);
    cart.addItem("mug");
    expect(store.actions[0]!.changes).toEqual([{ path: "items[1]", before: undefined, after: { sku: "mug", qty: 1 } }]);
  });

  test("dispose, replaceState and dispatchAgain", () => {
    const cart = createCart();
    cart.addItem("tee");
    const add = store.actions[0]!;
    const uid = store.instances[0]!.uid;

    expect(store.replaceState(uid, add.before, "devtools: jump")).toBe(true);
    expect(cart.getState().items).toEqual([]);
    const jump = store.actions[1]!;
    expect(jump).toMatchObject({ method: "devtools: jump", status: "external" });

    store.dispatchAgain(add.id);
    expect(cart.getState().items).toEqual([{ sku: "tee", qty: 1 }]);

    store.disposeModel(cart);
    expect(store.instances[0]!.disposed).toBe(true);
    expect(store.actions[store.actions.length - 1]).toMatchObject({ method: "dispose", status: "lifecycle" });
    expect(store.replaceState(uid, add.before)).toBe(false);
  });

  test("subscribers and containers", () => {
    const cart = createCart();
    const remove = store.addSubscriber(cart, { hook: "useGlobalModel", component: "CartBadge", renders: 1 });
    const unregister = store.registerContainer({ source: "@strator/react", id: {} });
    expect(store.instances[0]!.subscribers.size).toBe(1);
    expect(store.containers).toHaveLength(1);
    remove();
    unregister();
    expect(store.instances[0]!.subscribers.size).toBe(0);
    expect(store.containers).toHaveLength(0);
  });

  test("caps the log and clears it", () => {
    store = new DevtoolsStore({ maxActions: 3 });
    setDevtoolsHook(store);
    const cart = createCart();
    for (let i = 0; i < 5; i++) cart.addItem(`sku-${i}`);
    expect(store.actions.map(a => a.args[0])).toEqual(["sku-2", "sku-3", "sku-4"]);
    store.clear();
    expect(store.actions).toEqual([]);
  });

  test("notifies listeners in a batch", async () => {
    const cart = createCart();
    let calls = 0;
    store.subscribe(() => calls++);
    cart.addItem("a");
    cart.addItem("b");
    expect(calls).toBe(0);
    await tick();
    expect(calls).toBe(1);
  });

  test("exports a JSON-safe session", () => {
    const cart = createCart();
    cart.addItem("tee");
    const session = JSON.parse(JSON.stringify(store.exportSession()));
    expect(session.instances[0]).toMatchObject({ model: "CartModel", key: "cart", state: { items: [{ sku: "tee" }] } });
    expect(session.actions[0]).toMatchObject({ method: "addItem", args: ["tee"], status: "done" });
  });

  test("installDevtools installs one page-wide store", () => {
    setDevtoolsHook(undefined);
    const a = installDevtools();
    const b = installDevtools();
    expect(a).toBe(b);
    uninstallDevtools();
  });
});

describe("values", () => {
  test("formatValue renders JS-like previews", () => {
    expect(formatValue({ sku: "STR-TEE", qty: 2 })).toBe('{ sku: "STR-TEE", qty: 2 }');
    expect(formatValue([1, "a", null, undefined])).toBe('[1, "a", null, undefined]');
    expect(formatValue(new Map([["a", 1]]))).toBe('Map(1) { "a" => 1 }');
    expect(formatValue("x".repeat(50), 10)).toHaveLength(10);
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(formatValue(cyclic)).toBe("{ self: [Circular] }");
  });

  test("diffValues reports leaf paths", () => {
    expect(diffValues({ a: { b: 1 }, c: [1] }, { a: { b: 2 }, c: [1, 2] })).toEqual([
      { path: "a.b", before: 1, after: 2 },
      { path: "c[1]", before: undefined, after: 2 },
    ]);
    expect(diffValues({ "odd key": 1 }, { "odd key": 2 })[0]!.path).toBe('["odd key"]');
  });

  test("toCode produces source", () => {
    expect(toCode({ items: [{ sku: "a" }], d: new Date(0) })).toBe(
      '{ items: [{ sku: "a" }], d: new Date("1970-01-01T00:00:00.000Z") }',
    );
  });
});

describe("testSnippet", () => {
  test("replays a sync call", () => {
    const cart = createCart();
    cart.addItem("tee");
    const snippet = testSnippet(store.instances[0]!, store.actions[0]!);
    expect(snippet).toContain('import { CartModel } from "./CartModel";');
    expect(snippet).toContain('const cart = new CartModel({ items: [], status: "idle", lastError: null });');
    expect(snippet).toContain('  cart.addItem("tee");');
    expect(snippet).toContain(
      'expect(cart.getState()).toEqual({ items: [{ sku: "tee", qty: 1 }], status: "idle", lastError: null });',
    );
  });

  test("replays an async rejection", async () => {
    const cart = createCart();
    await expect(cart.checkout()).rejects.toThrow();
    await tick();
    const checkout = store.actions.find(a => a.method === "checkout")!;
    const snippet = testSnippet(store.instances[0]!, checkout);
    expect(snippet).toContain('test("CartModel.checkout", async () => {');
    expect(snippet).toContain('await expect(cart.checkout()).rejects.toThrow("card_declined");');
  });
});
