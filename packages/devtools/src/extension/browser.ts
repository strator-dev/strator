/** The few WebExtension APIs the extension uses. Chrome and Firefox both expose them on `chrome`. */
export interface Port {
  name: string;
  sender?: { tab?: { id?: number } };
  postMessage(message: unknown): void;
  disconnect(): void;
  onMessage: { addListener(listener: (message: any, port: Port) => void): void };
  onDisconnect: { addListener(listener: (port: Port) => void): void };
}

export interface ExtensionApi {
  runtime: {
    connect(info: { name: string }): Port;
    onConnect: { addListener(listener: (port: Port) => void): void };
  };
  devtools?: {
    inspectedWindow: { tabId: number };
    panels: {
      create(title: string, iconPath: string, pagePath: string, callback?: (panel: unknown) => void): void;
    };
  };
}

export function extensionApi(): ExtensionApi {
  const api =
    (globalThis as { browser?: ExtensionApi; chrome?: ExtensionApi }).chrome ??
    (globalThis as { browser?: ExtensionApi }).browser;
  if (!api) throw new Error("Strator devtools: not running inside a browser extension");
  return api;
}
