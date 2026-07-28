"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Star } from "lucide-react";

import {
  NAKSHATRAS,
  PADAS_PER_NAKSHATRA,
  buildChart,
  findPadasBySyllable,
  formatLongitude,
  getPadaDetails,
  padaFromLongitude,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const ERROR_CLASS =
  "rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]";

const DEFAULTS = { nakshatra: 14, pada: 2, syllable: "Ma", longitude: "" };
const DASH = "—";

const CHART = buildChart();

export default function ToolHome() {
  const [nakshatra, setNakshatra] = useState(String(DEFAULTS.nakshatra));
  const [pada, setPada] = useState(String(DEFAULTS.pada));
  const [syllable, setSyllable] = useState(DEFAULTS.syllable);
  const [longitude, setLongitude] = useState(DEFAULTS.longitude);
  const [copied, setCopied] = useState(false);

  const selected = useMemo(
    () => getPadaDetails({ nakshatraNumber: Number(nakshatra), pada: Number(pada) }),
    [nakshatra, pada],
  );

  const search = useMemo(() => findPadasBySyllable(syllable), [syllable]);

  const byLongitude = useMemo(() => {
    const raw = longitude.trim();
    if (!raw) return null;
    const value = Number(raw);
    return padaFromLongitude(Number.isFinite(value) ? value : NaN);
  }, [longitude]);

  const summary = useMemo(() => {
    if (selected.error) return "";
    return [
      `${selected.name} — pada ${selected.pada}`,
      `Naming syllable: ${selected.syllable}${selected.altSyllable ? ` (also ${selected.altSyllable})` : ""} / ${selected.devanagari}`,
      `Span: ${selected.startLabel} to ${selected.endLabel}`,
      `Rashi: ${selected.rashi.sanskrit} (${selected.rashi.english})`,
      `Navamsa: ${selected.navamsa.sanskrit} (${selected.navamsa.english})`,
      `Nakshatra lord: ${selected.lord}`,
      `Deity: ${selected.deity}`,
      `Symbol: ${selected.symbol}`,
    ].join("\n");
  }, [selected]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setNakshatra(String(DEFAULTS.nakshatra));
    setPada(String(DEFAULTS.pada));
    setSyllable(DEFAULTS.syllable);
    setLongitude(DEFAULTS.longitude);
    setCopied(false);
  };

  const jumpToPada = (nakshatraNumber, padaNumber) => {
    setNakshatra(String(nakshatraNumber));
    setPada(String(padaNumber));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Star className="h-4 w-4" aria-hidden="true" />
          Nakshatra reference
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Nakshatra Name Letter Chart</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          All 27 nakshatras and their 108 padas, each with the traditional namakarana syllable, its
          3°20′ span on the sidereal zodiac, the rashi and navamsa it falls in, and its Vimshottari lord.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="nak-select">
              Nakshatra
            </label>
            <select
              id="nak-select"
              className={`mt-2 ${INPUT_CLASS}`}
              value={nakshatra}
              onChange={(event) => setNakshatra(event.target.value)}
            >
              {NAKSHATRAS.map((item) => (
                <option key={item.number} value={String(item.number)}>
                  {item.number}. {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pada-select">
              Pada (quarter)
            </label>
            <select
              id="pada-select"
              className={`mt-2 ${INPUT_CLASS}`}
              value={pada}
              onChange={(event) => setPada(event.target.value)}
            >
              {Array.from({ length: PADAS_PER_NAKSHATRA }, (unused, i) => i + 1).map((p) => (
                <option key={p} value={String(p)}>
                  Pada {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        {selected.error ? (
          <p role="alert" className={ERROR_CLASS}>
            {selected.error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Naming syllable
            </p>
            <p className="mt-1 text-5xl font-semibold leading-none text-[var(--primary)]">
              {selected.error ? DASH : selected.syllable}
            </p>
            <p className="mt-2 text-lg text-[var(--foreground)]">
              {selected.error ? DASH : selected.devanagari}
              {!selected.error && selected.altSyllable ? (
                <span className="ml-2 text-sm text-[var(--muted-foreground)]">
                  also written {selected.altSyllable}
                </span>
              ) : null}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {selected.error ? DASH : `${selected.name} · pada ${selected.pada}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy this nakshatra pada detail"
              className={GHOST_BTN}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the chart selection" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Zodiac span", selected.error ? DASH : `${selected.startLabel} to ${selected.endLabel}`],
            ["Rashi (sign)", selected.error ? DASH : `${selected.rashi.sanskrit} (${selected.rashi.english})`],
            ["Navamsa (D-9) sign", selected.error ? DASH : `${selected.navamsa.sanskrit} (${selected.navamsa.english})`],
            ["Nakshatra lord", selected.error ? DASH : selected.lord],
            ["Deity", selected.error ? DASH : selected.deity],
            ["Symbol", selected.error ? DASH : selected.symbol],
            ["Pada number in zodiac", selected.error ? DASH : `${selected.padaIndex + 1} of 108`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Search by starting syllable</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Type the sound a name begins with to see which nakshatra padas traditionally carry it.
        </p>
        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="syllable-search">
            Starting syllable
          </label>
          <input
            id="syllable-search"
            className={`mt-2 ${INPUT_CLASS}`}
            type="text"
            autoComplete="off"
            placeholder="e.g. Ma, Chu, Kh"
            value={syllable}
            onChange={(event) => setSyllable(event.target.value)}
          />
        </div>

        {search.error ? (
          <p role="alert" className={`mt-3 ${ERROR_CLASS}`}>
            {search.error}
          </p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {search.matches.map((match) => (
              <li key={`${match.nakshatraNumber}-${match.pada}`}>
                <button
                  type="button"
                  onClick={() => jumpToPada(match.nakshatraNumber, match.pada)}
                  className="flex min-h-11 w-full items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <span>
                    <span className="font-semibold">{match.syllable}</span>
                    <span className="ml-2 text-[var(--muted-foreground)]">
                      {match.name} · pada {match.pada}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-[var(--muted-foreground)]">
                    {match.rashi.english}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Find the pada from a sidereal longitude</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          If you already know the Moon&apos;s sidereal (nirayana) longitude, enter it in degrees.
        </p>
        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="longitude-input">
            Sidereal longitude (0° to 360°)
          </label>
          <input
            id="longitude-input"
            className={`mt-2 ${INPUT_CLASS}`}
            type="number"
            inputMode="decimal"
            min="0"
            max="359.999"
            step="0.01"
            placeholder="e.g. 176.5"
            value={longitude}
            onChange={(event) => setLongitude(event.target.value)}
          />
        </div>
        {byLongitude ? (
          byLongitude.error ? (
            <p role="alert" className={`mt-3 ${ERROR_CLASS}`}>
              {byLongitude.error}
            </p>
          ) : (
            <p className="mt-3 text-sm">
              <span className="font-semibold">{formatLongitude(Number(longitude))}</span> falls in{" "}
              <span className="font-semibold text-[var(--primary)]">
                {byLongitude.name} pada {byLongitude.pada}
              </span>{" "}
              — naming syllable {byLongitude.syllable} ({byLongitude.devanagari}).
            </p>
          )
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Full chart: 27 nakshatras × 4 padas</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <caption className="sr-only">
              Nakshatra naming syllables by pada with span, lord and deity
            </caption>
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">#</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Nakshatra</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Pada 1</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Pada 2</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Pada 3</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Pada 4</th>
                <th scope="col" className="py-2 font-semibold">Lord</th>
              </tr>
            </thead>
            <tbody>
              {CHART.map((row) => (
                <tr key={row.number} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.number}</td>
                  <td className="py-2 pr-3 font-semibold">{row.name}</td>
                  {row.padas.map((p) => (
                    <td key={p.pada} className="py-2 pr-3">
                      <button
                        type="button"
                        onClick={() => jumpToPada(row.number, p.pada)}
                        className="min-h-11 rounded-md px-2 text-left font-semibold text-[var(--primary)] transition hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                        aria-label={`Show ${row.name} pada ${p.pada}, syllable ${p.syllable}`}
                      >
                        {p.syllable}
                      </button>
                    </td>
                  ))}
                  <td className="py-2 text-[var(--muted-foreground)]">{row.lord}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Reference material for cultural and educational use. Syllable sets vary slightly between
        regional traditions and printed panchangs — Shravana in particular is listed with both a
        Ju/Je/Jo/Gha and a Khi/Khu/Khe/Kho set. Confirm the birth nakshatra and pada with a computed
        panchang or a family priest before a namakarana ceremony.
      </p>
    </main>
  );
}
