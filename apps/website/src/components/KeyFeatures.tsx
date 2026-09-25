"use client";

import React from "react";
import { Code2, Sparkles, Zap, ShieldCheck, Layers, Share2, Cpu } from "lucide-react";

export function KeyFeatures() {
  const features = [
    {
      icon: <Code2 className="w-6 h-6 text-cyan-400" />,
      title: "Pure JavaScript Classes",
      description:
        "Define domain logic using standard ES classes, TypeScript types, getters, and methods without framework boilerplate or vendor lock-in.",
      tag: "OOP & Clean Code",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-sky-400" />,
      title: "Automatic Proxied Dispatch",
      description:
        "No action decorators, types, or reducers. When mounted to the UI, mutating the reactive proxied state automatically dispatches granular updates.",
      tag: "Zero Boilerplate",
    },
    {
      icon: <Zap className="w-6 h-6 text-blue-400" />,
      title: "Deep Proxy Reactivity",
      description:
        "Mutate arrays and nested objects naturally. Strator's reactive Proxy traps mutations down to the exact property path.",
      tag: "Fine-Grained",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      title: "Zero-Mock Unit Testing",
      description:
        "Instantiate models directly in Vitest or Jest. Verify complex domain logic without mounting React components or simulating clicks.",
      tag: "100x Faster CI",
    },
    {
      icon: <Layers className="w-6 h-6 text-cyan-300" />,
      title: "UI-Framework Agnostic",
      description:
        "Run the same Model across React, Vue, Svelte, or even Node.js CLI tools. Your business layer becomes truly portable.",
      tag: "Universal Logic",
    },
    {
      icon: <Share2 className="w-6 h-6 text-sky-300" />,
      title: "Flexible State Scopes",
      description:
        "Choose between useLocalModel (component-scoped), useSharedModel (keyed sharing), and useGlobalModel (app-wide singleton).",
      tag: "Lifecycle Control",
    },
  ];

  return (
    <section id="features" className="py-24 relative border-t border-white/5 bg-slate-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>Engineered for Maximum Utility</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Built for developers who value clean architecture
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Every feature in Strator is designed to maximize testability, eliminate UI coupling, and minimize cognitive
            friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="glass-panel glass-panel-hover p-6 rounded-2xl border border-white/10 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-slate-900 border border-white/5 text-slate-300">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs font-medium text-cyan-400 group-hover:text-cyan-300">
                <span>Learn more about this pattern →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
