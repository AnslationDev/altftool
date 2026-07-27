"use client";

import { useMemo, useState } from "react";
import { Baby, Check, Copy, RotateCcw } from "lucide-react";

import { CONTEXTS, PAIRS, buildKidsReport, minimumReadableSize } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const SAMPLE_HEADING = "Let's build a rocket!";
const SAMPLE_BODY =
  "First we fold the paper into a long triangle. Then we tape the sides so no air gets out. When you are ready, count down from five and let it go.";

const toNumber = (raw) => {
  const value = Number(String(raw).trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [pairId, setPairId] = useState(PAIRS[0].id);
  const [contextId, setContextId] = useState("tablet");
  const [age, setAge] = useState("6");
  const [bodySize, setBodySize] = useState("22");
  const [headingScale, setHeadingScale] = useState("2");
  const [copied, setCopied] = useState("");

  const report = useMemo(
    () =>
      buildKidsReport({
        pairId,
        contextId,
        readerAge: toNumber(age),
        bodySizePx: toNumber(bodySize),
        headingScale: toNumber(headingScale),
      }),
    [pairId, contextId, age, bodySize, headingScale],
  );

  const activePair = useMemo(() => PAIRS.find((item) => item.id === pairId) || PAIRS[0], [pairId]);

  const contextTable = useMemo(
    () =>
      CONTEXTS.map((context) => ({
        ...context,
        result: minimumReadableSize({
          distanceMm: context.distanceMm,
          readerAge: toNumber(age),
          xHeightRatio: activePair.body.xHeightRatio,
        }),
      })),
    [age, activePair],
  );

  const summary = useMemo(() => {
    if (report.error) return "";
    return [
      "Kids Brand Font Pairing",
      `Pair: ${report.pair.name}`,
      `Reader age ${age}, ${report.context.label} at ${report.context.distanceMm} mm`,
      `Minimum readable body size: ${report.minimum.fontSizePx} px (${report.minimum.fontSizePt} pt in print)`,
      `Chosen body size: ${bodySize} px — ${report.check.note}`,
      `Line height ${report.spacing.lineHeight}, letter-spacing ${report.spacing.letterSpacingEm}em, word-spacing ${report.spacing.wordSpacingEm}em`,
      "",
      report.css,
    ].join("\n");
  }, [report, age, bodySize]);

  const copy = async (key, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setPairId(PAIRS[0].id);
    setContextId("tablet");
    setAge("6");
    setBodySize("22");
    setHeadingScale("2");
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Baby className="h-4 w-4" aria-hidden="true" />
          Kids type
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Kids Brand Font Pairing</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Playful rounded pairs that stay readable. The minimum body size is calculated from viewing
          distance and reading age using the signage legibility ratio, then adjusted by each body
          face's x-height.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL_CLASS} htmlFor="kb-pair">
          Font pair
        </label>
        <select
          id="kb-pair"
          className={`mt-2 ${INPUT_CLASS}`}
          value={pairId}
          onChange={(event) => setPairId(event.target.value)}
        >
          {PAIRS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{activePair.why}</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kb-context">
              Where it is read
            </label>
            <select
              id="kb-context"
              className={`mt-2 ${INPUT_CLASS}`}
              value={contextId}
              onChange={(event) => setContextId(event.target.value)}
            >
              {CONTEXTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — {item.distanceMm} mm
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kb-age">
              Reader age (years)
            </label>
            <input
              id="kb-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="18"
              step="1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kb-body">
              Body size you plan to use (px)
            </label>
            <input
              id="kb-body"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="8"
              max="200"
              step="1"
              value={bodySize}
              onChange={(event) => setBodySize(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="kb-scale">
              Heading multiplier
            </label>
            <input
              id="kb-scale"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="6"
              step="0.1"
              value={headingScale}
              onChange={(event) => setHeadingScale(event.target.value)}
            />
          </div>
        </div>
      </section>

      {report.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {report.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Minimum readable body size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {report.error ? DASH : `${report.minimum.fontSizePx} px`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {report.error ? DASH : `${report.minimum.fontSizePt} pt in print · ${report.context.label}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("summary", summary)}
              disabled={Boolean(report.error)}
              aria-label="Copy the kids typography summary and CSS"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "summary" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "summary" ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Heading face", report.error ? DASH : `${report.pair.heading.family} ${report.pair.heading.weight}`],
            ["Body face", report.error ? DASH : `${report.pair.body.family} ${report.pair.body.weight}`],
            ["Heading size", report.error ? DASH : `${report.headingPx} px`],
            ["Required x-height", report.error ? DASH : `${report.minimum.xHeightMm} mm (${report.minimum.xHeightPx} px)`],
            ["Legibility ratio used", report.error ? DASH : `1:${report.minimum.ratioUsed} of viewing distance`],
            ["Line height", report.error ? DASH : NUM.format(report.spacing.lineHeight)],
            ["Letter / word spacing", report.error ? DASH : `${report.spacing.letterSpacingEm}em / ${report.spacing.wordSpacingEm}em`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!report.error && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              report.check.pass
                ? "bg-[var(--muted)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
            role={report.check.pass ? undefined : "alert"}
          >
            {report.check.note}
          </p>
        )}
      </section>

      {!report.error && (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Live preview</h2>
            <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p
                style={{
                  fontFamily: report.pair.heading.stack,
                  fontWeight: report.pair.heading.weight,
                  fontSize: `min(${report.headingPx}px, 11vw)`,
                  lineHeight: 1.15,
                }}
              >
                {SAMPLE_HEADING}
              </p>
              <p
                className="mt-4 max-w-prose text-[var(--muted-foreground)]"
                style={{
                  fontFamily: report.pair.body.stack,
                  fontWeight: report.pair.body.weight,
                  fontSize: `${bodySize}px`,
                  lineHeight: report.spacing.lineHeight,
                  letterSpacing: `${report.spacing.letterSpacingEm}em`,
                  wordSpacing: `${report.spacing.wordSpacingEm}em`,
                }}
              >
                {SAMPLE_BODY}
              </p>
            </div>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">{report.spacing.note}</p>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Minimum size by reading distance</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              For a {age}-year-old reading {report.pair.body.family}.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[400px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Context</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Distance</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Minimum px</th>
                    <th scope="col" className="py-2 text-right font-semibold">Minimum pt</th>
                  </tr>
                </thead>
                <tbody>
                  {contextTable.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.label}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{row.distanceMm} mm</td>
                      <td className="py-2 pr-3 text-right">{row.result.error ? DASH : `${row.result.fontSizePx}`}</td>
                      <td className="py-2 text-right text-[var(--muted-foreground)]">
                        {row.result.error ? DASH : `${row.result.fontSizePt}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">CSS</h2>
              <button type="button" onClick={() => copy("css", report.css)} className={PRIMARY_BTN} aria-label="Copy the CSS block">
                {copied === "css" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied === "css" ? "Copied!" : "Copy CSS"}
              </button>
            </div>
            <div className="mt-3 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
              <pre className="text-xs leading-5">{report.css}</pre>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Google Fonts request</h3>
              <button type="button" onClick={() => copy("url", report.fontUrl)} className={GHOST_BTN} aria-label="Copy the Google Fonts URL">
                {copied === "url" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied === "url" ? "Copied!" : "Copy URL"}
              </button>
            </div>
            <div className="mt-2 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
              <pre className="text-xs leading-5 break-all text-[var(--muted-foreground)]">{report.fontUrl}</pre>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        These are design guidelines, not an assessment of any individual child's reading ability.
        Children with dyslexia or low vision may need considerably larger type and more spacing — take
        advice from a teacher or accessibility specialist for learning material.
      </p>
    </main>
  );
}
