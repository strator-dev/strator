/**
 * Accent tones used across the site. Each tone is a Tailwind palette hue used as a
 * translucent tint: `bg-<hue>-500/10`, `border-<hue>-500/20`, `text-<hue>-400`.
 *
 * Class names are spelled out in full so Tailwind can detect them at build time.
 */
export type Tone = "cyan" | "sky" | "blue" | "teal" | "emerald" | "amber" | "rose" | "purple";

export const toneSoft: Record<Tone, string> = {
  cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
  sky: "bg-sky-500/10 border-sky-500/20 text-sky-400",
  blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  teal: "bg-teal-500/10 border-teal-500/20 text-teal-400",
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  rose: "bg-rose-500/10 border-rose-500/20 text-rose-400",
  purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
};

/** Slightly stronger border, used for status badges. */
export const toneStatus: Record<Tone, string> = {
  cyan: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
  sky: "bg-sky-500/10 border-sky-500/30 text-sky-400",
  blue: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  teal: "bg-teal-500/10 border-teal-500/30 text-teal-400",
  emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  amber: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  rose: "bg-rose-500/10 border-rose-500/30 text-rose-400",
  purple: "bg-purple-500/10 border-purple-500/30 text-purple-400",
};

export const toneText: Record<Tone, string> = {
  cyan: "text-cyan-400",
  sky: "text-sky-400",
  blue: "text-blue-400",
  teal: "text-teal-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  rose: "text-rose-400",
  purple: "text-purple-400",
};

export const toneDot: Record<Tone, string> = {
  cyan: "bg-cyan-400",
  sky: "bg-sky-400",
  blue: "bg-blue-400",
  teal: "bg-teal-400",
  emerald: "bg-emerald-400",
  amber: "bg-amber-400",
  rose: "bg-rose-400",
  purple: "bg-purple-400",
};

/** Framework accents: React reads as cyan, Vue as emerald, everywhere. */
export const frameworkTone = { react: "cyan", vue: "emerald" } as const satisfies Record<string, Tone>;

/** Severity → tone, as used by the docs limitation cards. */
export const severityTone = {
  critical: "rose",
  warning: "amber",
  info: "sky",
  success: "emerald",
} as const satisfies Record<string, Tone>;
