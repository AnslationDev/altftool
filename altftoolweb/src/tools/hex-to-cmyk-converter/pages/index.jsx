"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Printer, RotateCcw } from "lucide-react";

import { INK_LIMITS, convertHexToCmyk, formatConversionText } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export default function ToolHome() {
  const [hex, setHex] = useState("#14B8A6");
  const [profile, setProfile] = useState("gracol");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => convertHexToCmyk(hex, profile), [hex, profile]);
  const swatch = result.error ? "#14B8A6" : `#${result.hex}`;

  const copyResult = async () => {
    const text = formatConversionText(result);
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
    setHex("#14B8A6");
    setProfile("gracol");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Printer className="h-4 w-4" aria-hidden="true" />
          Print colour check
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Hex To CMYK Converter</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Convert web hex colours to rounded CMYK percentages, see total ink coverage and catch risky
          colours before sending artwork to print.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cmyk-hex">
              Hex colour
            </label>
            <input id="cmyk-hex" className={`mt-2 ${INPUT_CLASS}`} value={hex} onChange={(event) => setHex(event.target.value)} placeholder="#14B8A6" />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cmyk-profile">
              Ink limit profile
            </label>
            <select id="cmyk-profile" className={`mt-2 ${INPUT_CLASS}`} value={profile} onChange={(event) => setProfile(event.target.value)}>
              {Object.values(INK_LIMITS).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {result.error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
            <div className="min-h-36 rounded-lg ring-1 ring-[var(--border)]" style={{ backgroundColor: swatch }} aria-label={`Colour swatch ${swatch}`} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Converted values</p>
              <h2 className="mt-1 text-2xl font-semibold">#{result.hex}</h2>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-[var(--surface-soft)] p-3">
                  <dt className="text-xs text-[var(--muted-foreground)]">RGB</dt>
                  <dd className="mt-1 font-semibold">{result.r}, {result.g}, {result.b}</dd>
                </div>
                <div className="rounded-lg bg-[var(--surface-soft)] p-3">
                  <dt className="text-xs text-[var(--muted-foreground)]">HSL</dt>
                  <dd className="mt-1 font-semibold">{result.hsl.h}°, {result.hsl.s}%, {result.hsl.l}%</dd>
                </div>
                <div className="rounded-lg bg-[var(--surface-soft)] p-3">
                  <dt className="text-xs text-[var(--muted-foreground)]">CMYK</dt>
                  <dd className="mt-1 font-semibold">{result.c}, {result.m}, {result.y}, {result.k}</dd>
                </div>
                <div className="rounded-lg bg-[var(--surface-soft)] p-3">
                  <dt className="text-xs text-[var(--muted-foreground)]">Total ink</dt>
                  <dd className={result.withinLimit ? "mt-1 font-semibold text-[var(--success)]" : "mt-1 font-semibold text-[var(--danger)]"}>
                    {result.tic}% · {result.withinLimit ? `${fmt.format(result.headroom)}% headroom` : `${fmt.format(Math.abs(result.headroom))}% over`}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button className={GHOST_BTN} type="button" onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <button className={PRIMARY_BTN} type="button" onClick={copyResult}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied" : "Copy result"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
