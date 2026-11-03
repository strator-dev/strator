import React, { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { STYLES } from "./styles.ts";

/** Renders children inside a shadow root on a host element, so app CSS and panel CSS stay apart. */
export function ShadowRoot({
  children,
  hostStyle,
  hostTag = "div",
}: {
  children: React.ReactNode;
  hostStyle?: React.CSSProperties;
  hostTag?: "div" | "span";
}) {
  const hostRef = useRef<HTMLElement | null>(null);
  const [root, setRoot] = useState<ShadowRoot | HTMLElement | null>(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let target: ShadowRoot | HTMLElement = host;
    if (typeof host.attachShadow === "function") {
      target = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    }
    setRoot(target);
  }, []);

  const Host = hostTag;
  return (
    <Host ref={hostRef as React.Ref<HTMLDivElement>} data-strator-devtools="" style={hostStyle}>
      {root &&
        createPortal(
          <>
            <style>{STYLES}</style>
            {children}
          </>,
          root,
        )}
    </Host>
  );
}
