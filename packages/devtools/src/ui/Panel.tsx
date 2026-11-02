import type { ModelScope } from "@strator/core";
import React, { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import pkg from "../../package.json" with { type: "json" };
import { LOGO_64 } from "../logo.ts";
import { callLabel, testSnippet, variableName } from "../snippet.ts";
import type { ActionRecord, ActionStatus, DevtoolsStore, InstanceRecord } from "../store.ts";
import { childPath, formatValue, isJSONCompatible, isPlainContainer, toCode, toJSONValue } from "../values.ts";
import {
  ArrowIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClearIcon,
  CloseIcon,
  DownloadIcon,
  ListIcon,
  MaximizeIcon,
  MinimizeIcon,
  PauseIcon,
  RecordIcon,
  SearchIcon,
  SettingsIcon,
  SpinnerIcon,
  UsersIcon,
} from "./icons.tsx";

const VERSION: string = pkg.version;

/** Below this panel width the side panes collapse into rails and open as drawers over the log. */
export const COMPACT_WIDTH = 1100;

type TimeFormat = "relative" | "clock";
type InspectorTab = "state" | "action" | "subs";
type ScopeFilter = "all" | ModelScope;

const SCOPES: Record<
  ModelScope,
  { title: string; hook: string; color: string; tint: string; line: string; text: string }
> = {
  global: {
    title: "Global",
    hook: "useGlobalModel",
    color: "#22d3ee",
    tint: "rgb(6 182 212 / 0.10)",
    line: "rgb(6 182 212 / 0.25)",
    text: "#67e8f9",
  },
  shared: {
    title: "Shared",
    hook: "useSharedModel",
    color: "#38bdf8",
    tint: "rgb(14 165 233 / 0.10)",
    line: "rgb(14 165 233 / 0.25)",
    text: "#7dd3fc",
  },
  local: {
    title: "Local",
    hook: "useLocalModel",
    color: "#c084fc",
    tint: "rgb(168 85 247 / 0.10)",
    line: "rgb(168 85 247 / 0.25)",
    text: "#d8b4fe",
  },
  standalone: {
    title: "Standalone",
    hook: "Model.withInternalState",
    color: "#94a3b8",
    tint: "rgb(148 163 184 / 0.10)",
    line: "rgb(148 163 184 / 0.25)",
    text: "#cbd5e1",
  },
};
const SCOPE_ORDER: ModelScope[] = ["global", "shared", "local", "standalone"];

const STATUS_LABEL: Record<ActionStatus, string> = {
  done: "done",
  threw: "threw",
  pending: "pending",
  lifecycle: "lifecycle",
  external: "external",
};

const MAX_ROWS = 500;

function readSetting<T extends string>(name: string, fallback: T, allowed: readonly T[]): T {
  try {
    const value = globalThis.localStorage?.getItem(`strator-devtools:${name}`);
    return value && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeSetting(name: string, value: string): void {
  try {
    globalThis.localStorage?.setItem(`strator-devtools:${name}`, value);
  } catch {
    // Storage can be unavailable (private mode, sandboxed iframes); the setting just won't stick.
  }
}

function keyLabel(instance: InstanceRecord): string {
  return instance.scope === "local" ? `useId ${instance.key}` : JSON.stringify(instance.key);
}

function instanceLabel(instance: InstanceRecord): string {
  return instance.scope === "shared" ? `${instance.model} · ${instance.key}` : instance.model;
}

function formatTime(action: { time: number; timestamp: number }, format: TimeFormat): string {
  if (format === "clock") {
    const d = new Date(action.timestamp);
    const p = (n: number, l = 2) => String(n).padStart(l, "0");
    return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`;
  }
  return `+${(action.time / 1000).toFixed(3)}s`;
}

function formatDuration(action: ActionRecord): string {
  if (action.status === "pending") return "running";
  if (action.duration === undefined) return "—";
  if (action.duration < 1) return `${action.duration.toFixed(1)}ms`;
  if (action.duration < 1000) return `${Math.round(action.duration)}ms`;
  return `${(action.duration / 1000).toFixed(2)}s`;
}

function matches(action: ActionRecord, instance: InstanceRecord | undefined, query: string): boolean {
  if (!query) return true;
  const haystack = instance
    ? `${variableName(instance.model)}.${action.method} ${instance.model} ${instance.key} ${STATUS_LABEL[action.status]}`
    : action.method;
  return haystack.toLowerCase().includes(query);
}

function useElementWidth(ref: React.RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(() => (typeof window === "undefined" ? COMPACT_WIDTH : window.innerWidth));
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const next = element.getBoundingClientRect().width;
      if (next > 0) setWidth(next);
    };
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

function useCopy(): [string | null, (id: string, text: string) => void] {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (id: string, text: string) => {
    const done = () => {
      setCopied(id);
      setTimeout(() => setCopied(current => (current === id ? null : current)), 1500);
    };
    try {
      void globalThis.navigator?.clipboard?.writeText(text).then(done, () => {});
    } catch {
      // Clipboard access can be blocked; nothing else to do.
    }
  };
  return [copied, copy];
}

function downloadJSON(name: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ------------------------------------------------------------------------------------------ state tree

interface TreeLine {
  depth: number;
  key: string;
  value: string;
  kind: "string" | "number" | "literal" | "punct";
  path: string;
}

function valueKind(value: unknown): TreeLine["kind"] {
  if (typeof value === "string") return "string";
  if (typeof value === "number" || typeof value === "bigint") return "number";
  if (value === null || value === undefined || typeof value === "boolean") return "literal";
  return "string";
}

function buildTree(value: unknown): TreeLine[] {
  const lines: TreeLine[] = [];
  const seen = new Set<object>();
  const walk = (v: unknown, key: string | null, depth: number, path: string, last: boolean) => {
    const comma = last ? "" : ",";
    const k = key === null ? "" : `${key}: `;
    if (isPlainContainer(v) && !seen.has(v) && lines.length < 2000) {
      seen.add(v);
      const isArray = Array.isArray(v);
      const entries: Array<[string | number, unknown]> = isArray
        ? (v as unknown[]).map((x, n) => [n, x])
        : Object.keys(v).map(x => [x, (v as Record<string, unknown>)[x]]);
      if (entries.length === 0) {
        lines.push({ depth, key: k, value: (isArray ? "[]" : "{}") + comma, kind: "punct", path });
      } else {
        lines.push({ depth, key: k, value: isArray ? "[" : "{", kind: "punct", path });
        entries.forEach(([ck, cv], n) =>
          walk(
            cv,
            isArray ? null : /^[A-Za-z_$][\w$]*$/.test(String(ck)) ? String(ck) : JSON.stringify(ck),
            depth + 1,
            childPath(path, ck, isArray),
            n === entries.length - 1,
          ),
        );
        lines.push({ depth, key: "", value: (isArray ? "]" : "}") + comma, kind: "punct", path });
      }
      seen.delete(v);
    } else {
      lines.push({ depth, key: k, value: formatValue(v, 200) + comma, kind: valueKind(v), path });
    }
  };
  walk(value, null, 0, "", true);
  return lines;
}

function isHit(path: string, changed: string[]): boolean {
  if (!path) return false;
  return changed.some(c => path === c || path.startsWith(`${c}.`) || path.startsWith(`${c}[`));
}

// ------------------------------------------------------------------------------------------ panel

export interface DevtoolsPanelProps {
  store: DevtoolsStore;
  /** Shows a close button in the header. */
  onClose?: () => void;
  /** Shows a maximize / restore button in the header. */
  onToggleMaximize?: () => void;
  maximized?: boolean;
}

export function DevtoolsPanel({ store, onClose, onToggleMaximize, maximized }: DevtoolsPanelProps) {
  useSyncExternalStore(store.subscribe, store.getRevision, store.getRevision);
  const rootRef = useRef<HTMLDivElement>(null);
  const width = useElementWidth(rootRef);
  const compact = width < COMPACT_WIDTH;
  // Phone width: header buttons drop their labels.
  const narrow = width < 640;

  const [selectedUid, setSelectedUid] = useState<number | null>(null);
  const [selectedActionId, setSelectedActionId] = useState<number | null>(null);
  const [tab, setTab] = useState<InspectorTab>("action");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");
  const [logScope, setLogScope] = useState<"all" | "one">("all");
  const [query, setQuery] = useState("");
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(() =>
    readSetting<TimeFormat>("timeFormat", "relative", ["relative", "clock"]),
  );
  const [menuOpen, setMenuOpen] = useState(false);
  // Wide layout: panes sit next to the log and can be folded into rails.
  const [instancesOpen, setInstancesOpen] = useState(
    () => readSetting("instancesPane", "open", ["open", "closed"]) === "open",
  );
  const [inspectorOpen, setInspectorOpen] = useState(
    () => readSetting("inspectorPane", "open", ["open", "closed"]) === "open",
  );
  // Compact layout: at most one pane is open, as a drawer over the log.
  const [drawer, setDrawer] = useState<"instances" | "inspector" | null>(null);

  const instances = store.instances;
  const actions = store.actions;
  const byUid = new Map(instances.map(i => [i.uid, i]));

  const selectedAction =
    (selectedActionId !== null ? store.getAction(selectedActionId) : undefined) ?? actions[actions.length - 1];
  // Without an explicit pick, follow the selected action so the inspector header and its tabs agree.
  const selected =
    (selectedUid !== null ? byUid.get(selectedUid) : undefined) ??
    (selectedAction ? byUid.get(selectedAction.instanceUid) : undefined) ??
    instances.find(i => !i.disposed) ??
    instances[0];

  const toggleInstances = () => {
    if (compact) {
      setDrawer(d => (d === "instances" ? null : "instances"));
    } else {
      setInstancesOpen(open => {
        writeSetting("instancesPane", open ? "closed" : "open");
        return !open;
      });
    }
  };
  const toggleInspector = () => {
    if (compact) {
      setDrawer(d => (d === "inspector" ? null : "inspector"));
    } else {
      setInspectorOpen(open => {
        writeSetting("inspectorPane", open ? "closed" : "open");
        return !open;
      });
    }
  };

  useEffect(() => {
    if (!compact) setDrawer(null);
  }, [compact]);

  const pickInstance = (instance: InstanceRecord) => {
    setSelectedUid(instance.uid);
    setTab("state");
    const last = [...actions].reverse().find(a => a.instanceUid === instance.uid);
    if (last) setSelectedActionId(last.id);
    if (compact) setDrawer("inspector");
  };

  const pickAction = (action: ActionRecord) => {
    setSelectedActionId(action.id);
    setSelectedUid(action.instanceUid);
    setTab("action");
    if (compact) setDrawer("inspector");
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "Escape") return;
    if (menuOpen) setMenuOpen(false);
    else if (drawer) setDrawer(null);
    else return;
    event.stopPropagation();
  };

  // ---------------------------------------------------------------- derived data

  const q = query.trim().toLowerCase();
  const shown = actions.filter(a => {
    if (logScope === "one" && selected && a.instanceUid !== selected.uid) return false;
    return matches(a, byUid.get(a.instanceUid), q);
  });
  const rows = shown.length > MAX_ROWS ? shown.slice(shown.length - MAX_ROWS) : shown;
  const liveCount = instances.filter(i => !i.disposed).length;
  const disposedCount = instances.length - liveCount;
  const errors = actions.filter(a => a.status === "threw").length;
  const pending = actions.filter(a => a.status === "pending").length;
  const sources = [...new Set([...store.containers.map(c => c.source), ...instances.map(i => i.source)])].filter(
    Boolean,
  );
  const host = typeof location !== "undefined" ? location.host : "";
  const containerCount = store.containers.length;

  // ---------------------------------------------------------------- panes

  const instancesPane = (
    <InstancesPane
      instances={instances}
      selected={selected}
      scopeFilter={scopeFilter}
      setScopeFilter={setScopeFilter}
      liveCount={liveCount}
      disposedCount={disposedCount}
      onPick={pickInstance}
      onCollapse={toggleInstances}
      compact={compact}
    />
  );
  const inspectorPane = (
    <Inspector
      store={store}
      instance={selected}
      action={selectedAction}
      byUid={byUid}
      tab={tab}
      setTab={setTab}
      timeFormat={timeFormat}
      onPickAction={pickAction}
      onCollapse={toggleInspector}
      compact={compact}
    />
  );

  const showInstancesInline = !compact && instancesOpen;
  const showInspectorInline = !compact && inspectorOpen;

  return (
    <div
      className="sdt-root"
      ref={rootRef}
      onKeyDown={onKeyDown}
      data-layout={compact ? "compact" : "wide"}
      data-narrow={narrow || undefined}
    >
      <header className="sdt-header">
        <div className="sdt-brand">
          <div className="sdt-logo">
            <img src={LOGO_64} alt="Strator logo" width={24} height={24} />
          </div>
          <span className="sdt-wordmark">strator</span>
          <span className="sdt-pill">devtools</span>
          {VERSION && !narrow && <span className="sdt-mono sdt-muted" style={{ fontSize: 11 }}>{`v${VERSION}`}</span>}
        </div>
        <div className="sdt-status">
          <span
            className={`sdt-dot ${store.recording ? "sdt-pulse" : ""}`}
            style={{ background: store.recording ? "#34d399" : "#94a3b8" }}
          />
          <span>{store.recording ? "Recording" : "Paused"}</span>
          <span className="sdt-muted">·</span>
          <span className="sdt-mono">
            {[sources.join(", ") || "no provider", narrow ? "" : host].filter(Boolean).join(" · ")}
          </span>
        </div>
        <div className="sdt-grow" />
        <div className="sdt-actions">
          <button
            type="button"
            className="sdt-btn"
            aria-label={narrow ? (store.recording ? "Pause recording" : "Resume recording") : undefined}
            onClick={() => store.setRecording(!store.recording)}
          >
            {store.recording ? <PauseIcon /> : <RecordIcon />}
            <span className="sdt-btn-label">{store.recording ? "Pause" : "Resume"}</span>
          </button>
          <button
            type="button"
            className="sdt-btn"
            aria-label={narrow ? "Clear log" : undefined}
            onClick={() => {
              store.clear();
              setSelectedActionId(null);
            }}
          >
            <ClearIcon />
            <span className="sdt-btn-label">Clear</span>
          </button>
          <button
            type="button"
            className="sdt-btn"
            aria-label={narrow ? "Export session" : undefined}
            onClick={() => downloadJSON(`strator-session-${Date.now()}.json`, store.exportSession())}
          >
            <DownloadIcon />
            <span className="sdt-btn-label">Export session</span>
          </button>
          <div className="sdt-menu-wrap">
            <button
              type="button"
              className="sdt-btn sdt-btn-icon"
              aria-label="Devtools settings"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(open => !open)}
            >
              <SettingsIcon size={16} />
            </button>
            {menuOpen && (
              <div className="sdt-menu" role="group" aria-label="Devtools settings">
                <h3>Time column</h3>
                {(
                  [
                    ["relative", "Since load (+1.204s)"],
                    ["clock", "Clock (19:31:02.114)"],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className="sdt-radio">
                    <input
                      type="radio"
                      name="sdt-time"
                      checked={timeFormat === value}
                      onChange={() => {
                        setTimeFormat(value);
                        writeSetting("timeFormat", value);
                      }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            )}
          </div>
          {onToggleMaximize && (
            <button
              type="button"
              className="sdt-btn sdt-btn-icon"
              aria-label={maximized ? "Restore panel size" : "Maximize panel"}
              onClick={onToggleMaximize}
            >
              {maximized ? <MinimizeIcon size={16} /> : <MaximizeIcon size={16} />}
            </button>
          )}
          {onClose && (
            <button type="button" className="sdt-btn sdt-btn-icon" aria-label="Close devtools" onClick={onClose}>
              <CloseIcon size={16} />
            </button>
          )}
        </div>
      </header>

      <div className="sdt-body">
        {showInstancesInline ? (
          <nav className="sdt-pane sdt-instances" aria-label="Model instances">
            {instancesPane}
          </nav>
        ) : (
          <Rail
            side="left"
            label="Instances"
            badge={String(liveCount)}
            expanded={drawer === "instances"}
            onClick={toggleInstances}
          />
        )}

        <section className="sdt-pane sdt-log" aria-label="Action log">
          <div className="sdt-pane-head sdt-log-head">
            <h2 className="sdt-h2">Actions</h2>
            <span className="sdt-count">{rows.length}</span>
            <div className="sdt-grow" />
            <label className="sdt-search">
              <SearchIcon />
              <span className="sdt-sr">Filter actions</span>
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Filter, e.g. cart.add"
              />
            </label>
            <div className="sdt-seg" style={{ gridAutoFlow: "column" }}>
              <button
                type="button"
                className="sdt-seg-btn"
                aria-pressed={logScope === "all"}
                onClick={() => setLogScope("all")}
              >
                All instances
              </button>
              <button
                type="button"
                className="sdt-seg-btn"
                aria-pressed={logScope === "one"}
                onClick={() => setLogScope("one")}
                disabled={!selected}
              >
                {`Only ${selected?.model ?? "selected"}`}
              </button>
            </div>
          </div>
          {!store.recording && (
            <div className="sdt-banner">
              <PauseIcon />
              <span>Recording paused. State still updates in the app, but new actions are not captured.</span>
            </div>
          )}
          <ActionLog
            rows={rows}
            byUid={byUid}
            selectedId={selectedAction?.id}
            timeFormat={timeFormat}
            onPick={pickAction}
            emptyTitle={
              actions.length === 0
                ? instances.length === 0
                  ? "No models yet."
                  : "No actions captured yet."
                : "No actions match this filter."
            }
          />
        </section>

        {showInspectorInline ? (
          <aside className="sdt-pane sdt-inspector" aria-label="Inspector">
            {inspectorPane}
          </aside>
        ) : (
          <Rail
            side="right"
            label="Inspector"
            badge={selected ? selected.model : undefined}
            expanded={drawer === "inspector"}
            onClick={toggleInspector}
          />
        )}

        {compact && drawer && (
          <>
            <button type="button" className="sdt-scrim" aria-label="Close pane" onClick={() => setDrawer(null)} />
            {drawer === "instances" ? (
              <nav className="sdt-pane sdt-instances sdt-drawer" aria-label="Model instances">
                {instancesPane}
              </nav>
            ) : (
              <aside className="sdt-pane sdt-inspector sdt-drawer" aria-label="Inspector">
                {inspectorPane}
              </aside>
            )}
          </>
        )}
      </div>

      <footer className="sdt-footer">
        <span>{`${actions.length} actions captured`}</span>
        {errors > 0 && <span style={{ color: "#fda4af" }}>{`${errors} threw`}</span>}
        {pending > 0 && <span style={{ color: "#fcd34d" }}>{`${pending} pending`}</span>}
        <div className="sdt-grow" />
        <span>
          {`${liveCount} instance${liveCount === 1 ? "" : "s"} across ${containerCount} StratorProvider${containerCount === 1 ? "" : "s"}`}
        </span>
      </footer>
    </div>
  );
}

// ------------------------------------------------------------------------------------------ rail

function Rail({
  side,
  label,
  badge,
  expanded,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  badge?: string;
  expanded: boolean;
  onClick: () => void;
}) {
  const Chevron = (side === "left") !== expanded ? ChevronRightIcon : ChevronLeftIcon;
  return (
    <div className={`sdt-rail sdt-rail-${side}`}>
      <button
        type="button"
        className="sdt-rail-btn"
        aria-expanded={expanded}
        aria-label={`${expanded ? "Hide" : "Show"} ${label.toLowerCase()}`}
        onClick={onClick}
      >
        <Chevron />
        <span className="sdt-rail-label">{label}</span>
        {badge && <span className="sdt-rail-badge sdt-rail-label">{badge}</span>}
      </button>
    </div>
  );
}

function CollapseButton({ side, label, onClick }: { side: "left" | "right"; label: string; onClick: () => void }) {
  const Chevron = side === "left" ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <button type="button" className="sdt-btn sdt-btn-sm sdt-btn-icon" aria-label={`Hide ${label}`} onClick={onClick}>
      <Chevron />
    </button>
  );
}

// ------------------------------------------------------------------------------------------ instances

function InstancesPane({
  instances,
  selected,
  scopeFilter,
  setScopeFilter,
  liveCount,
  disposedCount,
  onPick,
  onCollapse,
  compact,
}: {
  instances: InstanceRecord[];
  selected?: InstanceRecord;
  scopeFilter: ScopeFilter;
  setScopeFilter: (scope: ScopeFilter) => void;
  liveCount: number;
  disposedCount: number;
  onPick: (instance: InstanceRecord) => void;
  onCollapse: () => void;
  compact: boolean;
}) {
  const hasStandalone = instances.some(i => i.scope === "standalone");
  const filters: Array<[ScopeFilter, string]> = [
    ["all", "All"],
    ["global", "Global"],
    ["shared", "Shared"],
    ["local", "Local"],
  ];
  if (hasStandalone) filters.push(["standalone", "Other"]);
  const groups = SCOPE_ORDER.filter(scope => scopeFilter === "all" || scopeFilter === scope)
    .map(scope => ({ scope, items: instances.filter(i => i.scope === scope) }))
    .filter(group => group.items.length > 0);

  return (
    <>
      <div className="sdt-pane-head">
        <h2 className="sdt-h2">Instances</h2>
        <span className="sdt-mono sdt-muted" style={{ fontSize: 11 }}>
          {`${liveCount} live${disposedCount ? ` · ${disposedCount} disposed` : ""}`}
        </span>
        <div className="sdt-grow" />
        <CollapseButton side="left" label={compact ? "instances" : "instances pane"} onClick={onCollapse} />
      </div>
      <div style={{ padding: "0 12px 12px" }}>
        <div
          className="sdt-seg"
          role="tablist"
          aria-label="Filter by scope"
          style={{ gridTemplateColumns: `repeat(${filters.length}, minmax(0, 1fr))` }}
        >
          {filters.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              className="sdt-seg-btn sdt-seg-brand"
              aria-selected={scopeFilter === id}
              onClick={() => setScopeFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="sdt-scroll sdt-grow">
        <div className="sdt-groups">
          {groups.length === 0 && (
            <div className="sdt-empty">
              <p>No instances.</p>
              <p>Models show up here as soon as a component creates them.</p>
            </div>
          )}
          {groups.map(group => (
            <div key={group.scope} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div className="sdt-group-head">
                <span className="sdt-dot" style={{ background: SCOPES[group.scope].color }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{SCOPES[group.scope].title}</span>
                <span className="sdt-mono sdt-muted" style={{ fontSize: 11 }}>
                  {SCOPES[group.scope].hook}
                </span>
              </div>
              {group.items.map(instance => (
                <button
                  key={instance.uid}
                  type="button"
                  className={`sdt-inst ${instance.disposed ? "sdt-inst-disposed" : ""}`}
                  aria-pressed={instance === selected}
                  onClick={() => onPick(instance)}
                >
                  <span className="sdt-inst-line">
                    <span className="sdt-inst-name">{instance.model}</span>
                    <span className="sdt-grow" />
                    <span className="sdt-mono sdt-inst-meta">
                      {instance.disposed ? "disposed" : `v${instance.version}`}
                    </span>
                  </span>
                  <span className="sdt-inst-line sdt-inst-meta">
                    <span className="sdt-mono sdt-ellipsis">{keyLabel(instance)}</span>
                    <span className="sdt-grow" />
                    <UsersIcon size={12} />
                    <span>{instance.subscribers.size}</span>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ------------------------------------------------------------------------------------------ action log

function StatusChip({ status }: { status: ActionStatus }) {
  return (
    <span className={`sdt-chip sdt-chip-${status}`}>
      {status === "pending" && <SpinnerIcon size={10} className="sdt-spin" />}
      {STATUS_LABEL[status]}
    </span>
  );
}

function ActionLog({
  rows,
  byUid,
  selectedId,
  timeFormat,
  onPick,
  emptyTitle,
}: {
  rows: ActionRecord[];
  byUid: Map<number, InstanceRecord>;
  selectedId?: number;
  timeFormat: TimeFormat;
  onPick: (action: ActionRecord) => void;
  emptyTitle: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const lastId = rows[rows.length - 1]?.id;

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (element && stickToBottom.current) element.scrollTop = element.scrollHeight;
  }, [lastId, rows.length]);

  return (
    <div
      className="sdt-scroll sdt-grow"
      ref={scrollRef}
      onScroll={event => {
        const el = event.currentTarget;
        stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
      }}
    >
      <div className="sdt-table" role="table" aria-label="Captured actions">
        <div className="sdt-tr sdt-th" role="row">
          <span role="columnheader">{timeFormat === "clock" ? "Clock" : "Since load"}</span>
          <span role="columnheader">Instance</span>
          <span role="columnheader">Action</span>
          <span role="columnheader">Status</span>
          <span role="columnheader" className="sdt-right">
            Time
          </span>
          <span role="columnheader" className="sdt-right" title="State changes">
            Δ
          </span>
        </div>
        {rows.length === 0 && (
          <div className="sdt-empty">
            <ListIcon size={28} />
            <p>{emptyTitle}</p>
            <p>Call a model method in the app and it shows up here with its arguments, result and state diff.</p>
          </div>
        )}
        {rows.map(action => {
          const instance = byUid.get(action.instanceUid);
          const muted = action.status === "lifecycle" || action.status === "external";
          return (
            <button
              key={action.id}
              type="button"
              role="row"
              className={`sdt-tr ${action.status === "threw" ? "sdt-tr-error" : ""}`}
              aria-pressed={action.id === selectedId}
              onClick={() => onPick(action)}
            >
              <span className="sdt-mono sdt-muted" style={{ fontSize: 11 }}>
                {formatTime(action, timeFormat)}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <span
                  className="sdt-dot"
                  style={{ width: 7, height: 7, background: SCOPES[instance?.scope ?? "standalone"].color }}
                />
                <span className="sdt-cell-mono sdt-ellipsis" style={{ color: "#cbd5e1" }}>
                  {instance ? instanceLabel(instance) : "?"}
                </span>
              </span>
              <span className="sdt-cell-mono sdt-ellipsis">
                {action.depth > 0 && <span className="sdt-muted">{`${"  ".repeat(action.depth - 1)}↳ `}</span>}
                <span
                  style={
                    muted
                      ? { color: "#94a3b8", fontStyle: "italic" }
                      : { color: action.status === "threw" ? "#fda4af" : "#f1f5f9" }
                  }
                >
                  {action.method}
                </span>
                {!muted && (
                  <span className="sdt-muted">{`(${action.args.map(a => formatValue(a, 40)).join(", ")})`}</span>
                )}
              </span>
              <StatusChip status={action.status} />
              <span className="sdt-mono sdt-muted sdt-right" style={{ fontSize: 11 }}>
                {formatDuration(action)}
              </span>
              <span className="sdt-mono sdt-right" style={{ fontSize: 11, color: "#cbd5e1" }}>
                {action.changes.length ? String(action.changes.length) : "—"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------ inspector

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="sdt-stat">
      <div className="sdt-stat-label">{label}</div>
      <div className="sdt-stat-value" title={value}>
        {value}
      </div>
    </div>
  );
}

function Inspector({
  store,
  instance,
  action,
  byUid,
  tab,
  setTab,
  timeFormat,
  onPickAction,
  onCollapse,
  compact,
}: {
  store: DevtoolsStore;
  instance?: InstanceRecord;
  action?: ActionRecord;
  byUid: Map<number, InstanceRecord>;
  tab: InspectorTab;
  setTab: (tab: InspectorTab) => void;
  timeFormat: TimeFormat;
  onPickAction: (action: ActionRecord) => void;
  onCollapse: () => void;
  compact: boolean;
}) {
  if (!instance) {
    return (
      <>
        <div className="sdt-pane-head">
          <h2 className="sdt-h2">Inspector</h2>
          <div className="sdt-grow" />
          <CollapseButton side="right" label={compact ? "inspector" : "inspector pane"} onClick={onCollapse} />
        </div>
        <div className="sdt-empty">
          <p>Nothing to inspect yet.</p>
          <p>Render a component that uses a Strator model, then pick it from Instances.</p>
        </div>
      </>
    );
  }
  const scope = SCOPES[instance.scope];
  const tabs: Array<[InspectorTab, string]> = [
    ["state", "State"],
    ["action", "Action"],
    ["subs", `Subscribers ${instance.subscribers.size}`],
  ];
  const actionInstance = action ? byUid.get(action.instanceUid) : undefined;

  return (
    <>
      <div className="sdt-insp-head">
        <div className="sdt-row">
          <span
            className="sdt-mono"
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 999,
              background: scope.tint,
              border: `1px solid ${scope.line}`,
              color: scope.text,
            }}
          >
            {`${scope.title} · ${scope.hook}`}
          </span>
          <span className="sdt-mono" style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
            {instance.model}
          </span>
          <span className="sdt-mono sdt-muted sdt-ellipsis" style={{ fontSize: 12 }}>
            {keyLabel(instance)}
          </span>
          <div className="sdt-grow" />
          <CollapseButton side="right" label={compact ? "inspector" : "inspector pane"} onClick={onCollapse} />
        </div>
        <div className="sdt-tabs" role="tablist" aria-label="Inspector view">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              className="sdt-tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="sdt-scroll sdt-grow">
        {tab === "state" && (
          <StateTab
            store={store}
            instance={instance}
            action={action && action.instanceUid === instance.uid ? action : undefined}
          />
        )}
        {tab === "action" &&
          (action && actionInstance ? (
            <ActionTab
              store={store}
              instance={actionInstance}
              action={action}
              timeFormat={timeFormat}
              onPickAction={onPickAction}
            />
          ) : (
            <div className="sdt-empty">
              <p>No action selected.</p>
              <p>Pick a row in the action log to see its arguments, result and state diff.</p>
            </div>
          ))}
        {tab === "subs" && <SubscribersTab instance={instance} />}
      </div>
    </>
  );
}

function StateTab({
  store,
  instance,
  action,
}: {
  store: DevtoolsStore;
  instance: InstanceRecord;
  action?: ActionRecord;
}) {
  const [copied, copy] = useCopy();
  const [editing, setEditing] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  useEffect(() => {
    setEditing(null);
    setEditError(null);
  }, [instance.uid]);

  const changed = action ? action.changes.map(c => c.path) : [];
  const lines = buildTree(instance.snapshot);
  const editable = !instance.disposed && !!instance.handle.replaceState && isJSONCompatible(instance.snapshot);
  const editHint = instance.disposed
    ? "Disposed instances cannot be edited"
    : !instance.handle.replaceState
      ? "This model's state lives in an external store"
      : !editable
        ? "Only JSON state (no Maps, Dates or class instances) can be edited here"
        : "Edit the state as JSON";
  const actionCount = store.actions.filter(a => a.instanceUid === instance.uid && a.status !== "lifecycle").length;

  return (
    <div className="sdt-insp-body">
      <div className="sdt-stats">
        <Stat label="Version" value={instance.disposed ? "—" : `v${instance.version}`} />
        <Stat label="Subscribers" value={String(instance.subscribers.size)} />
        <Stat label="Actions" value={String(actionCount)} />
      </div>
      {instance.disposed && (
        <div className="sdt-note">
          {`Disposed at +${((instance.disposedAt ?? 0) / 1000).toFixed(3)}s, when its last subscriber unmounted. This is its final state.`}
        </div>
      )}
      <div className="sdt-row">
        <h3 className="sdt-h3">{editing === null ? "Current state" : "Edit state"}</h3>
        {editing === null && changed.length > 0 && action && (
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#fcd34d" }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: "rgb(251 191 36 / 0.45)" }} />
            {`changed by ${action.method}()`}
          </span>
        )}
        <div className="sdt-grow" />
        {editing === null ? (
          <>
            <button
              type="button"
              className="sdt-btn sdt-btn-sm"
              onClick={() => copy("state", JSON.stringify(toJSONValue(instance.snapshot), null, 2))}
            >
              {copied === "state" ? "Copied" : "Copy JSON"}
            </button>
            <button
              type="button"
              className="sdt-btn sdt-btn-sm"
              disabled={!editable}
              title={editHint}
              onClick={() => {
                setEditing(JSON.stringify(instance.snapshot, null, 2));
                setEditError(null);
              }}
            >
              Edit
            </button>
          </>
        ) : (
          <>
            <button type="button" className="sdt-btn sdt-btn-sm" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="sdt-btn sdt-btn-sm sdt-btn-primary"
              onClick={() => {
                try {
                  const next = JSON.parse(editing);
                  if (typeof next !== "object" || next === null) throw new Error("State must be an object.");
                  store.replaceState(instance.uid, next, "devtools: edit state");
                  setEditing(null);
                } catch (error) {
                  setEditError(error instanceof Error ? error.message : String(error));
                }
              }}
            >
              Apply
            </button>
          </>
        )}
      </div>
      {editing !== null ? (
        <>
          <label className="sdt-sr" htmlFor="sdt-edit">
            State as JSON
          </label>
          <textarea
            id="sdt-edit"
            className="sdt-textarea"
            spellCheck={false}
            value={editing}
            onChange={e => setEditing(e.target.value)}
          />
          {editError && <div className="sdt-note sdt-note-err">{editError}</div>}
        </>
      ) : (
        <div className="sdt-tree">
          {lines.map((line, n) => (
            <div
              key={n}
              className={`sdt-tree-line ${isHit(line.path, changed) ? "sdt-tree-hit" : ""}`}
              style={{ paddingLeft: 14 + line.depth * 16 }}
            >
              <span className="sdt-key">{line.key}</span>
              <span className={`sdt-v-${line.kind}`}>{line.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionTab({
  store,
  instance,
  action,
  timeFormat,
  onPickAction,
}: {
  store: DevtoolsStore;
  instance: InstanceRecord;
  action: ActionRecord;
  timeFormat: TimeFormat;
  onPickAction: (action: ActionRecord) => void;
}) {
  const [copied, copy] = useCopy();
  const isCall = action.status !== "lifecycle" && action.status !== "external";
  const parent = action.parentId === undefined ? undefined : store.getAction(action.parentId);
  const snippet = testSnippet(instance, action);
  const canReplace = !instance.disposed && !!instance.handle.replaceState && action.before !== undefined;

  return (
    <div className="sdt-insp-body" style={{ gap: 16 }}>
      <div className="sdt-row" style={{ gap: 10 }}>
        <span className="sdt-mono" style={{ fontSize: 14, fontWeight: 700, color: "#fff", wordBreak: "break-all" }}>
          {callLabel(instance, action)}
        </span>
        <StatusChip status={action.status} />
        {action.isAsync && <span className="sdt-chip sdt-chip-async">async</span>}
      </div>
      <div className="sdt-stats">
        <Stat label="Dispatched" value={formatTime(action, timeFormat)} />
        <Stat label="Duration" value={formatDuration(action)} />
        <Stat label="State changes" value={String(action.changes.length)} />
      </div>
      {action.note && <div className="sdt-note">{action.note}</div>}
      {parent && (
        <div className="sdt-row" style={{ fontSize: 12 }}>
          <span className="sdt-muted">Called by</span>
          <button type="button" className="sdt-btn sdt-btn-sm sdt-mono" onClick={() => onPickAction(parent)}>
            {`${parent.method}()`}
          </button>
        </div>
      )}

      {isCall && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h3 className="sdt-h3">Arguments</h3>
          <pre className="sdt-code" style={{ color: "#6ee7b7" }}>
            {action.args.length ? action.args.map(a => toCode(a)).join(",\n") : "(none)"}
          </pre>
        </div>
      )}

      {action.status === "threw" && action.error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h3 className="sdt-h3" style={{ color: "#fda4af" }}>
            {action.isAsync ? "Rejected with" : "Threw"}
          </h3>
          <pre className="sdt-code sdt-code-err">
            {action.error.stack && action.error.stack.includes(action.error.message)
              ? action.error.stack
              : `${action.error.name}: ${action.error.message}`}
          </pre>
        </div>
      )}
      {(action.status === "done" || action.status === "pending") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h3 className="sdt-h3">
            {action.status === "pending" ? "Result" : action.isAsync ? "Resolved with" : "Returned"}
          </h3>
          <pre className="sdt-code">
            {action.status === "pending" ? "Promise still pending…" : toCode(action.result)}
          </pre>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h3 className="sdt-h3">State diff</h3>
        <div className="sdt-diff">
          {action.changes.length === 0 && (
            <div style={{ padding: 12, fontSize: 12 }} className="sdt-muted">
              No state was written.
            </div>
          )}
          {action.changes.map((change, n) => (
            <div key={n} className="sdt-diff-row">
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="sdt-muted" style={{ fontSize: 11 }}>{`#${n + 1}`}</span>
                <span className="sdt-key">{change.path}</span>
              </span>
              <span style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                <span className="sdt-before">{formatValue(change.before, 160)}</span>
                <span className="sdt-muted" style={{ display: "inline-flex" }}>
                  <ArrowIcon />
                </span>
                <span className="sdt-after">{formatValue(change.after, 160)}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {isCall && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="sdt-row">
            <h3 className="sdt-h3">Replay as a unit test</h3>
            <div className="sdt-grow" />
            <button
              type="button"
              className="sdt-btn sdt-btn-sm"
              disabled={action.status === "pending"}
              onClick={() => copy("snippet", snippet)}
            >
              {copied === "snippet" ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="sdt-code sdt-code-pre">{snippet}</pre>
        </div>
      )}

      <div className="sdt-row">
        <button
          type="button"
          className="sdt-btn sdt-btn-primary"
          disabled={!canReplace}
          title={canReplace ? "Replace the instance's state with the state before this action" : undefined}
          onClick={() => store.replaceState(instance.uid, action.before, `devtools: jump to before ${action.method}()`)}
        >
          Jump to state before
        </button>
        <button
          type="button"
          className="sdt-btn"
          disabled={!isCall || instance.disposed}
          onClick={() => {
            try {
              const result = store.dispatchAgain(action.id);
              if (result instanceof Promise) result.catch(() => {});
            } catch {
              // The error is captured in the log like any other call.
            }
          }}
        >
          Dispatch again
        </button>
      </div>
    </div>
  );
}

function SubscribersTab({ instance }: { instance: InstanceRecord }) {
  const subscribers = [...instance.subscribers];
  return (
    <div className="sdt-insp-body" style={{ gap: 10 }}>
      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5 }} className="sdt-muted">
        Components holding a reference to this instance. Each re-renders only when its selector output changes. The
        instance is disposed when the count reaches zero.
      </p>
      {subscribers.length === 0 && (
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            border: "1px dashed rgb(255 255 255 / 0.12)",
            fontSize: 12,
            textAlign: "center",
          }}
          className="sdt-muted"
        >
          {instance.disposed
            ? `No subscribers. It had ${instance.subscribersAtDispose ?? 0} when it was disposed.`
            : "No subscribers. The reference count is 0."}
        </div>
      )}
      {subscribers.map((subscriber, n) => (
        <div key={n} className="sdt-sub">
          <div className="sdt-row">
            <span className="sdt-mono" style={{ fontSize: 13, fontWeight: 600, color: "#67e8f9" }}>
              {subscriber.component ? `<${subscriber.component}>` : "<Anonymous>"}
            </span>
            {subscriber.file && (
              <span className="sdt-mono sdt-muted" style={{ fontSize: 11 }}>
                {subscriber.file}
              </span>
            )}
            <div className="sdt-grow" />
            <span className="sdt-mono" style={{ fontSize: 11, color: "#cbd5e1" }}>
              {`${subscriber.renders} render${subscriber.renders === 1 ? "" : "s"}`}
            </span>
          </div>
          <div
            className="sdt-mono sdt-ellipsis"
            style={{ fontSize: 12, color: "#e2e8f0" }}
            title={subscriber.selector ? `Selector: ${subscriber.selector}` : undefined}
          >
            <span style={{ color: "#c084fc" }}>{subscriber.hook}</span>
            <span className="sdt-muted">(</span>
            {[instance.scope === "shared" ? JSON.stringify(instance.key) : null, instance.model, subscriber.selector]
              .filter(Boolean)
              .join(", ")}
            <span className="sdt-muted">)</span>
          </div>
        </div>
      ))}
    </div>
  );
}
