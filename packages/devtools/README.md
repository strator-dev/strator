# @strator/devtools

In-app devtools for **Strator**. See every model instance your app holds, every method call made on them, and exactly what each call changed.

- **Instances**: grouped by scope (`useGlobalModel`, `useSharedModel`, `useLocalModel`) with key, version, subscriber count. Disposed instances stay visible, greyed out, with their final state.
- **Action log**: every model method call with arguments, status (`done`, `threw`, `pending`), duration and number of state changes. Filter by text or by instance, pause recording, clear, export the session as JSON.
- **Inspector**:
  - **State**: the live state tree, with the fields changed by the selected action highlighted. Copy it as JSON or edit it in place.
  - **Action**: arguments, return value or error, a leaf-level state diff, a ready-to-paste unit test that replays the call, "Jump to state before" and "Dispatch again".
  - **Subscribers**: the components using the instance, the hook and selector they use, and how often they rendered.

On wide screens the Instances and Inspector panes can be resized by dragging their edge (or with the arrow keys; double-click resets) and folded away. On narrow screens they fold into side rails and open as drawers over the action log.

## Installation

```bash
pnpm add -D @strator/devtools
```

React and react-dom are bundled into the package, so the panel works the same in React, Vue or plain JS apps and never clashes with your app's React version. `@strator/core` is the only required peer dependency.

## Usage

### Any app

```ts
import { mountDevtools } from "@strator/devtools";

if (import.meta.env.DEV) mountDevtools();
```

It shows a launcher button in the corner; click it to open the panel docked to the bottom of the page (drag the top edge to resize, or maximize it). `mountDevtools()` returns a function that removes it again.

| Option          | Default          | Description                                     |
| --------------- | ---------------- | ----------------------------------------------- |
| `initialIsOpen` | `false`          | Open the panel on first load (then remembered). |
| `position`      | `"bottom-right"` | Corner of the launcher button.                  |
| `initialHeight` | `420`            | Panel height in px (then remembered).           |
| `container`     | `document.body`  | Element the devtools are appended to.           |

To put the panel inside your own layout (a `/devtools` route, a split view), use `mountDevtoolsPanel(element)`.

### React

`@strator/devtools/react` wraps the same functions in components. They use your React only to know when to mount; the panel itself runs on the bundled React.

```tsx
import { StratorDevtools } from "@strator/devtools/react";

<>
  <StratorProvider>
    <App />
  </StratorProvider>
  {import.meta.env.DEV && <StratorDevtools />}
</>;
```

`<StratorDevtoolsPanel height={600} />` renders the panel in place.

### Browser extension

The same panel is available as a DevTools extension for Chrome (`packages/devtools-chrome`) and Firefox (`packages/devtools-firefox`). Every [GitHub release](https://github.com/strator-dev/strator/releases/latest) has both as zips to download, and [strator.dev/devtools](https://strator.dev/devtools/) explains how to install them. With the extension, the app needs no import at all: the extension installs the hook before the page's scripts run, and a **Strator** tab appears in the browser devtools.

## How it works

Importing `@strator/devtools` installs a hook on `@strator/core`. Models created through the bindings then report their method calls (`Dispatcher.dispatchAction` / `dispatchActionFinish` / `dispatchActionError`), state writes, lifecycle and subscribers to it. Without the import nothing is collected.

Import the package before your app renders its first model; instances created earlier are not tracked. (The browser extensions install the hook at page start, so they see everything.)

Writes that happen after an `await` inside an async method are attributed to that method while it is pending. Methods called after an `await` are logged as their own entries, because the synchronous call stack is gone by then.
