"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

export default function CopyButton({ text, label = "Copy", className = "", size = "sm" }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await safeCopyText(text);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const sizes = size === "sm" ? "px-2.5 py-1.5 text-xs gap-1" : "px-3.5 py-2 text-sm gap-1.5";

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : label}
      className={`inline-flex cursor-pointer items-center rounded-lg border border-(--border) bg-(--background) font-medium text-(--muted-foreground) transition-colors hover:border-(--primary) hover:text-(--primary) focus:outline-none focus:ring-2 focus:ring-(--primary)/40 ${sizes} ${className}`}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
}
