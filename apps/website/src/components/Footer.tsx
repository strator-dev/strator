"use client";

import React from "react";
import corePackage from "@strator/core/package.json";
import reactPackage from "@strator/react/package.json";
import vuePackage from "@strator/vue/package.json";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050811] text-slate-400 text-sm py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600/20 via-cyan-500/20 to-sky-400/20 border border-cyan-500/30 p-1 flex items-center justify-center shadow-md shadow-cyan-500/15">
                <img
                  src="/brand/logo-64.png"
                  alt="Strator Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-xl text-white font-mono tracking-tight">strator</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              UI-framework agnostic state management based on MVVM architecture. Pure classes, reactive proxies
              dispatching updates when mounted to UI, and zero-mock testability.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com/strator/strator"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-900 border border-white/5 text-slate-300 hover:text-white hover:border-cyan-500/40 transition-colors"
                aria-label="GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Documentation */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider font-mono">Documentation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#quickstart" className="hover:text-cyan-400 transition-colors">
                  Getting Started
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-cyan-400 transition-colors">
                  Architecture & MVVM
                </a>
              </li>
              <li>
                <a href="#demo" className="hover:text-cyan-400 transition-colors">
                  Interactive Sandbox
                </a>
              </li>
              <li>
                <a href="#testing" className="hover:text-cyan-400 transition-colors">
                  Zero-Mock Testing Guide
                </a>
              </li>
              <li>
                <a href="#comparison" className="hover:text-cyan-400 transition-colors">
                  Framework Comparison
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Packages */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider font-mono">Packages</h4>
            <ul className="space-y-2 text-sm font-mono text-xs">
              <li className="flex items-center justify-between text-slate-300">
                <span>@strator/core</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  v{corePackage.version}
                </span>
              </li>
              <li className="flex items-center justify-between text-slate-300">
                <span>@strator/react</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  v{reactPackage.version}
                </span>
              </li>
              <li className="flex items-center justify-between text-slate-300">
                <span>@strator/vue</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  v{vuePackage.version}
                </span>
              </li>
              <li className="text-slate-500">
                <span>@strator/svelte (coming soon)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Released under the <strong className="text-slate-400">MIT License</strong>. Copyright &copy;{" "}
            {new Date().getFullYear()} Strator.
          </div>
          <div className="flex items-center gap-1">
            <span>Crafted for high developer velocity &amp; robust software design.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
