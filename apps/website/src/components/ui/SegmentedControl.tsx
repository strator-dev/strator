"use client";

import React from "react";
import { cx } from "./cx";

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

/**
 * Tab switcher used for code tabs and package-manager pickers. The active segment
 * gets the cyan→blue gradient; the track is a dark inset well.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  mono = false,
  className,
  "aria-label": ariaLabel,
}: {
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  mono?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cx(
        "inline-flex items-center gap-1 border border-white/5",
        size === "md"
          ? "bg-slate-950/60 p-1 rounded-lg text-xs font-medium"
          : "bg-slate-900/90 p-0.5 rounded-lg text-[11px]",
        mono && "font-mono",
        className,
      )}
    >
      {options.map(option => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cx(
              "rounded-md transition-all",
              size === "md" ? "px-3 py-1.5" : "px-2 py-0.5",
              active
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
