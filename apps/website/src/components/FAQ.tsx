"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Why separate business logic from the UI (MVVM)?",
      a: "In conventional frontend frameworks, business logic frequently gets coupled with UI components, hooks, and component lifecycle events. This creates fragile codebases where testing a single business rule requires heavy component rendering, DOM mocks, and complex context providers. Strator isolates your business state and domain rules into pure JavaScript classes, making logic 100% portable, reusable, and testable in milliseconds.",
    },
    {
      q: "How does Strator provide fine-grained reactivity using Proxies?",
      a: "When a Model is bound to a UI framework, Strator wraps its `state` field in a deep JavaScript Proxy. Whenever a property or nested array element is mutated, the Proxy traps the change and automatically dispatches updates to subscribers and selector hooks listening to that slice with zero dirty checking overhead.",
    },
    {
      q: "How are updates dispatched without action decorators?",
      a: "Strator does not require action decorators or manual action creators. Instead, the reactive Proxied state itself dispatches updates. When model methods mutate `this.state`, the Proxy setter intercepts the mutation and dispatches state change events directly to subscribers.",
    },
    {
      q: "When is the state proxied and the Dispatcher provided?",
      a: "The state is wrapped in a reactive Proxy and connected to the Dispatcher exclusively when the Model is mounted or consumed within a UI framework (such as through `useLocalModel` or `useGlobalModel`). When instantiated outside a UI framework—such as inside a Vitest/Jest unit test or a Node CLI script—the model functions as a pure, lightweight class with standard plain state and zero UI overhead.",
    },
    {
      q: "How does Zero-Mock Unit Testing work?",
      a: "Because your Model is just a standard JavaScript class extending `Model<T>`, you can directly instantiate it using `new MyModel(initialState)` in any test environment. You call methods directly and assert on `model.state` without JSDOM, React test renderers, simulated click events, or fake mock dispatchers.",
    },
    {
      q: "Is Strator compatible with Next.js App Router and SSR?",
      a: "Yes! Strator models serialize cleanly to standard JSON. You can hydrate initial state seamlessly on the server or client, and use models across both Server Components (for data processing) and Client Components (for interactive state).",
    },
    {
      q: "Can I use Strator with Vue, Svelte, or Vanilla JS?",
      a: "Absolutely. `@strator/core` is 100% framework agnostic with zero runtime dependencies. You can bind Strator models to Vue 3 (`ref`/`shallowRef`), Svelte stores/runes, or Vanilla JS event listeners in just a few lines of code.",
    },
  ];

  return (
    <section className="py-24 relative border-t border-white/5 bg-slate-950/40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">Everything you need to know</h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Answers to common questions about Strator's architecture, Proxy reactivity, and testing methodology.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-panel rounded-2xl border border-white/10 overflow-hidden transition-colors">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none"
              >
                <span className="font-semibold text-white text-base sm:text-lg">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                    openIndex === idx ? "rotate-180 text-cyan-400" : ""
                  }`}
                />
              </button>

              {openIndex === idx && (
                <div className="px-6 pb-6 pt-1 text-slate-300 text-sm sm:text-base leading-relaxed border-t border-white/5 animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
