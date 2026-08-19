"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, RotateCcw, Sparkles } from "lucide-react";

const FIELD =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA =
  "min-h-28 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

export default function QuickToolPage({
  eyebrow = "ALTFTool workspace",
  title,
  description,
  fields = [],
  defaults = {},
  buildOutput,
  outputLabel = "Generated output",
}) {
  const [values, setValues] = useState(defaults);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const output = useMemo(() => {
    try {
      return buildOutput?.(values) || "";
    } catch (error) {
      return `Unable to generate output: ${error.message}`;
    }
  }, [buildOutput, values]);

  const set = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));

  const copy = async () => {
    if (!output) return;
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(output);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--primary)]">
            <Sparkles className="h-4 w-4" /> {eyebrow}
          </p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            {description}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => {
                const value = values[field.key] ?? "";
                return (
                  <label key={field.key} className={field.multiline || field.full ? "block sm:col-span-2" : "block"}>
                    <span className="mb-1 block text-sm font-medium">{field.label}</span>
                    {field.type === "select" ? (
                      <select className={FIELD} value={value} onChange={(event) => set(field.key, event.target.value)}>
                        {field.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : field.multiline ? (
                      <textarea
                        className={AREA}
                        placeholder={field.placeholder}
                        value={value}
                        onChange={(event) => set(field.key, event.target.value)}
                      />
                    ) : (
                      <input
                        className={FIELD}
                        inputMode={field.inputMode}
                        placeholder={field.placeholder}
                        value={value}
                        onChange={(event) => set(field.key, event.target.value)}
                      />
                    )}
                    {field.hint ? <span className="mt-1 block text-xs text-[var(--muted-foreground)]">{field.hint}</span> : null}
                  </label>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)]"
                onClick={copy}
                type="button"
              >
                <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy output"}
              </button>
              <button
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] px-4 text-sm font-semibold"
                onClick={() => setValues(defaults)}
                type="button"
              >
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </section>

          <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-lg font-semibold">{outputLabel}</h2>
            <pre
              aria-live="polite"
              className="mt-4 max-h-[600px] overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--background)] p-4 text-xs leading-5 ring-1 ring-[var(--border)]"
            >
              {output}
            </pre>
          </section>
        </div>
      </div>
    </main>
  );
}
