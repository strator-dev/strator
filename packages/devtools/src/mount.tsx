import React from "react";
import { createRoot } from "react-dom/client";
import type { DevtoolsStore } from "./store.ts";
import { StratorDevtools, StratorDevtoolsPanel, type StratorDevtoolsProps } from "./StratorDevtools.tsx";

export type MountDevtoolsOptions = StratorDevtoolsProps & {
  /** Element to render into. Default: a new element appended to `document.body`. */
  container?: Element;
};

/**
 * Shows the devtools launcher and the panel docked at the bottom of the page. Works in any app (React,
 * Vue, plain JS): the panel brings its own React. Returns a function that removes it.
 */
export function mountDevtools(options: MountDevtoolsOptions = {}): () => void {
  const { container, ...props } = options;
  const host = document.createElement("div");
  (container ?? document.body).appendChild(host);
  const root = createRoot(host);
  root.render(<StratorDevtools {...props} />);
  return () => {
    root.unmount();
    host.remove();
  };
}

export interface MountDevtoolsPanelOptions {
  store?: DevtoolsStore;
}

/**
 * Renders the panel inline, filling `container` (give it a height). For a dedicated devtools route or a
 * split view. Returns a function that removes it.
 */
export function mountDevtoolsPanel(container: Element, options: MountDevtoolsPanelOptions = {}): () => void {
  const root = createRoot(container);
  root.render(<StratorDevtoolsPanel store={options.store} height="100%" />);
  return () => root.unmount();
}
