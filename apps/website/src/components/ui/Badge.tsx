import React from "react";
import { cx } from "./cx";
import { toneDot, toneSoft, toneStatus, type Tone } from "./tones";

/**
 * Eyebrow pill shown above every section heading:
 * `rounded-full bg-<tone>-500/10 border-<tone>-500/20 text-<tone>-400 text-xs font-semibold`.
 */
export function Eyebrow({
  icon,
  tone = "cyan",
  className,
  children,
}: {
  icon?: React.ReactNode;
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        "inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-semibold [&_svg]:w-3.5 [&_svg]:h-3.5",
        toneSoft[tone],
        className,
      )}
    >
      {icon}
      <span>{children}</span>
    </div>
  );
}

/** Neutral monospace tag, e.g. the "OOP & Clean Code" label on feature cards. */
export function Tag({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex items-center text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-slate-900 border border-white/5 text-slate-300",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Tiny version chip next to the wordmark. */
export function VersionBadge({ version, className }: { version: string; className?: string }) {
  return (
    <span
      className={cx(
        "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
        className,
      )}
    >
      v{version}
    </span>
  );
}

/** Status badge with an icon, e.g. "Critical Behavior", "Important Gotcha". */
export function StatusBadge({
  tone,
  icon,
  className,
  children,
}: {
  tone: Tone;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold border [&_svg]:w-3.5 [&_svg]:h-3.5",
        toneStatus[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/** Small coloured dot. Marks framework links (React cyan, Vue emerald) and live items (`pulse`). */
export function StatusDot({
  tone = "cyan",
  pulse = false,
  className,
}: {
  tone?: Tone;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cx("inline-block w-1.5 h-1.5 rounded-full", toneDot[tone], pulse && "animate-pulse", className)}
    />
  );
}
