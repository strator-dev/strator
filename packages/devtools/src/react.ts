/**
 * React wrappers around `mountDevtools` / `mountDevtoolsPanel`. They only use the app's React to know
 * when to mount and unmount; the panel itself renders with the React bundled into @strator/devtools, so
 * any React version works.
 */
import { createElement, type CSSProperties, type ReactElement, useEffect, useRef } from "react";
import { mountDevtools, mountDevtoolsPanel, type MountDevtoolsOptions } from "./mount.tsx";
import { type DevtoolsStore, installDevtools } from "./store.ts";

// Installed on import, like the main entry: the panel mounts in its own root after the app's first
// commit, which is too late for the StratorProvider (it registers in an effect) and the first models.
installDevtools();

export type StratorDevtoolsProps = Omit<MountDevtoolsOptions, "container">;

/** Floating launcher plus a docked panel. Render it once, anywhere. Props are read when it mounts. */
export function StratorDevtools(props: StratorDevtoolsProps): null {
  const propsRef = useRef(props);
  useEffect(() => mountDevtools(propsRef.current), []);
  return null;
}

export interface StratorDevtoolsPanelProps {
  store?: DevtoolsStore;
  /** CSS height of the panel. Default `100%`. */
  height?: string | number;
  className?: string;
  style?: CSSProperties;
}

/** The panel rendered in place, e.g. on a dedicated devtools route. */
export function StratorDevtoolsPanel({
  store,
  height = "100%",
  className,
  style,
}: StratorDevtoolsPanelProps): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    return mountDevtoolsPanel(ref.current, { store });
  }, [store]);
  return createElement("div", { ref, className, style: { height, ...style } });
}
