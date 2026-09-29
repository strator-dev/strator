"use client";

import React, { useMemo, useState } from "react";
import { Copy, Check, FileCode } from "lucide-react";
import { highlightCode } from "../../lib/highlight";

export interface CodeCardProps {
  title?: string;
  filename?: string;
  code: string;
  language?: string;
  highlightLines?: number[];
  className?: string;
}

export function CodeCard({ title, filename, code, language = "tsx", className = "" }: CodeCardProps) {
  const [copied, setCopied] = useState(false);

  const highlightedHtml = useMemo(() => {
    return highlightCode(code, language);
  }, [code, language]);

  const handleCopy = () => {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`glass-panel rounded-2xl border border-white/10 shadow-xl overflow-hidden ${className}`}>
      {(title || filename) && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-slate-900/60">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-white">{title || filename}</span>
            {title && filename && <span className="text-slate-500">({filename})</span>}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-500 uppercase px-1.5 py-0.5 rounded bg-white/5">
              {language}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/5 transition-all text-xs flex items-center gap-1.5"
              title="Copy code"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-mono text-[11px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="font-mono text-[11px]">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
      {!title && !filename && (
        <div className="flex justify-end p-2 bg-slate-900/40 border-b border-white/5">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/5 transition-all text-xs flex items-center gap-1.5"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-mono text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="font-mono text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>
      )}
      <div className="p-4 sm:p-5 bg-slate-950 font-mono text-xs sm:text-sm text-slate-300 overflow-x-auto leading-relaxed">
        <pre className="m-0 font-mono">
          <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
        </pre>
      </div>
    </div>
  );
}
