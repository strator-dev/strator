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
import reactPackage from "@strator/react/package.json";
import { BookOpen, Layers, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "@strator/react Documentation | Strator MVVM for React",
  description:
    "Complete technical guide and API reference for @strator/react. Learn how to bind MVVM models to React 18+ components with fine-grained selectors and shallow diffing.",
};

const reactApiItems: ApiItem[] = [
  {
    id: "strator-provider",
    name: "<StratorProvider />",
    kind: "Component",
    signature: "<StratorProvider initialState?: Record<string, any> | Map<string, any>>{children}</StratorProvider>",
    description:
      "Root context provider that holds the Model instances map and ReactDispatcher instance across the component subtree. Also exported under the alias <Provider />.",
    parameters: [
      {
        name: "children",
        type: "ReactNode",
        description: "The React subtree that can consume Strator hooks.",
      },
      {
        name: "initialState",
        type: "Record<string, any> | Map<string, any>",
        description: "Optional initial state for pre-populating models during server-side rendering or hydration.",
        optional: true,
      },
    ],
    returns: {
      type: "JSX.Element",
      description: "Context provider wrapping children with StratorContext.Provider.",
    },
    tips: [
      "Wrap your root App component or any isolated subtree where you want shared state boundary.",
      "Supports nested providers: child providers create separate instance registries.",
    ],
    example: `import { StratorProvider } from "@strator/react";

export function App() {
  return (
    <StratorProvider initialState={{ "auth": { user: { name: "Alice" } } }}>
      <Dashboard />
    </StratorProvider>
  );
}`,
  },
  {
    id: "use-local-model",
    name: "useLocalModel<M, S>(Model, selector?)",
    kind: "Hook",
    signature:
      "useLocalModel<M extends Class<Model<any>>, S>(ModelClass: M, selector?: (state: StateOf<M>) => S): [InstanceType<M>, S]",
    description:
      "Creates or retrieves a component-local Model instance keyed automatically by React 18's useId(). When a selector is provided, subscribes the component to updates when selected values change.",
    parameters: [
      {
        name: "ModelClass",
        type: "Class<Model<T>>",
        description: "The domain Model class inheriting from @strator/core Model<T>.",
      },
      {
        name: "selector",
        type: "(state: T) => S",
        description: "Pure projection function returning selected slice of state for reactive re-renders.",
        optional: true,
      },
    ],
    returns: {
      type: "[InstanceType<M>, S]",
      description: "Tuple containing the Model instance and the current selected state snapshot.",
    },
    tips: [
      "Always supply a selector if your component needs to re-render when Model state changes.",
      "If selector is omitted, returns [model, undefined] and does not re-render on state updates.",
      "Automatically disposed and cleaned up from memory when the component unmounts.",
      "Ideal for form state, dropdowns, modals, and component-scoped business logic.",
    ],
    example: `import { useLocalModel } from "@strator/react";
import { CounterModel } from "./CounterModel";

export function Counter() {
  const [model, count] = useLocalModel(CounterModel, state => state.count);

  return (
    <div>
      <span>Count: {count}</span>
      <button onClick={() => model.increase()}>+1</button>
    </div>
  );
}`,
  },
  {
    id: "use-shared-model",
    name: "useSharedModel<M, S>(key, Model, selector?)",
    kind: "Hook",
    signature:
      "useSharedModel<M extends Class<Model<any>>, S>(key: string, ModelClass: M, selector?: (state: StateOf<M>) => S): [InstanceType<M>, S]",
    description:
      "Retrieves or instantiates a Model instance shared across all components referencing the same string key within the nearest <StratorProvider>.",
    parameters: [
      {
        name: "key",
        type: "string",
        description: "Unique string identifier for the shared model instance (e.g., 'checkout-flow', 'tab-1').",
      },
      {
        name: "ModelClass",
        type: "Class<Model<T>>",
        description: "The Model class constructor.",
      },
      {
        name: "selector",
        type: "(state: T) => S",
        description: "Selector function for slice of state.",
        optional: true,
      },
    ],
    returns: {
      type: "[InstanceType<M>, S]",
      description: "Tuple of [modelInstance, selectedSnapshot].",
    },
    tips: [
      "Enables multi-component workflows (e.g. step-by-step wizard, table + detail pane) to coordinate seamlessly.",
      "Reference-counted across active consumers: remains alive while any consumer is mounted and automatically disposes when all unmount.",
      "Multiple components can select different slices of the same shared model with independent re-renders.",
    ],
    example: `// Component A
const [cart, itemCount] = useSharedModel("active-cart", CartModel, s => s.items.length);

// Component B (in a different part of the tree)
const [cart, totalPrice] = useSharedModel("active-cart", CartModel, s => s.totalPrice);`,
  },
  {
    id: "use-global-model",
    name: "useGlobalModel<M, S>(Model, selector?)",
    kind: "Hook",
    signature:
      "useGlobalModel<M extends Class<Model<any>>, S>(ModelClass: M, selector?: (state: StateOf<M>) => S): [InstanceType<M>, S]",
    description:
      "Singleton model hook keyed by ModelClass.name. All components invoking useGlobalModel(UserModel) share exactly one instance under the Provider.",
    parameters: [
      {
        name: "ModelClass",
        type: "Class<Model<T>>",
        description: "The Model class constructor.",
      },
      {
        name: "selector",
        type: "(state: T) => S",
        description: "Selector function for reactive updates.",
        optional: true,
      },
    ],
    returns: {
      type: "[InstanceType<M>, S]",
      description: "Tuple of [singletonInstance, selectedSnapshot].",
    },
    tips: [
      "Perfect for application-wide singletons: AuthModel, ThemeModel, SettingsModel, NotificationsModel.",
      "Reference-counted across components: stays active while consumers exist and disposes when all consumers unmount.",
      "Under minification, ensure class names remain stable or use useSharedModel if minifier mangles names.",
    ],
    example: `import { useGlobalModel } from "@strator/react";
import { AuthModel } from "./AuthModel";

export function UserBadge() {
  const [auth, user] = useGlobalModel(AuthModel, s => s.currentUser);
  return <div>Welcome, {user?.name ?? "Guest"}</div>;
}`,
  },
  {
    id: "use-strator-context",
    name: "useStratorContext()",
    kind: "Hook",
    signature: "useStratorContext(): StratorContextValue",
    description:
      "Low-level hook that exposes direct access to the Strator dispatcher, registered model instances Map, and getState helper. Throws if called outside <StratorProvider>.",
    returns: {
      type: "StratorContextValue",
      description: "{ dispatcher: ReactDispatcher, models: Map<string, Model<any>>, getState: (key?: string) => any }",
    },
    tips: [
      "Use for testing utilities, devtools integration, or imperative state inspection.",
      "Regular UI components should prefer useLocalModel, useSharedModel, or useGlobalModel.",
    ],
    example: `import { useStratorContext } from "@strator/react";

export function DevtoolsButton() {
  const ctx = useStratorContext();
  return (
    <button onClick={() => console.log("All Models:", ctx.models)}>
      Dump State Registry
    </button>
  );
}`,
  },
];

const reactMechanicsSteps: FlowStep[] = [
  {
    step: 1,
    title: "Registration & Mounting",
    subtitle: "Context Registry, Dispatcher Attachment & Ref Counting",
    description:
      "When a hook like useLocalModel, useSharedModel, or useGlobalModel executes, it checks the Provider's models Map ref for an existing instance under the specified key (or useId()). If missing, it instantiates the Model class and registers it with the ReactDispatcher. On mount, it increments the model's reference count, and on unmount decrements it, automatically disposing the model and dispatcher once all consumers unmount.",
    badge: "Mount Phase",
    snippet: `// React binding resolves instance and tracks reference count
const instance = models.current.has(key)
  ? models.current.get(key)
  : new ModelClass();
models.current.set(key, instance);
// Retain on mount, release & auto-dispose on unmount
useEffect(() => {
  ctx.retainModel(key);
  return () => ctx.releaseModel(key);
}, [ctx, key]);`,
  },
  {
    step: 2,
    title: "Action Execution & Mutation",
    subtitle: "Direct Class Method Invocation",
    description:
      "Your component calls normal TypeScript class methods on the Model instance (e.g. model.increase()). When this.state is modified, the underlying @strator/core Model proxy intercepts the set trap and dispatches a state change event to the ReactDispatcher.",
    badge: "Domain Logic",
    snippet: `// Pure TypeScript class method
public increase() {
  this.state.count += 1; // triggers core Proxy setter
}`,
  },
  {
    step: 3,
    title: "Selector Evaluation & Diffing",
    subtitle: "shallowEqual Precision Filtering",
    description:
      "ReactDispatcher notifies all subscribed hook instances. Each hook re-evaluates its selector against instance.getState() and compares the result to snapshotRef.current using shallowEqual(). If unchanged, the update is dropped immediately.",
    badge: "Diffing Engine",
    snippet: `// Evaluates selector and tests shallow equality
const nextValue = selector(instance.getState());
if (!shallowEqual(snapshotRef.current, nextValue)) {
  snapshotRef.current = nextValue;
  setTick(t => t + 1); // trigger React re-render
}`,
  },
  {
    step: 4,
    title: "Selective Component Re-render",
    subtitle: "Zero-Overhead Fiber Reconciliation",
    description:
      "Only components whose selected values actually changed trigger setTick() and reconcile in React. Components selecting other slices of the same model remain completely untouched, ensuring optimal 60fps performance.",
    badge: "UI Commit",
    snippet: `// Component renders with fresh snapshot
const [model, count] = useLocalModel(CounterModel, s => s.count);
return <div>{count}</div>;`,
  },
];

const reactLimitations: LimitationItem[] = [
  {
    id: "mandatory-selector",
    title: "Selector Requirement for Reactive Re-renders",
    severity: "critical",
    summary:
      "Calling useLocalModel(Model) without a selector returns [model, undefined] and does NOT subscribe the component to re-renders.",
    details:
      "To prevent unneeded render subscriptions, @strator/react only registers a dispatcher listener when a selector function is passed. If you omit the selector, the hook returns undefined as the state and will never trigger a re-render when the model changes.",
    impact:
      "A developer might expect calling model.increase() to update the component, but the UI remains static if no selector is defined.",
    recommendation:
      "Always pass a selector if the component displays state. If a component only invokes actions without reading state, omitting the selector is intentional and optimal.",
    badSnippet: `// ❌ Bug: No selector means state is undefined and UI won't update
const [model] = useLocalModel(CounterModel);
return <div>{model.getState().count}</div>;`,
    goodSnippet: `// ✅ Correct: Selector subscribes component to updates
const [model, count] = useLocalModel(CounterModel, s => s.count);
return <div>{count}</div>;`,
  },
  {
    id: "selector-reference-stability",
    title: "Selector Reference Stability & Object Creation",
    severity: "warning",
    summary:
      "Returning new object or array literals from selectors without memoization causes re-renders on any state mutation in the model.",
    details:
      "@strator/react compares selector snapshots using shallowEqual(). If your selector returns a newly constructed nested object (e.g., state => ({ nested: { a: state.a } })), shallowEqual will evaluate to false because nested !== prev.nested.",
    impact: "Unnecessary re-renders when unrelated parts of the model state change.",
    recommendation:
      "Select primitive values or flat object projections where all top-level properties are shallow-comparable.",
    badSnippet: `// ❌ Deep nested object created on every tick
const [model, data] = useLocalModel(Model, s => ({
  nested: { value: s.count }
}));`,
    goodSnippet: `// ✅ Flat projection: shallowEqual compares top-level keys
const [model, data] = useLocalModel(Model, s => ({
  count: s.count,
  name: s.name
}));`,
  },
  {
    id: "context-boundary",
    title: "Provider Context Requirement",
    severity: "critical",
    summary: "All Strator hooks must be rendered inside a <StratorProvider> component tree.",
    details:
      "Attempting to call useLocalModel, useSharedModel, useGlobalModel, or useStratorContext outside a <StratorProvider> will throw an explicit Error('useStratorContext must be used within a StratorProvider').",
    impact: "Application crashes during render if context is missing (especially in isolated unit tests).",
    recommendation:
      "Wrap test harnesses or storybook previews with <StratorProvider>. For pure unit testing of Model classes, test the class directly without React or Provider wrappers.",
    goodSnippet: `// Unit testing React components with Strator:
import { render } from "@testing-library/react";
import { StratorProvider } from "@strator/react";

test("renders counter", () => {
  render(
    <StratorProvider>
      <Counter />
    </StratorProvider>
  );
});`,
  },
];

export default function ReactDocsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#060913] text-slate-100 selection:bg-cyan-400 selection:text-slate-950 glow-mesh grid-pattern">
      <Header />
      <main className="flex-grow">
        {/* Page Hero */}
        <DocsHeader
          framework="React"
          packageName="@strator/react"
          version={reactPackage.version}
          description="High-performance React 18 & 19 adapter for Strator MVVM models. Features selective component subscriptions with shallow equality diffing, zero boilerplate hooks, and pristine testability."
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Hands-on Setup</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                Getting Started with React
              </h2>
              <p className="text-slate-400 text-base sm:text-lg">
                Connect your first Model to a React component in less than 2 minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-cyan-600 text-white font-bold font-mono flex items-center justify-center text-sm shadow-md shadow-cyan-600/20">
                      1
                    </span>
                    <h3 className="text-lg font-bold text-white">Wrap your app with &lt;StratorProvider&gt;</h3>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Place <code className="text-cyan-300 font-mono">&lt;StratorProvider&gt;</code> at the root of your
                    React component hierarchy to manage model life-cycles.
                  </p>
                  <CodeCard
                    filename="App.tsx"
                    code={`import React from "react";
import { StratorProvider } from "@strator/react";
import { Counter } from "./Counter";

export function App() {
  return (
    <StratorProvider>
      <Counter />
    </StratorProvider>
  );
}`}
                  />
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold font-mono flex items-center justify-center text-sm shadow-md shadow-blue-600/20">
                      2
                    </span>
                    <h3 className="text-lg font-bold text-white">Define Pure Domain Model</h3>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Write standard classes with typed state and methods. No React dependencies inside the model.
                  </p>
                  <CodeCard
                    filename="CounterModel.ts"
                    code={`import { Model } from "@strator/core";

export interface CounterState {
  count: number;
}

export class CounterModel extends Model<CounterState> {
  static initialState: CounterState = { count: 0 };

  public increase() {
    this.state.count += 1;
  }

  public decrease() {
    this.state.count -= 1;
  }
}`}
                  />
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold font-mono flex items-center justify-center text-sm shadow-md shadow-indigo-600/20">
                    3
                  </span>
                  <h3 className="text-lg font-bold text-white">Consume with useLocalModel</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Use the hook to bind to the model instance and select the exact state properties you need.
                </p>
                <CodeCard
                  filename="Counter.tsx"
                  code={`import React from "react";
import { useLocalModel } from "@strator/react";
import { CounterModel } from "./CounterModel";

export function Counter() {
  const [model, count] = useLocalModel(CounterModel, s => s.count);

  return (
    <div className="p-6 bg-slate-900 rounded-xl border border-white/10 space-y-4">
      <h2 className="text-xl font-bold text-white">Count: {count}</h2>
      <div className="flex gap-2">
        <button
          onClick={() => model.decrease()}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-mono"
        >
          -1
        </button>
        <button
          onClick={() => model.increase()}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white font-mono"
        >
          +1
        </button>
      </div>
    </div>
  );
}`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* API Specification */}
        <ApiSection
          title="@strator/react API Reference"
          description="Explore all components, hooks, and types provided by the official React bindings package."
          items={reactApiItems}
        />

        {/* Internal Mechanics */}
        <InternalMechanics
          framework="React"
          title="React Reconciliation Architecture"
          description="How @strator/react bridges pure JavaScript class mutations with React Fiber state without causing global re-renders."
          steps={reactMechanicsSteps}
          deepDiveNotes={[
            {
              title: "Selective Subscriptions",
              content:
                "Unlike standard context which re-renders every consumer when any value changes, Strator hooks evaluate selectors per component with shallowEqual diffing before calling setTick.",
            },
            {
              title: "Predictable Snapshots",
              content:
                "snapshotRef retains the exact previous selector value. Re-renders only fire if snapshotRef.current !== nextValue according to shallow equality.",
            },
            {
              title: "Zero UI Dependencies in Models",
              content:
                "Domain models remain 100% agnostic of React. The ReactDispatcher handles bridging transparently via @strator/core dispatcher interface.",
            },
          ]}
        />

        {/* Real-World Code Examples */}
        <section id="examples" className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
                <Layers className="w-3.5 h-3.5" />
                <span>Production Patterns</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                Real-World React Examples
              </h2>
              <p className="text-slate-400 text-base sm:text-lg">
                Common architectural patterns for shared subtree state, global singletons, and SSR hydration.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Example 1: Shared Subtree state */}
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-lg font-bold text-white font-mono">Shared Subtree: Multi-step Wizard</h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    useSharedModel
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  Multiple distinct components coordinate across a multi-step checkout workflow by referencing a common
                  key string.
                </p>
                <CodeCard
                  filename="CheckoutWizard.tsx"
                  code={`import React from "react";
import { useSharedModel } from "@strator/react";
import { CheckoutModel } from "./CheckoutModel";

export function StepShipping() {
  const [checkout, shippingAddress] = useSharedModel("checkout-flow", CheckoutModel, s => s.shippingAddress);
  return (
    <input
      value={shippingAddress}
      onChange={e => checkout.setShippingAddress(e.target.value)}
    />
  );
}

export function OrderSummary() {
  // Only re-renders when total changes, NOT when shippingAddress updates!
  const [checkout, total] = useSharedModel("checkout-flow", CheckoutModel, s => s.totalAmount);
  return <div>Total: \${total}</div>;
}`}
                />
              </div>

              {/* Example 2: SSR Initial State Hydration */}
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-lg font-bold text-white font-mono">SSR &amp; Server Hydration</h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    initialState
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  Inject server-rendered data into the root{" "}
                  <code className="text-purple-300 font-mono">&lt;StratorProvider&gt;</code> to hydrate model instances
                  without flicker.
                </p>
                <CodeCard
                  filename="ServerPage.tsx"
                  code={`import React from "react";
import { StratorProvider } from "@strator/react";
import { ProfileView } from "./ProfileView";

export default async function Page() {
  const userData = await fetchUserFromDatabase();

  return (
    <StratorProvider initialState={{
      "UserModel": { profile: userData, isAuthenticated: true }
    }}>
      <ProfileView />
    </StratorProvider>
  );
}`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Limitations & Gotchas */}
        <LimitationsCard framework="React" items={reactLimitations} />

        {/* Bottom CTA to Vue Docs */}
        <section className="py-16 border-t border-white/5 bg-slate-950/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Building with Vue 3 instead?</h3>
              <p className="text-sm text-slate-400">
                Check out the dedicated Vue bindings documentation with reactive proxies and Composition API
                integration.
              </p>
            </div>
            <Link
              href="/vue/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm shadow-lg shadow-emerald-600/20 transition-all shrink-0"
            >
              <span>Explore Vue Bindings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
