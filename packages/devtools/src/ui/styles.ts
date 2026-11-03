/**
 * Panel styles. Values come from the website design tokens (apps/website/src/styles/tokens.css): ink
 * surfaces, white hairlines, brand cyan → blue accents. Everything is scoped under `.sdt-*` and rendered
 * inside a shadow root, so the app's CSS and the panel's never meet.
 */
export const STYLES = `
:host { all: initial; }
.sdt-root, .sdt-launcher {
  --ink-950: #050811; --ink-900: #060913; --ink-850: #070b12; --ink-800: #080c14; --ink-700: #13223f;
  --glass: rgb(10 17 32 / 0.75); --line-subtle: rgb(255 255 255 / 0.05); --line: rgb(255 255 255 / 0.08);
  --line-strong: rgb(255 255 255 / 0.14); --fg: #f1f5f9; --fg-2: #e2e8f0; --fg-3: #cbd5e1; --muted: #94a3b8;
  --cyan: #22d3ee; --cyan-300: #67e8f9; --sky-300: #7dd3fc; --purple-300: #d8b4fe; --purple-400: #c084fc;
  --ok: #6ee7b7; --err: #fda4af; --warn: #fcd34d; --orange: #fdba74;
  --btn: #1e293b; --btn-hover: #2a3a52;
  --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  font-family: var(--sans); font-size: 13px; line-height: 1.4; color: var(--fg); box-sizing: border-box;
}
.sdt-root *, .sdt-root *::before, .sdt-root *::after { box-sizing: border-box; }
.sdt-root {
  display: flex; flex-direction: column; width: 100%; height: 100%; min-height: 0; overflow: hidden;
  background-color: var(--ink-900);
  background-image: radial-gradient(at 20% 0%, rgb(4 248 252 / 0.07) 0px, transparent 45%),
    radial-gradient(at 85% 10%, rgb(0 162 252 / 0.08) 0px, transparent 45%);
}
.sdt-root button, .sdt-launcher { font: inherit; color: inherit; cursor: pointer; -webkit-appearance: none; appearance: none; margin: 0; }
.sdt-root button:disabled { cursor: not-allowed; opacity: 0.5; }
.sdt-root button:focus-visible, .sdt-root input:focus-visible, .sdt-root textarea:focus-visible, .sdt-launcher:focus-visible {
  outline: 2px solid var(--cyan); outline-offset: -2px;
}
.sdt-mono { font-family: var(--mono); }
.sdt-muted { color: var(--muted); }
.sdt-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.sdt-grow { flex-grow: 1; }
.sdt-scroll { overflow: auto; min-height: 0; }
.sdt-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
.sdt-scroll::-webkit-scrollbar-thumb { background: var(--ink-700); border-radius: 999px; border: 2px solid transparent; background-clip: padding-box; }

/* Buttons: dark fills, light text. */
.sdt-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 36px; padding: 0 12px;
  border-radius: 8px; border: 1px solid var(--line-strong); background: var(--btn); color: var(--fg); font-size: 12px;
  white-space: nowrap;
}
.sdt-btn:hover:not(:disabled) { background: var(--btn-hover); color: #fff; }
.sdt-root[data-narrow] .sdt-btn-label { display: none; }
.sdt-root[data-narrow] .sdt-header .sdt-btn { width: 36px; padding: 0; }
.sdt-root[data-narrow] .sdt-header { gap: 6px 8px; }
.sdt-btn-sm { min-height: 30px; padding: 0 10px; border-radius: 6px; }
.sdt-btn-icon { width: 36px; padding: 0; }
.sdt-btn-primary {
  border: none; color: #fff; font-weight: 600; background: #0e7490;
  background-image: linear-gradient(to right, #06b6d4, #0ea5e9, #2563eb); box-shadow: 0 4px 6px -1px rgb(6 182 212 / 0.2);
}
.sdt-btn-primary:hover:not(:disabled) { background-image: linear-gradient(to right, #22d3ee, #3b82f6); }

/* Header */
.sdt-header {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; padding: 6px 12px;
  border-bottom: 1px solid var(--line); background: var(--glass); flex-shrink: 0;
}
.sdt-brand { display: flex; align-items: center; gap: 10px; }
.sdt-logo {
  width: 30px; height: 30px; padding: 3px; border-radius: 9px; display: flex; align-items: center; justify-content: center;
  background-image: linear-gradient(to top right, rgb(37 99 235 / 0.2), rgb(6 182 212 / 0.2), rgb(56 189 248 / 0.2));
  border: 1px solid rgb(6 182 212 / 0.3);
}
.sdt-logo img { width: 100%; height: 100%; object-fit: contain; display: block; }
.sdt-wordmark { font-family: var(--mono); font-weight: 700; font-size: 15px; letter-spacing: -0.01em; color: #fff; }
.sdt-pill {
  font-family: var(--mono); font-size: 11px; padding: 2px 8px; border-radius: 999px;
  background: rgb(6 182 212 / 0.1); border: 1px solid rgb(6 182 212 / 0.25); color: var(--cyan-300);
}
.sdt-status {
  display: flex; align-items: center; gap: 8px; padding: 5px 12px; border-radius: 999px; min-width: 0;
  background: rgb(15 23 42 / 0.9); border: 1px solid var(--line); font-size: 12px; color: var(--fg-3);
}
.sdt-status > span:last-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sdt-dot { width: 8px; height: 8px; border-radius: 999px; flex-shrink: 0; display: inline-block; }
.sdt-pulse { animation: sdt-pulse 1.6s ease-in-out infinite; }
.sdt-spin { animation: sdt-spin 0.9s linear infinite; }
@keyframes sdt-spin { to { transform: rotate(360deg); } }
@keyframes sdt-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
@media (prefers-reduced-motion: reduce) { .sdt-pulse, .sdt-spin { animation: none; } }
.sdt-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.sdt-menu-wrap { position: relative; }
.sdt-menu {
  position: absolute; right: 0; top: calc(100% + 6px); z-index: 20; min-width: 220px; padding: 10px; border-radius: 12px;
  background: var(--ink-850); border: 1px solid var(--line-strong); box-shadow: 0 25px 50px -12px rgb(8 51 68 / 0.6);
  display: flex; flex-direction: column; gap: 8px;
}
.sdt-menu h3 { margin: 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }

/* Body and panes */
.sdt-body { position: relative; display: flex; flex: 1 1 auto; min-height: 0; }
.sdt-pane { display: flex; flex-direction: column; min-height: 0; min-width: 0; }
.sdt-instances { flex: 0 0 260px; border-right: 1px solid var(--line-subtle); background: rgb(5 8 17 / 0.55); }
.sdt-log { flex: 1 1 auto; }
.sdt-inspector { flex: 0 0 400px; border-left: 1px solid var(--line-subtle); background: rgb(10 17 32 / 0.55); }
.sdt-pane-head { display: flex; align-items: center; gap: 8px; padding: 10px 12px; flex-shrink: 0; min-height: 52px; }
.sdt-h2 { margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-3); }
.sdt-h3 { margin: 0; font-size: 12px; font-weight: 600; color: var(--fg-2); }
.sdt-count { font-family: var(--mono); font-size: 11px; padding: 1px 8px; border-radius: 999px; background: rgb(148 163 184 / 0.1); color: var(--fg-3); }

/* Drag handle between a side pane and the log: no width of its own, an 8px hit area over the border. */
.sdt-splitter { position: relative; flex: 0 0 0; z-index: 5; outline: none; touch-action: none; }
.sdt-splitter::before { content: ""; position: absolute; top: 0; bottom: 0; left: -4px; width: 8px; cursor: col-resize; }
.sdt-splitter:hover::before, .sdt-splitter:focus-visible::before, .sdt-splitter[data-dragging]::before { background: rgb(34 211 238 / 0.35); }
.sdt-root[data-resizing] { cursor: col-resize; user-select: none; }
.sdt-root[data-resizing] * { cursor: col-resize !important; }

/* Collapsed pane: a slim rail with a button that brings the pane back. */
.sdt-rail {
  flex: 0 0 40px; display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 8px 0;
  background: rgb(5 8 17 / 0.7);
}
.sdt-rail-left { border-right: 1px solid var(--line-subtle); }
.sdt-rail-right { border-left: 1px solid var(--line-subtle); }
.sdt-rail-btn {
  display: flex; flex-direction: column; align-items: center; gap: 10px; width: 32px; padding: 10px 0; border-radius: 8px;
  border: 1px solid var(--line-strong); background: var(--btn); color: var(--fg);
}
.sdt-rail-btn:hover { background: var(--btn-hover); }
.sdt-rail-label { writing-mode: vertical-rl; transform: rotate(180deg); font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
.sdt-rail-badge { font-family: var(--mono); font-size: 10px; color: var(--cyan-300); }

/* Compact layout: an expanded side pane slides over the action log instead of squeezing it. */
.sdt-drawer {
  position: absolute; top: 0; bottom: 0; z-index: 10; width: min(380px, calc(100% - 40px));
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.7); background-color: var(--ink-900);
}
.sdt-drawer.sdt-instances { left: 0; }
.sdt-drawer.sdt-inspector { right: 0; }
.sdt-scrim { position: absolute; inset: 0; z-index: 9; background: rgb(2 6 23 / 0.55); border: none; padding: 0; }

/* Instances */
.sdt-seg { display: grid; gap: 2px; padding: 3px; border-radius: 10px; background: rgb(2 6 23 / 0.6); border: 1px solid var(--line-subtle); }
.sdt-seg-btn { min-height: 30px; padding: 0 8px; border: none; border-radius: 6px; font-size: 12px; background: transparent; color: var(--fg-3); white-space: nowrap; }
.sdt-seg-btn:hover { background: rgb(255 255 255 / 0.06); color: #fff; }
.sdt-seg-btn[aria-pressed="true"], .sdt-seg-btn[aria-selected="true"] { background: #1e293b; color: #fff; font-weight: 600; }
.sdt-seg-btn.sdt-seg-brand[aria-selected="true"] { background: #0e7490; background-image: linear-gradient(to right, #0891b2, #2563eb); }
.sdt-groups { padding: 0 12px 14px; display: flex; flex-direction: column; gap: 12px; }
.sdt-group-head { display: flex; align-items: center; gap: 8px; padding: 6px 6px 4px; }
.sdt-inst {
  display: flex; flex-direction: column; gap: 3px; width: 100%; min-height: 48px; padding: 7px 10px; border-radius: 8px;
  text-align: left; border: 1px solid transparent; background: transparent; color: var(--fg);
}
.sdt-inst:hover { background: rgb(255 255 255 / 0.04); }
.sdt-inst[aria-pressed="true"] { background: rgb(6 182 212 / 0.12); border-color: rgb(34 211 238 / 0.35); }
.sdt-inst-line { display: flex; align-items: center; gap: 8px; width: 100%; min-width: 0; }
.sdt-inst-name { font-family: var(--mono); font-size: 12px; font-weight: 600; color: var(--fg); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sdt-inst-disposed .sdt-inst-name { color: var(--muted); text-decoration: line-through; }
.sdt-inst-meta { font-size: 11px; color: var(--muted); }
.sdt-ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.sdt-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 48px 24px; color: var(--muted); text-align: center; }
.sdt-empty p { margin: 0; font-size: 12px; max-width: 380px; }
.sdt-empty p:first-of-type { font-size: 13px; color: var(--fg-3); }

/* Action log */
.sdt-log-head { flex-wrap: wrap; border-bottom: 1px solid var(--line-subtle); }
.sdt-search {
  display: flex; align-items: center; gap: 8px; min-height: 32px; padding: 0 10px; border-radius: 8px; flex: 0 1 220px; min-width: 140px;
  background: rgb(2 6 23 / 0.6); border: 1px solid var(--line); color: var(--muted);
}
.sdt-search input { flex-grow: 1; min-width: 0; background: transparent; border: none; color: var(--fg); font: inherit; font-size: 12px; outline: none; }
.sdt-search input::placeholder { color: var(--muted); }
.sdt-banner { display: flex; align-items: center; gap: 8px; padding: 8px 16px; font-size: 12px; background: rgb(245 158 11 / 0.08); border-bottom: 1px solid rgb(245 158 11 / 0.2); color: var(--warn); }
.sdt-table { min-width: 620px; }
.sdt-tr {
  display: grid; grid-template-columns: 92px minmax(0, 1.1fr) minmax(0, 1.5fr) 84px 64px 32px; gap: 12px; align-items: center;
  width: 100%; min-height: 40px; padding: 6px 16px; border: none; border-bottom: 1px solid rgb(255 255 255 / 0.04);
  text-align: left; background: transparent; color: var(--fg);
}
button.sdt-tr:hover { background: rgb(255 255 255 / 0.04); }
.sdt-tr-error { background: rgb(244 63 94 / 0.05); }
button.sdt-tr[aria-pressed="true"] { background: rgb(6 182 212 / 0.12); box-shadow: inset 0 0 0 1px rgb(34 211 238 / 0.35); }
.sdt-th {
  position: sticky; top: 0; z-index: 1; min-height: 32px; background: var(--ink-850); border-bottom: 1px solid var(--line-subtle);
  font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted);
}
.sdt-right { text-align: right; }
.sdt-cell-mono { font-family: var(--mono); font-size: 12px; }
.sdt-chip {
  font-family: var(--mono); display: inline-flex; align-items: center; gap: 5px; justify-self: start; font-size: 11px;
  padding: 2px 8px; border-radius: 999px; border: 1px solid; white-space: nowrap;
}
.sdt-chip-done { background: rgb(16 185 129 / 0.1); border-color: rgb(16 185 129 / 0.3); color: var(--ok); }
.sdt-chip-threw { background: rgb(244 63 94 / 0.1); border-color: rgb(244 63 94 / 0.3); color: var(--err); }
.sdt-chip-pending { background: rgb(245 158 11 / 0.1); border-color: rgb(245 158 11 / 0.3); color: var(--warn); }
.sdt-chip-lifecycle, .sdt-chip-external { background: rgb(148 163 184 / 0.1); border-color: rgb(148 163 184 / 0.3); color: var(--fg-3); }
.sdt-chip-async { background: rgb(56 189 248 / 0.1); border-color: rgb(56 189 248 / 0.25); color: var(--sky-300); }

/* Inspector */
.sdt-insp-head { padding: 12px 16px 0; display: flex; flex-direction: column; gap: 8px; border-bottom: 1px solid var(--line-subtle); flex-shrink: 0; }
.sdt-tabs { display: flex; gap: 4px; }
.sdt-tab { min-height: 36px; padding: 0 12px; border: none; background: transparent; font-size: 12px; color: var(--muted); }
.sdt-tab:hover { color: #fff; }
.sdt-tab[aria-selected="true"] { color: #fff; font-weight: 600; box-shadow: inset 0 -2px 0 var(--cyan); }
.sdt-insp-body { padding: 16px; display: flex; flex-direction: column; gap: 14px; }
.sdt-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.sdt-stat { padding: 9px 12px; border-radius: 12px; background: rgb(2 6 23 / 0.6); border: 1px solid var(--line-subtle); min-width: 0; }
.sdt-stat-label { font-size: 11px; color: var(--muted); }
.sdt-stat-value { font-family: var(--mono); font-size: 14px; font-weight: 700; color: #fff; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sdt-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.sdt-code {
  border-radius: 10px; background: var(--ink-850); border: 1px solid var(--line); padding: 10px 12px;
  font-family: var(--mono); font-size: 12px; line-height: 1.6; color: var(--fg-3); white-space: pre-wrap; word-break: break-word; margin: 0;
}
.sdt-code-pre { white-space: pre; overflow-x: auto; word-break: normal; color: var(--fg-2); }
.sdt-code-err { background: rgb(244 63 94 / 0.08); border-color: rgb(244 63 94 / 0.3); color: #fecdd3; }
.sdt-tree { border-radius: 12px; background: var(--ink-850); border: 1px solid var(--line); padding: 10px 0; font-family: var(--mono); font-size: 12px; line-height: 1.7; overflow-x: auto; }
.sdt-tree-line { white-space: pre; padding-right: 14px; }
.sdt-tree-hit { background: rgb(251 191 36 / 0.12); }
.sdt-key { color: var(--sky-300); }
.sdt-v-string { color: var(--ok); } .sdt-v-number { color: var(--orange); } .sdt-v-literal { color: var(--purple-400); } .sdt-v-punct { color: var(--muted); }
.sdt-diff { border-radius: 10px; background: var(--ink-850); border: 1px solid var(--line); overflow: hidden; }
.sdt-diff-row { display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; border-top: 1px solid var(--line-subtle); font-family: var(--mono); font-size: 12px; }
.sdt-diff-row:first-child { border-top: none; }
.sdt-before { padding: 1px 6px; border-radius: 4px; background: rgb(244 63 94 / 0.1); color: var(--err); word-break: break-word; }
.sdt-after { padding: 1px 6px; border-radius: 4px; background: rgb(16 185 129 / 0.12); color: var(--ok); word-break: break-word; }
.sdt-note { padding: 10px 12px; border-radius: 10px; background: rgb(148 163 184 / 0.08); border: 1px solid rgb(148 163 184 / 0.2); color: var(--fg-3); font-size: 12px; line-height: 1.5; }
.sdt-note-err { background: rgb(244 63 94 / 0.08); border-color: rgb(244 63 94 / 0.3); color: #fecdd3; }
.sdt-sub { display: flex; flex-direction: column; gap: 6px; padding: 12px; border-radius: 12px; background: rgb(2 6 23 / 0.6); border: 1px solid var(--line-subtle); }
.sdt-textarea {
  width: 100%; min-height: 220px; resize: vertical; border-radius: 10px; background: var(--ink-850); border: 1px solid var(--line-strong);
  color: var(--fg); font-family: var(--mono); font-size: 12px; line-height: 1.6; padding: 10px 12px;
}
.sdt-radio { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--fg-2); min-height: 28px; }

/* Footer */
.sdt-footer {
  display: flex; flex-wrap: wrap; align-items: center; gap: 4px 16px; padding: 6px 16px; flex-shrink: 0;
  border-top: 1px solid var(--line-subtle); background: var(--ink-950); font-family: var(--mono); font-size: 11px; color: var(--muted);
}

/* Docked in-app panel and its launcher */
.sdt-dock { position: fixed; left: 0; right: 0; bottom: 0; z-index: 2147483000; border-top: 1px solid rgb(6 182 212 / 0.35); box-shadow: 0 -20px 40px -20px rgb(0 0 0 / 0.6); }
.sdt-dock-max { top: 0; }
.sdt-resize { position: absolute; left: 0; right: 0; top: -4px; height: 8px; cursor: ns-resize; z-index: 30; background: transparent; border: none; padding: 0; }
.sdt-resize:hover, .sdt-resize:focus-visible { background: rgb(34 211 238 / 0.35); }
.sdt-launcher {
  position: fixed; z-index: 2147483000; display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 12px 0 6px;
  border-radius: 12px; border: 1px solid rgb(6 182 212 / 0.4); background: #0b1324; color: var(--fg);
  box-shadow: 0 12px 30px -10px rgb(0 162 252 / 0.45); font-family: var(--mono); font-size: 12px;
}
.sdt-launcher:hover { background: #13223f; }
.sdt-launcher img { width: 32px; height: 32px; display: block; }
.sdt-launcher-badge { padding: 1px 7px; border-radius: 999px; background: rgb(244 63 94 / 0.2); color: var(--err); font-size: 11px; }
`;
