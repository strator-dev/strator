"use client";

import React, { useState } from "react";
import { ShieldCheck, Play, CheckCircle2, Clock, XCircle, Zap } from "lucide-react";

export function TestingShowcase() {
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [testTime, setTestTime] = useState<number | null>(null);

  const runSimulation = () => {
    setIsRunning(true);
    setHasRun(false);
    setTimeout(() => {
      setIsRunning(false);
      setHasRun(true);
      setTestTime(4.2);
    }, 450);
  };

  return (
    <section id="testing" className="py-24 relative border-t border-white/5 bg-slate-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>The #1 Selling Point</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Unit test business logic with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400">
              Zero UI Mocks
            </span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Because Strator models are pure JavaScript classes, you never need JSDOM, React test harnesses, mock
            dispatchers, or brittle UI click simulations to verify critical business logic.
          </p>
        </div>

        {/* Side-by-Side Code Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Traditional Way */}
          <div className="glass-panel rounded-2xl border border-rose-500/20 overflow-hidden shadow-xl bg-slate-950/80 flex flex-col h-full">
            <div className="px-5 py-3.5 bg-rose-950/30 border-b border-rose-500/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-rose-200">The Hard Way: Coupled to UI & DOM</span>
              </div>
              <span className="text-[11px] font-mono text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                ~450ms / test
              </span>
            </div>

            <div className="p-5 font-mono text-xs leading-relaxed text-slate-300 space-y-2 overflow-x-auto bg-[#080c14] flex-1">
              <div className="text-slate-500">// Requires JSDOM, React wrappers, and heavy providers</div>
              <div>
                <span className="text-purple-400">import</span> {"{"}{" "}
                <span className="text-yellow-300">render, screen, fireEvent</span> {"}"}{" "}
                <span className="text-purple-400">from</span>{" "}
                <span className="text-emerald-300">"@testing-library/react"</span>;
              </div>
              <div>
                <span className="text-purple-400">import</span> {"{"} <span className="text-yellow-300">Provider</span>{" "}
                {"}"} <span className="text-purple-400">from</span>{" "}
                <span className="text-emerald-300">"react-redux"</span>;
              </div>
              <div>
                <span className="text-purple-400">import</span> {"{"} store {"}"}{" "}
                <span className="text-purple-400">from</span> <span className="text-emerald-300">"../store"</span>;
              </div>
              <div>
                <span className="text-purple-400">import</span> {"{"}{" "}
                <span className="text-yellow-300">CheckoutModal</span> {"}"}{" "}
                <span className="text-purple-400">from</span>{" "}
                <span className="text-emerald-300">"../components/CheckoutModal"</span>;
              </div>
              <div className="my-2 border-t border-white/5" />
              <div>
                <span className="text-blue-400">test</span>(
                <span className="text-emerald-300">"applies discount coupon"</span>,{" "}
                <span className="text-purple-400">async</span> () =&gt; {"{"}
              </div>
              <div className="text-slate-400 ml-4">// 1. Heavy DOM mount</div>
              <div className="ml-4">
                <span className="text-blue-400">render</span>(&lt;
                <span className="text-indigo-400">Provider</span> store=&#123;store&#125;&gt;&lt;
                <span className="text-indigo-400">CheckoutModal</span> /&gt;&lt;/
                <span className="text-indigo-400">Provider</span>&gt;);
              </div>
              <div className="text-slate-400 ml-4">// 2. Brittle selector queries & async DOM events</div>
              <div className="ml-4">
                <span className="text-purple-400">const</span> input = screen.
                <span className="text-blue-400">getByPlaceholderText</span>(
                <span className="text-emerald-300">/coupon/i</span>);
              </div>
              <div className="ml-4">
                fireEvent.<span className="text-blue-400">change</span>(input, {"{"} target: {"{"} value:{" "}
                <span className="text-emerald-300">'SAVE20'</span> {"}"} {"}"});
              </div>
              <div className="ml-4">
                fireEvent.<span className="text-blue-400">click</span>(screen.
                <span className="text-blue-400">getByRole</span>(<span className="text-emerald-300">"button"</span>,{" "}
                {"{"} name: <span className="text-emerald-300">/apply/i</span> {"}"}));
              </div>
              <div className="text-slate-400 ml-4">// 3. Slow assertions on rendered text</div>
              <div className="ml-4">
                <span className="text-yellow-300">expect</span>(<span className="text-purple-400">await</span> screen.
                <span className="text-blue-400">findByText</span>(<span className="text-emerald-300">/\$80.00/</span>)).
                <span className="text-blue-400">toBeInTheDocument</span>();
              </div>
              <div>{"}"});</div>
            </div>

            <div className="p-4 bg-rose-950/20 border-t border-rose-500/20 text-xs text-rose-300 flex items-start gap-2 mt-auto shrink-0">
              <span className="font-semibold shrink-0">Drawbacks:</span>
              <span>
                Slow test suites, flaky selectors on DOM refactors, complex mock setups for hooks and contexts.
              </span>
            </div>
          </div>

          {/* The Strator Way */}
          <div className="glass-panel rounded-2xl border border-emerald-500/30 overflow-hidden shadow-xl bg-slate-950/80 flex flex-col h-full">
            <div className="px-5 py-3.5 bg-emerald-950/30 border-b border-emerald-500/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-200">The Strator Way: Pure Class Unit Test</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                &lt; 1ms / test
              </span>
            </div>

            <div className="p-5 font-mono text-xs leading-relaxed text-slate-300 space-y-2 overflow-x-auto bg-[#080c14] flex-1">
              <div className="text-slate-500">// Pure JavaScript. No DOM. No React harness. No Mocks.</div>
              <div>
                <span className="text-purple-400">import</span> {"{"}{" "}
                <span className="text-yellow-300">describe, it, expect</span> {"}"}{" "}
                <span className="text-purple-400">from</span> <span className="text-emerald-300">"vitest"</span>;
              </div>
              <div>
                <span className="text-purple-400">import</span> {"{"}{" "}
                <span className="text-yellow-300">CheckoutModel</span> {"}"}{" "}
                <span className="text-purple-400">from</span>{" "}
                <span className="text-emerald-300">"../models/CheckoutModel"</span>;
              </div>
              <div className="my-2 border-t border-white/5" />
              <div>
                <span className="text-blue-400">it</span>(
                <span className="text-emerald-300">"applies discount coupon"</span>, () =&gt; {"{"}
              </div>
              <div className="text-slate-400 ml-4">// 1. Direct class instantiation with state</div>
              <div className="ml-4">
                <span className="text-purple-400">const</span> model = <span className="text-purple-400">new</span>{" "}
                <span className="text-yellow-300">CheckoutModel</span>({"{"} cartTotal:{" "}
                <span className="text-orange-300">100</span>, discount: <span className="text-orange-300">0</span> {"}"}
                );
              </div>
              <div className="text-slate-400 ml-4">// 2. Direct method invocation</div>
              <div className="ml-4">
                model.<span className="text-blue-400">applyCoupon</span>(
                <span className="text-emerald-300">"SAVE20"</span>);
              </div>
              <div className="text-slate-400 ml-4">// 3. Pure deterministic state & computed assertions</div>
              <div className="ml-4">
                <span className="text-yellow-300">expect</span>(model.state.discount).
                <span className="text-blue-400">toBe</span>(<span className="text-orange-300">0.2</span>);
              </div>
              <div className="ml-4">
                <span className="text-yellow-300">expect</span>(model.
                <span className="text-blue-400">getFinalPrice</span>()).
                <span className="text-blue-400">toBe</span>(<span className="text-orange-300">80</span>);
              </div>
              <div>{"}"});</div>
            </div>

            <div className="p-4 bg-emerald-950/20 border-t border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2 mt-auto shrink-0">
              <span className="font-semibold shrink-0">Advantages:</span>
              <span>
                100x faster test runs, immune to UI styling changes, runs effortlessly in CI, Vitest, Node, or Bun.
              </span>
            </div>
          </div>
        </div>

        {/* Live Test Benchmark Simulator */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 bg-slate-900/40 text-center max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-left">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Zap className="w-4 h-4" />
                <span>Vitest Benchmark Simulation</span>
              </div>
              <h4 className="text-xl font-bold text-white">Execute 100 Strator Model Unit Tests</h4>
              <p className="text-sm text-slate-400">
                Experience instant feedback loops with zero mock instantiation overhead.
              </p>
            </div>

            <button
              onClick={runSimulation}
              disabled={isRunning}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 shrink-0 disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Executing tests...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run Vitest Suite</span>
                </>
              )}
            </button>
          </div>

          {/* Test Results Output */}
          {hasRun && (
            <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-emerald-500/30 font-mono text-left text-xs animate-fade-in space-y-1.5">
              <div className="text-emerald-400 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>✓ 100/100 model test files passed (100%)</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Duration: <span className="text-white font-bold">{testTime}ms</span> | Memory:{" "}
                <span className="text-white font-bold">12.4 MB</span> | Environment:{" "}
                <span className="text-white font-bold">pure node (no JSDOM required)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
