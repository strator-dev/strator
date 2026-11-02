# @strator/devtools

In-app devtools for **Strator**. See every model instance your app holds, every method call made on them, and exactly what each call changed.

- **Instances**: grouped by scope (`useGlobalModel`, `useSharedModel`, `useLocalModel`) with key, version, subscriber count. Disposed instances stay visible, greyed out, with their final state.
- **Action log**: every model method call with arguments, status (`done`, `threw`, `pending`), duration and number of state changes. Filter by text or by instance, pause recording, clear, export the session as JSON.
- **Inspector**:
  - **State**: the live state tree, with the fields changed by the selected action highlighted. Copy it as JSON or edit it in place.
  - **Action**: arguments, return value or error, a leaf-level state diff, a ready-to-paste unit test that replays the call, "Jump to state before" and "Dispatch again".
  - **Subscribers**: the components using the instance, the hook and selector they use, and how often they rendered.

On narrow screens the Instances and Inspector panes fold into side rails and open as drawers over the action log. On wide screens either pane can be folded away too.

## Installation

```bash
pnpm add -D @strator/devtools
```

`@strator/core`, `react` and `react-dom` are peer dependencies.

## Usage (React)

Render `<StratorDevtools />` once, anywhere. It does not need to be inside a `StratorProvider`:

```tsx
import { StratorDevtools } from "@strator/devtools";
import { StratorProvider } from "@strator/react";

createRoot(document.getElementById("root")!).render(
  <>
    <StratorProvider>
      <App />
    </StratorProvider>
    {import.meta.env.DEV && <StratorDevtools />}
  </>,
);
```

It shows a launcher button in the corner; click it to open the panel docked to the bottom of the page (drag the top edge to resize, or maximize it).

| Prop            | Default          | Description                                     |
| --------------- | ---------------- | ----------------------------------------------- |
| `initialIsOpen` | `false`          | Open the panel on first load (then remembered). |
| `position`      | `"bottom-right"` | Corner of the launcher button.                  |
| `initialHeight` | `420`            | Panel height in px (then remembered).           |

To embed the panel in your own layout (a `/devtools` route, a split view), use `<StratorDevtoolsPanel height={600} />`.

## Usage (Vue and others)

`mountDevtools()` renders the same panel in its own React root:

```ts
import { mountDevtools } from "@strator/devtools";

if (import.meta.env.DEV) mountDevtools();
```

## How it works

Importing `@strator/devtools` installs a hook on `@strator/core`. Models created through the bindings then report their method calls (`Dispatcher.dispatchAction` / `dispatchActionFinish` / `dispatchActionError`), state writes, lifecycle and subscribers to it. Without the import nothing is collected.

Import the package before your app renders its first model; instances created earlier are not tracked.

Writes that happen after an `await` inside an async method are attributed to that method while it is pending. Methods called after an `await` are logged as their own entries, because the synchronous call stack is gone by then.
