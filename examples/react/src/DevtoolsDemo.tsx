import { Model } from "@strator/core";
import { useGlobalModel, useSharedModel } from "@strator/react";

interface CartItem {
  sku: string;
  qty: number;
  price: number;
}

interface CartState {
  items: CartItem[];
  coupon: string | null;
  status: "idle" | "submitting";
  lastError: string | null;
}

class CartModel extends Model<CartState> {
  static modelKey = "cart";
  static initialState: CartState = { items: [], coupon: null, status: "idle", lastError: null };

  public addItem(sku: string, price: number) {
    const existing = this.state.items.find(item => item.sku === sku);
    if (existing) existing.qty += 1;
    else this.state.items.push({ sku, qty: 1, price });
  }

  public applyCoupon(code: string) {
    this.state.coupon = code;
    return true;
  }

  public async checkout() {
    this.state.status = "submitting";
    await new Promise(resolve => setTimeout(resolve, 400));
    this.state.lastError = "card_declined";
    this.state.status = "idle";
    throw new Error("PaymentDeclined: card_declined");
  }
}

interface TodoState {
  items: Array<{ id: number; title: string; done: boolean }>;
}

class TodoListModel extends Model<TodoState> {
  static initialState: TodoState = { items: [{ id: 1, title: "Write docs", done: false }] };

  public add(title: string) {
    this.state.items.push({ id: this.state.items.length + 1, title, done: false });
    return this.state.items.length;
  }

  public toggle(id: number) {
    const item = this.state.items.find(todo => todo.id === id);
    if (item) item.done = !item.done;
  }
}

function CartWidget() {
  const [cart, items] = useGlobalModel(CartModel, state => state.items);
  const [, status] = useGlobalModel(CartModel, state => state.status);
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
      <button className="counter" onClick={() => cart.addItem("STR-TEE", 24)}>
        Add tee ({items.length} in cart)
      </button>
      <button className="counter" onClick={() => cart.applyCoupon("LAUNCH10")}>
        Apply coupon
      </button>
      <button className="counter" onClick={() => cart.checkout().catch(() => {})}>
        {status === "submitting" ? "Checking out…" : "Checkout"}
      </button>
    </div>
  );
}

function Inbox() {
  const [todos, open] = useSharedModel("todos:inbox", TodoListModel, state => state.items.filter(t => !t.done).length);
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
      <button className="counter" onClick={() => todos.add("Ship devtools")}>
        Add todo ({open} open)
      </button>
      <button className="counter" onClick={() => todos.toggle(1)}>
        Toggle first
      </button>
    </div>
  );
}

/** A few models to look at in the devtools panel. */
export function DevtoolsDemo() {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12, padding: "24px 0" }}>
      <CartWidget />
      <Inbox />
    </section>
  );
}
