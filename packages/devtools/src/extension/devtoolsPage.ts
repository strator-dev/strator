import { extensionApi } from "./browser.ts";

/** The extension's devtools page: adds the "Strator" panel to the browser devtools. */
export function registerDevtoolsPanel(): void {
  extensionApi().devtools?.panels.create("Strator", "icons/logo-32.png", "panel.html");
}
