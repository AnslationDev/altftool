"use client";

import { useMemo, useState } from "react";
import { Calculator, Copy, RotateCcw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

/**
 * Shared primitive for "inputs -> computed result" tools (calculators/converters).
 *
 * props:
 *  - title, description, note?
 *  - fields: [{ key, label, type: "number"|"text"|"date"|"select", default, min?, max?, step?, choices?, suffix? }]
 *  - compute(values) -> { result: string, caption?: string, rows?: [ [label, value], ... ] }
 */
export default function CalcTool({ title, description, note, fields = [], compute }) {
  const initial = useMemo(() => {
    const v = {};
    for (const f of fields) v[f.key] = f.default;
    return v;
  }, [fields]);

  const [values, setValues] = useState(initial);
  const [copied, setCopied] = useState(false);

  const out = useMemo(() => {
    try {
      const r = compute(values) || {};
      return { result: r.result ?? "—", caption: r.caption ?? "", rows: r.rows ?? [] };
    } catch (error) {
      return { result: "—", caption: `Error: ${error?.message || error}`, rows: [] };
    }
  }, [values, compute]);

  const setField = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));

  const reset = () => setValues(initial);

  const copy = async () => {
    const summary = [
      title,
      ...fields.map((f) => `${f.label}: ${values[f.key]}`),
      `Result: ${out.result}`,
      ...out.rows.map(([l, v]) => `${l}: ${v}`),
    ].join("\n");
    if (!(await safeCopyText(summary))) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Calculator className="h-4 w-4" />
            Calculator
          </div>
          <h1 className="text-3xl font-semibold leading-tight">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
              {description}
            </p>
          ) : null}
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold">Inputs</span>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--primary)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
            <div className="grid gap-4">
              {fields.map((f) => (
                <label key={f.key} className="block">
                  <span className="text-sm font-semibold">{f.label}</span>
                  {f.type === "select" ? (
                    <select
                      value={values[f.key]}
                      onChange={(e) => setField(f.key, e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)]"
                    >
                      {f.choices.map((c) => (
                        <option key={String(c.value ?? c)} value={c.value ?? c}>
                          {c.label ?? c}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type={f.type}
                        value={values[f.key]}
                        min={f.min}
                        max={f.max}
                        step={f.step}
                        inputMode={f.type === "number" ? "decimal" : undefined}
                        onChange={(e) =>
                          setField(f.key, f.type === "number" ? e.target.value : e.target.value)
                        }
                        className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)]"
                      />
                      {f.suffix ? (
                        <span className="text-sm text-[var(--muted-foreground)]">{f.suffix}</span>
                      ) : null}
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="grid content-start gap-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Result
                </span>
                <button type="button" onClick={copy} className="btn-secondary min-h-8 px-3 py-1 text-xs">
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="mt-3 break-words text-3xl font-semibold text-[var(--primary)]">
                {out.result}
              </p>
              {out.caption ? (
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{out.caption}</p>
              ) : null}
            </div>

            {out.rows.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-2">
                {out.rows.map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3"
                  >
                    <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {note ? (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--card)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
            {note}
          </p>
        ) : null}
      </div>
    </main>
  );
}
