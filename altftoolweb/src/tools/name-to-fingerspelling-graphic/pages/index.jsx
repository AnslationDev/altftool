"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Hand, Printer, RotateCcw } from "lucide-react";

import {
  MAX_NAME_LENGTH,
  PACE_PRESETS,
  buildFingerspelling,
  describeStrip,
  estimateSpellingTime,
} from "../lib";

const DEFAULT_NAME = "Anjali";
const DEFAULT_PACE = "steady";
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

function HandDiagram({ geometry, letter }) {
  if (!geometry || geometry.error) return null;
  const { palm, fingers, thumb } = geometry;
  return (
    <svg
      viewBox="0 0 100 120"
      className="h-24 w-full"
      role="img"
      aria-label={`Schematic handshape for the letter ${letter}`}
    >
      <rect
        x={palm.x}
        y={palm.y}
        width={palm.w}
        height={palm.h}
        rx={palm.rx}
        className="fill-[var(--muted)] stroke-[var(--border)]"
        strokeWidth="2"
      />
      {fingers.map((finger) => (
        <rect
          key={finger.key}
          x={finger.x}
          y={finger.y}
          width={finger.w}
          height={finger.h}
          rx={finger.rx}
          className={
            finger.state === "extended"
              ? "fill-[var(--primary)]"
              : "fill-[var(--muted)] stroke-[var(--border)]"
          }
          strokeWidth="2"
        />
      ))}
      <rect
        x={thumb.x}
        y={thumb.y}
        width={thumb.w}
        height={thumb.h}
        rx={thumb.rx}
        transform={`rotate(${thumb.rotate} ${thumb.originX} ${thumb.originY})`}
        className="fill-[var(--foreground)] opacity-70"
      />
    </svg>
  );
}

export default function ToolHome() {
  const [name, setName] = useState(DEFAULT_NAME);
  const [paceId, setPaceId] = useState(DEFAULT_PACE);
  const [showDescriptions, setShowDescriptions] = useState(true);
  const [copied, setCopied] = useState(false);

  const strip = useMemo(() => buildFingerspelling({ name }), [name]);

  const pace = PACE_PRESETS.find((entry) => entry.id === paceId) ?? PACE_PRESETS[1];

  const timing = useMemo(
    () =>
      estimateSpellingTime({
        letterCount: strip.error ? 0 : strip.letterCount,
        lettersPerSecond: pace.lettersPerSecond,
      }),
    [strip, pace],
  );

  const stripText = useMemo(() => describeStrip(strip), [strip]);

  const copyResult = async () => {
    if (!stripText) return;
    try {
      await navigator.clipboard.writeText(stripText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const printStrip = () => {
    if (typeof window !== "undefined") window.print();
  };

  const reset = () => {
    setName(DEFAULT_NAME);
    setPaceId(DEFAULT_PACE);
    setShowDescriptions(true);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Hand className="h-4 w-4" aria-hidden="true" />
          ASL manual alphabet
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Name to Fingerspelling Graphic</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Type a name and get a letter-by-letter strip in the one-handed American Sign Language
          manual alphabet, with a schematic handshape and a written description you can practise from
          or print.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fs-name">
              Name to spell
            </label>
            <input
              id="fs-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              maxLength={MAX_NAME_LENGTH + 10}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fs-pace">
              Practice pace
            </label>
            <select
              id="fs-pace"
              className={`mt-2 ${INPUT_CLASS}`}
              value={paceId}
              onChange={(event) => setPaceId(event.target.value)}
            >
              {PACE_PRESETS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label} ({entry.lettersPerSecond} letter
                  {entry.lettersPerSecond === 1 ? "" : "s"}/second)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label
            htmlFor="fs-descriptions"
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
          >
            <input
              id="fs-descriptions"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={showDescriptions}
              onChange={(event) => setShowDescriptions(event.target.checked)}
            />
            Show handshape descriptions
          </label>
          <button type="button" onClick={printStrip} className={GHOST_BTN}>
            <Printer className="h-4 w-4" aria-hidden="true" />
            Print strip
          </button>
          <button type="button" onClick={reset} aria-label="Reset the name and options" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {strip.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {strip.error}
          </p>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Letters to spell
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Words", "Time at this pace", "Letters that move"].map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Letters to spell
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{strip.letterCount}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Spelling {strip.cleaned}
                </p>
              </div>
              <button
                type="button"
                onClick={copyResult}
                aria-label="Copy the fingerspelling instructions"
                className={GHOST_BTN}
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied!" : "Copy instructions"}
              </button>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Words", String(strip.wordCount)],
                ["Different handshapes used", String(strip.uniqueLetters.length)],
                ["Time at this pace", timing.error ? DASH : timing.label],
                ["Letters that move", strip.movingLetters.length ? strip.movingLetters.join(", ") : "None"],
                ["Characters skipped", strip.droppedCharacters.length ? strip.droppedCharacters.join(" ") : "None"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Fingerspelling strip</h2>
            <ol className="mt-4 grid gap-3 sm:grid-cols-2">
              {strip.items.map((item) => {
                if (item.kind !== "letter") {
                  return (
                    <li
                      key={item.key}
                      className="flex min-h-11 items-center justify-center rounded-lg border border-dashed border-[var(--border)] px-3 py-4 text-sm text-[var(--muted-foreground)]"
                    >
                      {item.kind === "space" ? "Pause between words" : `Hold briefly (${item.char})`}
                    </li>
                  );
                }
                return (
                  <li
                    key={item.key}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-2xl font-semibold text-[var(--primary)]">{item.char}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">{item.palmLabel}</span>
                    </div>
                    <HandDiagram geometry={item.geometry} letter={item.char} />
                    {showDescriptions && (
                      <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                        {item.description}
                      </p>
                    )}
                    {item.motion && (
                      <p className="mt-2 rounded-md bg-[var(--muted)] px-2 py-1 text-xs font-medium">
                        Movement: {item.motion}
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The diagrams are simplified front-on schematics; they cannot show depth, wrist rotation or
        the small contrasts between M, N and T, so read the description alongside each one. This
        covers the one-handed ASL alphabet only — British Sign Language and Indian Sign Language use
        two-handed alphabets with different shapes. Learn from a Deaf teacher or a video source
        before using fingerspelling in conversation.
      </p>
    </main>
  );
}
