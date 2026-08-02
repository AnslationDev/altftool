"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Music, RotateCcw } from "lucide-react";

import {
  LANDMARKS,
  MAX_MIDI,
  MIN_MIDI,
  TUNING_PRESETS,
  buildChart,
  frequencyToNote,
  midiToFrequency,
} from "../lib";

const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const NUM3 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  a4: "440",
  midi: "69",
  fromMidi: "21",
  toMidi: "108",
  lookupHz: "329.63",
  useFlats: false,
};

const DASH = "—";

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [a4, setA4] = useState(DEFAULTS.a4);
  const [midi, setMidi] = useState(DEFAULTS.midi);
  const [fromMidi, setFromMidi] = useState(DEFAULTS.fromMidi);
  const [toMidi, setToMidi] = useState(DEFAULTS.toMidi);
  const [lookupHz, setLookupHz] = useState(DEFAULTS.lookupHz);
  const [useFlats, setUseFlats] = useState(DEFAULTS.useFlats);
  const [copied, setCopied] = useState(false);

  const a4Hz = useMemo(() => toNumber(a4), [a4]);

  const selected = useMemo(() => midiToFrequency({ midi: toNumber(midi), a4Hz }), [midi, a4Hz]);

  const lookup = useMemo(
    () => frequencyToNote({ frequency: toNumber(lookupHz), a4Hz }),
    [lookupHz, a4Hz],
  );

  const chart = useMemo(
    () => buildChart({ fromMidi: toNumber(fromMidi), toMidi: toNumber(toMidi), a4Hz }),
    [fromMidi, toMidi, a4Hz],
  );

  const summary = useMemo(() => {
    if (selected.error) return "";
    const lines = [
      "Note Frequency Chart",
      `Tuning reference: A4 = ${a4} Hz`,
      `Selected note: ${selected.name} (MIDI ${selected.midi})`,
      `Frequency: ${NUM3.format(selected.frequency)} Hz`,
      `Period: ${NUM3.format(selected.periodMs)} ms`,
      `Wavelength in air at 20 C: ${NUM3.format(selected.wavelengthMetres)} m`,
    ];
    if (!chart.error) {
      lines.push("");
      lines.push(`Chart range: ${chart.rows[0].name} to ${chart.rows[chart.count - 1].name}`);
      chart.rows.forEach((row) => {
        lines.push(
          `${useFlats ? row.flatName : row.name}\tMIDI ${row.midi}\t${NUM2.format(row.frequency)} Hz`,
        );
      });
    }
    return lines.join("\n");
  }, [selected, chart, a4, useFlats]);

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
    setA4(DEFAULTS.a4);
    setMidi(DEFAULTS.midi);
    setFromMidi(DEFAULTS.fromMidi);
    setToMidi(DEFAULTS.toMidi);
    setLookupHz(DEFAULTS.lookupHz);
    setUseFlats(DEFAULTS.useFlats);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Music className="h-4 w-4" aria-hidden="true" />
          Ear training
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Note Frequency Chart</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Note names, octaves, MIDI numbers and frequencies in twelve-tone equal temperament, with a
          reverse lookup that tells you how many cents sharp or flat a measured pitch is.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="note-a4">
              Tuning reference A4 (Hz)
            </label>
            <input
              id="note-a4"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="380"
              max="500"
              step="0.5"
              value={a4}
              onChange={(event) => setA4(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="note-midi">
              Selected note (MIDI number)
            </label>
            <input
              id="note-midi"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_MIDI}
              max={MAX_MIDI}
              step="1"
              value={midi}
              onChange={(event) => setMidi(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="note-from">
              Chart from (MIDI)
            </label>
            <input
              id="note-from"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_MIDI}
              max={MAX_MIDI}
              step="1"
              value={fromMidi}
              onChange={(event) => setFromMidi(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="note-to">
              Chart to (MIDI)
            </label>
            <input
              id="note-to"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_MIDI}
              max={MAX_MIDI}
              step="1"
              value={toMidi}
              onChange={(event) => setToMidi(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="note-lookup">
              Reverse lookup — measured frequency (Hz)
            </label>
            <input
              id="note-lookup"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={lookupHz}
              onChange={(event) => setLookupHz(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {TUNING_PRESETS.map((preset) => (
            <button
              key={preset.hz}
              type="button"
              className={CHIP_BTN}
              onClick={() => setA4(String(preset.hz))}
            >
              {preset.name}
            </button>
          ))}
          <label
            htmlFor="note-flats"
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)]"
          >
            <input
              id="note-flats"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={useFlats}
              onChange={(event) => setUseFlats(event.target.checked)}
            />
            Show flats instead of sharps
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {LANDMARKS.map((item) => (
            <button
              key={item.midi}
              type="button"
              className={CHIP_BTN}
              onClick={() => setMidi(String(item.midi))}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {selected.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {selected.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {selected.error ? "Selected note" : `${selected.name} frequency`}
            </p>
            <p
              className="mt-1 text-4xl font-semibold text-[var(--primary)]"
              aria-live="polite"
              aria-atomic="true"
            >
              {selected.error ? DASH : `${NUM3.format(selected.frequency)} Hz`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {selected.error
                ? "Pick a MIDI note between 0 and 127."
                : `MIDI ${selected.midi} · octave ${selected.octave} · A4 = ${a4} Hz`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the note frequency chart"
              className={GHOST_BTN}
              disabled={Boolean(selected.error)}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the note chart"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Note name", selected.error ? DASH : selected.name],
            ["Period of one cycle", selected.error ? DASH : `${NUM3.format(selected.periodMs)} ms`],
            [
              "Wavelength in air at 20 °C",
              selected.error ? DASH : `${NUM3.format(selected.wavelengthMetres)} m`,
            ],
            ["One octave below", selected.error ? DASH : `${NUM3.format(selected.frequency / 2)} Hz`],
            ["One octave above", selected.error ? DASH : `${NUM3.format(selected.frequency * 2)} Hz`],
            [
              "Reverse lookup",
              lookup.error ? DASH : `${lookup.name} at ${NUM2.format(lookup.cents)} cents`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {lookup.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {lookup.error}
          </p>
        ) : (
          <p
            className="mt-4 rounded-md bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            aria-live="polite"
            aria-atomic="true"
          >
            {NUM2.format(lookup.frequency)} Hz is{" "}
            <span className="font-semibold text-[var(--foreground)]">{lookup.name}</span>{" "}
            {lookup.inTune
              ? "and is in tune within 5 cents."
              : `and is ${NUM2.format(Math.abs(lookup.cents))} cents ${
                  lookup.cents > 0 ? "sharp" : "flat"
                } of ${NUM2.format(lookup.targetFrequency)} Hz.`}
          </p>
        )}
      </section>

      {chart.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {chart.error}
        </p>
      ) : (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">
            {chart.count} notes from {chart.rows[0].name} to {chart.rows[chart.count - 1].name}
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Note
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    MIDI
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Frequency
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Wavelength
                  </th>
                </tr>
              </thead>
              <tbody>
                {chart.rows.map((row) => (
                  <tr key={row.midi} className="border-b border-[var(--border)] last:border-0">
                    <td
                      className={`py-2 pr-3 font-semibold ${
                        row.isBlackKey ? "text-[var(--muted-foreground)]" : ""
                      }`}
                    >
                      {useFlats ? row.flatName : row.name}
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {row.midi}
                    </td>
                    <td className="py-2 pr-3 text-right">{NUM2.format(row.frequency)} Hz</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {NUM3.format(row.wavelengthMetres)} m
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Frequencies are ideal equal-tempered values. Real instruments deviate: piano tuners stretch
        the octaves, strings and winds bend pitch with temperature and embouchure, and a tuner set to
        a different A4 reference will disagree with this table by the same ratio throughout.
      </p>
    </main>
  );
}
