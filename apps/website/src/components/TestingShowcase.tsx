"use client";

import React, { useState } from "react";
import { ShieldCheck, Play, CheckCircle2, Clock, XCircle, Zap } from "lucide-react";
import { CodeBlock } from "./CodeBlock";

const traditionalSnippet = `// Requires JSDOM, React wrappers, and heavy providers
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../store";
import { CheckoutModal } from "../components/CheckoutModal";

test("applies discount coupon", async () => {
  // 1. Heavy DOM mount
  render(
    <Provider store={store}>
      <CheckoutModal />
    </Provider>
  );

  // 2. Brittle selector queries & async DOM events
  const input = screen.getByPlaceholderText(/coupon/i);
  fireEvent.change(input, { target: { value: "SAVE20" } });
  fireEvent.click(screen.getByRole("button", { name: /apply/i }));

  // 3. Slow assertions on rendered text
  expect(await screen.findByText(/\\$80.00/)).toBeInTheDocument();
});`;

const stratorSnippet = `// Pure JavaScript. No DOM. No React harness. No Mocks.
import { describe, it, expect } from "vitest";
import { CheckoutModel } from "../models/CheckoutModel";

it("applies discount coupon", () => {
  // 1. Direct class instantiation with state
  const model = new CheckoutModel({ cartTotal: 100, discount: 0 });

  // 2. Direct method invocation
  model.applyCoupon("SAVE20");

  // 3. Pure deterministic state & computed assertions
  expect(model.state.discount).toBe(0.2);
  expect(model.getFinalPrice()).toBe(80);
});`;

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

            <div className="p-5 font-mono text-xs leading-relaxed text-slate-300 overflow-x-auto bg-[#080c14] flex-1">
              <CodeBlock code={traditionalSnippet} language="tsx" />
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

            <div className="p-5 font-mono text-xs leading-relaxed text-slate-300 overflow-x-auto bg-[#080c14] flex-1">
              <CodeBlock code={stratorSnippet} language="typescript" />
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
              <div className="flex items-center justify-between text-emerald-400 border-b border-emerald-500/20 pb-2">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> PASS src/tests/models.spec.ts (100 tests)
                </span>
                <span className="text-slate-400">{testTime}ms</span>
              </div>
              <div className="text-slate-400 pt-1">
                Test Files <span className="text-emerald-400 font-bold">1 passed</span> (1)
              </div>
              <div className="text-slate-400">
                Tests <span className="text-emerald-400 font-bold">100 passed</span> (100)
              </div>
              <div className="text-slate-400">
                Time <span className="text-slate-200 font-bold">{testTime}ms</span> (business logic execution only)
              </div>
              <div className="text-emerald-400 font-bold flex items-center gap-2 pt-1">
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
