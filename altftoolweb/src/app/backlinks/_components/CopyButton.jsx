"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Copy one cell's value.
 *
 * The only client component in the sheet view, kept to a single button so a
 * 30-row table ships one small bundle rather than hydrating the whole grid.
 *
 * navigator.clipboard needs a secure context and can be blocked by permissions
 * policy, so there is a textarea fallback and a visible failure state — a copy
 * button that silently does nothing is worse than not having one.
 */
export default function CopyButton({ value, label }) {
  const [state, setState] = useState("idle");
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async () => {
    clearTimeout(timer.current);
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        ok = true;
      } else throw new Error("no clipboard api");
    } catch {
      // Fallback for insecure contexts and older Safari.
      try {
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    setState(ok ? "copied" : "failed");
    timer.current = setTimeout(() => setState("idle"), 1600);
  }, [value]);

  return (
    <button
      type="button"
      className="bl-micro"
      onClick={copy}
      data-copied={state === "copied" ? "true" : undefined}
      title={state === "failed" ? "Copy failed — select the text instead" : `Copy ${label}`}
    >
      {state === "copied" ? (
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {/* aria-live so the outcome is announced, not just recoloured. */}
      <span className="sr-only" aria-live="polite">
        {state === "copied"
          ? `${label} copied`
          : state === "failed"
            ? `Could not copy ${label}`
            : `Copy ${label}`}
      </span>
    </button>
  );
}
