# Strator Devtools for Chrome

A **Strator** tab in Chrome DevTools: model instances, method calls, state diffs and subscribers of any page that uses Strator. It is the same panel as [`@strator/devtools`](../devtools), running in the browser instead of in your app.

## Build

```bash
pnpm --filter @strator/devtools-chrome build   # → packages/devtools-chrome/dist
pnpm --filter @strator/devtools-chrome zip     # → strator-devtools-chrome.zip, for the Chrome Web Store
```

## Install from a release

1. Download [`strator-devtools-chrome.zip`](https://github.com/strator-dev/strator/releases/latest/download/strator-devtools-chrome.zip) from the latest release and unzip it.
2. Open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and pick the unzipped folder.

The release workflow builds both zips and attaches them to every GitHub release.

## Install locally

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and pick `packages/devtools-chrome/dist`.
3. Open any page that uses Strator, open DevTools, and pick the **Strator** tab.

Works in Chrome 111+ and other Chromium browsers (Edge, Brave, Arc).

## Publishing to the Chrome Web Store

The release workflow (`.github/workflows/npm-publish.yml`, job `publish-chrome`) uploads the release zip with `tools/publish-chrome-extension.mjs` and submits it for review. The job may fail without failing the release. It needs, once:

1. The first version uploaded by hand in the [Developer Dashboard](https://chrome.google.com/webstore/devconsole), with the Store listing and Privacy tabs filled in. The API cannot create items.
2. A Google Cloud project with the Chrome Web Store API enabled, and a service account in it, added under **Account → Service accounts** in the Developer Dashboard.
3. In the GitHub `production` environment: the secret `CWS_SERVICE_ACCOUNT_KEY` (the service account's JSON key) and the variables `CWS_PUBLISHER_ID` and `CWS_EXTENSION_ID`.

## How it works

| File            | Runs in                   | Does                                                                       |
| --------------- | ------------------------- | -------------------------------------------------------------------------- |
| `hook.js`       | the page, before its code | Installs the Strator devtools hook and a bridge that streams what it sees. |
| `content.js`    | content script            | Relays messages between the page and the extension.                        |
| `background.js` | service worker            | Pairs each DevTools panel with the tab it inspects.                        |
| `devtools.js`   | DevTools page             | Adds the **Strator** panel.                                                |
| `panel.js`      | the panel                 | Renders the devtools panel from a live mirror of the page's data.          |

Pages that never create a Strator model never talk to the extension. The sources live in `packages/devtools/src/extension`; this package only holds the entry points, the manifest and the build.
