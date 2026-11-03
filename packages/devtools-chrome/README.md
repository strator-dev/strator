# Strator Devtools for Chrome

A **Strator** tab in Chrome DevTools: model instances, method calls, state diffs and subscribers of any page that uses Strator. It is the same panel as [`@strator/devtools`](../devtools), running in the browser instead of in your app.

## Build

```bash
pnpm --filter @strator/devtools-chrome build   # → packages/devtools-chrome/dist
pnpm --filter @strator/devtools-chrome zip     # → strator-devtools-chrome.zip, for the Chrome Web Store
```

## Install locally

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and pick `packages/devtools-chrome/dist`.
3. Open any page that uses Strator, open DevTools, and pick the **Strator** tab.

Works in Chrome 111+ and other Chromium browsers (Edge, Brave, Arc).

## How it works

| File            | Runs in                   | Does                                                                       |
| --------------- | ------------------------- | -------------------------------------------------------------------------- |
| `hook.js`       | the page, before its code | Installs the Strator devtools hook and a bridge that streams what it sees. |
| `content.js`    | content script            | Relays messages between the page and the extension.                        |
| `background.js` | service worker            | Pairs each DevTools panel with the tab it inspects.                        |
| `devtools.js`   | DevTools page             | Adds the **Strator** panel.                                                |
| `panel.js`      | the panel                 | Renders the devtools panel from a live mirror of the page's data.          |

Pages that never create a Strator model never talk to the extension. The sources live in `packages/devtools/src/extension`; this package only holds the entry points, the manifest and the build.
