"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

/**
 * Copyable embed-snippet block. Token-styled, light+dark, AA.
 */
export default function EmbedCodeCopy({ snippet, label = "Copy embed code" }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const ok = await safeCopyText(snippet);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div className="rounded-[8px] border border-(--border) bg-(--background)">
      <pre className="max-h-44 overflow-auto p-3 text-xs leading-5 text-(--muted-foreground)">
        <code>{snippet}</code>
      </pre>
      <div className="border-t border-(--border) p-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-(--primary) px-3.5 text-sm font-semibold text-(--primary-foreground) transition hover:bg-(--primary-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--anslation-ds-primary-hover)]/35"
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
