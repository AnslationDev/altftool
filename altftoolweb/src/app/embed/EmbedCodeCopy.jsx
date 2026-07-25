"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

/**
 * Copyable embed-snippet block. Token-styled, light+dark, AA by default;
 * hosts with an intentional local theme (e.g. ToolSeoSection's --sc-* app
 * theme) can restyle via the className/style overrides.
 */
export default function EmbedCodeCopy({
  snippet,
  label = "Copy embed code",
  containerClassName = "rounded-[8px] border border-(--border) bg-(--background)",
  preClassName = "max-h-44 overflow-auto p-3 text-xs leading-5 text-(--muted-foreground)",
  dividerClassName = "border-t border-(--border) p-2",
  buttonClassName = "inline-flex h-9 items-center gap-2 rounded-[8px] bg-(--primary) px-3.5 text-sm font-semibold text-(--primary-foreground) transition hover:bg-(--primary-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--anslation-ds-primary-hover)]/35",
  buttonStyle,
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const ok = await safeCopyText(snippet);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div className={containerClassName}>
      <pre className={preClassName}>
        <code>{snippet}</code>
      </pre>
      <div className={dividerClassName}>
        <button
          type="button"
          onClick={copy}
          className={buttonClassName}
          style={buttonStyle}
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {copied ? "Copied!" : label}
        </button>
      </div>
    </div>
  );
}
