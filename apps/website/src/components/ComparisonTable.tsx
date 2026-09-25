"use client";

import React from "react";
import { Check, X, Sparkles, Scale } from "lucide-react";

export function ComparisonTable() {
  const comparisons = [
    {
      feature: "True MVVM Separation (Logic isolated from View)",
      strator: { status: true, note: "Core architectural foundation" },
      redux: { status: false, note: "Coupled via action types/dispatch" },
      mobx: { status: true, note: "Observable classes" },
      zustand: { status: false, note: "Hook-bound closures" },
    },
    {
      feature: "Zero-Mock Unit Testing (Pure Class Instantiation)",
      strator: { status: true, note: "new Model(state) & test directly" },
      redux: { status: false, note: "Requires store config & mocks" },
      mobx: { status: true, note: "Direct class testing" },
      zustand: { status: false, note: "Requires hook wrappers / reset hacks" },
    },
    {
      feature: "Automatic Proxied Dispatch",
      strator: { status: true, note: "Proxy state automatically dispatches" },
      redux: { status: false, note: "Manual createAsyncThunk / actions" },
      mobx: { status: true, note: "@action decorator" },
      zustand: { status: false, note: "Manual function assignments" },
    },
    {
      feature: "Multi-Framework Portability (React, Vue, Svelte, Node)",
      strator: { status: true, note: "100% Agnostic core" },
      redux: { status: true, note: "Agnostic core, but verbose" },
      mobx: { status: true, note: "Multi-framework bindings" },
      zustand: { status: false, note: "Primarily React focused" },
    },
    {
      feature: "Deep Nested Proxy Path Reactivity",
      strator: { status: true, note: "Tracks exact nested property path" },
      redux: { status: false, note: "Immer produces new tree refs" },
      mobx: { status: true, note: "Observable getters" },
      zustand: { status: false, note: "Manual selectors required" },
    },
    {
      feature: "Boilerplate & Mental Overhead",
      strator: { status: true, note: "Minimal: Standard JS Class" },
      redux: { status: false, note: "High: Slices, Thunks, Selectors" },
      mobx: { status: false, note: "Moderate: makeObservable rules" },
      zustand: { status: true, note: "Minimal" },
    },
    {
      feature: "Core Library Footprint",
      strator: { status: true, note: "< 2.5 kB min+gzip" },
      redux: { status: false, note: "> 12 kB (RTK + Immer + Reselect)" },
      mobx: { status: false, note: "> 15 kB" },
      zustand: { status: true, note: "~1.5 kB" },
    },
  ];

  return (
    <section id="comparison" className="py-24 relative border-t border-white/5 bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>State Management Matrix</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">How Strator compares</h2>
          <p className="text-slate-400 text-base sm:text-lg">
            A direct feature comparison for engineering teams seeking maximum testability and minimal boilerplate.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900 border-b border-white/10 text-slate-300">
                <tr>
                  <th className="py-4 px-6 font-semibold">Feature / Capability</th>
                  <th className="py-4 px-6 font-bold text-cyan-400 bg-cyan-950/40 border-x border-cyan-500/30">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Strator</span>
                    </div>
                  </th>
                  <th className="py-4 px-6 font-medium text-slate-300">Redux Toolkit</th>
                  <th className="py-4 px-6 font-medium text-slate-300">MobX</th>
                  <th className="py-4 px-6 font-medium text-slate-300">Zustand</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {comparisons.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-6 font-medium text-white">{row.feature}</td>

                    {/* Strator */}
                    <td className="py-4 px-6 bg-cyan-950/20 border-x border-cyan-500/20">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                          <Check className="w-4 h-4" />
                          <span>Yes</span>
                        </div>
                        <span className="text-[11px] text-cyan-300 font-mono">{row.strator.note}</span>
                      </div>
                    </td>

                    {/* Redux Toolkit */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          {row.redux.status ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <X className="w-4 h-4 text-rose-400" />
                          )}
                          <span>{row.redux.status ? "Yes" : "No"}</span>
                        </div>
                        <span className="text-[11px] text-slate-500">{row.redux.note}</span>
                      </div>
                    </td>

                    {/* MobX */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          {row.mobx.status ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <X className="w-4 h-4 text-rose-400" />
                          )}
                          <span>{row.mobx.status ? "Yes" : "No"}</span>
                        </div>
                        <span className="text-[11px] text-slate-500">{row.mobx.note}</span>
                      </div>
                    </td>

                    {/* Zustand */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          {row.zustand.status ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <X className="w-4 h-4 text-rose-400" />
                          )}
                          <span>{row.zustand.status ? "Yes" : "No"}</span>
                        </div>
                        <span className="text-[11px] text-slate-500">{row.zustand.note}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
