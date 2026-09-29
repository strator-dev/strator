"use client";

import React, { useState } from "react";
import { Code, Copy, Check, FileCode } from "lucide-react";
import { CodeBlock } from "./CodeBlock";

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
            {activeTab === "model" && <CodeBlock code={snippets.model} language="typescript" />}
            {activeTab === "react" && <CodeBlock code={snippets.react} language="tsx" />}
            {activeTab === "test" && <CodeBlock code={snippets.test} language="typescript" />}
            {activeTab === "vanilla" && <CodeBlock code={snippets.vanilla} language="typescript" />}
          </div>
        </div>
      </div>
    </section>
  );
}
