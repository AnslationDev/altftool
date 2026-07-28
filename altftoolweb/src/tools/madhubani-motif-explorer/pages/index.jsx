"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Flower2, RotateCcw, Search, Shuffle } from "lucide-react";

import {
  MOTIFS,
  OCCASION_KEYS,
  OCCASION_SETS,
  PIGMENT_SOURCES,
  STYLES,
  STYLE_KEYS,
  THEMES,
  buildComposition,
  filterMotifs,
  planLayout,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = { width: "30", height: "40", border: "3", rows: "4", columns: "3" };

export default function ToolHome() {
  const [sheet, setSheet] = useState(DEFAULTS);
  const [occasion, setOccasion] = useState("wedding");
  const [seed, setSeed] = useState(5);
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("All");
  const [style, setStyle] = useState("All");
  const [copied, setCopied] = useState(false);

  const layout = useMemo(
    () =>
      planLayout({
        width: Number(sheet.width),
        height: Number(sheet.height),
        border: Number(sheet.border),
        rows: Number(sheet.rows),
        columns: Number(sheet.columns),
      }),
    [sheet],
  );
  const hasError = Boolean(layout.error);

  const composition = useMemo(
    () => buildComposition({ occasion, cells: hasError ? 12 : layout.cells, seed }),
    [occasion, hasError, layout.cells, seed],
  );

  const motifs = useMemo(() => filterMotifs({ query, theme, style }), [query, theme, style]);

  const setSheetField = (key) => (event) => setSheet((current) => ({ ...current, [key]: event.target.value }));

  const summary = useMemo(() => {
    if (hasError || composition.error) return "";
    return [
      "Madhubani panel plan",
      `Sheet: ${layout.width} x ${layout.height} cm with a ${layout.border} cm border`,
      `Field: ${layout.innerWidth} x ${layout.innerHeight} cm`,
      `Grid: ${layout.rows} rows x ${layout.columns} columns = ${layout.cells} cells`,
      `Each cell: ${layout.cellWidth} x ${layout.cellHeight} cm (${layout.squareness})`,
      `Border takes ${layout.borderSharePercent}% of the sheet`,
      "",
      `Motif order (${composition.set.label}):`,
      ...composition.motifs.map((motif, index) => `${index + 1}. ${motif.name} (${motif.localName}) — ${motif.meaning}`),
    ].join("\n");
  }, [layout, hasError, composition]);

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
    setSheet(DEFAULTS);
    setOccasion("wedding");
    setSeed(5);
    setQuery("");
    setTheme("All");
    setStyle("All");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Flower2 className="h-4 w-4" aria-hidden="true" />
          Mithila painting
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Madhubani Motif Explorer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {MOTIFS.length} Madhubani motifs with their Maithili names, what each stands for and how it
          is drawn — plus a panel planner that turns a sheet size, border width and grid into exact
          cell measurements and a motif order for the occasion you are painting for.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Panel</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="panel-width">
              Sheet width (cm)
            </label>
            <input
              id="panel-width"
              type="number"
              inputMode="decimal"
              min="5"
              max="300"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sheet.width}
              onChange={setSheetField("width")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="panel-height">
              Sheet height (cm)
            </label>
            <input
              id="panel-height"
              type="number"
              inputMode="decimal"
              min="5"
              max="300"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sheet.height}
              onChange={setSheetField("height")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="panel-border">
              Border band on each side (cm)
            </label>
            <input
              id="panel-border"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sheet.border}
              onChange={setSheetField("border")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="panel-occasion">
              Occasion
            </label>
            <select
              id="panel-occasion"
              className={`mt-2 ${INPUT_CLASS}`}
              value={occasion}
              onChange={(event) => setOccasion(event.target.value)}
            >
              {OCCASION_KEYS.map((key) => (
                <option key={key} value={key}>
                  {OCCASION_SETS[key].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="panel-rows">
              Rows of motifs
            </label>
            <input
              id="panel-rows"
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sheet.rows}
              onChange={setSheetField("rows")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="panel-columns">
              Columns of motifs
            </label>
            <input
              id="panel-columns"
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sheet.columns}
              onChange={setSheetField("columns")}
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">{OCCASION_SETS[occasion].note}</p>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {layout.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Size of each motif cell
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(layout.cellWidth)} × ${NUM.format(layout.cellHeight)} cm`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${layout.cells} cells, ${layout.squareness}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the panel plan" className={GHOST_BTN} disabled={hasError}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the planner" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Field inside the border", hasError ? DASH : `${NUM.format(layout.innerWidth)} × ${NUM.format(layout.innerHeight)} cm`],
            ["Cells to fill", hasError ? DASH : NUM.format(layout.cells)],
            ["Cell aspect ratio", hasError ? DASH : NUM.format(layout.aspect)],
            ["Border share of the sheet", hasError ? DASH : `${NUM.format(layout.borderSharePercent)}%`],
            ["Border band to draw", hasError ? DASH : `${NUM.format(layout.borderLength)} cm of running pattern`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && !composition.error && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Motif order for the grid</h2>
            <button
              type="button"
              onClick={() => setSeed((value) => value + 1)}
              className={GHOST_BTN}
              aria-label="Shuffle the motif order"
            >
              <Shuffle className="h-4 w-4" aria-hidden="true" />
              Reshuffle
            </button>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[340px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Cell</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Motif</th>
                  <th scope="col" className="py-2 font-semibold">Stands for</th>
                </tr>
              </thead>
              <tbody>
                {composition.motifs.map((motif, index) => (
                  <tr key={`${motif.id}-${index}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">
                      R{Math.floor(index / layout.columns) + 1}C{(index % layout.columns) + 1}
                    </td>
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{motif.name}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">{motif.localName}</span>
                    </td>
                    <td className="py-2 text-[var(--muted-foreground)]">{motif.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Motif reference</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="motif-search">
              Search motifs, meanings and occasions
            </label>
            <div className="relative mt-2">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
                aria-hidden="true"
              />
              <input
                id="motif-search"
                className={`${INPUT_CLASS} pl-9`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="lotus, fertility, border"
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="motif-theme">
              Theme
            </label>
            <select
              id="motif-theme"
              className={`mt-2 ${INPUT_CLASS}`}
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
            >
              <option value="All">All themes</option>
              {THEMES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="motif-style">
              Style it suits
            </label>
            <select
              id="motif-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={style}
              onChange={(event) => setStyle(event.target.value)}
            >
              <option value="All">All styles</option>
              {STYLE_KEYS.map((key) => (
                <option key={key} value={key}>
                  {STYLES[key].label} — {STYLES[key].meaning}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          Showing {NUM.format(motifs.length)} of {NUM.format(MOTIFS.length)} motifs
        </p>

        {motifs.length === 0 ? (
          <p className="mt-3 rounded-md border border-[var(--border)] px-3 py-4 text-sm text-[var(--muted-foreground)]">
            Nothing matches that combination. Clear the search box or choose All styles.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {motifs.map((motif) => (
              <li key={motif.id} className="rounded-md border border-[var(--border)] p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">
                    {motif.name} <span className="font-normal text-[var(--muted-foreground)]">· {motif.localName}</span>
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">{motif.theme}</p>
                </div>
                <p className="mt-2 text-sm">{motif.meaning}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {motif.occasion} · {motif.drawing}
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Suits: {motif.styles.map((key) => STYLES[key].label).join(", ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Traditional pigment sources</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Colour</th>
                <th scope="col" className="py-2 font-semibold">Made from</th>
              </tr>
            </thead>
            <tbody>
              {PIGMENT_SOURCES.map((row) => (
                <tr key={row.colour} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{row.colour}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{row.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Madhubani is a living tradition of the Mithila region, still practised by named artists whose
        families have carried particular styles for generations. Use this as a study reference, name
        the tradition when you show work influenced by it, and buy from Mithila artists rather than
        reproducing a signed composition.
      </p>
    </main>
  );
}
