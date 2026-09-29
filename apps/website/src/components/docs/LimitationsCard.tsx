"use client";

import React from "react";
import { AlertTriangle, AlertCircle, Info, CheckCircle2, ShieldAlert } from "lucide-react";
import { CodeCard } from "./CodeCard";

export interface LimitationItem {
  id: string;
  title: string;
  severity: "warning" | "critical" | "info";
  summary: string;
  details: string;
  impact: string;
  recommendation: string;
  badSnippet?: string;
  goodSnippet?: string;
}

export interface LimitationsProps {
  framework: "React" | "Vue";
  items: LimitationItem[];
}

export function LimitationsCard({ framework, items }: LimitationsProps) {
  const getSeverityBadge = (severity: LimitationItem["severity"]) => {
    switch (severity) {
      case "critical":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            Critical Behavior
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            Important Gotcha
          </span>
        );
      case "info":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <Info className="w-3.5 h-3.5" />
            Design Trade-off
          </span>
        );
    }
  };

  return (
    <section id="limitations" className="py-20 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-4">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Honest Engineering &amp; Gotchas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Current Limitations &amp; Best Practices
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            To make optimal architectural decisions, understand how the @strator/{framework.toLowerCase()} adapter
            behaves under the hood, where edge cases exist, and how to write reliable, memory-efficient code.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {items.map(item => (
            <div
              key={item.id}
              className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  </div>
                  <p className="text-sm text-slate-400">{item.summary}</p>
                </div>
                <div>{getSeverityBadge(item.severity)}</div>
              </div>

              {/* Technical Deep Dive */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                  <div className="font-semibold text-slate-300 font-mono text-xs uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    Technical Cause &amp; Impact
                  </div>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{item.details}</p>
                  <p className="text-rose-300/90 text-xs font-mono pt-1">
                    <strong>Impact:</strong> {item.impact}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                  <div className="font-semibold text-emerald-300 font-mono text-xs uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Recommended Mitigation
                  </div>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{item.recommendation}</p>
                </div>
              </div>

              {/* Code comparison if available */}
              {(item.badSnippet || item.goodSnippet) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {item.badSnippet && (
                    <div>
                      <div className="text-xs font-mono text-rose-400 mb-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        Avoid (Pitfall)
                      </div>
                      <CodeCard code={item.badSnippet} language={framework === "Vue" ? "vue" : "tsx"} />
                    </div>
                  )}
                  {item.goodSnippet && (
                    <div>
                      <div className="text-xs font-mono text-emerald-400 mb-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Recommended Pattern
                      </div>
                      <CodeCard code={item.goodSnippet} language={framework === "Vue" ? "vue" : "tsx"} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
