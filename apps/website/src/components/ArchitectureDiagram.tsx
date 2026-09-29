"use client";

import React, { useState } from "react";
import { Activity, Sparkles, Database, Layout, RefreshCw, Cpu } from "lucide-react";
import { CodeBlock } from "./CodeBlock";

const modelCardSnippet = `class CounterModel extends Model {
  // Pure properties
  state = { count: 0 };
  increase() { this.state.count++; }
}`;

const viewCardSnippet = `function View() {
  const [m, count] = useLocalModel(
    CounterModel, (s) => s.count
  );
  return <button onClick={() => m.increase()}>
    Count: {count}
  </button>;
}`;

export function ArchitectureDiagram() {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      title: "1. View Invokes Model Method",
      desc: "Component calls model method (e.g. `counter.increase()`). The UI invokes logic without handling state changes directly.",
      highlight: "view",
      event: "User Click ➔ Model Method",
    },
    {
      title: "2. Pure Class Execution",
      desc: "Method executes standard JS logic (`this.state.count += 1`). No decorator overhead or manual action creators required.",
      highlight: "model",
      event: "Model.increase() Executing",
    },
    {
      title: "3. Reactive Proxy Traps Mutation",
      desc: "When mounted to UI, state is wrapped in a Proxy whose setter detects changes and calls `dispatchStateChange()`.",
      highlight: "proxy",
      event: "Proxy.set ➔ dispatchStateChange()",
    },
    {
      title: "4. Fine-Grained UI Notification",
      desc: "Only selectors listening to modified keys/paths receive the change event, triggering minimal re-renders.",
      highlight: "view",
      event: "Selector Equality Check ➔ UI Update",
    },
    {
      title: "5. UI Re-renders with Fresh State",
      desc: "The component receives the new selected value and updates the DOM cleanly with zero unnecessary re-renders.",
      highlight: "finish",
      event: "Component DOM Re-render",
    },
  ];

  return (
    <section id="architecture" className="py-24 relative border-t border-white/5 bg-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>MVVM Internal Mechanics</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            How Strator separates the View from the Model
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            A battle-tested architecture that isolates state transitions inside pure ES classes while seamlessly
            providing reactive bindings to UI components.
          </p>
        </div>

        {/* 3-Column Architectural Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* 1. Model (Pure Data Layer) */}
          <div
            className={`glass-panel p-6 rounded-2xl border transition-all ${
              activeStep === 0 || activeStep === 1
                ? "border-cyan-500 shadow-lg shadow-cyan-500/20 bg-cyan-950/20"
                : "border-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Database className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-slate-800 text-cyan-300">
                MODEL (Pure Logic)
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Standard JavaScript Class</h3>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Holds <code className="text-cyan-300 font-mono">state</code>, domain methods, business validation, and API
              integrations. Zero React/DOM dependencies.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-900/90 font-mono text-xs text-slate-300 border border-white/5 overflow-x-auto">
              <CodeBlock code={modelCardSnippet} language="typescript" />
            </div>
          </div>

          {/* 2. Strator Reactive Engine (Dispatcher + Proxy) */}
          <div
            className={`glass-panel p-6 rounded-2xl border transition-all ${
              activeStep === 2 || activeStep === 3
                ? "border-sky-500 shadow-lg shadow-sky-500/20 bg-sky-950/20"
                : "border-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <RefreshCw className="w-5 h-5 animate-spin-slow" />
              </div>
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-slate-800 text-sky-300">
                STRATOR ENGINE
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Proxy Reactivity & Dispatcher</h3>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Wraps state in an ES Proxy and supplies the reactive{" "}
              <code className="text-sky-300 font-mono">Dispatcher</code> only when wired to UI components.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-900/90 font-mono text-xs text-slate-300 border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-sky-300 border-b border-white/5 pb-1">
                <span>Proxy Trap</span>
                <span className="text-emerald-400">Deep Path Intercept</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-cyan-300 border-b border-white/5 pb-1">
                <span>Dispatcher</span>
                <span className="text-slate-400">Auto-Dispatched Updates</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-blue-300">
                <span>Subscriptions</span>
                <span className="text-slate-400">Fine-grained Selectors</span>
              </div>
            </div>
          </div>

          {/* 3. View (UI Layer) */}
          <div
            className={`glass-panel p-6 rounded-2xl border transition-all ${
              activeStep === 0 || activeStep === 3 || activeStep === 4
                ? "border-blue-500 shadow-lg shadow-blue-500/20 bg-blue-950/20"
                : "border-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Layout className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-slate-800 text-blue-300">
                VIEW (UI Layer)
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Declarative UI Component</h3>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Consumes models via clean hooks (<code className="text-blue-300 font-mono">useLocalModel</code>,{" "}
              <code className="text-blue-300 font-mono">useGlobalModel</code>). Renders state and triggers actions.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-900/90 font-mono text-xs text-slate-300 border border-white/5 overflow-x-auto">
              <CodeBlock code={viewCardSnippet} language="tsx" />
            </div>
          </div>
        </div>

        {/* Interactive Step-by-Step Flow Controller */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 bg-slate-900/60">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
            <div>
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Interactive Lifecycle Simulator
              </h4>
              <p className="text-sm text-slate-400">
                Step through what happens inside Strator during a single state mutation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveStep(prev => (prev > 0 ? prev - 1 : steps.length - 1))}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setActiveStep(prev => (prev < steps.length - 1 ? prev + 1 : 0))}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-600/20 transition-all"
              >
                Next Step ({activeStep + 1}/{steps.length})
              </button>
            </div>
          </div>

          {/* Stepper indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-6">
            {steps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  activeStep === idx
                    ? "bg-cyan-600/20 border-cyan-500 text-white shadow-md shadow-cyan-500/10"
                    : "bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-300"
                }`}
              >
                <div className="text-[11px] font-mono text-cyan-400 font-semibold mb-1">Step 0{idx + 1}</div>
                <div className="text-xs font-medium truncate">{step.title.split(". ")[1]}</div>
              </button>
            ))}
          </div>

          {/* Current Step Detail Box */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-white">{steps[activeStep].title}</div>
              <div className="text-xs text-slate-300 leading-relaxed">{steps[activeStep].desc}</div>
            </div>
            <div className="shrink-0 px-3.5 py-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 font-mono text-xs text-cyan-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Event:</span>
              <strong className="text-white">{steps[activeStep].event}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
