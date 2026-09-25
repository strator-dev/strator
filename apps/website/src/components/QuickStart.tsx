"use client";

import React, { useState } from "react";
import { Copy, Check, BookOpen } from "lucide-react";

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
              <pre>
                <code>
                  <span className="text-purple-400">import</span> {"{"} <span className="text-yellow-300">Model</span>{" "}
                  {"}"} <span className="text-purple-400">from</span>{" "}
                  <span className="text-emerald-300">"@strator/core"</span>;{"\n\n"}
                  <span className="text-purple-400">export interface</span>{" "}
                  <span className="text-yellow-300">CounterState</span> {"{"}
                  {"\n  "}count: <span className="text-blue-300">number</span>;{"\n"}
                  {"}"}
                  {"\n\n"}
                  <span className="text-purple-400">export class</span>{" "}
                  <span className="text-yellow-300">CounterModel</span> <span className="text-purple-400">extends</span>{" "}
                  <span className="text-yellow-300">Model</span>&lt;
                  <span className="text-yellow-300">CounterState</span>&gt; {"{"}
                  {"\n  "}
                  <span className="text-purple-400">static</span> initialState:{" "}
                  <span className="text-yellow-300">CounterState</span> = {"{"} count:{" "}
                  <span className="text-orange-300">0</span> {"}"};{"\n\n  "}
                  <span className="text-purple-400">public</span> <span className="text-blue-400">increase</span>(){" "}
                  {"{"}
                  {"\n    "}
                  <span className="text-pink-400">this</span>.state.count += <span className="text-orange-300">1</span>;
                  {"\n  "}
                  {"}"}
                  {"\n\n  "}
                  <span className="text-purple-400">public</span> <span className="text-blue-400">reset</span>() {"{"}
                  {"\n    "}
                  <span className="text-pink-400">this</span>.state.count = <span className="text-orange-300">0</span>;
                  {"\n  "}
                  {"}"}
                  {"\n"}
                  {"}"}
                </code>
              </pre>
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
              <pre>
                <code>
                  <span className="text-purple-400">import</span> <span className="text-yellow-300">React</span>{" "}
                  <span className="text-purple-400">from</span> <span className="text-emerald-300">"react"</span>;{"\n"}
                  <span className="text-purple-400">import</span> {"{"}{" "}
                  <span className="text-yellow-300">useLocalModel</span> {"}"}{" "}
                  <span className="text-purple-400">from</span>{" "}
                  <span className="text-emerald-300">"@strator/react"</span>;{"\n"}
                  <span className="text-purple-400">import</span> {"{"}{" "}
                  <span className="text-yellow-300">CounterModel</span> {"}"}{" "}
                  <span className="text-purple-400">from</span>{" "}
                  <span className="text-emerald-300">"./CounterModel"</span>;{"\n\n"}
                  <span className="text-purple-400">export function</span>{" "}
                  <span className="text-blue-400">Counter</span>() {"{"}
                  {"\n  "}
                  <span className="text-purple-400">const</span> [model, count] ={" "}
                  <span className="text-yellow-300">useLocalModel</span>(
                  <span className="text-yellow-300">CounterModel</span>, (state) =&gt; state.count);{"\n\n  "}
                  <span className="text-purple-400">return</span> ({"\n    "}
                  &lt;<span className="text-indigo-400">div</span>&gt;{"\n      "}
                  &lt;<span className="text-indigo-400">p</span>&gt;Count: {"{"}count{"}"}&lt;/
                  <span className="text-indigo-400">p</span>&gt;{"\n      "}
                  &lt;<span className="text-indigo-400">button</span> onClick=&#123;() =&gt; model.
                  <span className="text-blue-400">increase</span>()&#125;&gt;Increment&lt;/
                  <span className="text-indigo-400">button</span>&gt;{"\n      "}
                  &lt;<span className="text-indigo-400">button</span> onClick=&#123;() =&gt; model.
                  <span className="text-blue-400">reset</span>()&#125;&gt;Reset&lt;/
                  <span className="text-indigo-400">button</span>&gt;{"\n    "}
                  &lt;/<span className="text-indigo-400">div</span>&gt;{"\n  "}
                  );{"\n"}
                  {"}"}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
