import { extensionApi, type Port } from "./browser.ts";
import { CONTENT_PORT, type ConnectionMessage, PANEL_PORT_PREFIX } from "./protocol.ts";

/** Background: pairs each devtools panel with the content script of the tab it inspects. */
export function startBackground(): void {
  const panels = new Map<number, Port>();
  const pages = new Map<number, Port>();
  const tell = (tabId: number, message: ConnectionMessage) => panels.get(tabId)?.postMessage(message);

  extensionApi().runtime.onConnect.addListener(port => {
    if (port.name.startsWith(PANEL_PORT_PREFIX)) {
      const tabId = Number(port.name.slice(PANEL_PORT_PREFIX.length));
      panels.set(tabId, port);
      port.onMessage.addListener(message => pages.get(tabId)?.postMessage(message));
      port.onDisconnect.addListener(() => {
        if (panels.get(tabId) === port) panels.delete(tabId);
      });
      if (pages.has(tabId)) tell(tabId, { kind: "page-connected" });
      return;
    }

    if (port.name === CONTENT_PORT) {
      const tabId = port.sender?.tab?.id;
      if (tabId === undefined) return;
      pages.set(tabId, port);
      port.onMessage.addListener(message => panels.get(tabId)?.postMessage(message));
      port.onDisconnect.addListener(() => {
        if (pages.get(tabId) !== port) return;
        pages.delete(tabId);
        tell(tabId, { kind: "page-disconnected" });
      });
      tell(tabId, { kind: "page-connected" });
    }
  });
}
