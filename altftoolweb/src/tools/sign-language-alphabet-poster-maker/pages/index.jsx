"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Grid3x3, Printer, RotateCcw } from "lucide-react";

import { COLUMN_CHOICES, POSTER_SETS, buildPoster, describePoster } from "../lib";

const DEFAULTS = { setId: "letters", columns: "4", described: true, quizMode: false };
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_LABEL =
  "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold";

const GRID_COLUMN_CLASS = {
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-5",
  6: "grid-cols-3 sm:grid-cols-6",
};

function HandDiagram({ geometry, char }) {
  if (!geometry || geometry.error) return null;
  const { palm, fingers, thumb } = geometry;
  return (
    <svg
      viewBox="0 0 100 120"
      className="mx-auto h-20 w-full"
      role="img"
      aria-label={`Schematic handshape for ${char}`}
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
          className={finger.state === "e" ? "fill-[var(--primary)]" : "fill-[var(--muted)] stroke-[var(--border)]"}
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
  const [setId, setSetId] = useState(DEFAULTS.setId);
  const [columns, setColumns] = useState(DEFAULTS.columns);
  const [described, setDescribed] = useState(DEFAULTS.described);
  const [quizMode, setQuizMode] = useState(DEFAULTS.quizMode);
  const [copied, setCopied] = useState(false);

  const poster = useMemo(
    () => buildPoster({ setId, columns: Number(columns), described, quizMode }),
    [setId, columns, described, quizMode],
  );

  const posterText = useMemo(() => describePoster(poster), [poster]);

  const copyResult = async () => {
    if (!posterText) return;
    try {
      await navigator.clipboard.writeText(posterText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSetId(DEFAULTS.setId);
    setColumns(DEFAULTS.columns);
    setDescribed(DEFAULTS.described);
    setQuizMode(DEFAULTS.quizMode);
    setCopied(false);
  };

  const gridClass = poster.error ? "" : GRID_COLUMN_CLASS[poster.columns] || GRID_COLUMN_CLASS[4];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Grid3x3 className="h-4 w-4" aria-hidden="true" />
          Manual alphabet poster
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Sign Language Alphabet Poster Maker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Lay out the one-handed ASL manual alphabet and number handshapes as a printable poster.
          Choose the column count, keep or drop the descriptions, and switch on quiz mode to hide the
          labels for classroom recall practice.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="poster-set">
              Poster content
            </label>
            <select
              id="poster-set"
              className={`mt-2 ${INPUT_CLASS}`}
              value={setId}
              onChange={(event) => setSetId(event.target.value)}
            >
              {POSTER_SETS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label} ({entry.count} handshapes)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="poster-columns">
              Columns
            </label>
            <select
              id="poster-columns"
              className={`mt-2 ${INPUT_CLASS}`}
              value={columns}
              onChange={(event) => setColumns(event.target.value)}
            >
              {COLUMN_CHOICES.map((value) => (
                <option key={value} value={String(value)}>
                  {value} across
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label htmlFor="poster-described" className={CHECK_LABEL}>
            <input
              id="poster-described"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={described}
              onChange={(event) => setDescribed(event.target.checked)}
            />
            Include descriptions
          </label>
          <label htmlFor="poster-quiz" className={CHECK_LABEL}>
            <input
              id="poster-quiz"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={quizMode}
              onChange={(event) => setQuizMode(event.target.checked)}
            />
            Quiz mode (hide letters)
          </label>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") window.print();
            }}
            className={GHOST_BTN}
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            Print poster
          </button>
          <button type="button" onClick={reset} aria-label="Reset poster options" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {poster.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {poster.error}
          </p>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Handshapes on the poster
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Grid", "Printed pages (estimate)", "Look-alike pairs marked"].map((label) => (
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
                  Handshapes on the poster
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{poster.count}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {poster.columns} columns · {poster.rows} rows
                </p>
              </div>
              <button
                type="button"
                onClick={copyResult}
                aria-label="Copy the poster as plain text"
                className={GHOST_BTN}
              >
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied!" : "Copy as text"}
              </button>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Grid", `${poster.columns} across × ${poster.rows} down`],
                ["Printed pages (estimate)", String(poster.pages)],
                ["Handshapes that move", String(poster.movingCount)],
                ["Look-alike pairs marked", String(poster.lookAlikeCount)],
                ["Shape families", poster.groupCounts.map((entry) => `${entry.label} (${entry.count})`).join(", ")],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Poster preview</h2>
            <div className={`mt-4 grid gap-3 ${gridClass}`}>
              {poster.cells.map((cell) => (
                <figure
                  key={cell.char}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-center"
                >
                  <HandDiagram geometry={cell.geometry} char={cell.char} />
                  <figcaption className="mt-2">
                    <span className="block text-2xl font-semibold text-[var(--primary)]">
                      {cell.hideLabel ? "?" : cell.char}
                    </span>
                    {!cell.hideLabel && (
                      <span className="mt-1 block text-xs font-medium">{cell.label}</span>
                    )}
                    {described && !cell.hideLabel && (
                      <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                        {cell.description}
                      </span>
                    )}
                    {cell.motion && !cell.hideLabel && (
                      <span className="mt-2 block rounded-md bg-[var(--muted)] px-2 py-1 text-xs">
                        {cell.motion}
                      </span>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Handshapes people mix up</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Pair</th>
                    <th scope="col" className="py-2 font-semibold">What tells them apart</th>
                  </tr>
                </thead>
                <tbody>
                  {poster.lookAlikes.map((entry) => (
                    <tr key={entry.pair} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold whitespace-nowrap">{entry.pair}</td>
                      <td className="py-2 text-[var(--muted-foreground)]">{entry.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This poster covers the one-handed ASL manual alphabet and ASL number handshapes only.
        British Sign Language, Auslan and the two-handed Indian Sign Language alphabet use a
        different system and are not shown rather than approximated. The diagrams are flat
        schematics — learn the real shapes from a Deaf teacher or a video source.
      </p>
    </main>
  );
}
