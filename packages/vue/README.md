# @strator/vue

Official Vue 3 bindings for **Strator**, an intuitive, class-based MVVM (Model-View-ViewModel) state management library.

`@strator/vue` bridges domain models created with [`@strator/core`](https://www.npmjs.com/package/@strator/core) to Vue 3 applications, providing native Vue `reactive()` state synchronization, fine-grained change tracking, flexible model scoping strategies (local, shared, global), seamless Composition API composables, and first-class SSR & hydration support.

---

## Features

- **Vue 3 Reactivity Bridge**: Automatically synchronizes Model mutations into native Vue `reactive()` proxies without forced full-component re-renders.
- **Component & Application Lifecycles**:
  - `useLocalModel`: Component-scoped model instance with automatic cleanup on unmount via `onScopeDispose`.
  - `useSharedModel`: Keyed model instance shared across components or subtrees identified by a unique key.
  - `useGlobalModel`: Singleton model instance shared globally across the entire application context.
- **Dual Destructuring Syntax**: Access model and reactive state using either array tuple destructuring (`const [model, state] = useLocalModel(...)`) or object destructuring (`const { model, state } = useLocalModel(...)`).
- **Flexible Selectors**: Subscribe to specific state slices via selector functions returning `ComputedRef` objects for fine-grained dependency tracking.
- **Plugin & Provider Setup**: Initialize globally with `createStrator()` Vue plugin (`app.use(createStrator())`) or scope to component trees via `<StratorProvider>` / `provideStratorContext()`.
- **Full SSR & Hydration Support**: Pass initial state records or Maps to `createStrator({ initialState })` or `<StratorProvider :initial-state="...">` during server-side rendering for instant hydration.

---

## Installation

Install `@strator/vue` and `@strator/core` along with Vue:

```bash
# pnpm
pnpm add @strator/vue @strator/core

# npm
npm install @strator/vue @strator/core

# yarn
yarn add @strator/vue @strator/core

# bun
bun add @strator/vue @strator/core
```

> **Note**: `@strator/core` and `vue` (>=3.4.0) are peer dependencies.

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

### 2. Install the Vue Plugin

Install the Strator plugin in your Vue application entry point (`main.ts`):

```typescript
// main.ts
import { createApp } from "vue";
import { createStrator } from "@strator/vue";
import App from "./App.vue";

const app = createApp(App);

// Install Strator root context
app.use(createStrator());

app.mount("#app");
```

---

### 3. Local Model State (`useLocalModel`)

Use `useLocalModel` in `<script setup>` for component-local state. It automatically disposes the model instance when the component unmounts:

```vue
<!-- Counter.vue -->
<script setup lang="ts">
import { useLocalModel } from "@strator/vue";
import { CounterModel } from "./CounterModel";

// Dual syntax: array tuple [model, state] or object { model, state }
const [model, state] = useLocalModel(CounterModel);
</script>

<template>
  <div>
    <p>Count: {{ state.count }}</p>
    <button @click="model.increase()">+1</button>
    <button @click="model.decrease()">-1</button>
    <button @click="model.reset()">Reset</button>
  </div>
</template>
```

#### With Selector Function:

```vue
<!-- CounterWithSelector.vue -->
<script setup lang="ts">
import { useLocalModel } from "@strator/vue";
import { CounterModel } from "./CounterModel";

// Passing a selector returns a ComputedRef
const [model, count] = useLocalModel(CounterModel, s => s.count);
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="model.increase()">+1</button>
  </div>
</template>
```

---

### 4. Global Model State (`useGlobalModel`)

Use `useGlobalModel` to access or create a shared singleton model across your entire application:

```vue
<!-- Header.vue -->
<script setup lang="ts">
import { useGlobalModel } from "@strator/vue";
import { AuthModel } from "./AuthModel";

const [auth, user] = useGlobalModel(AuthModel, s => s.user);
</script>

<template>
  <header>
    <div v-if="user">
      <span>Welcome, {{ user.name }}!</span>
      <button @click="auth.logout()">Logout</button>
    </div>
    <div v-else>
      <button @click="auth.login('John')">Login</button>
    </div>
  </header>
</template>
```

---

### 5. Shared Keyed Models (`useSharedModel`)

Use `useSharedModel` when multiple components need to share a model instance identified by a unique string key:

```vue
<!-- CartBadge.vue -->
<script setup lang="ts">
import { useSharedModel } from "@strator/vue";
import { CartModel } from "./CartModel";

const [cart, totalItems] = useSharedModel("main-cart", CartModel, s => s.items.length);
</script>

<template>
  <div class="cart-badge">
    <span>Items in cart: {{ totalItems }}</span>
  </div>
</template>
```

---

### 6. Scoped Context Provider (`<StratorProvider>`)

Use `<StratorProvider>` or `provideStratorContext()` to create an isolated context boundary (e.g., for widget subtrees, modals, or test fixtures):

```vue
<!-- CheckoutWidget.vue -->
<script setup lang="ts">
import { StratorProvider } from "@strator/vue";
import CheckoutFlow from "./CheckoutFlow.vue";
</script>

<template>
  <StratorProvider :initial-state="{ CartModel: { items: [] } }">
    <CheckoutFlow />
  </StratorProvider>
</template>
```

---

### 7. SSR & Hydration

Pass initial state maps or records during server-side rendering for seamless client hydration:

```typescript
// server.ts / entry-server.ts
import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import { createStrator } from "@strator/vue";
import App from "./App.vue";

export async function render() {
  const app = createSSRApp(App);

  const initialState = {
    CounterModel: { count: 42 },
  };

  app.use(createStrator({ initialState }));

  const html = await renderToString(app);
  return { html, state: initialState };
}
```

---

## API Reference

- **`createStrator(options?)`**: Vue plugin that creates and provides the root Strator context (`STRATOR_CONTEXT_KEY`). Accepts optional `initialState`.
- **`<StratorProvider :initial-state="...">`**: Component that creates an isolated Strator context boundary for its children.
- **`provideStratorContext(initialState?)`**: Imperative function to create and provide a scoped Strator context in `setup()`.
- **`useStratorContext()`**: Injects the active Strator context (`STRATOR_CONTEXT_KEY`).
- **`useLocalModel(ModelClass, selector?)`**: Creates a component-local model instance with automatic lifecycle cleanup (`onScopeDispose`).
- **`useGlobalModel(ModelClass, selector?)`**: Accesses or creates a global singleton model instance keyed by class name.
- **`useSharedModel(key, ModelClass, selector?)`**: Accesses or creates a shared model instance identified by a unique string key.
- **`useModel(key, ModelClass, selector?, options?)`**: Lower-level composable backing `useLocalModel`, `useSharedModel`, and `useGlobalModel`.

---

## Contributing

We welcome contributions! To get started developing `@strator/vue`:

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

All workspace packages (`@strator/core`, `@strator/react`, `@strator/vue`) are versioned synchronously.

---

## License

This package is licensed under the [MIT License](https://opensource.org/licenses/MIT).
