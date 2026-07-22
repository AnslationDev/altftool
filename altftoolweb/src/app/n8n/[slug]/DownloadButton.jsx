"use client";

import { useState } from "react";
import { Download, Copy, Check } from "lucide-react";

export default function DownloadButton({ jsonPath, slug }) {
  const [copyStatus, setCopyStatus] = useState("idle");

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {
        // Fall through for browsers that expose the API but deny permission.
      }
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.inset = "0 auto auto -9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();

    if (!copied) throw new Error("Clipboard copy failed");
  }

  async function download() {
    const res = await fetch(jsonPath);
    if (!res.ok) return;
    const text = await res.text();
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function copyJson() {
    try {
      setCopyStatus("idle");
      const res = await fetch(jsonPath);
      if (!res.ok) throw new Error("Workflow download failed");
      const text = await res.text();
      await copyText(text);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 2500);
    }
  }

  const copyLabel =
    copyStatus === "copied" ? "Copied!" : copyStatus === "error" ? "Copy failed" : "Copy JSON";

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <button
        type="button"
        onClick={download}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-(--color-primary) px-6 py-3 text-sm font-semibold text-(--color-primary-foreground) transition-opacity hover:opacity-90"
      >
        <Download size={16} /> Download Workflow
      </button>
      <button
        type="button"
        onClick={copyJson}
        aria-live="polite"
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-(--color-border) bg-(--color-card) px-6 py-3 text-sm font-semibold text-(--color-foreground) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
      >
        {copyStatus === "copied" ? <Check size={16} /> : <Copy size={16} />}
        {copyLabel}
      </button>
    </div>
  );
}
