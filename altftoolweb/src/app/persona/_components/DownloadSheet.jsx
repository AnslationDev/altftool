"use client";

import { useCallback, useState } from "react";
import { Check, Download } from "lucide-react";

/*
 * The sheet as a file.
 *
 * The whole argument against a hosted AI-influencer product is that a persona
 * should be portable text you own rather than an account you rent — and a
 * product that only ever shows you the text inside its own interface has not
 * really made that argument. So: one Markdown file, generated in the browser,
 * nothing uploaded.
 *
 * The sheet module pulls the planner and shot catalog with it, so it is loaded
 * only after a click rather than added to every Persona client bundle.
 */
export default function DownloadSheet({
  spec,
  label = "Download sheet (.md)",
  className = "",
}) {
  const [state, setState] = useState("idle");

  const download = useCallback(async () => {
    setState("working");
    try {
      const { sheetFilename, sheetMarkdown, sheetShareQuery } = await import(
        "@altftool/core/persona/sheet"
      );

      const shareUrl = `${window.location.origin}/persona/studio?${sheetShareQuery(spec)}`;
      const blob = new Blob([sheetMarkdown(spec, { shareUrl })], {
        type: "text/markdown;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = sheetFilename(spec);
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      /* Revoking immediately races the download in Safari; a tick is enough. */
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      setState("done");
      window.setTimeout(() => setState("idle"), 1800);
    } catch {
      setState("failed");
      window.setTimeout(() => setState("idle"), 2600);
    }
  }, [spec]);

  const text =
    state === "working"
      ? "Building…"
      : state === "done"
        ? "Downloaded"
        : state === "failed"
          ? "Could not build the file"
          : label;

  return (
    <button
      type="button"
      onClick={download}
      disabled={state === "working"}
      className={`inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-[var(--psn-accent)] focus-visible:outline-none disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-primary ${className}`}
    >
      {state === "done" ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Download className="h-4 w-4" aria-hidden="true" />
      )}
      {text}
      <span aria-live="polite" className="sr-only">
        {state === "done" ? "Character sheet downloaded" : ""}
      </span>
    </button>
  );
}
