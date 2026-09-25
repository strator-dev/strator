"use client";

import React, { useState } from "react";
import { Code, Copy, Check, FileCode } from "lucide-react";

export function CodePlayground() {
  const [activeTab, setActiveTab] = useState<"model" | "react" | "test" | "vanilla">("model");
  const [copied, setCopied] = useState(false);

  const snippets = {
    model: `import { Model } from "@strator/core";

export interface UserState {
  profile: { name: string; email: string } | null;
  isLoading: boolean;
  error: string | null;
}

export class UserModel extends Model<UserState> {
  static initialState: UserState = {
    profile: null,
    isLoading: false,
    error: null,
  };

  public async fetchUserProfile(userId: string) {
    this.state.isLoading = true;
    this.state.error = null;

    try {
      const res = await fetch(\`/api/users/\${userId}\`);
      if (!res.ok) throw new Error("Failed to load user profile");
      this.state.profile = await res.json();
    } catch (err: any) {
      this.state.error = err.message;
    } finally {
      this.state.isLoading = false;
    }
  }

  public updateEmail(newEmail: string) {
    if (!this.state.profile) throw new Error("No profile loaded");
    this.state.profile.email = newEmail;
  }
}`,
    react: `import React, { useEffect } from "react";
import { useGlobalModel } from "@strator/react";
import { UserModel } from "./UserModel";

export function UserProfileView({ userId }: { userId: string }) {
  // Subscribe to specific state slices to prevent unwanted re-renders
  const [userModel, state] = useGlobalModel(UserModel, (s) => ({
    profile: s.profile,
    isLoading: s.isLoading,
    error: s.error,
  }));

  useEffect(() => {
    userModel.fetchUserProfile(userId);
  }, [userId]);

  if (state.isLoading) return <div className="spinner">Loading user...</div>;
  if (state.error) return <div className="error">{state.error}</div>;
  if (!state.profile) return null;

  return (
    <div className="card">
      <h2>{state.profile.name}</h2>
      <p>Email: {state.profile.email}</p>
      <button onClick={() => userModel.updateEmail("new@strator.dev")}>
        Update Email
      </button>
    </div>
  );
}`,
    test: `import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserModel } from "./UserModel";

describe("UserModel Unit Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("updates email address directly without UI rendering or DOM harnesses", () => {
    // 1. Instantiate pure class
    const user = new UserModel({
      profile: { name: "Alice", email: "alice@example.com" },
      isLoading: false,
      error: null,
    });

    // 2. Invoke method
    user.updateEmail("alice@strator.dev");

    // 3. Verify state
    expect(user.state.profile?.email).toBe("alice@strator.dev");
  });

  it("handles async network error cleanly", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false });

    const user = new UserModel(UserModel.initialState);
    await user.fetchUserProfile("usr_999");

    expect(user.state.isLoading).toBe(false);
    expect(user.state.error).toBe("Failed to load user profile");
    expect(user.state.profile).toBeNull();
  });
});`,
    vanilla: `import { Model } from "@strator/core";
import { UserModel } from "./UserModel";

// Use directly in Node.js, CLI scripts, WebSockets, or Vanilla JS!
const model = new UserModel(UserModel.initialState);

async function main() {
  console.log("Initial state:", model.state);

  // Business logic executes anywhere
  await model.fetchUserProfile("usr_123");
  console.log("Loaded Profile:", model.state.profile);
}

main();`,
  };

  const handleCopy = () => {
    void navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24 relative border-t border-white/5 bg-[#080c14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
            <Code className="w-3.5 h-3.5" />
            <span>Developer Ergonomics</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Clean code across the full stack
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Look at how effortless it is to define a Model, wire it to React, test it in Vitest, and reuse it anywhere.
          </p>
        </div>

        {/* Code Box */}
        <div className="max-w-5xl mx-auto glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-900 border-b border-white/5 gap-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab("model")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all flex items-center gap-1.5 ${
                  activeTab === "model"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                UserModel.ts
              </button>
              <button
                onClick={() => setActiveTab("react")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all flex items-center gap-1.5 ${
                  activeTab === "react"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                UserProfileView.tsx
              </button>
              <button
                onClick={() => setActiveTab("test")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all flex items-center gap-1.5 ${
                  activeTab === "test"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                UserModel.test.ts
              </button>
              <button
                onClick={() => setActiveTab("vanilla")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all flex items-center gap-1.5 ${
                  activeTab === "vanilla"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                VanillaOrNode.ts
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          {/* Code Content */}
          <div className="p-6 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto bg-[#05080e] text-slate-200 min-h-[360px]">
            {activeTab === "model" && (
              <pre>
                <code>
                  <span className="text-purple-400">import</span> {"{"} <span className="text-yellow-300">Model</span>{" "}
                  {"}"} <span className="text-purple-400">from</span>{" "}
                  <span className="text-emerald-300">"@strator/core"</span>;{"\n\n"}
                  <span className="text-purple-400">export interface</span>{" "}
                  <span className="text-yellow-300">UserState</span> {"{"}
                  {"\n  "}profile: {"{"} name: <span className="text-blue-300">string</span>; email:{" "}
                  <span className="text-blue-300">string</span> {"}"} | <span className="text-orange-300">null</span>;
                  {"\n  "}isLoading: <span className="text-blue-300">boolean</span>;{"\n  "}error:{" "}
                  <span className="text-blue-300">string</span> | <span className="text-orange-300">null</span>;{"\n"}
                  {"}"}
                  {"\n\n"}
                  <span className="text-purple-400">export class</span>{" "}
                  <span className="text-yellow-300">UserModel</span> <span className="text-purple-400">extends</span>{" "}
                  <span className="text-yellow-300">Model</span>&lt;<span className="text-yellow-300">UserState</span>
                  &gt; {"{"}
                  {"\n  "}
                  <span className="text-purple-400">static</span> initialState:{" "}
                  <span className="text-yellow-300">UserState</span> = {"{"}
                  {"\n    "}profile: <span className="text-orange-300">null</span>,{"\n    "}isLoading:{" "}
                  <span className="text-orange-300">false</span>,{"\n    "}error:{" "}
                  <span className="text-orange-300">null</span>,{"\n  "}
                  {"}"};{"\n\n  "}
                  <span className="text-purple-400">public async</span>{" "}
                  <span className="text-blue-400">fetchUserProfile</span>(userId:{" "}
                  <span className="text-blue-300">string</span>) {"{"}
                  {"\n    "}
                  <span className="text-pink-400">this</span>.state.isLoading ={" "}
                  <span className="text-orange-300">true</span>;{"\n    "}
                  <span className="text-pink-400">this</span>.state.error ={" "}
                  <span className="text-orange-300">null</span>;{"\n\n    "}
                  <span className="text-purple-400">try</span> {"{"}
                  {"\n      "}
                  <span className="text-purple-400">const</span> res = <span className="text-purple-400">await</span>{" "}
                  <span className="text-blue-400">fetch</span>(<span className="text-emerald-300">`/api/users/</span>
                  <span className="text-purple-300">${"{"}</span>userId<span className="text-purple-300">{"}"}</span>
                  <span className="text-emerald-300">`</span>);
                  {"\n      "}
                  <span className="text-purple-400">if</span> (!res.ok){" "}
                  <span className="text-purple-400">throw new</span> <span className="text-yellow-300">Error</span>(
                  <span className="text-emerald-300">"Failed to load user profile"</span>);
                  {"\n      "}
                  <span className="text-pink-400">this</span>.state.profile ={" "}
                  <span className="text-purple-400">await</span> res.<span className="text-blue-400">json</span>();
                  {"\n    "}
                  {"}"} <span className="text-purple-400">catch</span> (err: <span className="text-blue-300">any</span>){" "}
                  {"{"}
                  {"\n      "}
                  <span className="text-pink-400">this</span>.state.error = err.message;
                  {"\n    "}
                  {"}"} <span className="text-purple-400">finally</span> {"{"}
                  {"\n      "}
                  <span className="text-pink-400">this</span>.state.isLoading ={" "}
                  <span className="text-orange-300">false</span>;{"\n    "}
                  {"}"}
                  {"\n  "}
                  {"}"}
                  {"\n\n  "}
                  <span className="text-purple-400">public</span> <span className="text-blue-400">updateEmail</span>
                  (newEmail: <span className="text-blue-300">string</span>) {"{"}
                  {"\n    "}
                  <span className="text-purple-400">if</span> (!<span className="text-pink-400">this</span>
                  .state.profile) <span className="text-purple-400">throw new</span>{" "}
                  <span className="text-yellow-300">Error</span>(
                  <span className="text-emerald-300">"No profile loaded"</span>);
                  {"\n    "}
                  <span className="text-pink-400">this</span>.state.profile.email = newEmail;
                  {"\n  "}
                  {"}"}
                  {"\n"}
                  {"}"}
                </code>
              </pre>
            )}

            {activeTab === "react" && (
              <pre>
                <code>
                  <span className="text-purple-400">import</span> <span className="text-yellow-300">React</span>, {"{"}{" "}
                  <span className="text-yellow-300">useEffect</span> {"}"} <span className="text-purple-400">from</span>{" "}
                  <span className="text-emerald-300">"react"</span>;{"\n"}
                  <span className="text-purple-400">import</span> {"{"}{" "}
                  <span className="text-yellow-300">useGlobalModel</span> {"}"}{" "}
                  <span className="text-purple-400">from</span>{" "}
                  <span className="text-emerald-300">"@strator/react"</span>;{"\n"}
                  <span className="text-purple-400">import</span> {"{"}{" "}
                  <span className="text-yellow-300">UserModel</span> {"}"} <span className="text-purple-400">from</span>{" "}
                  <span className="text-emerald-300">"./UserModel"</span>;{"\n\n"}
                  <span className="text-purple-400">export function</span>{" "}
                  <span className="text-blue-400">UserProfileView</span>({"{"} userId {"}"}: {"{"} userId:{" "}
                  <span className="text-blue-300">string</span> {"}"}) {"{"}
                  {"\n  "}
                  <span className="text-slate-400">
                    // Subscribe to specific state slices to prevent unwanted re-renders
                  </span>
                  {"\n  "}
                  <span className="text-purple-400">const</span> [userModel, state] ={" "}
                  <span className="text-yellow-300">useGlobalModel</span>(
                  <span className="text-yellow-300">UserModel</span>, (s) =&gt; ({"{"}
                  {"\n    "}profile: s.profile,
                  {"\n    "}isLoading: s.isLoading,
                  {"\n    "}error: s.error,
                  {"\n  "}
                  {"}"}));{"\n\n  "}
                  <span className="text-yellow-300">useEffect</span>(() =&gt; {"{"}
                  {"\n    "}userModel.<span className="text-blue-400">fetchUserProfile</span>(userId);
                  {"\n  "}
                  {"}"}, [userId]);{"\n\n  "}
                  <span className="text-purple-400">if</span> (state.isLoading){" "}
                  <span className="text-purple-400">return</span> &lt;<span className="text-indigo-400">div</span>{" "}
                  className=<span className="text-emerald-300">"spinner"</span>&gt;Loading user...&lt;/
                  <span className="text-indigo-400">div</span>&gt;;
                  {"\n  "}
                  <span className="text-purple-400">if</span> (state.error){" "}
                  <span className="text-purple-400">return</span> &lt;<span className="text-indigo-400">div</span>{" "}
                  className=<span className="text-emerald-300">"error"</span>&gt;{"{"}state.error{"}"}&lt;/
                  <span className="text-indigo-400">div</span>&gt;;
                  {"\n  "}
                  <span className="text-purple-400">if</span> (!state.profile){" "}
                  <span className="text-purple-400">return</span> <span className="text-orange-300">null</span>;
                  {"\n\n  "}
                  <span className="text-purple-400">return</span> ({"\n    "}
                  &lt;<span className="text-indigo-400">div</span> className=
                  <span className="text-emerald-300">"card"</span>&gt;{"\n      "}
                  &lt;<span className="text-indigo-400">h2</span>&gt;{"{"}state.profile.name{"}"}&lt;/
                  <span className="text-indigo-400">h2</span>&gt;{"\n      "}
                  &lt;<span className="text-indigo-400">p</span>&gt;Email: {"{"}state.profile.email{"}"}&lt;/
                  <span className="text-indigo-400">p</span>&gt;{"\n      "}
                  &lt;<span className="text-indigo-400">button</span> onClick=&#123;() =&gt; userModel.
                  <span className="text-blue-400">updateEmail</span>(
                  <span className="text-emerald-300">"new@strator.dev"</span>)&#125;&gt;{"\n        "}
                  Update Email{"\n      "}
                  &lt;/<span className="text-indigo-400">button</span>&gt;{"\n    "}
                  &lt;/<span className="text-indigo-400">div</span>&gt;{"\n  "}
                  );{"\n"}
                  {"}"}
                </code>
              </pre>
            )}

            {activeTab === "test" && (
              <pre>
                <code>
                  <span className="text-purple-400">import</span> {"{"}{" "}
                  <span className="text-yellow-300">describe, it, expect, vi, beforeEach</span> {"}"}{" "}
                  <span className="text-purple-400">from</span> <span className="text-emerald-300">"vitest"</span>;
                  {"\n"}
                  <span className="text-purple-400">import</span> {"{"}{" "}
                  <span className="text-yellow-300">UserModel</span> {"}"} <span className="text-purple-400">from</span>{" "}
                  <span className="text-emerald-300">"./UserModel"</span>;{"\n\n"}
                  <span className="text-blue-400">describe</span>(
                  <span className="text-emerald-300">"UserModel Unit Tests"</span>, () =&gt; {"{"}
                  {"\n  "}
                  <span className="text-blue-400">beforeEach</span>(() =&gt; {"{"}
                  {"\n    "}vi.<span className="text-blue-400">restoreAllMocks</span>();
                  {"\n  "}
                  {"}"});{"\n\n  "}
                  <span className="text-blue-400">it</span>(
                  <span className="text-emerald-300">
                    "updates email address directly without UI rendering or DOM harnesses"
                  </span>
                  , () =&gt; {"{"}
                  {"\n    "}
                  <span className="text-slate-400">// 1. Instantiate pure class</span>
                  {"\n    "}
                  <span className="text-purple-400">const</span> user = <span className="text-purple-400">new</span>{" "}
                  <span className="text-yellow-300">UserModel</span>({"{"}
                  {"\n      "}profile: {"{"} name: <span className="text-emerald-300">"Alice"</span>, email:{" "}
                  <span className="text-emerald-300">"alice@example.com"</span> {"}"},{"\n      "}isLoading:{" "}
                  <span className="text-orange-300">false</span>,{"\n      "}error:{" "}
                  <span className="text-orange-300">null</span>,{"\n    "}
                  {"}"});{"\n\n    "}
                  <span className="text-slate-400">// 2. Invoke method</span>
                  {"\n    "}user.<span className="text-blue-400">updateEmail</span>(
                  <span className="text-emerald-300">"alice@strator.dev"</span>);{"\n\n    "}
                  <span className="text-slate-400">// 3. Verify state</span>
                  {"\n    "}
                  <span className="text-yellow-300">expect</span>(user.state.profile?.email).
                  <span className="text-blue-400">toBe</span>(
                  <span className="text-emerald-300">"alice@strator.dev"</span>);
                  {"\n  "}
                  {"}"});{"\n\n  "}
                  <span className="text-blue-400">it</span>(
                  <span className="text-emerald-300">"handles async network error cleanly"</span>,{" "}
                  <span className="text-purple-400">async</span> () =&gt; {"{"}
                  {"\n    "}globalThis.fetch = vi.<span className="text-blue-400">fn</span>().
                  <span className="text-blue-400">mockResolvedValue</span>({"{"} ok:{" "}
                  <span className="text-orange-300">false</span> {"}"});{"\n\n    "}
                  <span className="text-purple-400">const</span> user = <span className="text-purple-400">new</span>{" "}
                  <span className="text-yellow-300">UserModel</span>(<span className="text-yellow-300">UserModel</span>
                  .initialState);
                  {"\n    "}
                  <span className="text-purple-400">await</span> user.
                  <span className="text-blue-400">fetchUserProfile</span>(
                  <span className="text-emerald-300">"usr_999"</span>);{"\n\n    "}
                  <span className="text-yellow-300">expect</span>(user.state.isLoading).
                  <span className="text-blue-400">toBe</span>(<span className="text-orange-300">false</span>);
                  {"\n    "}
                  <span className="text-yellow-300">expect</span>(user.state.error).
                  <span className="text-blue-400">toBe</span>(
                  <span className="text-emerald-300">"Failed to load user profile"</span>);
                  {"\n    "}
                  <span className="text-yellow-300">expect</span>(user.state.profile).
                  <span className="text-blue-400">toBeNull</span>();
                  {"\n  "}
                  {"}"});
                  {"\n"}
                  {"}"});
                </code>
              </pre>
            )}

            {activeTab === "vanilla" && (
              <pre>
                <code>
                  <span className="text-purple-400">import</span> {"{"} <span className="text-yellow-300">Model</span>{" "}
                  {"}"} <span className="text-purple-400">from</span>{" "}
                  <span className="text-emerald-300">"@strator/core"</span>;{"\n"}
                  <span className="text-purple-400">import</span> {"{"}{" "}
                  <span className="text-yellow-300">UserModel</span> {"}"} <span className="text-purple-400">from</span>{" "}
                  <span className="text-emerald-300">"./UserModel"</span>;{"\n\n"}
                  <span className="text-slate-400">
                    // Use directly in Node.js, CLI scripts, WebSockets, or Vanilla JS!
                  </span>
                  {"\n"}
                  <span className="text-purple-400">const</span> model = <span className="text-purple-400">new</span>{" "}
                  <span className="text-yellow-300">UserModel</span>(<span className="text-yellow-300">UserModel</span>
                  .initialState);{"\n\n"}
                  <span className="text-purple-400">async function</span> <span className="text-blue-400">main</span>(){" "}
                  {"{"}
                  {"\n  "}console.<span className="text-blue-400">log</span>(
                  <span className="text-emerald-300">"Initial state:"</span>, model.state);{"\n\n  "}
                  <span className="text-slate-400">// Business logic executes anywhere</span>
                  {"\n  "}
                  <span className="text-purple-400">await</span> model.
                  <span className="text-blue-400">fetchUserProfile</span>(
                  <span className="text-emerald-300">"usr_123"</span>);
                  {"\n  "}console.<span className="text-blue-400">log</span>(
                  <span className="text-emerald-300">"Loaded Profile:"</span>, model.state.profile);
                  {"\n"}
                  {"}"}
                  {"\n\n"}
                  <span className="text-blue-400">main</span>();
                </code>
              </pre>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
