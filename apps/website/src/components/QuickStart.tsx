"use client";

import React, { useState } from "react";
import { Copy, Check, BookOpen } from "lucide-react";
import { CodeBlock } from "./CodeBlock";

const modelSnippet = `import { Model } from "@strator/core";

export interface CounterState {
  count: number;
}

export class CounterModel extends Model<CounterState> {
  static initialState: CounterState = { count: 0 };

  public increase() {
    this.state.count += 1;
  }

  public reset() {
    this.state.count = 0;
  }
}`;

const viewSnippet = `import React from "react";
import { useLocalModel } from "@strator/react";
import { CounterModel } from "./CounterModel";

export function Counter() {
  const [model, count] = useLocalModel(CounterModel, (state) => state.count);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => model.increase()}>Increment</button>
      <button onClick={() => model.reset()}>Reset</button>
    </div>
  );
}`;

export function QuickStart() {
  const [pkgManager, setPkgManager] = useState<"pnpm" | "npm" | "yarn" | "bun">("pnpm");
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const installCommands = {
    pnpm: "pnpm add @strator/core @strator/react",
    npm: "npm install @strator/core @strator/react",
    yarn: "yarn add @strator/core @strator/react",
    bun: "bun add @strator/core @strator/react",
  };

  const copyText = (text: string, stepIndex: number) => {
    void navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <section id="quickstart" className="py-24 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Quickstart Guide</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Get up and running in minutes
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Follow these 3 simple steps to add MVVM state management and zero-mock testing to your app.
          </p>
        </div>

        {/* Step 1: Install */}
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold flex items-center justify-center text-sm font-mono shadow-md shadow-cyan-600/20">
                  1
                </div>
                <h3 className="text-lg font-bold text-white">Install packages</h3>
              </div>

              {/* Package Manager selector */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-white/5 font-mono text-xs">
                {(["pnpm", "npm", "yarn", "bun"] as const).map(pm => (
                  <button
                    key={pm}
                    onClick={() => setPkgManager(pm)}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      pkgManager === pm
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {pm}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs sm:text-sm text-slate-300 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <span className="text-cyan-400">$</span>
                <span>{installCommands[pkgManager]}</span>
              </div>
              <button
                onClick={() => copyText(installCommands[pkgManager], 1)}
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Copy command"
              >
                {copiedStep === 1 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Step 2: Define Model */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold flex items-center justify-center text-sm font-mono shadow-md shadow-sky-600/20">
                  2
                </div>
                <h3 className="text-lg font-bold text-white">Define your domain model</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">CounterModel.ts</span>
            </div>

            <p className="text-sm text-slate-400 mb-4">
              Extend <code className="text-cyan-300 font-mono">Model&lt;T&gt;</code> and write standard class methods.
              State is proxied when mounted to the UI to dispatch updates.
            </p>

            <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs sm:text-sm text-slate-300 border border-white/5 overflow-x-auto">
              <CodeBlock code={modelSnippet} language="typescript" />
            </div>
          </div>

          {/* Step 3: Bind to React */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm font-mono shadow-md shadow-blue-600/20">
                  3
                </div>
                <h3 className="text-lg font-bold text-white">Connect to your UI component</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Counter.tsx</span>
            </div>

            <p className="text-sm text-slate-400 mb-4">
              Use <code className="text-blue-300 font-mono">useLocalModel</code> or{" "}
              <code className="text-blue-300 font-mono">useGlobalModel</code> with a selector for fine-grained
              re-renders.
            </p>

            <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs sm:text-sm text-slate-300 border border-white/5 overflow-x-auto">
              <CodeBlock code={viewSnippet} language="tsx" />
            </div>
          </div>

          {/* Dedicated Framework Guides Banner */}
          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <a
              href="/react/"
              className="glass-panel p-6 rounded-2xl border border-cyan-500/30 hover:border-cyan-400/60 bg-gradient-to-br from-cyan-950/20 via-slate-900/60 to-slate-950/80 transition-all hover:scale-[1.01] group shadow-lg shadow-cyan-950/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse" />
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    React 18 &amp; 19 Guide
                  </span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  @strator/react
                </span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                React Bindings Documentation &rarr;
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Learn about selector diffing with shallowEqual, local &amp; shared model hooks, SSR hydration, and
                memory best practices.
              </p>
            </a>

            <a
              href="/vue/"
              className="glass-panel p-6 rounded-2xl border border-emerald-500/30 hover:border-emerald-400/60 bg-gradient-to-br from-emerald-950/20 via-slate-900/60 to-slate-950/80 transition-all hover:scale-[1.01] group shadow-lg shadow-emerald-950/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse" />
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Vue 3 Guide
                  </span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  @strator/vue
                </span>
              </div>
              <h4 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                Vue Bindings Documentation &rarr;
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Learn about createStrator plugin, native reactive proxies, syncState recursive syncing, and Composition
                API usage.
              </p>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
