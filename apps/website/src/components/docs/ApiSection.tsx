"use client";

import React, { useState } from "react";
import { Code2, ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { CodeCard } from "./CodeCard";

export interface ApiItem {
  id: string;
  name: string;
  kind: "Hook" | "Component" | "Function" | "Type" | "Plugin";
  signature: string;
  description: string;
  parameters?: { name: string; type: string; description: string; optional?: boolean }[];
  returns?: { type: string; description: string };
  example?: string;
  language?: string;
  tips?: string[];
}

export interface ApiSectionProps {
  title?: string;
  description?: string;
  items: ApiItem[];
  defaultLanguage?: string;
}

export function ApiSection({
  title = "API Reference",
  description = "Complete reference of hooks, components, and utilities available in this package.",
  items,
  defaultLanguage = "tsx",
}: ApiSectionProps) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    items.forEach((item, idx) => {
      init[item.id] = idx === 0 || idx === 1;
    });
    return init;
  });

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getKindBadgeClass = (kind: ApiItem["kind"]) => {
    switch (kind) {
      case "Hook":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "Component":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Function":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Plugin":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Type":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  return (
    <section id="api" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
            <Code2 className="w-3.5 h-3.5" />
            <span>API Specification</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">{title}</h2>
          <p className="text-slate-400 text-base sm:text-lg">{description}</p>
        </div>

        <div className="space-y-6">
          {items.map(item => {
            const isOpen = openItems[item.id] ?? false;
            return (
              <div
                key={item.id}
                id={`api-${item.id}`}
                className="glass-panel rounded-2xl border border-white/10 shadow-xl overflow-hidden transition-all duration-200"
              >
                {/* Header / Accordion toggle */}
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left bg-slate-900/40 hover:bg-slate-900/70 transition-colors border-b border-white/5"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full border ${getKindBadgeClass(
                        item.kind,
                      )}`}
                    >
                      {item.kind}
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-white font-mono">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-xs font-mono hidden sm:inline-block">{isOpen ? "Collapse" : "Expand"}</span>
                    {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="p-6 sm:p-8 space-y-6 bg-slate-950/40">
                    {/* Description */}
                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed">{item.description}</p>

                    {/* Signature */}
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Signature</h4>
                      <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-xs sm:text-sm text-cyan-300 border border-white/5 overflow-x-auto">
                        <code>{item.signature}</code>
                      </div>
                    </div>

                    {/* Parameters */}
                    {item.parameters && item.parameters.length > 0 && (
                      <div>
                        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">Parameters</h4>
                        <div className="overflow-x-auto rounded-xl border border-white/5">
                          <table className="w-full text-left text-xs sm:text-sm">
                            <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase border-b border-white/5">
                              <tr>
                                <th className="px-4 py-3">Parameter</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Description</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 bg-slate-950/60 font-mono text-xs">
                              {item.parameters.map((param, pIdx) => (
                                <tr key={pIdx} className="hover:bg-white/[0.02]">
                                  <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">
                                    {param.name}
                                    {param.optional && (
                                      <span className="text-slate-500 ml-1 font-normal">(optional)</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-cyan-400 whitespace-nowrap">{param.type}</td>
                                  <td className="px-4 py-3 text-slate-300 font-sans text-xs sm:text-sm">
                                    {param.description}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Returns */}
                    {item.returns && (
                      <div>
                        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Returns</h4>
                        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 text-xs sm:text-sm space-y-1">
                          <div className="font-mono text-cyan-400 font-medium">{item.returns.type}</div>
                          <div className="text-slate-300 text-xs">{item.returns.description}</div>
                        </div>
                      </div>
                    )}

                    {/* Tips / Best Practices */}
                    {item.tips && item.tips.length > 0 && (
                      <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs sm:text-sm space-y-2">
                        <div className="flex items-center gap-2 font-semibold text-cyan-300 font-mono text-xs">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Usage Insights &amp; Best Practices</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs pl-1">
                          {item.tips.map((tip, tIdx) => (
                            <li key={tIdx} className="leading-relaxed">
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Example snippet */}
                    {item.example && (
                      <div>
                        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Example</h4>
                        <CodeCard code={item.example} language={item.language || defaultLanguage} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
