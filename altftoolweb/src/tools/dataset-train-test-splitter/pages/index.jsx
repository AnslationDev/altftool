"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, RotateCcw, Split } from "lucide-react";

import { splitDataset } from "../lib";

const NUM = new Intl.NumberFormat("en-US");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SAMPLE = [
  '{"prompt": "What is 2+2?", "completion": "4"}',
  '{"prompt": "Capital of France?", "completion": "Paris"}',
  '{"prompt": "Boiling point of water in C?", "completion": "100"}',
  '{"prompt": "Largest planet?", "completion": "Jupiter"}',
  '{"prompt": "H2O is?", "completion": "Water"}',
  '{"prompt": "Speed of light km/s?", "completion": "299792"}',
  '{"prompt": "Smallest prime?", "completion": "2"}',
  '{"prompt": "Author of 1984?", "completion": "George Orwell"}',
  '{"prompt": "Square root of 81?", "completion": "9"}',
  '{"prompt": "Chemical symbol for gold?", "completion": "Au"}',
].join("\n");

const DEFAULTS = {
  text: SAMPLE,
  trainPct: "80",
  valPct: "10",
  testPct: "10",
  seed: "42",
  shuffle: true,
  skipInvalid: true,
};

const DASH = "—";

export default function ToolHome() {
  const [text, setText] = useState(DEFAULTS.text);
  const [trainPct, setTrainPct] = useState(DEFAULTS.trainPct);
  const [valPct, setValPct] = useState(DEFAULTS.valPct);
  const [testPct, setTestPct] = useState(DEFAULTS.testPct);
  const [seed, setSeed] = useState(DEFAULTS.seed);
  const [shuffle, setShuffle] = useState(DEFAULTS.shuffle);
  const [skipInvalid, setSkipInvalid] = useState(DEFAULTS.skipInvalid);
  const [copiedKey, setCopiedKey] = useState("");

  const result = useMemo(
    () =>
      splitDataset({
        text,
        trainPct: trainPct.trim() === "" ? Number.NaN : Number(trainPct),
        valPct: valPct.trim() === "" ? Number.NaN : Number(valPct),
        testPct: testPct.trim() === "" ? Number.NaN : Number(testPct),
        seed: seed.trim() === "" ? Number.NaN : Number(seed),
        shuffle,
        skipInvalid,
      }),
    [text, trainPct, valPct, testPct, seed, shuffle, skipInvalid],
  );
  const hasError = Boolean(result.error);

  const copyLines = async (key, lines) => {
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
    } catch {
      setCopiedKey("");
    }
  };

  const downloadLines = (name, lines) => {
    const blob = new Blob([lines.join("\n") + "\n"], { type: "application/jsonl" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setText(DEFAULTS.text);
    setTrainPct(DEFAULTS.trainPct);
    setValPct(DEFAULTS.valPct);
    setTestPct(DEFAULTS.testPct);
    setSeed(DEFAULTS.seed);
    setShuffle(DEFAULTS.shuffle);
    setSkipInvalid(DEFAULTS.skipInvalid);
    setCopiedKey("");
  };

  const splits = hasError
    ? []
    : [
        { key: "train", label: "Train", lines: result.train, count: result.counts.train },
        {
          key: "validation",
          label: "Validation",
          lines: result.validation,
          count: result.counts.validation,
        },
        { key: "test", label: "Test", lines: result.test, count: result.counts.test },
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Split className="h-4 w-4" aria-hidden="true" />
          Dataset tools
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Dataset Train / Test Splitter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste a JSONL dataset (one JSON object per line), pick your split percentages and a seed,
          and download reproducible train, validation and test files. Everything runs in your
          browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="split-input">
          JSONL dataset
        </label>
        <textarea
          id="split-input"
          className="mt-2 min-h-44 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-xs text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
          spellCheck={false}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder='{"prompt": "...", "completion": "..."}'
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="split-train">
              Train %
            </label>
            <input
              id="split-train"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={trainPct}
              onChange={(event) => setTrainPct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="split-val">
              Validation %
            </label>
            <input
              id="split-val"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={valPct}
              onChange={(event) => setValPct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="split-test">
              Test %
            </label>
            <input
              id="split-test"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={testPct}
              onChange={(event) => setTestPct(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="split-seed">
              Random seed
            </label>
            <input
              id="split-seed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              step="1"
              value={seed}
              onChange={(event) => setSeed(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1 sm:flex-row sm:gap-6">
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="split-shuffle"
          >
            <input
              id="split-shuffle"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={shuffle}
              onChange={(event) => setShuffle(event.target.checked)}
            />
            Shuffle before splitting (seeded Fisher–Yates)
          </label>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="split-skip"
          >
            <input
              id="split-skip"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={skipInvalid}
              onChange={(event) => setSkipInvalid(event.target.checked)}
            />
            Skip lines that are not valid JSON
          </label>
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
              Records split
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.total)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `Seed ${result.seed} — the same input and seed always reproduce this exact split.`}
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            aria-label="Reset all inputs to the sample dataset"
            className={PRIMARY_BTN}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Train records", DASH],
                ["Validation records", DASH],
                ["Test records", DASH],
                ["Invalid lines skipped", DASH],
              ]
            : [
                ["Train records", NUM.format(result.counts.train)],
                ["Validation records", NUM.format(result.counts.validation)],
                ["Test records", NUM.format(result.counts.test)],
                ["Invalid lines skipped", NUM.format(result.invalidCount)],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-4 space-y-1 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning}>• {warning}</li>
            ))}
          </ul>
        ) : null}
      </section>

      {splits.length > 0 ? (
        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          {splits.map((split) => (
            <div
              key={split.key}
              className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-4"
            >
              <p className="text-sm font-semibold">{split.label}</p>
              <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
                {NUM.format(split.count)}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">records</p>
              <div className="mt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => copyLines(split.key, split.lines)}
                  disabled={split.count === 0}
                  aria-label={`Copy the ${split.label.toLowerCase()} split as JSONL`}
                  className={`${GHOST_BTN} disabled:opacity-50`}
                >
                  {copiedKey === split.key ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copiedKey === split.key ? "Copied!" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={() => downloadLines(`${split.key}.jsonl`, split.lines)}
                  disabled={split.count === 0}
                  aria-label={`Download ${split.key}.jsonl`}
                  className={`${GHOST_BTN} disabled:opacity-50`}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Split sizes use the largest-remainder method, so the three counts always sum to the total.
        Shuffling uses the mulberry32 seeded PRNG with a Fisher–Yates shuffle for cross-platform
        reproducibility. Your data never leaves the browser.
      </p>
    </main>
  );
}
