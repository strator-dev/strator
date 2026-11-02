# Strator Devtools for Firefox

A **Strator** tab in Firefox Developer Tools: model instances, method calls, state diffs and subscribers of any page that uses Strator. It is the same panel as [`@strator/devtools`](../devtools), running in the browser instead of in your app.

## Build

```bash
pnpm --filter @strator/devtools-firefox build   # → packages/devtools-firefox/dist
pnpm --filter @strator/devtools-firefox zip     # → strator-devtools-firefox.zip, for addons.mozilla.org
```

## Install locally

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and pick `packages/devtools-firefox/dist/manifest.json`.
3. Open any page that uses Strator, open Developer Tools, and pick the **Strator** tab.

If the panel stays empty, check that the add-on may run on the site (Extensions menu in the toolbar → Strator Devtools → allow), since Firefox can hold back site access for Manifest V3 add-ons.

Needs Firefox 128+ (Manifest V3 content scripts in the page's own world). The add-on id is `devtools@strator.dev`.

## How it works

The Firefox and Chrome extensions share all their code (`packages/devtools/src/extension`). Only the manifest differs: Firefox runs `background.js` as an event page instead of a service worker and needs a `gecko` id. See the [Chrome README](../devtools-chrome/README.md) for what each script does.
