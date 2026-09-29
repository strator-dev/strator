"use client";

import React, { useState } from "react";
import { Copy, Check, Terminal, Layers } from "lucide-react";

export interface DocsHeaderProps {
  framework: "React" | "Vue";
  packageName: string;
  version: string;
  description: string;
  installCommand?: string;
  navLinks?: { href: string; label: string }[];
}

export function DocsHeader({
  framework,
  packageName,
  version,
  description,
  navLinks = [
    { href: "#quickstart", label: "Quickstart" },
    { href: "#api", label: "API Reference" },
    { href: "#internals", label: "How It Works" },
    { href: "#examples", label: "Examples" },
    { href: "#limitations", label: "Limitations & Gotchas" },
  ],
}: DocsHeaderProps) {
  const [pkgManager, setPkgManager] = useState<"pnpm" | "npm" | "yarn" | "bun">("pnpm");
  const [copied, setCopied] = useState(false);

  const isReact = framework === "React";

  const getCommand = (pm: "pnpm" | "npm" | "yarn" | "bun") => {
    switch (pm) {
      case "pnpm":
        return `pnpm add @strator/core ${packageName}`;
      case "npm":
        return `npm install @strator/core ${packageName}`;
      case "yarn":
        return `yarn add @strator/core ${packageName}`;
      case "bun":
        return `bun add @strator/core ${packageName}`;
    }
  };

  const currentCmd = getCommand(pkgManager);

  const handleCopy = () => {
    void navigator.clipboard.writeText(currentCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative pt-32 pb-16 border-b border-white/5 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/15 to-purple-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/80 border text-xs font-semibold mb-6 shadow-sm backdrop-blur-md">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                isReact ? "bg-cyan-400 shadow-cyan-400/50" : "bg-emerald-400 shadow-emerald-400/50"
              } shadow-md animate-pulse`}
            />
            <span className="font-mono text-white">{framework} Bindings</span>
            <span className="text-slate-500">|</span>
            <span className="font-mono text-cyan-400">v{version}</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-4">
            <span className="font-mono">{packageName}</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-8">{description}</p>

          {/* Package Manager Quick Install */}
          <div className="glass-panel p-4 rounded-xl border border-white/10 shadow-xl max-w-xl mb-8">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Installation</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-white/5 font-mono text-[11px]">
                {(["pnpm", "npm", "yarn", "bun"] as const).map(pm => (
                  <button
                    key={pm}
                    onClick={() => setPkgManager(pm)}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      pkgManager === pm
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {pm}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-xs sm:text-sm text-slate-300 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <span className="text-cyan-400 select-none">$</span>
                <span className="truncate">{currentCmd}</span>
              </div>
              <button
                onClick={handleCopy}
                className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-2 shrink-0"
                title="Copy command"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Section Jump Links */}
          {navLinks.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-mono text-slate-500 mr-2 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                Jump to:
              </span>
              {navLinks.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 hover:text-cyan-300 border border-white/5 transition-all"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
