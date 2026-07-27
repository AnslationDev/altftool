"use client";

import { useMemo, useState } from "react";
import { Atom, Check, Copy, Download, RotateCcw } from "lucide-react";

import {
  CATEGORIES,
  compareElements,
  ELEMENTS,
  elementsToCSV,
  findElement,
  formatProperty,
  kelvinToCelsius,
  kelvinToFahrenheit,
  searchElements,
  SORTABLE_PROPERTIES,
  STANDARD_STATES,
} from "../lib";

const DEFAULTS = {
  query: "",
  category: "all",
  block: "all",
  state: "all",
  period: "all",
  sortBy: "atomicNumber",
  sortDir: "asc",
  selected: "Fe",
  compare: ["Fe", "Cu"],
};

const BLOCKS = [
  ["all", "All blocks"],
  ["s", "s-block"],
  ["p", "p-block"],
  ["d", "d-block"],
  ["f", "f-block"],
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

export default function ToolHome() {
  const [query, setQuery] = useState(DEFAULTS.query);
  const [category, setCategory] = useState(DEFAULTS.category);
  const [block, setBlock] = useState(DEFAULTS.block);
  const [state, setState] = useState(DEFAULTS.state);
  const [period, setPeriod] = useState(DEFAULTS.period);
  const [sortBy, setSortBy] = useState(DEFAULTS.sortBy);
  const [sortDir, setSortDir] = useState(DEFAULTS.sortDir);
  const [selected, setSelected] = useState(DEFAULTS.selected);
  const [compare, setCompare] = useState(DEFAULTS.compare);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => searchElements({ query, category, block, state, period, sortBy, sortDir }),
    [query, category, block, state, period, sortBy, sortDir],
  );

  const hasError = Boolean(result.error);
  const element = useMemo(() => findElement(selected), [selected]);
  const comparison = useMemo(() => compareElements(compare), [compare]);

  const toggleCompare = (symbol) => {
    setCompare((current) => {
      if (current.includes(symbol)) return current.filter((entry) => entry !== symbol);
      if (current.length >= 4) return current;
      return [...current, symbol];
    });
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(elementsToCSV(result.elements));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const download = () => {
    if (hasError) return;
    const blob = new Blob([elementsToCSV(result.elements)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "elements.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setQuery(DEFAULTS.query);
    setCategory(DEFAULTS.category);
    setBlock(DEFAULTS.block);
    setState(DEFAULTS.state);
    setPeriod(DEFAULTS.period);
    setSortBy(DEFAULTS.sortBy);
    setSortDir(DEFAULTS.sortDir);
    setSelected(DEFAULTS.selected);
    setCompare(DEFAULTS.compare);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Atom className="h-4 w-4" aria-hidden="true" />
          {ELEMENTS.length} elements
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Periodic Table Query Tool</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Search all 118 confirmed elements by name, symbol or atomic number, filter by category,
          block, period or state, sort on any measured property, and compare up to four side by
          side. Period, group and block are derived from the IUPAC 18-column layout.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pt-query">
              Search by name, symbol or atomic number
            </label>
            <input
              id="pt-query"
              className={`mt-2 ${INPUT_CLASS}`}
              type="search"
              value={query}
              placeholder="iron, Fe, 26…"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="pt-category">
              Category
            </label>
            <select
              id="pt-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="pt-block">
              Orbital block
            </label>
            <select
              id="pt-block"
              className={`mt-2 ${INPUT_CLASS}`}
              value={block}
              onChange={(event) => setBlock(event.target.value)}
            >
              {BLOCKS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="pt-state">
              Standard state at 298 K
            </label>
            <select
              id="pt-state"
              className={`mt-2 ${INPUT_CLASS}`}
              value={state}
              onChange={(event) => setState(event.target.value)}
            >
              <option value="all">Any state</option>
              {STANDARD_STATES.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="pt-period">
              Period
            </label>
            <select
              id="pt-period"
              className={`mt-2 ${INPUT_CLASS}`}
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
            >
              <option value="all">All periods</option>
              {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                <option key={value} value={String(value)}>
                  Period {value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="pt-sort">
              Sort by
            </label>
            <select
              id="pt-sort"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              {SORTABLE_PROPERTIES.map((property) => (
                <option key={property.key} value={property.key}>
                  {property.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="pt-dir">
              Direction
            </label>
            <select
              id="pt-dir"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sortDir}
              onChange={(event) => setSortDir(event.target.value)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </section>

      {hasError && (
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
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Matching elements
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.count}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the filters above to see results." : `of ${ELEMENTS.length} elements`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the filtered element list as CSV"
              className={GHOST_BTN}
              disabled={hasError || result.count === 0}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy CSV"}
            </button>
            <button
              type="button"
              onClick={download}
              aria-label="Download the filtered element list as a CSV file"
              className={GHOST_BTN}
              disabled={hasError || result.count === 0}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download
            </button>
            <button type="button" onClick={reset} aria-label="Reset all filters" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Selected element", element ? `${element.name} (${element.symbol})` : DASH],
            ["Atomic number", element ? String(element.atomicNumber) : DASH],
            ["Atomic mass", element ? formatProperty(element.atomicMass, "u", 4) : DASH],
            [
              "Position",
              element
                ? `Period ${element.period}, ${element.group === null ? "f-block series" : `group ${element.group}`}, ${element.block}-block`
                : DASH,
            ],
            ["Electron configuration", element ? element.electronicConfiguration || DASH : DASH],
            [
              "Electronegativity (Pauling)",
              element ? formatProperty(element.electronegativity, "", 2) : DASH,
            ],
            [
              "First ionisation energy",
              element ? formatProperty(element.ionizationEnergy, "kJ/mol", 1) : DASH,
            ],
            [
              "Melting point",
              element && element.meltingPoint !== null
                ? `${NUM.format(element.meltingPoint)} K (${NUM.format(Number(kelvinToCelsius(element.meltingPoint).toFixed(2)))} °C, ${NUM.format(Number(kelvinToFahrenheit(element.meltingPoint).toFixed(1)))} °F)`
                : DASH,
            ],
            [
              "Boiling point",
              element && element.boilingPoint !== null
                ? `${NUM.format(element.boilingPoint)} K (${NUM.format(Number(kelvinToCelsius(element.boilingPoint).toFixed(2)))} °C)`
                : DASH,
            ],
            ["Density", element ? formatProperty(element.density, "g/cm³", 4) : DASH],
            ["Oxidation states", element ? element.oxidationStates || DASH : DASH],
            ["Year discovered", element ? formatProperty(element.yearDiscovered, "", 0) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Results</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Z</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Symbol</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Name</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Category</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Period / group</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    {SORTABLE_PROPERTIES.find((property) => property.key === sortBy).label}
                  </th>
                  <th scope="col" className="py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {result.elements.map((row) => (
                  <tr key={row.atomicNumber} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.atomicNumber}</td>
                    <td className="py-2 pr-3 font-semibold">{row.symbol}</td>
                    <td className="py-2 pr-3">{row.name}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.category}</td>
                    <td className="py-2 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                      {row.period} / {row.group === null ? "f" : row.group}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {formatProperty(
                        row[sortBy],
                        SORTABLE_PROPERTIES.find((property) => property.key === sortBy).unit,
                      )}
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelected(row.symbol)}
                          aria-label={`Show details for ${row.name}`}
                          className="min-h-11 rounded-md border border-[var(--border)] px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleCompare(row.symbol)}
                          aria-label={
                            compare.includes(row.symbol)
                              ? `Remove ${row.name} from the comparison`
                              : `Add ${row.name} to the comparison`
                          }
                          className={`min-h-11 rounded-md border px-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                            compare.includes(row.symbol)
                              ? "border-[var(--primary)] text-[var(--primary)]"
                              : "border-[var(--border)]"
                          }`}
                        >
                          {compare.includes(row.symbol) ? "In compare" : "Compare"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.count === 0 && (
            <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
              No element matches those filters.
            </p>
          )}
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Comparison</h2>
        {comparison.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {comparison.error}
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Property</th>
                  {comparison.elements.map((entry) => (
                    <th key={entry.symbol} scope="col" className="py-2 pr-3 text-right font-semibold">
                      {entry.symbol}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row) => (
                  <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.label}</td>
                    {row.values.map((value, index) => (
                      <td key={`${row.key}-${comparison.elements[index].symbol}`} className="py-2 pr-3 text-right font-semibold">
                        {formatProperty(value, row.unit)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Blank values mean the property has not been measured — mostly the superheavy synthetic
        elements above Z 104, which exist only as a handful of atoms. Temperatures are stored in
        kelvin and converted with °C = K − 273.15.
      </p>
    </main>
  );
}
