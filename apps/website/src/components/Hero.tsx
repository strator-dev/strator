"use client";

import React, { useState } from "react";
import { Check, Copy, ArrowRight, ShieldCheck, Zap, Code2, Sparkles, Terminal, Cpu } from "lucide-react";
import { CodeBlock } from "./CodeBlock";

const modelSnippet = `import { Model } from "@strator/core";

export interface CartState {
  items: Array<{ id: string; name: string; price: number }>;
  discount: number;
}

export class CartModel extends Model<CartState> {
  static initialState: CartState = { items: [], discount: 0 };

  addItem(item: { id: string; name: string; price: number }) {
    // State is proxied when mounted to UI, automatically dispatching updates
    this.state.items.push(item);
  }

  getTotal(): number {
    const raw = this.state.items.reduce((sum, item) => sum + item.price, 0);
    return raw * (1 - this.state.discount);
  }
}`;

const viewSnippet = `import { useLocalModel } from "@strator/react";
import { CartModel } from "./CartModel";

export function CartView() {
  // Hook seamlessly provides reactive Dispatcher and binds fine-grained state
  const [cart, items] = useLocalModel(CartModel, (s) => s.items);

  return (
    <div className="cart-box">
      <h3>Items: {items.length}</h3>
      <button
        onClick={() =>
          cart.addItem({
            id: "1",
            name: "Pro Plan",
            price: 49,
          })
        }
      >
        Add Item (Total: \${cart.getTotal()})
      </button>
    </div>
  );
}`;

const testSnippet = `import { describe, it, expect } from "vitest";
import { CartModel } from "./CartModel";

describe("CartModel business logic", () => {
  it("calculates total with discount cleanly without ANY UI rendering or mocks", () => {
    // Simply instantiate standard JavaScript class!
    const cart = new CartModel({ items: [], discount: 0.1 });

    cart.addItem({ id: "sku_1", name: "Toolkit", price: 100 });

    // 100% deterministic, instant execution (<1ms)
    expect(cart.state.items).toHaveLength(1);
    expect(cart.getTotal()).toBe(90);
  });
});`;

export function Hero() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"model" | "view" | "test">("model");

  const copyCommand = () => {
    void navigator.clipboard.writeText("pnpm add @strator/core @strator/react");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copySnippet = () => {
    const codeToCopy = activeTab === "model" ? modelSnippet : activeTab === "view" ? viewSnippet : testSnippet;
    void navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-cyan-500/20 via-sky-500/20 to-blue-600/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-medium mb-8 shadow-inner shadow-cyan-500/10 animate-fade-in">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>UI-Agnostic MVVM Architecture</span>
            <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
            <span className="text-slate-300">Pure Logic. Zero-Mock Tests.</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            State management that{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500">
              never touches the UI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto mb-10 font-normal">
            Define your business logic in standard JavaScript classes. Let Strator wrap your state in reactive Proxies
            when mounted to the UI to automatically dispatch updates—delivering lightning-fast, zero-mock testability
            across any framework.
          </p>

          {/* Actions & Terminal */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <a
              href="#quickstart"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 group"
            >
              <span>Get Started in 2 Minutes</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            {/* Quick Install Pill */}
            <div className="w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 font-mono text-xs sm:text-sm text-slate-300 shadow-lg">
              <div className="flex items-center gap-2 text-cyan-400">
                <Terminal className="w-4 h-4" />
                <span className="text-slate-400">$</span>
              </div>
              <span className="select-all">pnpm add @strator/core @strator/react</span>
              <button
                onClick={copyCommand}
                className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Value Metric Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left mb-16">
            <div className="glass-panel p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Unit Tests</span>
              </div>
              <div className="text-xl font-bold text-white">0 UI Mocks</div>
              <p className="text-xs text-slate-400 mt-0.5">Test pure classes in &lt;1ms</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-sky-400 mb-1">
                <Cpu className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Architecture</span>
              </div>
              <div className="text-xl font-bold text-white">True MVVM</div>
              <p className="text-xs text-slate-400 mt-0.5">Strict Model / View separation</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Reactivity</span>
              </div>
              <div className="text-xl font-bold text-white">Fine-Grained Proxy</div>
              <p className="text-xs text-slate-400 mt-0.5">Zero unnecessary re-renders</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 text-teal-400 mb-1">
                <Code2 className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Portability</span>
              </div>
              <div className="text-xl font-bold text-white">100% Agnostic</div>
              <p className="text-xs text-slate-400 mt-0.5">React, Vue, Svelte, Vanilla, Node</p>
            </div>
          </div>
        </div>

        {/* Hero Code Showcase Box */}
        <div className="max-w-5xl mx-auto glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/10 shadow-cyan-950/40">
          {/* Box Header Bar */}
          <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-white/5 gap-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-slate-400 ml-2">strator-state-demo</span>
            </div>

            {/* Tab switcher */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg border border-white/5 text-xs font-medium">
                <button
                  onClick={() => setActiveTab("model")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    activeTab === "model"
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  1. Pure Model (TS)
                </button>
                <button
                  onClick={() => setActiveTab("view")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    activeTab === "view"
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  2. UI View (React)
                </button>
                <button
                  onClick={() => setActiveTab("test")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    activeTab === "test"
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  3. Zero-Mock Unit Test
                </button>
              </div>

              <button
                onClick={copySnippet}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/5 transition-all text-xs flex items-center gap-1.5"
                title="Copy snippet"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto bg-[#070b12]/95 text-slate-200 grid grid-cols-1 grid-rows-1">
            <div
              className={`col-start-1 row-start-1 min-w-0 transition-opacity duration-150 ${
                activeTab === "model" ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none select-none"
              }`}
            >
              <CodeBlock code={modelSnippet} language="typescript" />
            </div>

            <div
              className={`col-start-1 row-start-1 min-w-0 transition-opacity duration-150 ${
                activeTab === "view" ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none select-none"
              }`}
            >
              <CodeBlock code={viewSnippet} language="tsx" />
            </div>

            <div
              className={`col-start-1 row-start-1 min-w-0 transition-opacity duration-150 ${
                activeTab === "test" ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none select-none"
              }`}
            >
              <CodeBlock code={testSnippet} language="typescript" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
