import React from "react";
import Link from "next/link";
import { cx } from "./cx";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-1.5 font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "text-white bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40",
  secondary:
    "text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-cyan-500/40",
  ghost: "text-slate-300 hover:text-cyan-400 hover:bg-white/5",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 rounded-lg text-sm",
  md: "px-4 py-2.5 rounded-lg text-sm",
  lg: "px-8 py-4 rounded-xl text-base font-semibold hover:scale-[1.02] shadow-xl",
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
};

type AsButton = CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = CommonProps & React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type ButtonProps = AsButton | AsLink;

export function buttonClasses({
  variant = "primary",
  size = "sm",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cx(
    base,
    variants[variant],
    sizes[size],
    size === "lg" && variant === "primary" && "shadow-cyan-500/25",
    className,
  );
}

/**
 * Primary: the gradient CTA ("Get Started"). Secondary: the slate chip ("GitHub").
 * Ghost: nav-style text button. Pass `href` to render a link; internal paths use next/link.
 */
export function Button(props: ButtonProps) {
  const { variant, size, className, children, ...rest } = props;
  const classes = buttonClasses({ variant, size, className });

  if (rest.href !== undefined) {
    const { href, ...anchor } = rest as AsLink;
    if (href.startsWith("/")) {
      return (
        <Link href={href} className={classes} {...anchor}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className={classes} {...anchor}>
        {children}
      </a>
    );
  }

  const { type = "button", ...button } = rest as AsButton;
  return (
    <button type={type} className={classes} {...button}>
      {children}
    </button>
  );
}

/** Square icon-only button (copy, menu toggle). Always pass an aria-label. */
export function IconButton({
  className,
  children,
  type = "button",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { "aria-label": string }) {
  return (
    <button
      type={type}
      className={cx(
        "p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/5 transition-all inline-flex items-center gap-1.5 text-xs",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
