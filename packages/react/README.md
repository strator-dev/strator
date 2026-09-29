# @strator/react

Official React bindings for **Strator**, an intuitive, class-based MVVM (Model-View-ViewModel) state management library.

`@strator/react` bridges domain models created with [`@strator/core`](https://www.npmjs.com/package/@strator/core) to React components, providing fine-grained reactivity, selective re-renders via selectors, multiple model scoping strategies, and first-class Server-Side Rendering (SSR) & hydration support.

---

## Features

- **Component & Application Lifecycles**:
  - `useLocalModel`: Component-scoped model instance tied to the component's lifecycle.
  - `useSharedModel`: Keyed model instance shared across a specific subtree or identifiable by a string key.
  - `useGlobalModel`: Singleton model instance shared globally across the entire provider.
- **Selective Re-rendering**: Subscribe to specific state slices with selector functions and built-in shallow equality comparison to prevent unnecessary re-renders.
- **Direct Domain Method Invocations**: Trigger state updates by directly calling model methods without action dispatchers or reducer boilerplate.
- **Full SSR & Hydration Support**: Populate initial state maps on `<StratorProvider>` during server-side rendering and smoothly hydrate client-side state.

---

## Installation

Install `@strator/react` and `@strator/core` along with React:

```bash
# pnpm
pnpm add @strator/react @strator/core

# npm
npm install @strator/react @strator/core

# yarn
yarn add @strator/react @strator/core

# bun
bun add @strator/react @strator/core
```

> **Note**: `@strator/core` and `react` (>=18 or >=19) are peer dependencies.

---

## Quick Start & Usage Examples

### 1. Define a Domain Model (with `@strator/core`)

Define your state interface and domain logic as a class extending `Model<T>`:

```typescript
// CounterModel.ts
import { Model } from "@strator/core";

export interface CounterState {
  count: number;
}

export class CounterModel extends Model<CounterState> {
  public static initialState: CounterState = {
    count: 0,
  };

  public increase() {
    this.state.count += 1;
  }

  public decrease() {
    this.state.count -= 1;
  }

  public reset() {
    this.state.count = 0;
  }
}
```

---

### 2. Wrap Your App with `Provider` (Optional for local models, recommended for shared/global models and SSR)

```tsx
// App.tsx
import React from "react";
import { StratorProvider } from "@strator/react";
import { Counter } from "./Counter";

export function App() {
  return (
    <StratorProvider>
      <Counter />
    </StratorProvider>
  );
}
```

---

### 3. Local Model State (`useLocalModel`)

Use `useLocalModel` when a component needs an isolated model instance tied to its lifecycle:

```tsx
// Counter.tsx
import React from "react";
import { useLocalModel } from "@strator/react";
import { CounterModel } from "./CounterModel";

export function Counter() {
  // Pass a selector to subscribe only to the relevant slice of state
  const [model, count] = useLocalModel(CounterModel, state => state.count);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => model.increase()}>+1</button>
      <button onClick={() => model.decrease()}>-1</button>
      <button onClick={() => model.reset()}>Reset</button>
    </div>
  );
}
```

---

### 4. Global Model State (`useGlobalModel`)

Use `useGlobalModel` to share a singleton model instance across multiple components in the application tree:

```tsx
// Header.tsx
import React from "react";
import { useGlobalModel } from "@strator/react";
import { AuthModel } from "./AuthModel";

export function Header() {
  const [auth, username] = useGlobalModel(AuthModel, state => state.username);

  return (
    <header>
      {username ? (
        <div>
          <span>Welcome, {username}!</span>
          <button onClick={() => auth.logout()}>Logout</button>
        </div>
      ) : (
        <button onClick={() => auth.login("John")}>Login</button>
      )}
    </header>
  );
}
```

---

### 5. Shared Keyed Models (`useSharedModel`)

Use `useSharedModel` when multiple components need to share a model instance identified by a unique key (such as an item ID or widget name):

```tsx
// TodoItem.tsx
import React from "react";
import { useSharedModel } from "@strator/react";
import { TodoItemModel } from "./TodoItemModel";

interface TodoItemProps {
  todoId: string;
}

export function TodoItem({ todoId }: TodoItemProps) {
  const [todo, item] = useSharedModel(`todo-${todoId}`, TodoItemModel, state => state);

  return (
    <div>
      <span style={{ textDecoration: item.completed ? "line-through" : "none" }}>{item.title}</span>
      <button onClick={() => todo.toggleComplete()}>Toggle</button>
    </div>
  );
}
```

---

### 6. SSR & Hydration

Hydrate server-rendered state by passing initial state records or Maps to `<Provider>`:

```tsx
// Server-side / Hydration
import React from "react";
import { renderToString } from "react-dom/server";
import { Provider } from "@strator/react";
import { CounterModel } from "./CounterModel";
import { App } from "./App";

// On Server:
const initialState = {
  CounterModel: { count: 42 },
};

const html = renderToString(
  <Provider initialState={initialState}>
    <App />
  </Provider>,
);

// On Client:
// <Provider initialState={window.__INITIAL_STATE__}><App /></Provider>
```

---

## API Reference

- **`useLocalModel(ModelClass, selector?)`**: Creates a component-local instance of the model.
- **`useGlobalModel(ModelClass, selector?)`**: Accesses or creates a global singleton model instance keyed by class name.
- **`useSharedModel(key, ModelClass, selector?)`**: Accesses or creates a shared model instance identified by a string key.
- **`<Provider initialState={...}>` / `<StratorProvider>`**: Context provider managing model instances, lifecycle dispatchers, and SSR initial state.
- **`useStratorContext()`**: Accesses the active Strator context, dispatcher, and state snapshot helper (`getState()`).

---

## Contributing

We welcome contributions! To get started developing `@strator/react`:

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

3. **Run Unit Tests**:

   ```bash
   vp test
   ```

4. **Lint and Type-Check**:

   ```bash
   vp check
   # Or run workspace readiness check
   vp run ready
   ```

5. **Build the Package**:

   ```bash
   vp pack
   ```

6. **Submit a Pull Request**:
   Create a branch, commit your updates, and open a Pull Request at [github.com/strator-dev/strator](https://github.com/strator-dev/strator). Issue reports and feature requests can be submitted via [GitHub Issues](https://github.com/strator-dev/strator/issues).

---

## Versioning

This project adheres to **[Epoch Semantic Versioning (Epoch SemVer)](https://antfu.me/posts/epoch-semver)**:

- **Patch releases** (`0.100.x`): Backward-compatible bug fixes and minor internal adjustments.
- **Minor releases / Epoch increments** (`0.101.0`, `0.102.0`): New features, enhancements, and non-breaking or incremental API refinements within the current epoch.
- **Major Epoch bumps** (`1000.0.0`): Fundamental shifts or revolutionary milestone transitions.

All workspace packages (`@strator/core`, `@strator/react`) are versioned synchronously.

---

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).
