import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DocsHeader } from "@/components/docs/DocsHeader";
import { ApiSection, ApiItem } from "@/components/docs/ApiSection";
import { InternalMechanics, FlowStep } from "@/components/docs/InternalMechanics";
import { LimitationsCard, LimitationItem } from "@/components/docs/LimitationsCard";
import { CodeCard } from "@/components/docs/CodeCard";
import vuePackage from "@strator/vue/package.json";
import { BookOpen, Layers, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "@strator/vue Documentation | Strator MVVM for Vue 3",
  description:
    "Complete technical guide and API reference for @strator/vue. Learn how to bind MVVM models to Vue 3 Composition API using native reactive proxies and computed selectors.",
};

const vueApiItems: ApiItem[] = [
  {
    id: "create-strator",
    name: "createStrator(options?)",
    kind: "Plugin",
    signature: "createStrator(options?: { initialState?: Record<string, any> | Map<string, any> }): Plugin",
    description:
      "Standard Vue 3 plugin that installs Strator's root context and model registry into the application using app.use().",
    parameters: [
      {
        name: "options.initialState",
        type: "Record<string, any> | Map<string, any>",
        description: "Initial state object or Map for hydrating models during SSR or initialization.",
        optional: true,
      },
    ],
    returns: {
      type: "Plugin",
      description: "Vue 3 plugin instance providing STRATOR_CONTEXT_KEY to the entire app.",
    },
    tips: [
      "Install once in your main.ts before mounting the Vue app.",
      "Automatically makes all Strator composables available throughout the Vue component hierarchy.",
    ],
    language: "typescript",
    example: `import { createApp } from "vue";
import { createStrator } from "@strator/vue";
import App from "./App.vue";

const app = createApp(App);
app.use(createStrator());
app.mount("#app");`,
  },
  {
    id: "strator-provider-vue",
    name: "<StratorProvider /> / provideStratorContext()",
    kind: "Component",
    signature: "<StratorProvider :initial-state='initialState'><slot /></StratorProvider>",
    description:
      "Component or helper function for creating scoped Strator context boundaries in isolated subtrees or micro-frontends without registering globally.",
    parameters: [
      {
        name: "initialState",
        type: "Record<string, any> | Map<string, any>",
        description: "Initial state mapping for this scoped context boundary.",
        optional: true,
      },
    ],
    returns: {
      type: "StratorContext",
      description: "Scoped context with independent model registry and dispatcher.",
    },
    tips: ["Use when embedding isolated widgets or test fixtures that must not share state with the global app."],
    language: "vue",
    example: `<template>
  <StratorProvider :initial-state="{ 'CartModel': { items: [] } }">
    <CheckoutSubtree />
  </StratorProvider>
</template>

<script setup lang="ts">
import { StratorProvider } from "@strator/vue";
import CheckoutSubtree from "./CheckoutSubtree.vue";
</script>`,
  },
  {
    id: "use-local-model-vue",
    name: "useLocalModel(ModelClass, selector?)",
    kind: "Hook",
    signature:
      "useLocalModel<M extends Class<Model<any>>, S>(ModelClass: M, selector?: (state: StateOf<M>) => S): UseModelResult<M, S>",
    description:
      "Instantiates a component-local Model instance keyed by Vue's useId(). Automatically disposes the model when the component unmounts via onScopeDispose().",
    parameters: [
      {
        name: "ModelClass",
        type: "Class<Model<T>>",
        description: "Domain Model class constructor.",
      },
      {
        name: "selector",
        type: "(state: T) => S",
        description:
          "Optional projection returning a ComputedRef<S>. If omitted, returns the entire reactive state proxy.",
        optional: true,
      },
    ],
    returns: {
      type: "UseModelResult<M, S>",
      description: "Dual-access structure usable as tuple [model, state] or object { model, state }.",
    },
    tips: [
      "Provides automatic memory cleanup when component unmounts via onScopeDispose.",
      "Dual return syntax allows either array destructuring ([model, state]) or property destructuring ({ model, state }).",
    ],
    language: "vue",
    example: `<script setup lang="ts">
import { useLocalModel } from "@strator/vue";
import { CounterModel } from "./CounterModel";

// Array destructuring syntax:
const [model, count] = useLocalModel(CounterModel, s => s.count);

// Or object destructuring syntax:
// const { model, state: count } = useLocalModel(CounterModel, s => s.count);
</script>

<template>
  <button @click="model.increase()">Count: {{ count }}</button>
</template>`,
  },
  {
    id: "use-shared-model-vue",
    name: "useSharedModel(key, ModelClass, selector?)",
    kind: "Hook",
    signature:
      "useSharedModel<M extends Class<Model<any>>, S>(key: string, ModelClass: M, selector?: (state: StateOf<M>) => S): UseModelResult<M, S>",
    description: "Shares a Model instance across multiple Vue components identified by the same string key.",
    parameters: [
      {
        name: "key",
        type: "string",
        description: "Unique string key identifying the shared model.",
      },
      {
        name: "ModelClass",
        type: "Class<Model<T>>",
        description: "Domain Model class constructor.",
      },
      {
        name: "selector",
        type: "(state: T) => S",
        description: "Selector returning ComputedRef<S> (or reactive state if omitted).",
        optional: true,
      },
    ],
    returns: {
      type: "UseModelResult<M, S>",
      description: "Dual-access tuple/object [model, state].",
    },
    tips: [
      "Persists across component lifecycles in the context until explicitly cleared.",
      "Great for master-detail views, modals, and multi-step forms.",
    ],
    language: "typescript",
    example: `// Component A:
const [cart, items] = useSharedModel("checkout", CartModel, s => s.items);

// Component B:
const [cart, total] = useSharedModel("checkout", CartModel, s => s.total);`,
  },
  {
    id: "use-global-model-vue",
    name: "useGlobalModel(ModelClass, selector?)",
    kind: "Hook",
    signature:
      "useGlobalModel<M extends Class<Model<any>>, S>(ModelClass: M, selector?: (state: StateOf<M>) => S): UseModelResult<M, S>",
    description:
      "Singleton hook keyed by ModelClass.name. Every component calling useGlobalModel(AuthModel) accesses the same instance.",
    parameters: [
      {
        name: "ModelClass",
        type: "Class<Model<T>>",
        description: "Domain Model class constructor.",
      },
      {
        name: "selector",
        type: "(state: T) => S",
        description: "Optional projection function.",
        optional: true,
      },
    ],
    returns: {
      type: "UseModelResult<M, S>",
      description: "Dual-access tuple/object [model, state].",
    },
    tips: ["Ideal for global state: AuthModel, SettingsModel, ThemeModel, DeviceModel."],
    language: "vue",
    example: `<script setup lang="ts">
import { useGlobalModel } from "@strator/vue";
import { AuthModel } from "./AuthModel";

const [auth, user] = useGlobalModel(AuthModel, s => s.user);
</script>

<template>
  <div v-if="user">Logged in as {{ user.name }}</div>
</template>`,
  },
];

const vueMechanicsSteps: FlowStep[] = [
  {
    step: 1,
    title: "Plugin & Context Initialization",
    subtitle: "Global STRATOR_CONTEXT_KEY Provisioning",
    description:
      "When app.use(createStrator()) runs, it configures a VueDispatcher and Model instance cache, providing STRATOR_CONTEXT_KEY to Vue's injection system.",
    badge: "App Startup",
    snippet: `// main.ts
const app = createApp(App);
app.use(createStrator());
app.mount("#app");`,
  },
  {
    step: 2,
    title: "Reactive Proxy Wrapping",
    subtitle: "Vue 3 native reactive() clone",
    description:
      "When a Model is mounted to Vue, VueModelDispatcher creates a native Vue reactive(cloneState(model.getState())) proxy. This allows Vue's reactivity system to track dependencies naturally.",
    badge: "Proxy Creation",
    snippet: `// dispatcher.ts
const reactiveState = reactive(cloneState(initialState));
dispatcher.setReactiveState(reactiveState, () => instance.getState());`,
  },
  {
    step: 3,
    title: "Method Call & syncState Synchronization",
    subtitle: "Deep Structural Reconciliation",
    description:
      "When a domain method updates this.state, dispatchStateChange() triggers syncState(source, target). syncState recursively synchronizes updated keys, nested objects, and array lengths directly into Vue's reactive proxy.",
    badge: "Sync Algorithm",
    snippet: `// dispatcher.ts
public dispatchStateChange() {
  if (this._reactiveState && this._getState) {
    syncState(this._getState(), this._reactiveState);
  }
}`,
  },
  {
    step: 4,
    title: "Native Vue Reactivity Trigger",
    subtitle: "Computed & Template Dependency Updates",
    description:
      "Because mutations are applied directly to the Vue reactive proxy, all computed() selectors and template bindings that accessed those properties update automatically via Vue's native effect runner with zero overhead.",
    badge: "Reactivity Update",
    snippet: `// Native computed tracking
const count = computed(() => reactiveState.count);
// Template re-renders automatically when count changes!`,
  },
];

const vueLimitations: LimitationItem[] = [
  {
    id: "sync-state-overhead",
    title: "Deep State Sync Overhead on Massive Collections",
    severity: "warning",
    summary:
      "syncState recursively traverses and synchronizes object properties and array items into the reactive proxy on state mutation notifications.",
    details:
      "To keep Vue's reactive proxy in sync with the model's internal plain JS state, syncState compares keys and array elements recursively. For very large collections (e.g. arrays of 50,000+ items modified frequently), this recursive sync can introduce CPU overhead during high-frequency mutations.",
    impact: "Performance degradation during bulk modifications of huge, deeply nested arrays or graphs.",
    recommendation:
      "For massive collections, paginate or normalize lists into maps keyed by IDs, or slice data at the Model level before storing in state.",
    badSnippet: `// Massive monolithic array in state
export class TableModel extends Model<{ rows: LargeItem[] }> {
  public updateAll() {
    this.state.rows = 100_000_items; // syncState traverses all 100k items
  }
}`,
    goodSnippet: `// Normalized or paginated state
export class TableModel extends Model<{ page: LargeItem[]; total: number }> {
  public setPage(pageItems: LargeItem[]) {
    this.state.page = pageItems; // Fast 20-50 item sync
  }
}`,
  },
  {
    id: "computed-ref-value",
    title: "ComputedRef .value Unwrapping Behavior",
    severity: "info",
    summary:
      "When a selector function is passed to useLocalModel/useModel, the returned state is a Vue ComputedRef, requiring .value in <script setup>.",
    details:
      "In Vue 3 templates, ComputedRef values are automatically unwrapped (e.g., {{ count }}). However, inside <script setup lang='ts'>, you must access count.value if you perform computations or logging in script code. Conversely, when no selector is passed, state is a reactive proxy where properties are accessed directly without .value.",
    impact:
      "Developers accustomed to React hooks might forget .value in Vue script setup, resulting in referencing the ref object rather than the primitive value.",
    recommendation:
      "Remember that selectors produce a ComputedRef<S>. Use count.value in script setup and {{ count }} in templates.",
    badSnippet: `<script setup lang="ts">
const [model, count] = useLocalModel(CounterModel, s => s.count);
// ❌ Bug: count is a ComputedRef, cannot use math operators directly
console.log(count + 1); // "[object Object]1"
</script>`,
    goodSnippet: `<script setup lang="ts">
const [model, count] = useLocalModel(CounterModel, s => s.count);
// ✅ Correct: access .value in script setup
console.log(count.value + 1);
</script>
<template>
  <!-- ✅ In template, automatically unwrapped -->
  <div>{{ count }}</div>
</template>`,
  },
  {
    id: "direct-proxy-mutation",
    title: "Direct Reactive Proxy Mutation Divergence",
    severity: "critical",
    summary:
      "Mutating the returned reactive proxy directly (state.count++) bypasses Model class methods and breaks encapsulation.",
    details:
      "In Vue, modifying a reactive proxy (state.count++) triggers Vue template updates. However, doing so does NOT invoke Model action validation, logging, or core dispatchers, and can cause the Model's private internal state to diverge from Vue's proxy until the next class method executes.",
    impact: "Bypasses business logic invariants and breaks zero-mock unit test guarantees.",
    recommendation:
      "Always trigger mutations exclusively through Model class methods (model.increase()) rather than mutating state directly.",
    badSnippet: `<!-- ❌ Anti-pattern: direct proxy mutation -->
<button @click="state.count++">Increment</button>`,
    goodSnippet: `<!-- ✅ Recommended: call model class method -->
<button @click="model.increase()">Increment</button>`,
  },
  {
    id: "injection-context-vue",
    title: "Vue Injection Context Requirement",
    severity: "warning",
    summary: "Strator composables must be invoked during Vue component setup() or inside an active effect scope.",
    details:
      "Composables like useLocalModel rely on inject(STRATOR_CONTEXT_KEY) and onScopeDispose. Calling them outside of setup() or an active injection context will cause them to throw an error indicating context is unavailable.",
    impact: "Fails if called inside asynchronous callbacks after setup has finished.",
    recommendation: "Always call useLocalModel, useSharedModel, and useGlobalModel at the top level of <script setup>.",
    goodSnippet: `<script setup lang="ts">
// ✅ Called synchronously in setup()
const [auth, user] = useGlobalModel(AuthModel, s => s.currentUser);
</script>`,
  },
];

export default function VueDocsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#060913] text-slate-100 selection:bg-cyan-400 selection:text-slate-950 glow-mesh grid-pattern">
      <Header />
      <main className="flex-grow">
        {/* Page Hero */}
        <DocsHeader
          framework="Vue"
          packageName="@strator/vue"
          version={vuePackage.version}
          description="Native Vue 3 adapter for Strator MVVM models. Bridges pure TypeScript domain logic with Vue's reactive() proxies and Composition API for automatic dependency tracking and zero boilerplate."
          navLinks={[
            { href: "#quickstart", label: "Quickstart" },
            { href: "#api", label: "API Reference" },
            { href: "#internals", label: "How It Works" },
            { href: "#examples", label: "Examples" },
            { href: "#limitations", label: "Limitations & Gotchas" },
          ]}
        />

        {/* Quickstart Section */}
        <section id="quickstart" className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Vue 3 Setup</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                Getting Started with Vue 3
              </h2>
              <p className="text-slate-400 text-base sm:text-lg">
                Install the plugin and start using Strator models with Vue Composition API in 3 simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold font-mono flex items-center justify-center text-sm shadow-md shadow-emerald-600/20">
                      1
                    </span>
                    <h3 className="text-lg font-bold text-white">Register the createStrator() Plugin</h3>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Install <code className="text-emerald-300 font-mono">createStrator()</code> into your Vue app
                    instance in <code className="text-slate-300 font-mono">main.ts</code>.
                  </p>
                  <CodeCard
                    filename="main.ts"
                    language="ts"
                    code={`import { createApp } from "vue";
import { createStrator } from "@strator/vue";
import App from "./App.vue";

const app = createApp(App);
app.use(createStrator());
app.mount("#app");`}
                  />
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-teal-600 text-white font-bold font-mono flex items-center justify-center text-sm shadow-md shadow-teal-600/20">
                      2
                    </span>
                    <h3 className="text-lg font-bold text-white">Define Pure Domain Model</h3>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Pure TypeScript class inheriting from{" "}
                    <code className="text-emerald-300 font-mono">Model&lt;T&gt;</code>. Exactly identical across React,
                    Vue, or Node.js!
                  </p>
                  <CodeCard
                    filename="CounterModel.ts"
                    language="ts"
                    code={`import { Model } from "@strator/core";

export interface CounterState {
  count: number;
}

export class CounterModel extends Model<CounterState> {
  static initialState: CounterState = { count: 0 };

  public increase() {
    this.state.count += 1;
  }

  public reset() {
    this.state.count = 0;
  }
}`}
                  />
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-cyan-600 text-white font-bold font-mono flex items-center justify-center text-sm shadow-md shadow-cyan-600/20">
                    3
                  </span>
                  <h3 className="text-lg font-bold text-white">Use in &lt;script setup&gt;</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Consume models with <code className="text-emerald-300 font-mono">useLocalModel</code>. Automatic
                  cleanup on unmount!
                </p>
                <CodeCard
                  filename="Counter.vue"
                  language="vue"
                  code={`<script setup lang="ts">
import { useLocalModel } from "@strator/vue";
import { CounterModel } from "./CounterModel";

// Dual syntax: [model, count] or { model, state: count }
const [model, count] = useLocalModel(CounterModel, s => s.count);
</script>

<template>
  <div class="p-6 bg-slate-900 rounded-xl border border-white/10 space-y-4">
    <h2 class="text-xl font-bold text-white">Count: {{ count }}</h2>
    <div class="flex gap-2">
      <button
        @click="model.increase()"
        class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-mono"
      >
        +1
      </button>
      <button
        @click="model.reset()"
        class="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-mono"
      >
        Reset
      </button>
    </div>
  </div>
</template>`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* API Specification */}
        <ApiSection
          title="@strator/vue API Reference"
          description="Explore all plugin options, composables, and components in @strator/vue."
          items={vueApiItems}
          defaultLanguage="vue"
        />

        {/* Internal Mechanics */}
        <InternalMechanics
          framework="Vue"
          title="Vue Reactivity & syncState Architecture"
          description="How @strator/vue synchronizes pure JavaScript class instances with Vue 3's reactive proxy engine."
          steps={vueMechanicsSteps}
          deepDiveNotes={[
            {
              title: "Native Vue Dependency Tracking",
              content:
                "Unlike React which requires forced ticks to re-render, Vue tracks accessed properties directly through the reactive proxy. If a template only reads user.name, modifying user.email triggers zero template updates.",
            },
            {
              title: "Automatic onScopeDispose Lifecycle",
              content:
                "Local models created with useLocalModel automatically clean themselves up when their parent component's Vue EffectScope is destroyed.",
            },
            {
              title: "Dual Return Syntax",
              content:
                "All composables return a UseModelResult that can be destructured as an array [model, state] or as an object { model, state }, maximizing flexibility.",
            },
          ]}
        />

        {/* Real-World Code Examples */}
        <section id="examples" className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
                <Layers className="w-3.5 h-3.5" />
                <span>Vue Composition API Patterns</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                Real-World Vue 3 Examples
              </h2>
              <p className="text-slate-400 text-base sm:text-lg">
                Practical patterns for global singletons, shared state, and full reactive state access.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Example 1: Full Reactive State without selector */}
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-lg font-bold text-white font-mono">Full Reactive State Access</h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Direct Proxy
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  When selector is omitted in Vue, you receive the full reactive state proxy with direct dot-notation
                  access.
                </p>
                <CodeCard
                  filename="ProfileCard.vue"
                  language="vue"
                  code={`<script setup lang="ts">
import { useGlobalModel } from "@strator/vue";
import { UserModel } from "./UserModel";

// Omit selector: state is the full reactive proxy
const [userModel, state] = useGlobalModel(UserModel);
</script>

<template>
  <div class="user-card">
    <h3>{{ state.profile.name }}</h3>
    <p>{{ state.profile.email }}</p>
    <button @click="userModel.updateStatus('active')">Set Active</button>
  </div>
</template>`}
                />
              </div>

              {/* Example 2: Shared Cart across View & Header */}
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-lg font-bold text-white font-mono">Shared Shopping Cart</h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    useSharedModel
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  Seamlessly share state across multiple Vue components with fine-grained computed selectors.
                </p>
                <CodeCard
                  filename="CartBadge.vue"
                  language="vue"
                  code={`<script setup lang="ts">
import { useSharedModel } from "@strator/vue";
import { CartModel } from "./CartModel";

// Select only item count for the header badge
const [cart, count] = useSharedModel("main-cart", CartModel, s => s.items.length);
</script>

<template>
  <div class="badge">
    Cart Items: {{ count }}
  </div>
</template>`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Limitations & Gotchas */}
        <LimitationsCard framework="Vue" items={vueLimitations} />

        {/* Bottom CTA to React Docs */}
        <section className="py-16 border-t border-white/5 bg-slate-950/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Looking for React bindings?</h3>
              <p className="text-sm text-slate-400">
                Explore the React 18 &amp; 19 guide with selective hooks, shallowEqual diffing, and SSR hydration.
              </p>
            </div>
            <Link
              href="/react/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-sm shadow-lg shadow-cyan-600/20 transition-all shrink-0"
            >
              <span>Explore React Bindings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
