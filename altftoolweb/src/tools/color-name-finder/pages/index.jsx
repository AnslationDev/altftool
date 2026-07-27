"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Palette, RotateCcw } from "lucide-react";

import { findColorNames, formatNamesText } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [hex, setHex] = useState("#14B8A6");
  const [limit, setLimit] = useState("6");
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => findColorNames(hex, Number(limit)), [hex, limit]);

  const copyResult = async () => {
    const text = formatNamesText(result);
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
    setLimit("6");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Palette className="h-4 w-4" aria-hidden="true" />
          Colour naming
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Colour Name Finder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Find the nearest CSS colour keywords and a plain-English colour term using perceptual colour distance.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <div>
            <label className="block text-sm font-semibold" htmlFor="cnf-hex">Hex colour</label>
            <input id="cnf-hex" className={`mt-2 ${INPUT_CLASS}`} value={hex} onChange={(event) => setHex(event.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold" htmlFor="cnf-limit">Matches</label>
            <input id="cnf-limit" className={`mt-2 ${INPUT_CLASS}`} type="number" min="1" max="20" value={limit} onChange={(event) => setLimit(event.target.value)} />
          </div>
        </div>
      </section>

      {result.error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">{result.error}</p>
      ) : (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <div className="grid gap-4 sm:grid-cols-[170px_1fr]">
            <div className="min-h-36 rounded-lg ring-1 ring-[var(--border)]" style={{ backgroundColor: `#${result.hex}` }} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Best description</p>
              <h2 className="mt-1 text-2xl font-semibold">#{result.hex} — {result.description}</h2>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Basic term: {result.basicTerm}. Better readable text over this swatch: {result.betterTextColor}.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-[var(--surface-soft)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">RGB</p>
                  <p className="mt-1 font-semibold">{result.r}, {result.g}, {result.b}</p>
                </div>
                <div className="rounded-lg bg-[var(--surface-soft)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)]">Contrast</p>
                  <p className="mt-1 font-semibold">white {result.contrastOnWhite}:1 · black {result.contrastOnBlack}:1</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {result.matches.map((match) => (
              <div key={match.name} className="flex items-center gap-3 rounded-lg bg-[var(--surface-soft)] p-3">
                <span className="h-10 w-10 rounded-md ring-1 ring-[var(--border)]" style={{ backgroundColor: `#${match.hex}` }} />
                <div>
                  <p className="font-semibold">{match.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">#{match.hex} · ΔE {match.deltaE}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button className={GHOST_BTN} type="button" onClick={reset}><RotateCcw className="h-4 w-4" aria-hidden="true" />Reset</button>
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
