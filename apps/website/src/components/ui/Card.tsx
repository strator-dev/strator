import React from "react";
import { cx } from "./cx";

/**
 * Glass card: the default container on the site. Translucent navy over the glow mesh,
 * blurred, with a hairline white border. `interactive` adds the lift + cyan border on hover.
 */
export function Card({
  interactive = false,
  padding = "md",
  radius = "card",
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  radius?: "tile" | "card";
}) {
  return (
    <div
      className={cx(
        "glass-panel border",
        radius === "card" ? "rounded-2xl border-white/10" : "rounded-xl border-white/5",
        interactive && "glass-panel-hover group",
        padding === "sm" && "p-4",
        padding === "md" && "p-6",
        padding === "lg" && "p-6 sm:p-8",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Rounded square that holds a feature icon. Scales up when its parent `group` is hovered. */
export function IconTile({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cx(
        "w-12 h-12 rounded-xl bg-slate-800/80 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform [&_svg]:w-6 [&_svg]:h-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Compact metric tile from the hero: overline label, big value, muted caption. */
export function StatTile({
  icon,
  iconClassName = "text-cyan-400",
  label,
  value,
  caption,
}: {
  icon?: React.ReactNode;
  iconClassName?: string;
  label: string;
  value: React.ReactNode;
  caption?: React.ReactNode;
}) {
  return (
    <Card padding="sm" radius="tile">
      <div className={cx("flex items-center gap-2 mb-1 [&_svg]:w-4 [&_svg]:h-4", iconClassName)}>
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
      {caption && <p className="text-xs text-slate-400 mt-0.5">{caption}</p>}
    </Card>
  );
}
