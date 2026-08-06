"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, RotateCcw, Wand2 } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

/**
 * Shared primitive for text-in / text-out tools.
 *
 * props:
 *  - title, description
 *  - transform(input, options) -> string | Promise<string>
 *  - options?: [{ key, label, type: "toggle"|"select"|"number"|"text", default, choices? }]
 *  - sample?: string  (loaded on first render + "Load sample")
 *  - placeholder?: string
 *  - inputLabel?, outputLabel?
 *  - confirmClear?: string  (when set, Clear asks window.confirm(confirmClear)
 *    before wiping the input; omitted by default so existing consumers keep
 *    their current one-click behaviour unchanged)
 */
export default function TextTool({
  title,
  description,
  transform,
  options = [],
  sample = "",
  placeholder = "Type or paste your text here…",
  inputLabel = "Input",
  outputLabel = "Result",
  confirmClear = "",
}) {
  const initialOpts = useMemo(() => {
    const o = {};
    for (const opt of options) o[opt.key] = opt.default;
    return o;
  }, [options]);

  const [input, setInput] = useState(sample);
  const [opts, setOpts] = useState(initialOpts);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.resolve()
      .then(() => transform(input, opts))
      .then((result) => {
        if (alive) setOutput(typeof result === "string" ? result : String(result ?? ""));
      })
      .catch((error) => {
        if (alive) setOutput(`Error: ${error?.message || error}`);
      });
    return () => {
      alive = false;
    };
  }, [input, opts, transform]);

  const setOpt = (key, value) => setOpts((prev) => ({ ...prev, [key]: value }));

  const copy = async () => {
    if (!(await safeCopyText(output))) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Wand2 className="h-4 w-4" />
            Text tool
          </div>
          <h1 className="text-3xl font-semibold leading-tight">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
              {description}
            </p>
          ) : null}
        </section>

        {options.length > 0 && (
          <section className="mt-4 flex flex-wrap gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
            {options.map((opt) => (
              <label key={opt.key} className="flex items-center gap-2 text-sm font-medium">
                <span>{opt.label}</span>
                {opt.type === "toggle" ? (
                  <input
                    type="checkbox"
                    checked={!!opts[opt.key]}
                    onChange={(e) => setOpt(opt.key, e.target.checked)}
                    className="h-4 w-4 accent-[var(--primary)]"
                  />
                ) : opt.type === "select" ? (
                  <select
                    value={opts[opt.key]}
                    onChange={(e) => setOpt(opt.key, e.target.value)}
                    className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 outline-none focus:border-[var(--primary)]"
                  >
                    {opt.choices.map((c) => (
                      <option key={String(c.value ?? c)} value={c.value ?? c}>
                        {c.label ?? c}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={opt.type === "number" ? "number" : "text"}
                    value={opts[opt.key]}
                    onChange={(e) =>
                      setOpt(opt.key, opt.type === "number" ? Number(e.target.value) : e.target.value)
                    }
                    className="h-9 w-28 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 outline-none focus:border-[var(--primary)]"
                  />
                )}
              </label>
            ))}
          </section>
        )}

        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">{inputLabel}</span>
              <div className="flex gap-2">
                {sample ? (
                  <button
                    type="button"
                    onClick={() => setInput(sample)}
                    className="text-xs font-semibold text-[var(--primary)]"
                  >
                    Load sample
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    if (confirmClear && !window.confirm(confirmClear)) return;
                    setInput("");
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted-foreground)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Clear
                </button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              spellCheck={false}
              aria-label={inputLabel}
              className="h-72 w-full resize-y rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">{outputLabel}</span>
              <button
                type="button"
                onClick={copy}
                className="btn-secondary min-h-8 px-3 py-1 text-xs"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              spellCheck={false}
              aria-label={outputLabel}
              className="h-72 w-full resize-y rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm outline-none"
            />
            {/*
              The textarea's `value` is a DOM property, not text-node content, so
              screen readers' live-region mutation observers never see it change —
              aria-live on the textarea itself would not reliably announce updates.
              This hidden node mirrors the output as real text content so the
              "live output as you type" result is actually announced.
            */}
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {output}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
