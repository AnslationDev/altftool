"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Music, RotateCcw } from "lucide-react";

import {
  ACCIDENTALS,
  DEFAULT_A4_HZ,
  LETTERS,
  MAX_OCTAVE,
  MIN_OCTAVE,
  SIMPLE_INTERVAL_TABLE,
  computeInterval,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });
const NUM4 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 });

const DASH = "—";

const DEFAULTS = {
  fromLetter: "C",
  fromAccidental: 0,
  fromOctave: 4,
  toLetter: "G",
  toAccidental: 0,
  toOctave: 4,
  a4: DEFAULT_A4_HZ,
};

const OCTAVES = [];
for (let octave = MIN_OCTAVE; octave <= MAX_OCTAVE; octave += 1) OCTAVES.push(octave);

const CONTROL =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const PRESETS = [
  { label: "Perfect fifth", from: ["C", 0, 4], to: ["G", 0, 4] },
  { label: "Major third", from: ["C", 0, 4], to: ["E", 0, 4] },
  { label: "Tritone", from: ["C", 0, 4], to: ["F", 1, 4] },
  { label: "Minor seventh", from: ["A", 0, 3], to: ["G", 0, 4] },
  { label: "Major tenth", from: ["C", 0, 4], to: ["E", 0, 5] },
];

export default function ToolHome() {
  const [fromLetter, setFromLetter] = useState(DEFAULTS.fromLetter);
  const [fromAccidental, setFromAccidental] = useState(DEFAULTS.fromAccidental);
  const [fromOctave, setFromOctave] = useState(DEFAULTS.fromOctave);
  const [toLetter, setToLetter] = useState(DEFAULTS.toLetter);
  const [toAccidental, setToAccidental] = useState(DEFAULTS.toAccidental);
  const [toOctave, setToOctave] = useState(DEFAULTS.toOctave);
  const [a4, setA4] = useState(String(DEFAULTS.a4));
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      computeInterval({
        from: { letter: fromLetter, accidental: fromAccidental, octave: fromOctave },
        to: { letter: toLetter, accidental: toAccidental, octave: toOctave },
        a4Hz: Number(a4),
      }),
    [fromLetter, fromAccidental, fromOctave, toLetter, toAccidental, toOctave, a4],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Music Interval Calculator",
      `${result.fromNote} to ${result.toNote} (${result.direction})`,
      `Interval: ${result.fullName} (${result.shortName})`,
      `Distance: ${result.semitones} semitones = ${result.cents} cents`,
      `Equal-tempered ratio: ${NUM4.format(result.ratio)}:1`,
      `Just ratio: ${result.just.numerator}:${result.just.denominator} (${NUM2.format(result.just.cents)} cents)`,
      `Inversion: ${result.inversion}`,
      `Character: ${result.consonance}`,
      `Frequencies at A4 = ${NUM2.format(Number(a4))} Hz: ${NUM2.format(result.frequencyFrom)} Hz and ${NUM2.format(result.frequencyTo)} Hz`,
    ].join("\n");
  }, [failed, result, a4]);

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
    setFromLetter(DEFAULTS.fromLetter);
    setFromAccidental(DEFAULTS.fromAccidental);
    setFromOctave(DEFAULTS.fromOctave);
    setToLetter(DEFAULTS.toLetter);
    setToAccidental(DEFAULTS.toAccidental);
    setToOctave(DEFAULTS.toOctave);
    setA4(String(DEFAULTS.a4));
    setCopied(false);
  };

  const applyPreset = (preset) => {
    setFromLetter(preset.from[0]);
    setFromAccidental(preset.from[1]);
    setFromOctave(preset.from[2]);
    setToLetter(preset.to[0]);
    setToAccidental(preset.to[1]);
    setToOctave(preset.to[2]);
    setCopied(false);
  };

  const rows = failed
    ? []
    : [
        ["Shorthand", result.shortName],
        ["Semitones", `${result.semitones}`],
        ["Cents (12-TET)", `${result.cents}`],
        ["Direction", result.direction],
        ["Frequency ratio", `${NUM4.format(result.ratio)} : 1`],
        [
          "Pure (just) ratio",
          `${result.just.numerator} : ${result.just.denominator} — ${NUM2.format(result.just.cents)} cents`,
        ],
        [
          "Tempering error",
          `${result.just.temperedDeviationCents >= 0 ? "+" : ""}${NUM2.format(result.just.temperedDeviationCents)} cents vs pure`,
        ],
        ["Inversion", result.inversion],
        ["Enharmonic equivalent", result.enharmonicName],
        ["Character", result.consonance],
        ["MIDI numbers", `${result.midiFrom} and ${result.midiTo}`],
        [
          "Frequencies",
          `${NUM3.format(result.frequencyFrom)} Hz and ${NUM3.format(result.frequencyTo)} Hz`,
        ],
      ];

  const noteFields = (
    prefix,
    label,
    letter,
    setLetter,
    accidental,
    setAccidental,
    octave,
    setOctave,
  ) => (
    <fieldset className="rounded-lg border border-[var(--border)] p-4">
      <legend className="px-1 text-sm font-semibold text-[var(--foreground)]">{label}</legend>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={LABEL} htmlFor={`${prefix}-letter`}>
            Letter
          </label>
          <select
            id={`${prefix}-letter`}
            className={`mt-2 ${CONTROL}`}
            value={letter}
            onChange={(event) => setLetter(event.target.value)}
          >
            {LETTERS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL} htmlFor={`${prefix}-accidental`}>
            Accidental
          </label>
          <select
            id={`${prefix}-accidental`}
            className={`mt-2 ${CONTROL}`}
            value={accidental}
            onChange={(event) => setAccidental(Number(event.target.value))}
          >
            {ACCIDENTALS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL} htmlFor={`${prefix}-octave`}>
            Octave
          </label>
          <select
            id={`${prefix}-octave`}
            className={`mt-2 ${CONTROL}`}
            value={octave}
            onChange={(event) => setOctave(Number(event.target.value))}
          >
            {OCTAVES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
    </fieldset>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Music className="h-4 w-4" aria-hidden="true" />
          Music theory
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Music Interval Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick two notes and get the interval name, its semitone and cent distance, the inversion,
          and how far equal temperament sits from the pure ratio.
        </p>
      </header>

      <section className="grid gap-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        {noteFields(
          "iv-from",
          "First note",
          fromLetter,
          setFromLetter,
          fromAccidental,
          setFromAccidental,
          fromOctave,
          setFromOctave,
        )}
        {noteFields(
          "iv-to",
          "Second note",
          toLetter,
          setToLetter,
          toAccidental,
          setToAccidental,
          toOctave,
          setToOctave,
        )}

        <div className="sm:max-w-xs">
          <label className={LABEL} htmlFor="iv-a4">
            Concert pitch, A4 (Hz)
          </label>
          <input
            id="iv-a4"
            className={`mt-2 ${CONTROL}`}
            type="number"
            inputMode="decimal"
            min="380"
            max="500"
            step="0.5"
            value={a4}
            onChange={(event) => setA4(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Interval
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : result.fullName}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the input above to see the interval."
                : `${result.fromNote} to ${result.toNote} · ${result.semitones} semitones · ${result.cents} cents`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy interval result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset both notes" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(failed
            ? [
                ["Shorthand", DASH],
                ["Semitones", DASH],
                ["Cents (12-TET)", DASH],
                ["Frequency ratio", DASH],
                ["Inversion", DASH],
                ["Character", DASH],
              ]
            : rows
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Semitone reference, 0 to 12</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Equal temperament divides the octave into twelve equal 100-cent steps, so most intervals
          sit a few cents away from the pure whole-number ratio.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  St
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Interval
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Pure ratio
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  12-TET error
                </th>
              </tr>
            </thead>
            <tbody>
              {SIMPLE_INTERVAL_TABLE.map((row) => (
                <tr key={row.semitones} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.semitones}</td>
                  <td className="py-2 pr-3">{row.name}</td>
                  <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                    {row.justRatio}
                  </td>
                  <td className="py-2 text-right">
                    {row.deviationCents >= 0 ? "+" : ""}
                    {NUM2.format(row.deviationCents)} c
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Spelling matters: C to F# is an augmented fourth and C to Gb is a diminished fifth, even
        though both sound like six semitones on a piano.
      </p>
    </main>
  );
}
