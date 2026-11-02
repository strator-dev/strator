import React from "react";
import { cx } from "./cx";

/**
 * Faux editor window: traffic-light title bar over a dark code pane.
 * Put a `CodeBlock` (or anything) inside; `actions` sits at the right of the title bar.
 */
export function CodeWindow({
  title,
  actions,
  className,
  bodyClassName,
  children,
}: {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        "glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/10 shadow-cyan-950/40",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-white/5 gap-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5" aria-hidden>
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          {title && <span className="text-xs font-mono text-slate-400 ml-2">{title}</span>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div
        className={cx(
          "p-6 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto bg-ink-850/95 text-slate-200",
          bodyClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
