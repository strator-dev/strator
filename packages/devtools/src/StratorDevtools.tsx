import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LOGO_64 } from "./logo.ts";
import { type DevtoolsStore, installDevtools } from "./store.ts";
import { DevtoolsPanel } from "./ui/Panel.tsx";
import { ShadowRoot } from "./ui/ShadowRoot.tsx";

export type LauncherPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";

export interface StratorDevtoolsProps {
  /** Open the panel on first render. Default `false`; the last state is remembered per browser. */
  initialIsOpen?: boolean;
  /** Where the launcher button sits. Default `bottom-right`. */
  position?: LauncherPosition;
  /** Initial panel height in px. Default 420. */
  initialHeight?: number;
  /** Use a specific store instead of the page-wide one. */
  store?: DevtoolsStore;
}

const LAUNCHER_POSITION: Record<LauncherPosition, React.CSSProperties> = {
  "bottom-right": { right: 16, bottom: 16 },
  "bottom-left": { left: 16, bottom: 16 },
  "top-right": { right: 16, top: 16 },
  "top-left": { left: 16, top: 16 },
};

function readStored(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(`strator-devtools:${key}`) ?? null;
  } catch {
    return null;
  }
}

function store(key: string, value: string): void {
  try {
    globalThis.localStorage?.setItem(`strator-devtools:${key}`, value);
  } catch {
    // Not persisted; fine.
  }
}

/**
 * Floating launcher plus a panel docked to the bottom of the page. Render it once, anywhere in a
 * React app (it does not need to be inside a StratorProvider).
 */
export function StratorDevtools({
  initialIsOpen = false,
  position = "bottom-right",
  initialHeight = 420,
  store: customStore,
}: StratorDevtoolsProps) {
  const devtools = customStore ?? installDevtools();
  useSyncExternalStore(devtools.subscribe, devtools.getRevision, devtools.getRevision);

  const [open, setOpen] = useState(() => {
    const stored = readStored("open");
    return stored === null ? initialIsOpen : stored === "true";
  });
  const [maximized, setMaximized] = useState(false);
  const [height, setHeight] = useState(() => {
    const stored = Number(readStored("height"));
    return Number.isFinite(stored) && stored >= 200 ? stored : initialHeight;
  });
  const drag = useRef<{ startY: number; startHeight: number } | null>(null);

  const setOpenAndStore = (next: boolean) => {
    setOpen(next);
    store("open", String(next));
  };

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!drag.current) return;
      const max = window.innerHeight - 80;
      const next = Math.min(max, Math.max(200, drag.current.startHeight + drag.current.startY - event.clientY));
      setHeight(next);
    };
    const onUp = () => {
      if (!drag.current) return;
      drag.current = null;
      setHeight(h => {
        store("height", String(Math.round(h)));
        return h;
      });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  // Reserve room under the page so the docked panel never hides the end of the app.
  useEffect(() => {
    if (!open || maximized || typeof document === "undefined") return;
    const body = document.body;
    const previous = body.style.paddingBottom;
    body.style.paddingBottom = `${Math.min(height, window.innerHeight - 40)}px`;
    return () => {
      body.style.paddingBottom = previous;
    };
  }, [open, maximized, height]);

  const errors = devtools.actions.filter(a => a.status === "threw").length;

  return (
    <ShadowRoot>
      {open ? (
        <div
          className={`sdt-dock ${maximized ? "sdt-dock-max" : ""}`}
          style={maximized ? undefined : { height: `min(${height}px, calc(100vh - 40px))` }}
        >
          {!maximized && (
            <button
              type="button"
              className="sdt-resize"
              aria-label="Resize devtools (arrow keys)"
              onPointerDown={event => {
                event.preventDefault();
                drag.current = { startY: event.clientY, startHeight: height };
              }}
              onKeyDown={event => {
                if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
                event.preventDefault();
                setHeight(h => Math.max(200, h + (event.key === "ArrowUp" ? 40 : -40)));
              }}
            />
          )}
          <DevtoolsPanel
            store={devtools}
            onClose={() => setOpenAndStore(false)}
            onToggleMaximize={() => setMaximized(m => !m)}
            maximized={maximized}
          />
        </div>
      ) : (
        <button
          type="button"
          className="sdt-launcher"
          style={LAUNCHER_POSITION[position]}
          aria-label="Open Strator devtools"
          onClick={() => setOpenAndStore(true)}
        >
          <img src={LOGO_64} alt="" width={32} height={32} />
          <span>{`${devtools.actions.length} actions`}</span>
          {errors > 0 && <span className="sdt-launcher-badge">{`${errors} threw`}</span>}
        </button>
      )}
    </ShadowRoot>
  );
}

export interface StratorDevtoolsPanelProps {
  store?: DevtoolsStore;
  /** CSS height of the panel. Default `100%`. */
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

/** The panel on its own, rendered in place: for a dedicated devtools route or a resizable split view. */
export function StratorDevtoolsPanel({ store: customStore, height = "100%", style }: StratorDevtoolsPanelProps) {
  const devtools = customStore ?? installDevtools();
  return (
    <ShadowRoot hostStyle={{ display: "block", height, ...style }}>
      <div style={{ height: "100%" }}>
        <DevtoolsPanel store={devtools} />
      </div>
    </ShadowRoot>
  );
}
