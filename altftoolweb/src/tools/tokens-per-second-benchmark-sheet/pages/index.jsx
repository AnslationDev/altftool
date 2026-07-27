"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  QUANT_FORMATS,
  buildSheetMarkdown,
  computeRun,
  summariseRuns,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const NUM0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  label: "Llama 3 8B Instruct",
  hardware: "MacBook Pro M2 Pro",
  paramsB: "8",
  quant: "q4_k_m",
  promptTokens: "1024",
  generatedTokens: "512",
  prefillSeconds: "0.8",
  decodeSeconds: "12.8",
  bandwidthGBps: "200",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [saved, setSaved] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const draft = useMemo(() => computeRun(form), [form]);
  const ok = !draft.error;

  const savedRuns = useMemo(
    () => saved.map((entry) => ({ id: entry.id, run: computeRun(entry.values) })),
    [saved]
  );
  const summary = useMemo(() => summariseRuns(savedRuns.map((entry) => entry.run)), [savedRuns]);
  const markdown = useMemo(() => buildSheetMarkdown(savedRuns.map((entry) => entry.run)), [savedRuns]);

  const addRun = () => {
    if (!ok) return;
    setSaved((prev) => [...prev, { id: nextId, values: { ...form } }]);
    setNextId(nextId + 1);
    setCopied(false);
  };

  const removeRun = (id) => {
    setSaved((prev) => prev.filter((entry) => entry.id !== id));
    setCopied(false);
  };

  const copySheet = async () => {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setSaved([]);
    setCopied(false);
  };

  const rows = [
    ["Prefill throughput", ok && draft.prefillTps !== null ? `${NUM0.format(draft.prefillTps)} tok/s` : DASH],
    ["Time to first token", ok ? `${NUM0.format(draft.ttftMs)} ms` : DASH],
    ["End-to-end throughput", ok && draft.totalTps !== null ? `${NUM1.format(draft.totalTps)} tok/s` : DASH],
    ["Weights in memory", ok ? `${NUM2.format(draft.weightsGB)} GB at ${draft.bitsPerWeight} bpw` : DASH],
    ["With runtime overhead", ok ? `${NUM2.format(draft.residentGB)} GB` : DASH],
    [
      "Memory-bandwidth ceiling",
      ok && draft.rooflineTps !== null ? `${NUM1.format(draft.rooflineTps)} tok/s` : DASH,
    ],
    [
      "Share of the ceiling reached",
      ok && draft.efficiencyPct !== null ? `${NUM0.format(draft.efficiencyPct)}%` : DASH,
    ],
    ["Total wall time", ok ? `${NUM2.format(draft.totalSeconds)} s` : DASH],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          Local AI
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Tokens Per Second Benchmark Sheet</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste the timings your runner prints, and this separates prefill from decode, works out the
          model&apos;s weight footprint at your quantisation, and compares your measured speed against
          the memory-bandwidth ceiling that actually limits single-stream decoding.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-label">
              Model
            </label>
            <input id="tp-label" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.label} onChange={set("label")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-hardware">
              Hardware
            </label>
            <input
              id="tp-hardware"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.hardware}
              onChange={set("hardware")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-params">
              Parameters (billions)
            </label>
            <input
              id="tp-params"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.05"
              step="0.1"
              value={form.paramsB}
              onChange={set("paramsB")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-quant">
              Quantisation
            </label>
            <select id="tp-quant" className={`mt-2 ${INPUT_CLASS}`} value={form.quant} onChange={set("quant")}>
              {QUANT_FORMATS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — {item.bitsPerWeight} bpw
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-prompt">
              Prompt tokens
            </label>
            <input
              id="tp-prompt"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.promptTokens}
              onChange={set("promptTokens")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-gen">
              Generated tokens
            </label>
            <input
              id="tp-gen"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.generatedTokens}
              onChange={set("generatedTokens")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-prefill">
              Prefill / prompt-eval time (s)
            </label>
            <input
              id="tp-prefill"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={form.prefillSeconds}
              onChange={set("prefillSeconds")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-decode">
              Generation time (s)
            </label>
            <input
              id="tp-decode"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              value={form.decodeSeconds}
              onChange={set("decodeSeconds")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tp-bandwidth">
              Memory bandwidth (GB/s, optional — enables the ceiling)
            </label>
            <input
              id="tp-bandwidth"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={form.bandwidthGBps}
              onChange={set("bandwidthGBps")}
            />
          </div>
        </div>
      </section>

      {draft.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {draft.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Decode throughput
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${NUM1.format(draft.decodeTps)} tok/s` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${draft.generatedTokens} tokens in ${NUM2.format(draft.decodeSeconds)} s`
                : "Fix the input above to see the run"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addRun}
              disabled={!ok}
              aria-label="Add this run to the comparison sheet"
              className={`${PRIMARY_BTN} disabled:opacity-50`}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add to sheet
            </button>
            <button type="button" onClick={reset} aria-label="Reset inputs and clear the sheet" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Saved runs</h2>
          <button
            type="button"
            onClick={copySheet}
            disabled={!markdown}
            aria-label="Copy the benchmark sheet as a markdown table"
            className={`${GHOST_BTN} disabled:opacity-50`}
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy markdown"}
          </button>
        </div>

        {savedRuns.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Nothing saved yet. Add the run above, change the model or hardware, and add it again to compare.
          </p>
        ) : (
          <>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Model</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Hardware</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Size GB</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Decode</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">% of roof</th>
                    <th scope="col" className="py-2 text-right font-semibold">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {savedRuns.map(({ id, run }) => (
                    <tr key={id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{run.label}</td>
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">{run.hardware || DASH}</td>
                      <td className="py-2 pr-3 text-right">{NUM2.format(run.weightsGB)}</td>
                      <td className="whitespace-nowrap py-2 pr-3 text-right font-semibold">
                        {NUM1.format(run.decodeTps)} tok/s
                      </td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {run.efficiencyPct === null ? DASH : `${NUM0.format(run.efficiencyPct)}%`}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeRun(id)}
                          aria-label={`Remove ${run.label} from the sheet`}
                          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {summary ? (
              <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
                {[
                  ["Runs saved", `${summary.count}`],
                  ["Fastest", `${summary.fastest.label} at ${NUM1.format(summary.fastest.decodeTps)} tok/s`],
                  ["Slowest", `${summary.slowest.label} at ${NUM1.format(summary.slowest.decodeTps)} tok/s`],
                  ["Median decode", `${NUM1.format(summary.medianDecodeTps)} tok/s`],
                  ["Mean decode", `${NUM1.format(summary.meanDecodeTps)} tok/s`],
                  ["Fastest over slowest", summary.spread === null ? DASH : `${NUM2.format(summary.spread)}x`],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <div className="mt-5 overflow-x-auto">
              <pre className="min-w-0 whitespace-pre rounded-md bg-[var(--background)] p-3 text-xs leading-6 text-[var(--foreground)]">
                {markdown}
              </pre>
            </div>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Sizes use decimal gigabytes so they line up with GB/s bandwidth figures; runners that report
        GiB will show slightly larger numbers. The ceiling assumes single-stream decoding reads every
        weight once per token, so batching, speculative decoding and MoE routing all beat it — treat
        it as a sanity check, not a target.
      </p>
    </main>
  );
}
