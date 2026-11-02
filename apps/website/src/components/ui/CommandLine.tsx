"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { cx } from "./cx";

/** Monospace shell command with a `$` prompt and a copy button. */
export function CommandLine({ command, className }: { command: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    void navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cx(
        "flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 font-mono text-xs sm:text-sm text-slate-300 shadow-lg",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-cyan-400 shrink-0">
        <Terminal className="w-4 h-4" />
        <span className="text-slate-400">$</span>
      </div>
      <span className="select-all truncate flex-1">{command}</span>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy to clipboard"
        className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
