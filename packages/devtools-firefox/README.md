# Strator Devtools for Firefox

A **Strator** tab in Firefox Developer Tools: model instances, method calls, state diffs and subscribers of any page that uses Strator. It is the same panel as [`@strator/devtools`](../devtools), running in the browser instead of in your app.

## Build

```bash
pnpm --filter @strator/devtools-firefox build   # → packages/devtools-firefox/dist
pnpm --filter @strator/devtools-firefox zip     # → strator-devtools-firefox.zip, for addons.mozilla.org
```

## Install from a release

1. Download [`strator-devtools-firefox.zip`](https://github.com/strator-dev/strator/releases/latest/download/strator-devtools-firefox.zip) from the latest release.
2. Open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on…** and pick the zip.

The release workflow builds both zips and attaches them to every GitHub release.

## Install locally

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and pick `packages/devtools-firefox/dist/manifest.json`.
3. Open any page that uses Strator, open Developer Tools, and pick the **Strator** tab.

If the panel stays empty, check that the add-on may run on the site (Extensions menu in the toolbar → Strator Devtools → allow), since Firefox can hold back site access for Manifest V3 add-ons.

Needs Firefox 128+ (Manifest V3 content scripts in the page's own world). The add-on id is `devtools@strator.dev`.

## Publishing to addons.mozilla.org

The release workflow (`.github/workflows/npm-publish.yml`, job `publish-firefox`) runs `web-ext sign --channel listed` with the release zip and the source archive that AMO reviewers need for minified code. The job may fail without failing the release.

It needs an [AMO API key](https://addons.mozilla.org/developers/addon/api/key/) stored in the GitHub `production` environment as the secrets `AMO_JWT_ISSUER` and `AMO_JWT_SECRET`. The first submission creates the listing from [`amo-metadata.json`](amo-metadata.json), which also holds the build instructions for reviewers; later releases add a version. The manifest declares `data_collection_permissions: none`, which AMO requires from new add-ons.

## How it works

The Firefox and Chrome extensions share all their code (`packages/devtools/src/extension`). Only the manifest differs: Firefox runs `background.js` as an event page instead of a service worker and needs a `gecko` id. See the [Chrome README](../devtools-chrome/README.md) for what each script does.
