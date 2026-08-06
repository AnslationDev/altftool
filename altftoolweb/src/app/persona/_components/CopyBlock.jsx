"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

/*
 * A block of prompt text with a copy button.
 *
 * The whole product is text you paste somewhere else, so this is the single
 * most-used control on the site. Two things it must get right: the copied
 * state has to last long enough to be believed (1.6s), and the fallback path
 * has to exist, because navigator.clipboard is unavailable on any non-secure
 * origin — including the LAN address people test the dev server on.
 */
export default function CopyBlock({
  text,
  label,
  note,
  tone = "default",
  className = "",
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }, [text]);

  return (
    <div className={className}>
      {(label || note) && (
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          {label ? <p className="psn-stamp">{label}</p> : <span />}
          {note ? (
            <p className="text-xs text-muted-foreground">{note}</p>
          ) : null}
        </div>
      )}

      <div className="relative">
        <pre
          className={`psn-code rounded-lg p-4 pr-14 ${
            tone === "tight" ? "text-xs" : ""
          }`}
        >
          {text}
        </pre>
        <button
          type="button"
          onClick={copy}
          className="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  );
}
