"use client";

import React, { useState } from "react";
import { Cpu, ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import { CodeCard } from "./CodeCard";

export interface FlowStep {
  step: number;
  title: string;
  subtitle: string;
  description: string;
  badge?: string;
  snippet?: string;
}

export interface InternalMechanicsProps {
  framework?: "React" | "Vue";
  title?: string;
  description?: string;
  steps: FlowStep[];
  deepDiveNotes?: { title: string; content: string }[];
}

export function InternalMechanics({
  title = "Internal Architecture & Mechanics",
  description = "Understanding how Strator synchronizes Model state mutations with the UI rendering pipeline without magic or monkey patching.",
  steps,
  deepDiveNotes = [],
}: InternalMechanicsProps) {
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <section id="internals" className="py-20 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>Under The Hood</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">{title}</h2>
          <p className="text-slate-400 text-base sm:text-lg">{description}</p>
        </div>

        {/* Step Flow Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          {steps.map(step => {
            const isActive = activeStep === step.step;
            return (
              <button
                key={step.step}
                onClick={() => setActiveStep(step.step)}
                className={`p-5 rounded-2xl text-left transition-all border flex flex-col justify-between ${
                  isActive
                    ? "bg-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-500/10 scale-[1.02]"
                    : "bg-slate-900/40 hover:bg-slate-900/80 border-white/5 text-slate-400 hover:text-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                        isActive ? "bg-cyan-500 text-black shadow-sm" : "bg-white/10 text-slate-400"
                      }`}
                    >
                      0{step.step}
                    </span>
                    {step.badge && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                        {step.badge}
                      </span>
                    )}
                  </div>
                  <h3 className={`font-bold text-sm mb-1 ${isActive ? "text-white" : "text-slate-300"}`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{step.subtitle}</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-[11px] font-mono text-cyan-400">
                  <span>Inspect Step</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Detail Card */}
        {(() => {
          const current = steps.find(s => s.step === activeStep) || steps[0];
          return (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl mb-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold flex items-center justify-center font-mono text-base shadow-md shadow-cyan-500/20">
                    {current.step}
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">{current.title}</h3>
                    <p className="text-xs sm:text-sm text-cyan-400 font-mono">{current.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={activeStep <= 1}
                    onClick={() => setActiveStep(s => Math.max(1, s - 1))}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-xs font-mono text-slate-300 border border-white/5"
                  >
                    Previous
                  </button>
                  <button
                    disabled={activeStep >= steps.length}
                    onClick={() => setActiveStep(s => Math.min(steps.length, s + 1))}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-xs font-mono text-white shadow-sm"
                  >
                    Next Step
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">{current.description}</p>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-400 space-y-2">
                    <div className="flex items-center gap-2 text-cyan-300 font-mono font-semibold">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Reconciliation Mechanics</span>
                    </div>
                    <p>
                      Strator eliminates unnecessary re-renders by enforcing clean boundaries between data manipulation
                      and UI notifications.
                    </p>
                  </div>
                </div>

                {current.snippet && (
                  <div>
                    <CodeCard code={current.snippet} language="typescript" title="Implementation Sample" />
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Deep Dive Notes */}
        {deepDiveNotes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {deepDiveNotes.map((note, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-xl border border-white/5 space-y-2">
                <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  {note.title}
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
