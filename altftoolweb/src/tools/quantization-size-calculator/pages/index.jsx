"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Cpu, RotateCcw } from "lucide-react";

import { computeQuantSizes } from "../lib";

const GB = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const BPW = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULT_PARAMS = "7";

const PRESETS = ["1", "3", "7", "13", "32", "70", "405"];

export default function ToolHome() {
  const [paramsInput, setParamsInput] = useState(DEFAULT_PARAMS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeQuantSizes({
        paramsBillions: paramsInput.trim() === "" ? Number.NaN : Number(paramsInput),
      }),
    [paramsInput],
  );
  const hasError = Boolean(result.error);

  const q4Row = hasError ? null : result.rows.find((row) => row.id === "q4_k");

  const copyResult = async () => {
    if (hasError) return;
    const text = [
      `Quantization sizes for a ${result.paramsBillions}B-parameter model (weights only)`,
      ...result.rows.map(
        (row) =>
          `${row.label}: ${GB.format(row.gb)} GB (${GB.format(row.gib)} GiB) at ${BPW.format(row.bpw)} bits/weight`,
      ),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setParamsInput(DEFAULT_PARAMS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Cpu className="h-4 w-4" aria-hidden="true" />
          Local AI
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Quantization Size Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Estimate a model&apos;s weight-file size across FP16, Q8_0, Q6_K, Q5_K, Q4_K, Q3_K and
          Q2_K using size = parameters × bits-per-weight ÷ 8, with bits-per-weight taken from the
          exact llama.cpp GGUF block layouts.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="qz-params">
          Model parameters (billions)
        </label>
        <input
          id="qz-params"
          className={`mt-2 ${INPUT_CLASS}`}
          type="number"
          inputMode="decimal"
          min="0"
          step="0.1"
          value={paramsInput}
          onChange={(event) => setParamsInput(event.target.value)}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setParamsInput(preset)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset}B
            </button>
          ))}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              4-bit (Q4_K) estimate
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {q4Row ? `${GB.format(q4Row.gb)} GB` : DASH}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see size estimates."
                : `${GB.format(q4Row.gib)} GiB — ${PCT.format(q4Row.savingsVsFp16Pct)}% smaller than FP16 (${GB.format(result.fp16Gb)} GB).`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the quantization size table"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset to the default 7B model"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Format</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Bits/weight</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Size (GB)</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Size (GiB)</th>
                <th scope="col" className="py-2 text-right font-semibold">vs FP16</th>
              </tr>
            </thead>
            <tbody>
              {(hasError ? [] : result.rows).map((row) => (
                <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{row.label}</td>
                  <td className="py-2 pr-3 text-right">{BPW.format(row.bpw)}</td>
                  <td className="py-2 pr-3 text-right font-semibold">{GB.format(row.gb)}</td>
                  <td className="py-2 pr-3 text-right">{GB.format(row.gib)}</td>
                  <td
                    className={`py-2 text-right font-semibold ${
                      row.savingsVsFp16Pct > 0
                        ? "text-[var(--success)]"
                        : row.savingsVsFp16Pct < 0
                          ? "text-[var(--danger)]"
                          : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {row.savingsVsFp16Pct > 0 ? "−" : row.savingsVsFp16Pct < 0 ? "+" : ""}
                    {PCT.format(Math.abs(row.savingsVsFp16Pct))}%
                  </td>
                </tr>
              ))}
              {hasError ? (
                <tr>
                  <td className="py-2 pr-3" colSpan={5}>
                    {DASH}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Weights-only estimate. Real GGUF files run a few percent larger: &quot;_M&quot; mixed
        variants keep some tensors at Q6_K, and embeddings, output layers and metadata add
        overhead. Running the model also needs extra memory for the KV cache, which grows with
        context length.
      </p>
    </main>
  );
}
