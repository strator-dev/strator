import React from "react";
import { cx } from "./cx";
import { Eyebrow } from "./Badge";
import type { Tone } from "./tones";

/** Page-width wrapper: `max-w-7xl` with the site's responsive gutters. */
export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cx("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

/**
 * A landing-page band. Bands are separated by a hairline top border and alternate
 * between transparent and a faint `bg-slate-950/30`–`/50` fill.
 */
export function Section({
  id,
  tinted = false,
  spacing = "lg",
  className,
  children,
}: {
  id?: string;
  tinted?: boolean;
  spacing?: "md" | "lg";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cx(
        "relative border-t border-white/5",
        spacing === "lg" ? "py-24" : "py-20",
        tinted && "bg-slate-950/30",
        className,
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}

/** Eyebrow + h2 + lead paragraph. Centered on the landing page, left-aligned in docs. */
export function SectionHeader({
  eyebrow,
  eyebrowIcon,
  tone = "cyan",
  title,
  lead,
  align = "center",
  className,
}: {
  eyebrow?: React.ReactNode;
  eyebrowIcon?: React.ReactNode;
  tone?: Tone;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div className={cx("max-w-3xl", align === "center" ? "text-center mx-auto mb-16" : "mb-12", className)}>
      {eyebrow && (
        <Eyebrow tone={tone} icon={eyebrowIcon} className="mb-4">
          {eyebrow}
        </Eyebrow>
      )}
      <h2
        className={cx(
          "font-bold text-white tracking-tight mb-4",
          align === "center" ? "text-3xl sm:text-5xl" : "text-3xl sm:text-4xl",
        )}
      >
        {title}
      </h2>
      {lead && <p className="text-slate-400 text-base sm:text-lg">{lead}</p>}
    </div>
  );
}
