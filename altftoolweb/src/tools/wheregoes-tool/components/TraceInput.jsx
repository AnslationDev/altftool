"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ClipboardPaste,
  CornerDownLeft,
  Loader2,
  Search,
  TriangleAlert,
  X,
} from "lucide-react";
import { isTraceableUrl } from "../hooks/useTrace";
import { CARD, FOCUS_RING } from "./ui.jsx";

const EXAMPLES = ["https://google.com", "http://github.com", "https://altftool.com"];

export default function TraceInput({ status, error, onTrace }) {
  const inputRef = useRef(null);
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const [canPaste, setCanPaste] = useState(false);
  const loading = status === "loading";

  const valid = isTraceableUrl(value);
  const showInvalid = touched && value.trim().length > 3 && !valid;

  // Autofocus + "/" keyboard shortcut to jump into the input.
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
    setCanPaste(Boolean(navigator.clipboard?.readText));

    const onKeyDown = (event) => {
      if (
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        event.preventDefault();
        inputRef.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    setTouched(true);
    if (!loading && value.trim()) onTrace(value);
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      setValue(text.trim());
      setTouched(false);
      inputRef.current?.focus();
    } catch {
      inputRef.current?.focus();
    }
  }

  const iconButton = `flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground) ${FOCUS_RING}`;

  return (
    <section aria-label="Enter URL to trace" className={`${CARD} p-4 sm:p-5`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold tracking-tight text-(--foreground)">Enter URL to Trace</h2>
        <span className="hidden items-center gap-1 text-[11px] font-semibold text-(--muted-foreground) sm:flex" aria-hidden="true">
          Press
          <kbd className="rounded-[5px] border border-(--border) bg-(--muted) px-1.5 py-0.5 font-mono text-[10px] font-bold text-(--foreground)">/</kbd>
          to focus
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:flex-row">
        <div
          className={`flex h-12 min-w-0 flex-1 items-center gap-2 rounded-[8px] border bg-(--background) px-3 transition focus-within:[box-shadow:var(--anslation-ds-focus-ring)] ${
            showInvalid
              ? "border-[color-mix(in_srgb,var(--anslation-ds-danger)_55%,var(--border))]"
              : "border-(--border) focus-within:border-(--primary)"
          }`}
        >
          <Search size={16} aria-hidden="true" className="shrink-0 text-(--muted-foreground)" />
          <input
            ref={inputRef}
            type="text"
            inputMode="url"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (touched) setTouched(false);
            }}
            onBlur={() => setTouched(true)}
            placeholder="https://example.com"
            aria-label="URL to trace"
            aria-invalid={showInvalid}
            className="h-full w-full min-w-0 appearance-none border-0 bg-transparent font-mono text-sm text-(--foreground) shadow-none outline-none! placeholder:text-(--input-placeholder)"
          />
          {value ? (
            <button
              type="button"
              onClick={() => {
                setValue("");
                setTouched(false);
                inputRef.current?.focus();
              }}
              aria-label="Clear URL"
              className={iconButton}
            >
              <X size={13} aria-hidden="true" />
            </button>
          ) : (
            canPaste && (
              <button
                type="button"
                onClick={handlePaste}
                aria-label="Paste URL from clipboard"
                title="Paste from clipboard"
                className={iconButton}
              >
                <ClipboardPaste size={14} aria-hidden="true" />
              </button>
            )
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !value.trim()}
          className={`inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[8px] px-5 text-sm font-bold text-white shadow-[0_6px_16px_color-mix(in_srgb,var(--primary)_30%,transparent)] transition hover:opacity-95 disabled:pointer-events-none disabled:opacity-60 ${FOCUS_RING}`}
          style={{ background: "var(--anslation-ds-cta-gradient)" }}
        >
          {loading ? (
            <>
              <Loader2 size={17} aria-hidden="true" className="motion-safe:animate-spin" />
              Tracing…
            </>
          ) : (
            <>
              Trace Redirects
              <ArrowRight size={16} aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-(--muted-foreground)">Examples:</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            disabled={loading}
            onClick={() => {
              setValue(example);
              setTouched(false);
              onTrace(example);
            }}
            className={`rounded-full border border-(--border) bg-(--background) px-3 py-1 font-mono text-[11px] font-semibold text-(--muted-foreground) transition hover:border-(--primary) hover:text-(--primary-hover) dark:hover:text-(--primary) disabled:opacity-60 ${FOCUS_RING}`}
          >
            {example}
          </button>
        ))}
        <span className="ml-auto hidden items-center gap-1 text-[11px] font-medium text-(--muted-foreground) sm:flex" aria-hidden="true">
          <CornerDownLeft size={11} />
          Enter to trace
        </span>
      </div>

      {showInvalid && (
        <p
          className="mt-2.5 text-xs font-medium"
          style={{ color: "color-mix(in srgb, var(--anslation-ds-danger) 75%, var(--foreground))" }}
        >
          This doesn&apos;t look like a valid URL — try something like https://example.com
        </p>
      )}

      {status === "error" && (
        <p
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-[8px] border px-3 py-2.5 text-xs font-medium leading-5"
          style={{
            backgroundColor: "var(--anslation-ds-danger-soft)",
            borderColor: "color-mix(in srgb, var(--anslation-ds-danger) 35%, transparent)",
            color: "color-mix(in srgb, var(--anslation-ds-danger) 75%, var(--foreground))",
          }}
        >
          <TriangleAlert size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </section>
  );
}
