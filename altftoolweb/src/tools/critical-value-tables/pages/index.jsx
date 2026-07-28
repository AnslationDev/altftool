"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sigma, Table2 } from "lucide-react";

import {
  DEFAULT_ALPHAS,
  F_ALPHAS,
  buildTable,
  solve,
  stripInfinityTokens,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "mb-1.5 block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD_CLASS =
  "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 text-[var(--card-foreground)]";
const DASH = "—";

const MODES = [
  ["table", "Table"],
  ["solve", "Solve"],
];

const DISTS = [
  ["t", "Student t"],
  ["z", "Normal z"],
  ["chi2", "Chi-square χ²"],
  ["f", "F"],
];

const DEFAULTS = {
  mode: "table",
  dist: "t",
  tails: 2,
  chiTail: "upper",
  dfRows: "1-30, 40, 60, 120, inf",
  fAlpha: "0.05",
  df1List: "1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 24, 30, inf",
  df2List: "1-20, 25, 30, 40, 60, 120, inf",
  statistic: "2.5",
  alpha: "0.05",
  solveDf: "10",
  solveDf1: "3",
  solveDf2: "10",
};

const decimalFmt = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});
const preciseFmt = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 6,
  maximumFractionDigits: 6,
});

/** Format a table cell. Presentation only — no statistics happen here. */
function formatCell(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return DASH;
  if (Math.abs(value) >= 0.001) return decimalFmt.format(value);
  return value.toExponential(3);
}

/** Format a probability. Presentation only. */
function formatProbability(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return DASH;
  if (value >= 0.0001) return preciseFmt.format(value);
  return value.toExponential(4);
}

function SegmentedGroup({ legend, options, value, onChange, name }) {
  return (
    <fieldset>
      <legend className={LABEL_CLASS}>{legend}</legend>
      <div className="flex flex-wrap gap-2" role="group" aria-label={legend}>
        {options.map(([optionValue, label]) => {
          const active = value === optionValue;
          return (
            <button
              key={String(optionValue)}
              type="button"
              name={name}
              aria-pressed={active}
              onClick={() => onChange(optionValue)}
              className={`inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                active
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function ErrorNote({ message }) {
  return (
    <p
      role="alert"
      className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
    >
      {message}
    </p>
  );
}

function DetailRow({ term, value, mono = false }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-[var(--border)] py-2 first:border-t-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{term}</dt>
      <dd
        className={`text-sm font-semibold text-[var(--foreground)] ${mono ? "font-mono" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [dist, setDist] = useState(DEFAULTS.dist);
  const [tails, setTails] = useState(DEFAULTS.tails);
  const [chiTail, setChiTail] = useState(DEFAULTS.chiTail);
  const [dfRows, setDfRows] = useState(DEFAULTS.dfRows);
  const [fAlpha, setFAlpha] = useState(DEFAULTS.fAlpha);
  const [df1List, setDf1List] = useState(DEFAULTS.df1List);
  const [df2List, setDf2List] = useState(DEFAULTS.df2List);
  const [statistic, setStatistic] = useState(DEFAULTS.statistic);
  const [alpha, setAlpha] = useState(DEFAULTS.alpha);
  const [solveDf, setSolveDf] = useState(DEFAULTS.solveDf);
  const [solveDf1, setSolveDf1] = useState(DEFAULTS.solveDf1);
  const [solveDf2, setSolveDf2] = useState(DEFAULTS.solveDf2);
  const [copied, setCopied] = useState(false);

  const table = useMemo(
    () =>
      buildTable({
        dist,
        dfRows,
        tails,
        chiTail,
        alpha: Number(fAlpha),
        df1List,
        df2List,
        alphas: DEFAULT_ALPHAS,
      }),
    [dist, dfRows, tails, chiTail, fAlpha, df1List, df2List],
  );

  const answer = useMemo(
    () =>
      solve({
        dist,
        statistic,
        alpha,
        df: solveDf,
        df1: solveDf1,
        df2: solveDf2,
        tails,
        chiTail,
      }),
    [dist, statistic, alpha, solveDf, solveDf1, solveDf2, tails, chiTail],
  );

  const tableFailed = Boolean(table.error);
  const solveFailed = Boolean(answer.error);

  function handleDistChange(next) {
    setDist(next);
    // Chi-square has no ∞ degrees-of-freedom row, so carrying a t-table row
    // list across would only produce an error. Drop the token visibly instead.
    if (next === "chi2") setDfRows((current) => stripInfinityTokens(current));
  }

  function resetAll() {
    setMode(DEFAULTS.mode);
    setDist(DEFAULTS.dist);
    setTails(DEFAULTS.tails);
    setChiTail(DEFAULTS.chiTail);
    setDfRows(DEFAULTS.dfRows);
    setFAlpha(DEFAULTS.fAlpha);
    setDf1List(DEFAULTS.df1List);
    setDf2List(DEFAULTS.df2List);
    setStatistic(DEFAULTS.statistic);
    setAlpha(DEFAULTS.alpha);
    setSolveDf(DEFAULTS.solveDf);
    setSolveDf1(DEFAULTS.solveDf1);
    setSolveDf2(DEFAULTS.solveDf2);
    setCopied(false);
  }

  async function copyResult() {
    let text = "";
    if (mode === "table") {
      if (tableFailed) return;
      const head = [table.rowHeader, ...table.header].join("\t");
      const body = table.rows
        .map((row) => [row.label, ...row.cells.map(formatCell)].join("\t"))
        .join("\n");
      text = `${table.caption}\n${head}\n${body}\n${table.note}`;
    } else {
      if (solveFailed) return;
      text = [
        `${answer.distLabel} — ${answer.tailLabel}`,
        `Degrees of freedom: ${answer.dfLabel}`,
        `Observed statistic: ${answer.statistic}`,
        `p-value: ${formatProbability(answer.pValue)}`,
        `Critical value at alpha = ${answer.alpha}: ${formatCell(answer.critical)}`,
      ].join("\n");
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  // The z table prints both the one- and two-tailed rows, so the tail control
  // would do nothing there; it only matters for z in Solve mode.
  const showTails = dist === "t" || (dist === "z" && mode === "solve");
  const showChiTail = dist === "chi2";

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 text-[var(--foreground)]">
      <header className="flex flex-col gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Sigma className="size-6 text-[var(--primary)]" aria-hidden="true" />
          Critical Value Tables
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          t, z, chi-square and F critical values computed from the distribution
          functions themselves — so the degrees of freedom are whatever you type,
          not the handful a printed table had room for.
        </p>
      </header>

      <section className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <SegmentedGroup
            legend="Mode"
            name="mode"
            options={MODES}
            value={mode}
            onChange={setMode}
          />
          <SegmentedGroup
            legend="Distribution"
            name="dist"
            options={DISTS}
            value={dist}
            onChange={handleDistChange}
          />
        </div>

        {showTails ? (
          <SegmentedGroup
            legend="Tails"
            name="tails"
            options={[
              [2, "Two-tailed"],
              [1, "One-tailed"],
            ]}
            value={tails}
            onChange={setTails}
          />
        ) : null}

        {showChiTail ? (
          <SegmentedGroup
            legend="Which tail holds α"
            name="chiTail"
            options={[
              ["upper", "Upper tail"],
              ["lower", "Lower tail"],
            ]}
            value={chiTail}
            onChange={setChiTail}
          />
        ) : null}
      </section>

      {mode === "table" ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Table settings</h2>
          {dist === "z" ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              The standard normal has no degrees of freedom, so its table is a
              single pair of rows across the usual α levels.
            </p>
          ) : null}

          {dist === "t" || dist === "chi2" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="cvt-df-rows">
                Degrees of freedom (rows)
              </label>
              <input
                id="cvt-df-rows"
                type="text"
                inputMode="text"
                className={INPUT_CLASS}
                value={dfRows}
                onChange={(event) => setDfRows(event.target.value)}
              />
              <p className={HINT_CLASS}>
                Commas and ranges both work: <code>1-30, 40, 60, 120, inf</code>.
                Fractional df such as <code>18.7</code> from a Welch–Satterthwaite
                correction is accepted{dist === "t" ? "; ∞ gives the normal limit" : ""}.
              </p>
            </div>
          ) : null}

          {dist === "f" ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className={LABEL_CLASS} htmlFor="cvt-f-alpha">
                  Significance level α
                </label>
                <select
                  id="cvt-f-alpha"
                  className={INPUT_CLASS}
                  value={fAlpha}
                  onChange={(event) => setFAlpha(event.target.value)}
                >
                  {F_ALPHAS.map((value) => (
                    <option key={value} value={String(value)}>
                      {value}
                    </option>
                  ))}
                </select>
                <p className={HINT_CLASS}>
                  An F table carries one α per sheet, with df₁ across the top.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor="cvt-df1">
                    Numerator df₁ (columns)
                  </label>
                  <input
                    id="cvt-df1"
                    type="text"
                    className={INPUT_CLASS}
                    value={df1List}
                    onChange={(event) => setDf1List(event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor="cvt-df2">
                    Denominator df₂ (rows)
                  </label>
                  <input
                    id="cvt-df2"
                    type="text"
                    className={INPUT_CLASS}
                    value={df2List}
                    onChange={(event) => setDf2List(event.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {tableFailed ? <ErrorNote message={table.error} /> : null}

          <div className={CARD_CLASS}>
            <h3 className="text-base font-semibold">
              {tableFailed ? "Critical values" : table.caption}
            </h3>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {tableFailed
                ? "Fix the input above to see the table."
                : table.note}
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-max border-collapse text-sm">
                <caption className="sr-only">
                  {tableFailed ? "Critical values" : table.caption}
                </caption>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="sticky left-0 z-10 bg-[var(--card)] px-3 py-2 text-left font-semibold"
                    >
                      {tableFailed ? "df" : table.rowHeader}
                    </th>
                    {(tableFailed ? DEFAULT_ALPHAS.map((a) => `α = ${a}`) : table.header).map(
                      (label) => (
                        <th
                          key={label}
                          scope="col"
                          className="px-3 py-2 text-right font-semibold whitespace-nowrap"
                        >
                          {label}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {tableFailed ? (
                    <tr className="border-t border-[var(--border)]">
                      <th
                        scope="row"
                        className="sticky left-0 z-10 bg-[var(--card)] px-3 py-2 text-left font-medium"
                      >
                        {DASH}
                      </th>
                      {DEFAULT_ALPHAS.map((a) => (
                        <td key={a} className="px-3 py-2 text-right font-mono">
                          {DASH}
                        </td>
                      ))}
                    </tr>
                  ) : (
                    table.rows.map((row) => (
                      <tr key={row.label} className="border-t border-[var(--border)]">
                        <th
                          scope="row"
                          className="sticky left-0 z-10 bg-[var(--card)] px-3 py-2 text-left font-medium whitespace-nowrap"
                        >
                          {row.label}
                        </th>
                        {row.cells.map((cell, index) => (
                          <td
                            key={table.header[index]}
                            className="px-3 py-2 text-right font-mono whitespace-nowrap"
                          >
                            {formatCell(cell)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Observed value</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="cvt-statistic">
                Observed test statistic
              </label>
              <input
                id="cvt-statistic"
                type="number"
                step="any"
                inputMode="decimal"
                className={INPUT_CLASS}
                value={statistic}
                onChange={(event) => setStatistic(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="cvt-alpha">
                Significance level α
              </label>
              <input
                id="cvt-alpha"
                type="number"
                step="any"
                min="0"
                max="1"
                inputMode="decimal"
                className={INPUT_CLASS}
                value={alpha}
                onChange={(event) => setAlpha(event.target.value)}
              />
            </div>
            {dist === "t" || dist === "chi2" ? (
              <div>
                <label className={LABEL_CLASS} htmlFor="cvt-solve-df">
                  Degrees of freedom
                </label>
                <input
                  id="cvt-solve-df"
                  type="text"
                  inputMode="decimal"
                  className={INPUT_CLASS}
                  value={solveDf}
                  onChange={(event) => setSolveDf(event.target.value)}
                />
                <p className={HINT_CLASS}>
                  {dist === "t"
                    ? "Any positive number, including fractional df and inf."
                    : "Any positive number of degrees of freedom."}
                </p>
              </div>
            ) : null}
            {dist === "f" ? (
              <>
                <div>
                  <label className={LABEL_CLASS} htmlFor="cvt-solve-df1">
                    Numerator df₁
                  </label>
                  <input
                    id="cvt-solve-df1"
                    type="text"
                    inputMode="decimal"
                    className={INPUT_CLASS}
                    value={solveDf1}
                    onChange={(event) => setSolveDf1(event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor="cvt-solve-df2">
                    Denominator df₂
                  </label>
                  <input
                    id="cvt-solve-df2"
                    type="text"
                    inputMode="decimal"
                    className={INPUT_CLASS}
                    value={solveDf2}
                    onChange={(event) => setSolveDf2(event.target.value)}
                  />
                </div>
              </>
            ) : null}
          </div>

          {solveFailed ? <ErrorNote message={answer.error} /> : null}

          <div className={CARD_CLASS}>
            <p className="text-sm text-[var(--muted-foreground)]">
              Exact p-value
            </p>
            <p className="mt-1 font-mono text-4xl font-bold tracking-tight text-[var(--foreground)]">
              {solveFailed ? DASH : formatProbability(answer.pValue)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {solveFailed
                ? "Fix the input above to see the result."
                : `${answer.distLabel}, ${answer.tailLabel}`}
            </p>

            <dl className="mt-4">
              <DetailRow
                term={`Critical value at α = ${solveFailed ? DASH : answer.alpha}`}
                value={solveFailed ? DASH : formatCell(answer.critical)}
                mono
              />
              <DetailRow
                term="Degrees of freedom"
                value={solveFailed ? DASH : answer.dfLabel}
                mono
              />
              <DetailRow
                term="Observed statistic"
                value={solveFailed ? DASH : String(answer.statistic)}
                mono
              />
              <DetailRow
                term="p against α"
                value={
                  solveFailed
                    ? DASH
                    : answer.pBelowAlpha
                      ? "p ≤ α"
                      : "p > α"
                }
              />
              <DetailRow
                term="Statistic against critical value"
                value={
                  solveFailed
                    ? DASH
                    : answer.exceedsCritical
                      ? "in the rejection region"
                      : "outside the rejection region"
                }
              />
              <DetailRow
                term="p computed as"
                value={solveFailed ? DASH : answer.pFormula}
                mono
              />
              <DetailRow
                term="Critical value defined as"
                value={solveFailed ? DASH : answer.criticalFormula}
                mono
              />
            </dl>

            <p className="mt-4 text-xs text-[var(--muted-foreground)]">
              These are the numbers the distribution produces under the fixed-α
              rule. What they mean for your study is a judgement this page does
              not make.
            </p>
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={copyResult}
          className={PRIMARY_BTN}
          aria-label={
            mode === "table"
              ? "Copy the critical value table"
              : "Copy the p-value and critical value"
          }
          disabled={mode === "table" ? tableFailed : solveFailed}
        >
          {copied ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <Copy className="size-4" aria-hidden="true" />
          )}
          {copied ? "Copied!" : mode === "table" ? "Copy table" : "Copy result"}
        </button>
        <button
          type="button"
          onClick={resetAll}
          className={GHOST_BTN}
          aria-label="Reset every field to its default"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      <section className={CARD_CLASS}>
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Table2 className="size-5 text-[var(--primary)]" aria-hidden="true" />
          How these numbers are produced
        </h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Nothing here is looked up. Each tail probability is evaluated from the
          regularised incomplete beta function I<sub>x</sub>(a, b) and the
          regularised incomplete gamma functions P(a, x) and Q(a, x), both
          computed with continued fractions run by the modified Lentz algorithm
          to a relative tolerance of 1e-15. Critical values invert those tails by
          bracketed bisection to a relative width of 1e-13.
        </p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Checked against published tables and against exact identities that
          hold independently — χ²(0.05, 1) = z(0.05, two-tailed)², F(α; 1, v) =
          t(α, two-tailed; v)², and t(α; ∞) = z(α) — the values agree to better
          than 1e-12 relative, far beyond the three decimals a printed table
          shows. Pure mathematics: there is no data source and nothing here goes
          out of date.
        </p>
      </section>
    </div>
  );
}
