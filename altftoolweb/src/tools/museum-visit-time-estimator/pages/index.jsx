"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

import {
  VIEWING_STYLES,
  estimateMuseumVisit,
  formatDuration,
  formatVisitText,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  museum: "A big national museum",
  objectsOnDisplay: "2000",
  galleries: "30",
  style: "normal",
  highlights: "5",
  highlightSeconds: "180",
  secondsPerGallery: "45",
  entryMinutes: "20",
  cloakroomMinutes: "5",
  cafeMinutes: "30",
  shopMinutes: "10",
  restBreakMinutes: "10",
  availableMinutes: "180",
};

function Field({ id, label, value, onChange, min, max, step = "1", hint }) {
  return (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`mt-2 ${INPUT_CLASS}`}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
    </div>
  );
}

export default function ToolHome() {
  const [museum, setMuseum] = useState(DEFAULTS.museum);
  const [objectsOnDisplay, setObjectsOnDisplay] = useState(DEFAULTS.objectsOnDisplay);
  const [galleries, setGalleries] = useState(DEFAULTS.galleries);
  const [style, setStyle] = useState(DEFAULTS.style);
  const [highlights, setHighlights] = useState(DEFAULTS.highlights);
  const [highlightSeconds, setHighlightSeconds] = useState(DEFAULTS.highlightSeconds);
  const [secondsPerGallery, setSecondsPerGallery] = useState(DEFAULTS.secondsPerGallery);
  const [entryMinutes, setEntryMinutes] = useState(DEFAULTS.entryMinutes);
  const [cloakroomMinutes, setCloakroomMinutes] = useState(DEFAULTS.cloakroomMinutes);
  const [cafeMinutes, setCafeMinutes] = useState(DEFAULTS.cafeMinutes);
  const [shopMinutes, setShopMinutes] = useState(DEFAULTS.shopMinutes);
  const [restBreakMinutes, setRestBreakMinutes] = useState(DEFAULTS.restBreakMinutes);
  const [availableMinutes, setAvailableMinutes] = useState(DEFAULTS.availableMinutes);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      estimateMuseumVisit({
        objectsOnDisplay: Number(objectsOnDisplay),
        galleries: Number(galleries),
        style,
        highlights: Number(highlights),
        highlightSeconds: Number(highlightSeconds),
        secondsPerGallery: Number(secondsPerGallery),
        entryMinutes: Number(entryMinutes),
        cloakroomMinutes: Number(cloakroomMinutes),
        cafeMinutes: Number(cafeMinutes),
        shopMinutes: Number(shopMinutes),
        restBreakMinutes: Number(restBreakMinutes),
        availableMinutes: Number(availableMinutes),
      }),
    [
      objectsOnDisplay,
      galleries,
      style,
      highlights,
      highlightSeconds,
      secondsPerGallery,
      entryMinutes,
      cloakroomMinutes,
      cafeMinutes,
      shopMinutes,
      restBreakMinutes,
      availableMinutes,
    ],
  );

  const copyResult = async () => {
    const text = formatVisitText(result, museum);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setMuseum(DEFAULTS.museum);
    setObjectsOnDisplay(DEFAULTS.objectsOnDisplay);
    setGalleries(DEFAULTS.galleries);
    setStyle(DEFAULTS.style);
    setHighlights(DEFAULTS.highlights);
    setHighlightSeconds(DEFAULTS.highlightSeconds);
    setSecondsPerGallery(DEFAULTS.secondsPerGallery);
    setEntryMinutes(DEFAULTS.entryMinutes);
    setCloakroomMinutes(DEFAULTS.cloakroomMinutes);
    setCafeMinutes(DEFAULTS.cafeMinutes);
    setShopMinutes(DEFAULTS.shopMinutes);
    setRestBreakMinutes(DEFAULTS.restBreakMinutes);
    setAvailableMinutes(DEFAULTS.availableMinutes);
    setCopied(false);
  };

  const activeStyle = VIEWING_STYLES.find((item) => item.id === style);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Museum planning
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Museum Visit Time Estimator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Timing studies put the median look at a single work at 17 to 21 seconds. Feed in the size of the
          collection and your pace and this works out how long the visit really takes — and how much of it
          fits in the hours you have.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The museum</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mve-museum">
              Museum
            </label>
            <input
              id="mve-museum"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={museum}
              onChange={(event) => setMuseum(event.target.value)}
            />
          </div>
          <Field
            id="mve-objects"
            label="Objects on display"
            value={objectsOnDisplay}
            onChange={setObjectsOnDisplay}
            min="1"
            step="50"
            hint="On display, not in storage — museums show a small fraction of what they hold."
          />
          <Field id="mve-galleries" label="Gallery rooms" value={galleries} onChange={setGalleries} min="1" />
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mve-style">
              Your viewing pace
            </label>
            <select
              id="mve-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={style}
              onChange={(event) => setStyle(event.target.value)}
            >
              {VIEWING_STYLES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — {item.secondsPerObject}s per object, stopping at {Math.round(item.stopRate * 100)}%
                </option>
              ))}
            </select>
            {activeStyle ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{activeStyle.note}</p>
            ) : null}
          </div>
          <Field
            id="mve-highlights"
            label="Works you will give real time to"
            value={highlights}
            onChange={setHighlights}
            min="0"
          />
          <Field
            id="mve-highlight-secs"
            label="Seconds on each of those"
            value={highlightSeconds}
            onChange={setHighlightSeconds}
            min="0"
            step="30"
          />
          <Field
            id="mve-gallery-secs"
            label="Seconds walking per room"
            value={secondsPerGallery}
            onChange={setSecondsPerGallery}
            min="0"
            step="5"
          />
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Everything that is not looking</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field id="mve-entry" label="Queue, tickets, security (min)" value={entryMinutes} onChange={setEntryMinutes} min="0" step="5" />
          <Field id="mve-cloak" label="Cloakroom and bags (min)" value={cloakroomMinutes} onChange={setCloakroomMinutes} min="0" step="5" />
          <Field id="mve-cafe" label="Café (min)" value={cafeMinutes} onChange={setCafeMinutes} min="0" step="5" />
          <Field id="mve-shop" label="Shop (min)" value={shopMinutes} onChange={setShopMinutes} min="0" step="5" />
          <Field
            id="mve-rest"
            label="Rest break length (min)"
            value={restBreakMinutes}
            onChange={setRestBreakMinutes}
            min="0"
            step="5"
            hint="One is scheduled per hour of gallery time."
          />
          <Field
            id="mve-available"
            label="Time you actually have (min, 0 to skip)"
            value={availableMinutes}
            onChange={setAvailableMinutes}
            min="0"
            step="15"
          />
        </div>
      </section>

      {result.error ? (
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
              Total visit time
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? DASH : formatDuration(result.totalMinutes)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error
                ? "Fix the input above to estimate the visit."
                : `${formatDuration(result.galleryMinutes)} of it in the galleries, at the ${result.style.label.toLowerCase()} pace`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the visit estimate"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy estimate"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Objects you will stop at", result.error ? DASH : result.stoppedObjects.toLocaleString("en-IN")],
            ["Objects you will walk past", result.error ? DASH : result.skippedObjects.toLocaleString("en-IN")],
            ["Share of the collection seen", result.error ? DASH : `${Math.round(result.coverageOfCollectionPct)}%`],
            ["Time looking", result.error ? DASH : formatDuration(result.viewingMinutes)],
            ["Time walking between rooms", result.error ? DASH : formatDuration(result.transitMinutes)],
            ["Rest breaks", result.error ? DASH : `${result.restBreaks} × ${formatDuration(result.restTotalMinutes / Math.max(1, result.restBreaks))}`],
            ["Queue, cloakroom, café, shop", result.error ? DASH : formatDuration(result.fixedMinutes)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!result.error && result.reverse && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">In the time you actually have</h2>
          <p
            className={`mt-3 rounded-md px-3 py-3 text-sm font-semibold ${
              result.reverse.feasible
                ? "bg-[var(--muted)] text-[var(--foreground)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
            {...(result.reverse.feasible ? {} : { role: "alert" })}
          >
            {result.reverse.message}
          </p>
          {result.reverse.feasible && (
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {[
                ["Objects you can stop at", result.reverse.objectsPossible.toLocaleString("en-IN")],
                ["Share of the collection", `${Math.round(result.reverse.coveragePct * 10) / 10}%`],
                ["Gallery time inside the budget", formatDuration(result.reverse.galleryBudgetMinutes)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      )}

      {!result.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Where the time goes</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Part of the visit</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Time</th>
                  <th scope="col" className="py-2 text-right font-semibold">Share</th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown
                  .filter((row) => row.minutes > 0)
                  .map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.label}</td>
                      <td className="py-2 pr-3 text-right">{formatDuration(row.minutes)}</td>
                      <td className="py-2 text-right text-[var(--muted-foreground)]">{Math.round(row.share)}%</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {result.notes.length > 0 && (
            <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
              {result.notes.map((note) => (
                <li key={note} className="rounded-md bg-[var(--muted)] px-3 py-2">
                  {note}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        An estimate from published visitor-timing research applied to the numbers you enter. Check the
        museum's own site for the objects on display, current queue advice and closing times before fixing
        a plan.
      </p>
    </main>
  );
}
