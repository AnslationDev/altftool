"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Dumbbell, RotateCcw } from "lucide-react";

import { CAPS_TRACKING_EM, CONTAINERS, PAIRS, buildFitnessReport, fitHeadline } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const toNumber = (raw) => {
  const value = Number(String(raw).trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [pairId, setPairId] = useState(PAIRS[0].id);
  const [headline, setHeadline] = useState("TRAIN HARDER");
  const [containerId, setContainerId] = useState("phone");
  const [customWidth, setCustomWidth] = useState("");
  const [bodySize, setBodySize] = useState("16");
  const [allCaps, setAllCaps] = useState(true);
  const [copied, setCopied] = useState("");

  const report = useMemo(
    () =>
      buildFitnessReport({
        pairId,
        headline,
        containerId,
        customWidthPx: toNumber(customWidth),
        bodySizePx: toNumber(bodySize),
        allCaps,
      }),
    [pairId, headline, containerId, customWidth, bodySize, allCaps],
  );

  const activePair = useMemo(() => PAIRS.find((item) => item.id === pairId) || PAIRS[0], [pairId]);

  const containerTable = useMemo(
    () =>
      CONTAINERS.map((item) => ({
        ...item,
        result: fitHeadline({
          text: headline,
          containerWidthPx: item.widthPx,
          avgCharEm: activePair.heading.avgCharEm,
        }),
      })),
    [headline, activePair],
  );

  const summary = useMemo(() => {
    if (report.error) return "";
    return [
      "Fitness Brand Font Pairing",
      `Pair: ${report.pair.name}`,
      `Headline: "${headline.trim()}" (${report.fit.chars} characters)`,
      `Container: ${report.widthPx} px`,
      `Largest single-line size: ${report.fit.fittedPx} px${report.fit.cappedByMax ? " (capped)" : ""}`,
      `Width used: ${report.fit.usedPx} px, slack ${report.fit.slackPx} px`,
      report.wrapped ? `Wraps as: ${report.wrapped.lines.join(" / ")}` : "",
      report.bodyBudget ? `Body text fits about ${report.bodyBudget.chars} characters per line at ${bodySize} px` : "",
      "",
      report.css,
    ]
      .filter(Boolean)
      .join("\n");
  }, [report, headline, bodySize]);

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
    setHeadline("TRAIN HARDER");
    setContainerId("phone");
    setCustomWidth("");
    setBodySize("16");
    setAllCaps(true);
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Dumbbell className="h-4 w-4" aria-hidden="true" />
          Impact type
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Fitness Brand Font Pairing</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Condensed display faces exist to fit more shout into a fixed width. Enter a headline and a
          container and this works out the largest size that still holds one line, where it wraps, and
          how much copy fits underneath.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL_CLASS} htmlFor="fp-pair">
          Font pair
        </label>
        <select
          id="fp-pair"
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
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fp-headline">
              Headline
            </label>
            <input
              id="fp-headline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={80}
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fp-container">
              Container
            </label>
            <select
              id="fp-container"
              className={`mt-2 ${INPUT_CLASS}`}
              value={containerId}
              onChange={(event) => setContainerId(event.target.value)}
            >
              {CONTAINERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fp-custom">
              Custom width (px, optional)
            </label>
            <input
              id="fp-custom"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="10000"
              step="10"
              placeholder="overrides the preset"
              value={customWidth}
              onChange={(event) => setCustomWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fp-body">
              Body size (px)
            </label>
            <input
              id="fp-body"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="10"
              max="48"
              step="1"
              value={bodySize}
              onChange={(event) => setBodySize(event.target.value)}
            />
          </div>
          <div className="self-end">
            <button
              type="button"
              aria-pressed={allCaps}
              onClick={() => setAllCaps((value) => !value)}
              className={`min-h-11 w-full rounded-md border px-3 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                allCaps
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
              }`}
            >
              Uppercase headline
            </button>
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
              Largest single-line size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {report.error ? DASH : `${report.fit.fittedPx} px`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {report.error ? DASH : `${report.fit.chars} characters across ${report.widthPx} px`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("summary", summary)}
              disabled={Boolean(report.error)}
              aria-label="Copy the fitness type report and CSS"
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
            ["Display face", report.error ? DASH : `${report.pair.heading.family} ${report.pair.heading.weight}`],
            ["Body face", report.error ? DASH : `${report.pair.body.family} ${report.pair.body.weight}`],
            ["Average character width", report.error ? DASH : `${report.pair.heading.avgCharEm}em`],
            ["Exact fit before rounding", report.error ? DASH : `${NUM.format(report.fit.exactPx)} px`],
            ["Width used / slack", report.error ? DASH : `${NUM.format(report.fit.usedPx)} px / ${NUM.format(report.fit.slackPx)} px`],
            ["Wraps to", report.error || !report.wrapped ? DASH : `${report.wrapped.lines.length} line(s)`],
            [
              "Body characters per line",
              report.error || !report.bodyBudget ? DASH : String(report.bodyBudget.chars),
            ],
            ["Caps tracking", report.error ? DASH : allCaps ? `${CAPS_TRACKING_EM}em` : "0em"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!report.error && (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Live preview</h2>
            <div className="mt-4 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p
                style={{
                  fontFamily: report.pair.heading.stack,
                  fontWeight: report.pair.heading.weight,
                  fontSize: `min(${report.fit.fittedPx}px, 13vw)`,
                  lineHeight: 0.95,
                  letterSpacing: `${allCaps ? CAPS_TRACKING_EM : 0}em`,
                  textTransform: allCaps ? "uppercase" : "none",
                }}
              >
                {headline}
              </p>
              <p
                className="mt-4 max-w-prose text-[var(--muted-foreground)]"
                style={{
                  fontFamily: report.pair.body.stack,
                  fontWeight: report.pair.body.weight,
                  fontSize: `${bodySize}px`,
                  lineHeight: 1.55,
                }}
              >
                Six classes a week, one coach, no contract. Book a free trial session and see where your
                baseline actually sits before you commit to anything.
              </p>
            </div>
            {report.wrapped && report.wrapped.lines.length > 1 && (
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                At this size the headline breaks as: {report.wrapped.lines.join(" | ")}
              </p>
            )}
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Same headline, every placement</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[400px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Placement</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Width</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Fits at</th>
                    <th scope="col" className="py-2 text-right font-semibold">Slack</th>
                  </tr>
                </thead>
                <tbody>
                  {containerTable.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.label}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{row.widthPx} px</td>
                      <td className="py-2 pr-3 text-right">{row.result.error ? DASH : `${row.result.fittedPx} px`}</td>
                      <td className="py-2 text-right text-[var(--muted-foreground)]">
                        {row.result.error ? DASH : `${NUM.format(row.result.slackPx)} px`}
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
        Fitting uses each family's average character width, so the result is within a few percent of a
        real render rather than exact. Check the headline against the loaded font before locking a hero
        size, especially with a wide letter like W repeated.
      </p>
    </main>
  );
}
