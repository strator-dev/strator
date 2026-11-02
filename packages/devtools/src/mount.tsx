import React from "react";
import { createRoot } from "react-dom/client";
import { StratorDevtools, type StratorDevtoolsProps } from "./StratorDevtools.tsx";

/**
 * Mounts the devtools in their own React root, for apps that do not render with React (e.g. Vue).
 * Returns a function that unmounts them.
 */
export function mountDevtools(options: StratorDevtoolsProps & { container?: Element } = {}): () => void {
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
