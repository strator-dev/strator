import React from "react";

/**
 * A static, simplified picture of the devtools panel for the landing page: the three panes with sample
 * data from the React example (cart, todos, counter). Not the real panel, which lives in @strator/devtools.
 */

type Scope = "global" | "shared" | "local";

// Same colors as the real panel (SCOPES in packages/devtools/src/ui/Panel.tsx).
const SCOPE_DOT: Record<Scope, string> = {
  global: "bg-cyan-400",
  shared: "bg-sky-400",
  local: "bg-purple-400",
};

const instances: { model: string; key: string; scope: Scope; subs: number; selected?: boolean }[] = [
  { model: "SessionModel", key: "SessionModel", scope: "global", subs: 3 },
  { model: "CartModel", key: "active-cart", scope: "shared", subs: 2, selected: true },
  { model: "TodoListModel", key: ":r1:", scope: "local", subs: 1 },
  { model: "CounterModel", key: ":r3:", scope: "local", subs: 1 },
];

type Status = "done" | "threw" | "pending";

const STATUS_CHIP: Record<Status, string> = {
  done: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  threw: "bg-rose-500/10 border-rose-500/30 text-rose-400",
  pending: "bg-amber-500/10 border-amber-500/30 text-amber-400",
};

const actions: {
  time: string;
  call: string;
  status: Status;
  duration: string;
  changes: number;
  depth?: number;
  selected?: boolean;
}[] = [
  { time: "+0.84s", call: "counter.increase()", status: "done", duration: "0.1ms", changes: 1 },
  { time: "+2.10s", call: 'todoList.add("Ship devtools")', status: "done", duration: "0.2ms", changes: 2 },
  { time: "+3.47s", call: 'cart.addItem("sku-42", 19)', status: "done", duration: "0.3ms", changes: 2, selected: true },
  { time: "+3.47s", call: "cart.recalculate()", status: "done", duration: "0.1ms", changes: 1, depth: 1 },
  { time: "+5.02s", call: 'cart.applyCoupon("NOPE")', status: "threw", duration: "0.1ms", changes: 0 },
  { time: "+6.31s", call: "session.refresh()", status: "pending", duration: "…", changes: 0 },
];

const diff: { path: string; before: string; after: string }[] = [
  { path: "items[1]", before: "undefined", after: '{ sku: "sku-42", qty: 1 }' },
  { path: "total", before: "19", after: "38" },
];

function PaneHead({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">{title}</span>
      {count !== undefined && (
        <span className="text-[10px] font-mono px-2 py-px rounded-full bg-slate-400/10 text-slate-300">{count}</span>
      )}
    </div>
  );
}

export function DevtoolsPreview() {
  return (
    <div
      role="img"
      aria-label="Illustration of the Strator devtools panel: model instances on the left, the action log in the middle and the inspector with a state diff on the right."
      className="rounded-2xl border border-cyan-500/20 bg-ink-900/90 shadow-2xl shadow-cyan-950/40 overflow-hidden backdrop-blur-md select-none"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 bg-ink-950/80">
        <img src="/brand/logo-64.png" alt="" width={20} height={20} className="w-5 h-5" />
        <span className="font-mono font-bold text-sm text-white">strator</span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          devtools
        </span>
        <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono ml-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Recording · @strator/react · localhost:5173
        </span>
        <div className="flex-grow" />
        <span className="hidden md:inline text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-800/80 border border-white/10 text-slate-300">
          Export session
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_260px] lg:grid-cols-[200px_minmax(0,1fr)_280px] text-left">
        {/* Instances */}
        <div className="hidden lg:block border-r border-white/5 bg-ink-950/50">
          <PaneHead title="Instances" count={instances.length} />
          <ul className="p-2 space-y-1">
            {instances.map(instance => (
              <li
                key={instance.key}
                className={`px-2.5 py-2 rounded-lg border ${
                  instance.selected ? "bg-cyan-500/10 border-cyan-500/30" : "border-transparent"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${SCOPE_DOT[instance.scope]}`} />
                  <span className="font-mono text-xs text-white truncate">{instance.model}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5 pl-3.5 font-mono text-[10px] text-slate-400">
                  <span className="truncate">{instance.key}</span>
                  <span>{`${instance.subs} sub${instance.subs === 1 ? "" : "s"}`}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Action log */}
        <div className="min-w-0">
          <PaneHead title="Actions" count={actions.length} />
          <ul className="divide-y divide-white/5">
            {actions.map((action, index) => (
              <li
                key={index}
                className={`flex items-center gap-3 px-3 py-2 font-mono text-[11px] ${
                  action.selected ? "bg-cyan-500/10" : ""
                }`}
              >
                <span className="w-12 shrink-0 text-slate-500">{action.time}</span>
                <span
                  className="flex-1 min-w-0 truncate text-slate-200"
                  style={{ paddingLeft: (action.depth ?? 0) * 16 }}
                >
                  {action.depth ? <span className="text-slate-500">↳ </span> : null}
                  {action.call}
                </span>
                <span className={`shrink-0 px-2 py-px rounded-full border text-[10px] ${STATUS_CHIP[action.status]}`}>
                  {action.status}
                </span>
                <span className="hidden sm:inline w-12 shrink-0 text-right text-slate-400">{action.duration}</span>
                <span className="hidden sm:inline w-14 shrink-0 text-right text-slate-400">
                  {action.changes > 0 ? `Δ ${action.changes}` : "–"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Inspector */}
        <div className="hidden md:block border-l border-white/5 bg-slate-950/40">
          <div className="flex items-center gap-1 px-3 py-2 border-b border-white/5 text-[11px] font-medium">
            {["State", "Action", "Subscribers"].map(tab => (
              <span
                key={tab}
                className={`px-2.5 py-1 rounded-md ${
                  tab === "Action" ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white" : "text-slate-400"
                }`}
              >
                {tab}
              </span>
            ))}
          </div>
          <div className="p-3 space-y-3">
            <div className="font-mono text-xs text-white">cart.addItem(&quot;sku-42&quot;, 19)</div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                State changes
              </div>
              <ul className="space-y-1.5">
                {diff.map(change => (
                  <li
                    key={change.path}
                    className="rounded-lg bg-ink-800/80 border border-white/5 p-2 font-mono text-[10px]"
                  >
                    <div className="text-cyan-300 mb-0.5">{change.path}</div>
                    <div className="text-rose-300/80 line-through truncate">{change.before}</div>
                    <div className="text-emerald-300 truncate">{change.after}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-medium">
              <span className="px-2 py-1 rounded-md bg-slate-800/80 border border-white/10 text-slate-200">
                Jump to state before
              </span>
              <span className="px-2 py-1 rounded-md bg-slate-800/80 border border-white/10 text-slate-200">
                Dispatch again
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
