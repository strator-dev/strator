import { extensionApi, type Port } from "./browser.ts";
import { CONTENT_PORT, ENVELOPE } from "./protocol.ts";

/**
 * Content script (isolated world): forwards messages between the page bridge (`window.postMessage`) and
 * the extension's background (a runtime port). Connects only once the page announces Strator.
 */
export function startContentRelay(): void {
  let port: Port | null = null;

  const ensurePort = (): Port => {
    if (port) return port;
    const next = extensionApi().runtime.connect({ name: CONTENT_PORT });
    next.onMessage.addListener(message => {
      window.postMessage({ [ENVELOPE]: "panel", message }, "*");
    });
    next.onDisconnect.addListener(() => {
      if (port === next) port = null;
    });
    port = next;
    return next;
  };

  window.addEventListener("message", event => {
    if (event.source !== window) return;
    const data = event.data as Record<string, unknown> | null;
    if (!data || data[ENVELOPE] !== "page") return;
    ensurePort().postMessage(data.message);
  });
}
