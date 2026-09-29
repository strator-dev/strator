"use client";

import React, { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import { highlightCode } from "../lib/highlight";

export interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  showCopy?: boolean;
  className?: string;
  preClassName?: string;
}

export function CodeBlock({
  code,
  language = "tsx",
  showLineNumbers = false,
  showCopy = false,
  className = "",
  preClassName = "",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const highlightedHtml = useMemo(() => {
    return highlightCode(code, language);
  }, [code, language]);

  const handleCopy = () => {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!showLineNumbers) {
    return (
      <div className={`relative group ${className}`}>
        {showCopy && (
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/5 transition-all text-xs flex items-center gap-1.5 z-10"
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
        )}
        <pre className={`m-0 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto ${preClassName}`}>
          <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
        </pre>
      </div>
    );
  }

  // With line numbers
  const lines = highlightedHtml.split("\n");

  return (
    <div className={`relative group ${className}`}>
      {showCopy && (
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/5 transition-all text-xs flex items-center gap-1.5 z-10"
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
      )}
      <pre className={`m-0 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto ${preClassName}`}>
        <code>
          {lines.map((line, index) => (
            <div key={index} className="table-row">
              <span className="table-cell pr-4 text-slate-600 select-none text-right font-mono text-xs">
                {index + 1}
              </span>
              <span className="table-cell" dangerouslySetInnerHTML={{ __html: line || " " }} />
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
