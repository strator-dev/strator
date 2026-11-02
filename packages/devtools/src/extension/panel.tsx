import React from "react";
import { createRoot } from "react-dom/client";
import { DevtoolsPanel } from "../ui/Panel.tsx";
import { STYLES } from "../ui/styles.ts";
import { extensionApi } from "./browser.ts";
import { PANEL_PORT_PREFIX } from "./protocol.ts";
import { RemoteDevtoolsSource } from "./RemoteDevtoolsSource.ts";

/** The extension's panel page: connects to the inspected tab and renders the devtools panel. */
export function mountExtensionPanel(container: Element): void {
  const api = extensionApi();
  // `?tabId=` lets the panel page be opened in a normal tab, which helps when debugging the extension.
  const tabId = api.devtools?.inspectedWindow.tabId ?? Number(new URLSearchParams(location.search).get("tabId"));
  const port = api.runtime.connect({ name: `${PANEL_PORT_PREFIX}${tabId}` });
  const source = new RemoteDevtoolsSource(port);
  createRoot(container).render(
    <>
      <style>{STYLES}</style>
      <div style={{ height: "100%" }}>
        <DevtoolsPanel store={source} />
      </div>
    </>,
  );
  source.init();
}
