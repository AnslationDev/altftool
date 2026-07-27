"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Type } from "lucide-react";

import { MEASURE_IDEAL, PAIRS, RATIOS, buildPairingReport } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const VERDICT_STYLE = {
  comfortable: "text-[var(--success)]",
  narrow: "text-[var(--danger)]",
  wide: "text-[var(--danger)]",
};

const SAMPLE_HEADING = "Design that gets out of the way";
const SAMPLE_BODY =
  "A minimal system leans on one clear hierarchy, generous space and a measure that keeps the eye moving. Nothing decorative, nothing arbitrary — every size in the scale comes from the same ratio, so the page holds together even when the content changes.";

const toNumber = (raw) => {
  const value = Number(String(raw).trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [pairId, setPairId] = useState(PAIRS[0].id);
  const [base, setBase] = useState("17");
  const [ratio, setRatio] = useState("1.25");
  const [measure, setMeasure] = useState(String(MEASURE_IDEAL));
  const [copied, setCopied] = useState("");

  const report = useMemo(
    () =>
      buildPairingReport({
        pairId,
        base: toNumber(base),
        ratio: toNumber(ratio),
        charsPerLine: toNumber(measure),
      }),
    [pairId, base, ratio, measure],
  );

  const activePair = useMemo(() => PAIRS.find((item) => item.id === pairId) || PAIRS[0], [pairId]);

  const summary = useMemo(() => {
    if (report.error) return "";
    return [
      "Minimal Vibe Font Pairing",
      `Pair: ${report.pair.name}`,
      `Headings: ${report.pair.heading.family} ${report.pair.heading.weight}`,
      `Body: ${report.pair.body.family} ${report.pair.body.weight} at ${base} px`,
      `Scale ratio: ${ratio}`,
      `Measure: ${Math.round(report.measure.chars)} characters (${Math.round(report.widthPx)} px column)`,
      `Body line height: ${report.lineHeight.lineHeight}`,
      "",
      report.css,
    ].join("\n");
  }, [report, base, ratio]);

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
    setBase("17");
    setRatio("1.25");
    setMeasure(String(MEASURE_IDEAL));
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Type className="h-4 w-4" aria-hidden="true" />
          Minimal type
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Minimal Vibe Font Pairing</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Six restrained heading and body pairs, each with a modular type scale, a column width derived
          from your target line length, and a line height that starts at the WCAG minimum of 1.5.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL_CLASS} htmlFor="mv-pair">
          Font pair
        </label>
        <select
          id="mv-pair"
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
            <label className={LABEL_CLASS} htmlFor="mv-base">
              Body size (px)
            </label>
            <input
              id="mv-base"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="14"
              max="32"
              step="0.5"
              value={base}
              onChange={(event) => setBase(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mv-ratio">
              Scale ratio
            </label>
            <select
              id="mv-ratio"
              className={`mt-2 ${INPUT_CLASS}`}
              value={ratio}
              onChange={(event) => setRatio(event.target.value)}
            >
              {RATIOS.map((item) => (
                <option key={item.id} value={String(item.value)}>
                  {item.label} — {item.value}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mv-measure">
              Target line length (characters): {measure}
            </label>
            <input
              id="mv-measure"
              className="mt-3 h-11 w-full accent-[var(--primary)]"
              type="range"
              min="35"
              max="100"
              step="1"
              value={measure}
              onChange={(event) => setMeasure(event.target.value)}
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
              Ideal column width
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {report.error ? DASH : `${Math.round(report.widthPx)} px`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {report.error ? DASH : `${Math.round(report.measure.chars)} characters at ${base} px body text`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("summary", summary)}
              disabled={Boolean(report.error)}
              aria-label="Copy the pairing summary and CSS"
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
            ["Body line height", report.error ? DASH : NUM.format(report.lineHeight.lineHeight)],
            ["Measure verdict", report.error ? DASH : report.measure.note],
            ["Scale ratio", report.error ? DASH : NUM.format(report.scale.ratio)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd
                className={`text-right font-semibold ${
                  label === "Measure verdict" && !report.error ? VERDICT_STYLE[report.measure.verdict] : ""
                }`}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
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
                  fontSize: `${report.scale.steps[report.scale.steps.length - 1].px}px`,
                  lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                }}
              >
                {SAMPLE_HEADING}
              </p>
              <p
                className="mt-4 text-[var(--muted-foreground)]"
                style={{
                  fontFamily: report.pair.body.stack,
                  fontWeight: report.pair.body.weight,
                  fontSize: `${report.scale.steps.find((step) => step.step === 0).px}px`,
                  lineHeight: report.lineHeight.lineHeight,
                  maxWidth: `${Math.round(report.widthPx)}px`,
                }}
              >
                {SAMPLE_BODY}
              </p>
            </div>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              The preview uses the full CSS stack. If the family is not installed locally or loaded from
              Google Fonts, your browser falls back to the next face in the stack.
            </p>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Type scale</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[360px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Step</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">px</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">rem</th>
                    <th scope="col" className="py-2 font-semibold">Sample</th>
                  </tr>
                </thead>
                <tbody>
                  {report.scale.steps
                    .slice()
                    .reverse()
                    .map((step) => (
                      <tr key={step.step} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3 font-semibold whitespace-nowrap">{step.name}</td>
                        <td className="py-2 pr-3 text-right">{NUM.format(step.px)}</td>
                        <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{step.rem}</td>
                        <td
                          className="max-w-[10rem] truncate py-2"
                          style={{
                            fontFamily: step.step > 0 ? report.pair.heading.stack : report.pair.body.stack,
                            fontWeight: step.step > 0 ? report.pair.heading.weight : report.pair.body.weight,
                            fontSize: `${Math.min(step.px, 34)}px`,
                          }}
                        >
                          Aa
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
              <pre className="text-xs leading-5 text-[var(--foreground)]">{report.css}</pre>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Google Fonts request</h3>
              <button
                type="button"
                onClick={() => copy("url", report.fontUrl)}
                className={GHOST_BTN}
                aria-label="Copy the Google Fonts URL"
              >
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
        Column widths are calculated from the typographic convention that running lowercase text averages
        half an em per character. Real widths vary by a few percent between families — treat the number as
        a starting point and check it with your actual copy.
      </p>
    </main>
  );
}
