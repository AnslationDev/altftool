"use client";

import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronRight } from "lucide-react";
import { highlightCode, getLanguageClass } from "../utils/syntaxHighlighter";

export default function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const langClass = getLanguageClass(language);
  const langLabel = language || "text";
  const lineCount = (code || "").split("\n").length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-[--border] bg-[--page]">
      <div className="flex items-center justify-between border-b border-[--border] bg-[--surface-soft] px-3 py-1.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded p-0.5 text-[--muted] transition-colors hover:text-[--foreground]"
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          <span className="text-xs font-medium text-[--muted]">
            {langLabel}
          </span>
          {lineCount > 1 && (
            <span className="text-xs text-[--muted]">{lineCount} lines</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[--muted] transition-colors hover:bg-[--surface] hover:text-[--foreground]"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-500" />
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      {!collapsed && (
        <div className="overflow-x-auto">
          <pre className="p-4 text-sm leading-relaxed">
            <code
              className={`language-${langClass}`}
              dangerouslySetInnerHTML={{
                __html: highlightCode(code, langClass),
              }}
            />
          </pre>
        </div>
      )}
    </div>
  );
}

const styles = `
pre {
  margin: 0;
}
code {
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 0.8125rem;
  line-height: 1.6;
}
`;
