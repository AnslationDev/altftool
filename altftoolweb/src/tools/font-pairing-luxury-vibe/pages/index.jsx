"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gem, RotateCcw } from "lucide-react";

import { PAIRS, RATIOS, buildLuxuryReport } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [pairId, setPairId] = useState("playfair-lato");
  const [base, setBase] = useState("17");
  const [ratioId, setRatioId] = useState("major-third");
  const [displaySizePx, setDisplaySizePx] = useState("76");
  const [devicePixelRatio, setDevicePixelRatio] = useState("2");
  const [allCaps, setAllCaps] = useState(false);
  const [copied, setCopied] = useState(false);
  const ratio = RATIOS.find((item) => item.id === ratioId)?.value || 1.25;
  const report = useMemo(
    () =>
      buildLuxuryReport({
        pairId,
        base: Number(base),
        ratio,
        displaySizePx: Number(displaySizePx),
        allCaps,
        devicePixelRatio: Number(devicePixelRatio),
      }),
    [pairId, base, ratio, displaySizePx, allCaps, devicePixelRatio],
  );

  const copyCss = async () => {
    if (!report.css) return;
    try {
      await navigator.clipboard.writeText(`${report.fontUrl}\n\n${report.css}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setPairId("playfair-lato"); setBase("17"); setRatioId("major-third"); setDisplaySizePx("76"); setDevicePixelRatio("2"); setAllCaps(false); setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gem className="h-4 w-4" aria-hidden="true" />
          Premium typography
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Luxury Vibe Font Pairing</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a refined serif/sans pair, compute optical tracking and check whether delicate hairlines survive on screen.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold" htmlFor="lf-pair">Font pair</label>
            <select id="lf-pair" className={`mt-2 ${INPUT_CLASS}`} value={pairId} onChange={(event) => setPairId(event.target.value)}>
              {PAIRS.map((pair) => <option key={pair.id} value={pair.id}>{pair.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold" htmlFor="lf-ratio">Scale</label>
            <select id="lf-ratio" className={`mt-2 ${INPUT_CLASS}`} value={ratioId} onChange={(event) => setRatioId(event.target.value)}>
              {RATIOS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold" htmlFor="lf-base">Body px</label>
            <input id="lf-base" className={`mt-2 ${INPUT_CLASS}`} type="number" min="13" max="28" value={base} onChange={(event) => setBase(event.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold" htmlFor="lf-display">Display px</label>
            <input id="lf-display" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" max="400" value={displaySizePx} onChange={(event) => setDisplaySizePx(event.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold" htmlFor="lf-dpr">Device pixel ratio</label>
            <input id="lf-dpr" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" max="4" step="0.25" value={devicePixelRatio} onChange={(event) => setDevicePixelRatio(event.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={allCaps} onChange={(event) => setAllCaps(event.target.checked)} />
            All caps display
          </label>
        </div>
      </section>

      {report.error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">{report.error}</p>
      ) : (
        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Preview</p>
            <h2 className="mt-4 leading-none" style={{ fontFamily: report.pair.heading.stack, fontWeight: report.pair.heading.weight, fontSize: `${Math.min(Number(displaySizePx), 96)}px`, letterSpacing: report.displayTracking.css, textTransform: allCaps ? "uppercase" : "none" }}>
              Quiet luxury, sharper type.
            </h2>
            <p className="mt-5 max-w-prose text-base leading-7" style={{ fontFamily: report.pair.body.stack, fontWeight: report.pair.body.weight, letterSpacing: report.bodyTracking.css }}>
              {report.pair.why} Body copy stays calm while the display face carries the brand signal.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-[var(--surface-soft)] p-3"><p className="text-xs text-[var(--muted-foreground)]">Display tracking</p><p className="mt-1 font-semibold">{report.displayTracking.css}</p></div>
              <div className="rounded-lg bg-[var(--surface-soft)] p-3"><p className="text-xs text-[var(--muted-foreground)]">Hairline</p><p className={report.displayHairline.solid ? "mt-1 font-semibold text-[var(--success)]" : "mt-1 font-semibold text-[var(--warning)]"}>{report.displayHairline.hairlineDevicePx}px device</p></div>
              <div className="rounded-lg bg-[var(--surface-soft)] p-3"><p className="text-xs text-[var(--muted-foreground)]">Small text</p><p className={report.smallHairline.solid ? "mt-1 font-semibold text-[var(--success)]" : "mt-1 font-semibold text-[var(--warning)]"}>{report.smallHairline.solid ? "safe" : `use ${report.smallHairline.minSizePx}px+`}</p></div>
            </div>
          </div>
          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <div className="flex flex-wrap gap-2">
              <button className={GHOST_BTN} type="button" onClick={reset}><RotateCcw className="h-4 w-4" aria-hidden="true" />Reset</button>
              <button className={PRIMARY_BTN} type="button" onClick={copyCss}>{copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}{copied ? "Copied" : "Copy CSS"}</button>
            </div>
            <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--surface-soft)] p-4 text-xs leading-5">{report.css}</pre>
          </div>
        </section>
      )}
    </main>
  );
}
