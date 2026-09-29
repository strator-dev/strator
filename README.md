# Strator

**Strator** is an intuitive, class-based MVVM (Model-View-ViewModel) state management library for modern JavaScript and TypeScript applications.

By separating domain business logic and state mutations into clean, testable TypeScript classes, Strator eliminates action creators, reducer boilerplate, and complex store wiring while providing fine-grained reactivity, zero-mock unit testing, and seamless UI framework integration.

---

## Packages

| Package                              | Version                                                                                                 | Description                                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [`@strator/core`](./packages/core)   | [![npm](https://img.shields.io/npm/v/@strator/core.svg)](https://www.npmjs.com/package/@strator/core)   | Framework-agnostic core engine (Proxy-based change tracking, `Model<T>` base class, dispatchers)                |
| [`@strator/react`](./packages/react) | [![npm](https://img.shields.io/npm/v/@strator/react.svg)](https://www.npmjs.com/package/@strator/react) | Official React bindings (`useLocalModel`, `useSharedModel`, `useGlobalModel`, `<StratorProvider>`, SSR support) |

---

## Repository Structure

This repository is a monorepo managed with [Vite+](https://viteplus.dev) (`vp`) and `pnpm`:

```text
strator/
├── apps/
│   └── website/          # Documentation and marketing website (Next.js)
├── packages/
│   ├── core/             # Framework-agnostic core MVVM state engine (@strator/core)
│   └── react/            # React integration hooks and provider (@strator/react)
├── examples/
│   └── react/            # Example React application showcasing Strator
├── package.json          # Monorepo root configuration and workspace scripts
├── pnpm-workspace.yaml   # pnpm workspace definition
└── vite.config.ts        # Vite+ toolchain configuration
```

---

## Quick Example

### 1. Define a Model (`@strator/core`)

```typescript
import { Model } from "@strator/core";

export interface CounterState {
  count: number;
}

export class CounterModel extends Model<CounterState> {
  public static initialState: CounterState = { count: 0 };

  public increase() {
    this.state.count += 1;
  }

  public decrease() {
    this.state.count -= 1;
  }
}
```

### 2. Connect to React (`@strator/react`)

```tsx
import React from "react";
import { useLocalModel } from "@strator/react";
import { CounterModel } from "./CounterModel";

export function Counter() {
  const [model, count] = useLocalModel(CounterModel, state => state.count);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => model.increase()}>+1</button>
      <button onClick={() => model.decrease()}>-1</button>
    </div>
  );
}
```

---

## Contributing

We welcome contributions from the community! Please read our detailed [Contribution Guidelines](./CONTRIBUTING.md) for full setup instructions, workflow details, and code review criteria.

### 1. Prerequisites

- **Node.js**: `>=22.12.0`
- **pnpm**: `>=10.0.0`
- **Vite+** (`vp`): [viteplus.dev](https://viteplus.dev)

### 2. Clone and Install

```bash
# Clone the repository
git clone https://github.com/strator-dev/strator.git
cd strator

# Install dependencies using Vite+
vp install
```

### 3. Development Workflow

- **Run tests across all packages**:

  ```bash
  vp test
  # Or run tests recursively across workspace packages
  vp run -r test
  ```

- **Format and lint code**:

  ```bash
  vp check
  # Automatically fix formatting/lint issues
  vp check --fix
  ```

- **Run the documentation website locally**:

  ```bash
  vp run dev
  ```

- **Build packages and applications**:

  ```bash
  vp run -r build
  ```

- **Verify workspace readiness (format, lint, test, build)**:
  ```bash
  vp run ready
  ```

### 4. Submitting Changes

1. Create a descriptive feature or bugfix branch (`git checkout -b feature/my-feature`).
2. Implement your changes and add unit tests where applicable.
3. Verify that all tests, linter, and formatting checks pass with `vp run ready`.
4. Commit your changes and open a Pull Request at [github.com/strator-dev/strator](https://github.com/strator-dev/strator).
5. For bug reports or feature requests, feel free to open an issue on [GitHub Issues](https://github.com/strator-dev/strator/issues).

---

## Versioning

This project adheres to **[Epoch Semantic Versioning (Epoch SemVer)](https://antfu.me/posts/epoch-semver)**:

- **Patch releases** (`0.100.x`): Backward-compatible bug fixes and minor internal adjustments.
- **Minor releases / Epoch increments** (`0.101.0`, `0.102.0`): New features, enhancements, and non-breaking or incremental API refinements within the current epoch.
- **Major Epoch bumps** (`1000.0.0`): Fundamental shifts or revolutionary milestone transitions.

All workspace packages (`@strator/core`, `@strator/react`) are versioned synchronously.

---

## License

This repository is licensed under the [MIT License](https://opensource.org/licenses/MIT).
