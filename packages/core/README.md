# @strator/core

The framework-agnostic core engine for **Strator**, an intuitive, class-based MVVM (Model-View-ViewModel) state management library for modern JavaScript and TypeScript applications.

`@strator/core` empowers developers to cleanly separate business domain logic and mutations from UI rendering layers, delivering robust reactivity, fine-grained change tracking, and effortless zero-mock unit testing.

---

## Features

- **Class-Based Domain Models**: Encapsulate domain logic and state transitions within standard, typed TypeScript classes extending `Model<T>`.
- **Proxy-Driven Fine-Grained Reactivity**: Transparently tracks modifications to nested objects and arrays (`push`, `splice`, `pop`, etc.) and notifies dispatchers without boilerplate action creators or reducers.
- **Zero-Mock Unit Testing**: Because models are pure JavaScript classes, test domain logic and state mutations directly without mocking frameworks, DOM dependencies, or browser runtimes.
- **Framework Agnostic**: Core reactivity and model abstractions work seamlessly across any JavaScript environment or UI framework adapters (such as `@strator/react`).
- **External State Synchronization**: Easily observe and synchronize external state sources using `withExternalState`.

---

## Installation

Install `@strator/core` using your preferred package manager:

```bash
# pnpm
pnpm add @strator/core

# npm
npm install @strator/core

# yarn
yarn add @strator/core

# bun
bun add @strator/core
```

---

## Quick Start & Usage Examples

### 1. Defining a Domain Model

Extend the `Model<T>` base class and specify an initial state. Any mutation to `this.state` automatically triggers change notifications when connected to a dispatcher.

```typescript
// CartModel.ts
import { Model } from "@strator/core";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  currency: string;
}

export class CartModel extends Model<CartState> {
  // Define default initial state
  public static initialState: CartState = {
    items: [],
    currency: "USD",
  };

  // State mutations can be performed directly via class methods
  public addItem(item: Omit<CartItem, "quantity">) {
    const existing = this.state.items.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.state.items.push({ ...item, quantity: 1 });
    }
  }

  public removeItem(id: string) {
    const index = this.state.items.findIndex(i => i.id === id);
    if (index !== -1) {
      this.state.items.splice(index, 1);
    }
  }

  public clearCart() {
    this.state.items = [];
  }

  // Computed helper using current snapshot state
  public getTotalPrice(): number {
    return this.getState().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}
```

### 2. Zero-Mock Unit Testing

Models can be instantiated directly with any initial state for fast, isolated unit testing:

```typescript
// CartModel.test.ts
import { describe, it, expect } from "vitest";
import { CartModel } from "./CartModel";

describe("CartModel", () => {
  it("adds and calculates items correctly", () => {
    // Instantiate model with initial state (no DOM or UI wrappers needed)
    const cart = new CartModel({ items: [], currency: "USD" });

    cart.addItem({ id: "prod-1", name: "Keyboard", price: 99 });
    cart.addItem({ id: "prod-1", name: "Keyboard", price: 99 });
    cart.addItem({ id: "prod-2", name: "Mouse", price: 49 });

    expect(cart.getState().items).toHaveLength(2);
    expect(cart.getState().items[0].quantity).toBe(2);
    expect(cart.getTotalPrice()).toBe(247);
  });

  it("removes items cleanly", () => {
    const cart = new CartModel({
      items: [{ id: "prod-1", name: "Keyboard", price: 99, quantity: 1 }],
      currency: "USD",
    });

    cart.removeItem("prod-1");
    expect(cart.getState().items).toHaveLength(0);
  });
});
```

### 3. Integrating with Dispatchers

When integrating with UI adapters (like `@strator/react`), instantiate models via `Model.withInternalState`:

```typescript
import { Model, type Dispatcher } from "@strator/core";
import { CartModel } from "./CartModel";

const dispatcher: Dispatcher = {
  dispatchStateChange: ({ path, isArray }) => {
    console.log(`State changed at path: ${path.join(".")}`);
  },
  dispatchAction: payload => {
    /* ... */
  },
  dispatchActionFinish: payload => {
    /* ... */
  },
  dispatchActionError: payload => {
    /* ... */
  },
};

const cart = Model.withInternalState(CartModel, CartModel.initialState, dispatcher);

cart.addItem({ id: "item-1", name: "Item", price: 10 });
// Logs: State changed at path: items
```

---

## API Overview

- **`Model<T>`**: Abstract base class for domain models.
  - `getState()`: Returns a clean snapshot of the target state.
  - `state`: Protected accessor for mutating state through a reactive proxy.
  - `Model.withInternalState(ctor, initialState, dispatcher)`: Factory creating a model instance wrapped with a reactive proxy and dispatcher.
  - `Model.withExternalState(ctor, initialState, dispatcher, observer)`: Factory binding a model instance to an external state observer.
- **`createModelState(initialState, observer)`**: Creates a deeply proxied object that intercepts property sets and array mutations.
- **`Dispatcher`**: Interface for dispatching lifecycle events (`dispatchStateChange`, `dispatchAction`, `dispatchActionFinish`, `dispatchActionError`).

---

## Contributing

We welcome contributions of all kinds! To contribute to `@strator/core`:

1. **Fork and Clone the Repository**:

   ```bash
   git clone https://github.com/strator-dev/strator.git
   cd strator
   ```

2. **Install Dependencies**:
   This project uses [Vite+](https://viteplus.dev) (`vp`) and `pnpm`:

   ```bash
   vp install
   ```

3. **Run Tests**:
   Run unit tests across packages:

   ```bash
   vp test
   ```

4. **Verify Quality & Code Style**:
   Format, lint, and type-check the codebase:

   ```bash
   vp check
   # Or run ready check across the workspace
   vp run ready
   ```

5. **Build the Package**:

   ```bash
   vp pack
   ```

6. **Submit a Pull Request**:
   Create a descriptive branch, commit your changes, and open a Pull Request at [github.com/strator-dev/strator](https://github.com/strator-dev/strator). You can also report bugs or request features on the [GitHub Issues](https://github.com/strator-dev/strator/issues) page.

---

## Versioning

This project adheres to **[Epoch Semantic Versioning (Epoch SemVer)](https://antfu.me/posts/epoch-semver)**:

- **Patch releases** (`0.100.x`): Backward-compatible bug fixes and minor internal adjustments.
- **Minor releases / Epoch increments** (`0.101.0`, `0.102.0`): New features, enhancements, and non-breaking or incremental API refinements within the current epoch.
- **Major Epoch bumps** (`1000.0.0`): Fundamental shifts or revolutionary milestone transitions.

All workspace packages (`@strator/core`, `@strator/react`, `@strator/vue`) are versioned synchronously.

---

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).
