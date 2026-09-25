"use client";

import React, { useState } from "react";
import { Play, Plus, CheckCircle2, Circle, Trash2, RotateCcw, Terminal, Filter } from "lucide-react";

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
}

interface DispatchLogEntry {
  id: string;
  timestamp: string;
  type: "METHOD_CALL" | "PROXY_MUTATION" | "UI_UPDATE";
  title: string;
  payload?: any;
  path?: string[];
}

export function InteractiveDemo() {
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: "1", title: "Write domain model as pure ES Class", completed: true, priority: "high" },
    { id: "2", title: "Mutate state directly (Proxied auto-dispatch)", completed: true, priority: "medium" },
    { id: "3", title: "Execute unit tests in 0.5ms with zero UI mocks", completed: false, priority: "high" },
    { id: "4", title: "Connect to React with useLocalModel()", completed: false, priority: "low" },
  ]);

  const [inputTitle, setInputTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [logs, setLogs] = useState<DispatchLogEntry[]>([
    {
      id: "init-1",
      timestamp: new Date().toLocaleTimeString(),
      type: "UI_UPDATE",
      title: "TodoModel mounted via useLocalModel()",
      payload: { initialCount: 4 },
    },
  ]);

  const addLog = (type: DispatchLogEntry["type"], title: string, meta?: any) => {
    const entry: DispatchLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      title,
      ...meta,
    };
    setLogs(prev => [entry, ...prev.slice(0, 19)]);
  };

  // Simulating Strator Model Execution with Proxied Dispatcher
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTitle.trim()) return;

    const newTodo: TodoItem = {
      id: Date.now().toString(),
      title: inputTitle.trim(),
      completed: false,
      priority,
    };

    // 1. Model method call
    addLog("METHOD_CALL", "todoModel.addTodo(title, priority)", { payload: { title: newTodo.title, priority } });

    // 2. Proxied state mutation
    setTodos(prev => [...prev, newTodo]);
    addLog("PROXY_MUTATION", "Proxy setter -> dispatchStateChange()", { path: ["todos", `${todos.length}`] });

    // 3. UI re-render
    addLog("UI_UPDATE", "useLocalModel selector notified", { payload: { id: newTodo.id } });

    setInputTitle("");
  };

  const handleToggle = (id: string) => {
    const itemIndex = todos.findIndex(t => t.id === id);
    if (itemIndex === -1) return;

    addLog("METHOD_CALL", "todoModel.toggleTodo(id)", { payload: { id } });

    setTodos(prev => prev.map((t, idx) => (idx === itemIndex ? { ...t, completed: !t.completed } : t)));

    addLog("PROXY_MUTATION", "Proxy setter -> dispatchStateChange()", { path: ["todos", `${itemIndex}`, "completed"] });
    addLog("UI_UPDATE", "useLocalModel selector notified", { payload: { status: !todos[itemIndex].completed } });
  };

  const handleDelete = (id: string) => {
    const itemIndex = todos.findIndex(t => t.id === id);
    if (itemIndex === -1) return;

    addLog("METHOD_CALL", "todoModel.removeTodo(id)", { payload: { id } });
    setTodos(prev => prev.filter(t => t.id !== id));
    addLog("PROXY_MUTATION", "Proxy setter -> dispatchStateChange()", { path: ["todos", `${itemIndex}`] });
    addLog("UI_UPDATE", "useLocalModel selector notified", { payload: { removedId: id } });
  };

  const handleReset = () => {
    addLog("METHOD_CALL", "todoModel.resetState()");
    setTodos([
      { id: "1", title: "Write domain model as pure ES Class", completed: true, priority: "high" },
      { id: "2", title: "Mutate state directly (Proxied auto-dispatch)", completed: true, priority: "medium" },
      { id: "3", title: "Execute unit tests in 0.5ms with zero UI mocks", completed: false, priority: "high" },
      { id: "4", title: "Connect to React with useLocalModel()", completed: false, priority: "low" },
    ]);
    addLog("PROXY_MUTATION", "Proxy setter -> dispatchStateChange()", { path: ["todos"] });
    addLog("UI_UPDATE", "useLocalModel selector notified");
  };

  const filteredTodos = todos.filter(t => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <section id="demo" className="py-24 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
            <Play className="w-3.5 h-3.5" />
            <span>Interactive Sandbox</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            See the Reactive Dispatcher in Real Time
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Interact with the live UI on the left and watch the Strator Dispatcher and Proxy mutation stream in the live
            telemetry console on the right.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive UI App (7 cols) */}
          <div className="lg:col-span-7 glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Window header */}
            <div className="px-5 py-3.5 bg-slate-900/90 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span className="text-xs font-semibold text-slate-200">Interactive TodoModel Component</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono">
                  {completedCount}/{todos.length} done
                </span>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                  title="Reset Demo"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Form Input */}
              <form onSubmit={handleAddTodo} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={inputTitle}
                  onChange={e => setInputTitle(e.target.value)}
                  placeholder="Add a new business requirement..."
                  className="flex-1 bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium</option>
                  <option value="high">High Priority</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Todo</span>
                </button>
              </form>

              {/* Filters */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-400 font-medium">Filter:</span>
                  {(["all", "active", "completed"] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`text-xs px-2.5 py-1 rounded-md capitalize transition-colors ${
                        filter === f
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-slate-400">
                  Total Items: <strong className="text-slate-200">{filteredTodos.length}</strong>
                </div>
              </div>

              {/* Todo List Items */}
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {filteredTodos.map(todo => (
                  <div
                    key={todo.id}
                    className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      todo.completed
                        ? "bg-slate-950/30 border-white/5 text-slate-500"
                        : "bg-slate-900/60 border-white/10 text-slate-200 hover:border-cyan-500/40"
                    }`}
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer flex-1"
                      onClick={() => handleToggle(todo.id)}
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0" />
                      )}
                      <span className={`text-sm ${todo.completed ? "line-through text-slate-500" : "text-slate-200"}`}>
                        {todo.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                          todo.priority === "high"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : todo.priority === "medium"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        }`}
                      >
                        {todo.priority}
                      </span>
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all"
                        title="Delete Todo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Real-Time Dispatcher Telemetry Console (5 cols) */}
          <div className="lg:col-span-5 glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col h-[520px]">
            {/* Console Header */}
            <div className="px-5 py-3.5 bg-slate-950 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-semibold text-slate-200">Dispatcher Event Stream</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                LIVE TELEMETRY
              </span>
            </div>

            {/* Console Logs */}
            <div className="flex-1 p-4 bg-[#050811] font-mono text-xs overflow-y-auto space-y-2.5">
              {logs.map(log => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-slate-900/70 border border-white/5 space-y-1 animate-fade-in"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        log.type === "METHOD_CALL"
                          ? "bg-cyan-500/20 text-cyan-300"
                          : log.type === "PROXY_MUTATION"
                            ? "bg-sky-500/20 text-sky-300"
                            : "bg-blue-500/20 text-blue-300"
                      }`}
                    >
                      {log.type}
                    </span>
                    <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                  </div>

                  <div className="text-slate-200 font-semibold">{log.title}</div>

                  {log.path && (
                    <div className="text-[11px] text-cyan-300">
                      path: <code className="text-sky-400">/{log.path.join("/")}</code>
                    </div>
                  )}

                  {log.payload && (
                    <div className="text-[10px] text-slate-400 truncate">payload: {JSON.stringify(log.payload)}</div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-950/90 border-t border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Auto-tracked by Strator Engine</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Connected
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
