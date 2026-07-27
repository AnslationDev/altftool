"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Map, RotateCcw } from "lucide-react";

import {
  CURRENCIES,
  QUALITY_LEVELS,
  TOUR_STYLES,
  cashPlan,
  computeTourTips,
  defaultRolesFor,
  findStyle,
  isPerDay,
} from "../lib";

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_STYLE = "escorted-coach";
const DEFAULT_QUALITY = "standard";
const DEFAULT_DAYS = "10";
const DEFAULT_TRAVELLERS = "2";
const DEFAULT_CURRENCY = "USD";
const DEFAULT_NOTE_SIZE = "20";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

const asRows = (styleId, quality, days) =>
  defaultRolesFor(styleId, quality, days).map((role) => ({
    ...role,
    rate: String(role.rate),
    units: String(role.units),
  }));

export default function ToolHome() {
  const [styleId, setStyleId] = useState(DEFAULT_STYLE);
  const [quality, setQuality] = useState(DEFAULT_QUALITY);
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [travellers, setTravellers] = useState(DEFAULT_TRAVELLERS);
  const [currencyCode, setCurrencyCode] = useState(DEFAULT_CURRENCY);
  const [noteSize, setNoteSize] = useState(DEFAULT_NOTE_SIZE);
  const [rows, setRows] = useState(() => asRows(DEFAULT_STYLE, DEFAULT_QUALITY, toNumber(DEFAULT_DAYS)));
  const [copied, setCopied] = useState(false);

  const currency = CURRENCIES.find((item) => item.code === currencyCode) ?? CURRENCIES[0];
  const money = useMemo(() => {
    const formatter = new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      maximumFractionDigits: 0,
    });
    return (value) => formatter.format(Number.isFinite(value) ? value : 0);
  }, [currency]);
  const pct = useMemo(() => {
    const formatter = new Intl.NumberFormat(currency.locale, { maximumFractionDigits: 1 });
    return (value) => `${formatter.format(Number.isFinite(value) ? value : 0)}%`;
  }, [currency]);

  const style = findStyle(styleId) ?? TOUR_STYLES[0];

  const result = useMemo(() => {
    const dayCount = toNumber(days);
    const partySize = toNumber(travellers);
    if (Number.isNaN(dayCount) || Number.isNaN(partySize)) {
      return { error: "Enter a valid number of days and travellers." };
    }
    const parsed = rows.map((row) => ({
      ...row,
      rate: toNumber(row.rate),
      units: toNumber(row.units),
    }));
    if (parsed.some((row) => row.include !== false && (Number.isNaN(row.rate) || Number.isNaN(row.units)))) {
      return { error: "Every switched-on role needs a numeric rate and count." };
    }
    return computeTourTips({ days: dayCount, travellers: partySize, roles: parsed });
  }, [days, travellers, rows]);

  const failed = Boolean(result.error);

  const cash = useMemo(() => {
    if (failed) return null;
    const note = toNumber(noteSize);
    if (Number.isNaN(note)) return null;
    const plan = cashPlan(result.total, note);
    return plan.error ? null : plan;
  }, [failed, result, noteSize]);

  const applyStyle = (nextStyle) => {
    setStyleId(nextStyle);
    setRows(asRows(nextStyle, quality, toNumber(days)));
  };

  const applyQuality = (nextQuality) => {
    setQuality(nextQuality);
    setRows(asRows(styleId, nextQuality, toNumber(days)));
  };

  const applyDays = (nextDays) => {
    setDays(nextDays);
    const dayCount = toNumber(nextDays);
    if (Number.isNaN(dayCount) || dayCount <= 0) return;
    setRows((current) =>
      current.map((row) => (isPerDay(row.basis) ? { ...row, units: String(Math.round(dayCount)) } : row)),
    );
  };

  const updateRow = (id, patch) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const summary = useMemo(() => {
    if (failed) return "";
    const lines = [
      `Tour tip plan — ${style.label}`,
      `${result.days} days, ${result.travellers} traveller${result.travellers === 1 ? "" : "s"}`,
      "",
      ...result.rows.map(
        (row) => `${row.label}: ${money(row.amount)} (${money(row.rate)} × ${row.units} ${row.unitLabel}${row.units === 1 ? "" : "s"}${row.people > 1 ? ` × ${row.people} people` : ""})`,
      ),
      "",
      `Total tips: ${money(result.total)}`,
      `Per traveller: ${money(result.perTraveller)}`,
      `Per traveller per day: ${money(result.perTravellerPerDay)}`,
    ];
    if (cash) lines.push(`Cash to draw: ${cash.notes} × ${money(cash.denomination)} = ${money(cash.withdraw)}`);
    return lines.join("\n");
  }, [failed, result, style, money, cash]);

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
    setStyleId(DEFAULT_STYLE);
    setQuality(DEFAULT_QUALITY);
    setDays(DEFAULT_DAYS);
    setTravellers(DEFAULT_TRAVELLERS);
    setCurrencyCode(DEFAULT_CURRENCY);
    setNoteSize(DEFAULT_NOTE_SIZE);
    setRows(asRows(DEFAULT_STYLE, DEFAULT_QUALITY, toNumber(DEFAULT_DAYS)));
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Map className="h-4 w-4" aria-hidden="true" />
          Tour tipping
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Tour Guide and Driver Tip Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Totals the cash you need for guides, drivers, porters and camp crew across a whole trip,
          using the per-person-per-day rates tour operators publish in their pre-departure notes.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tour-style">
              Style of trip
            </label>
            <select
              id="tour-style"
              className={`mt-2 ${INPUT_CLASS}`}
              value={styleId}
              onChange={(event) => applyStyle(event.target.value)}
            >
              {TOUR_STYLES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{style.note}</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="tour-days">
              Length of tour (days)
            </label>
            <input
              id="tour-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="365"
              step="1"
              value={days}
              onChange={(event) => applyDays(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="tour-travellers">
              Travellers in your party
            </label>
            <input
              id="tour-travellers"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="100"
              step="1"
              value={travellers}
              onChange={(event) => setTravellers(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="tour-quality">
              How generous
            </label>
            <select
              id="tour-quality"
              className={`mt-2 ${INPUT_CLASS}`}
              value={quality}
              onChange={(event) => applyQuality(event.target.value)}
            >
              {QUALITY_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="tour-currency">
              Show amounts in
            </label>
            <select
              id="tour-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={currencyCode}
              onChange={(event) => setCurrencyCode(event.target.value)}
            >
              {CURRENCIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code} — {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-4 rounded-md bg-[var(--info-soft)] px-3 py-2 text-xs leading-5 text-[var(--info)]">
          The starting rates are the US dollar figures tour operators publish. Changing the currency
          only changes the formatting — edit the rates below if your operator quotes in local money.
        </p>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Who gets tipped</h2>
        <div className="mt-4 grid gap-4">
          {rows.map((row) => (
            <div key={row.id} className="rounded-lg border border-[var(--border)] p-4">
              <label className="flex items-start gap-3" htmlFor={`include-${row.id}`}>
                <input
                  id={`include-${row.id}`}
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 accent-[var(--primary)]"
                  checked={row.include !== false}
                  onChange={(event) => updateRow(row.id, { include: event.target.checked })}
                />
                <span className="text-sm font-semibold">{row.label}</span>
              </label>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS} htmlFor={`rate-${row.id}`}>
                    Rate per {row.unitLabel} ({currency.code})
                  </label>
                  <input
                    id={`rate-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    value={row.rate}
                    onChange={(event) => updateRow(row.id, { rate: event.target.value })}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`units-${row.id}`}>
                    Number of {row.unitLabel}s
                  </label>
                  <input
                    id={`units-${row.id}`}
                    className={`mt-2 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    value={row.units}
                    onChange={(event) => updateRow(row.id, { units: event.target.value })}
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                {row.basis.startsWith("per-person")
                  ? "Charged once per traveller."
                  : "Charged once for the whole party."}
              </p>
            </div>
          ))}
        </div>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total tips for the trip
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : money(result.total)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to see a total."
                : `${money(result.perTraveller)} per traveller · ${money(result.perTravellerPerDay)} per traveller per day`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={failed}
              aria-label="Copy the tour tip plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Total for the party", failed ? DASH : money(result.total)],
            ["Per traveller", failed ? DASH : money(result.perTraveller)],
            ["Per day, whole party", failed ? DASH : money(result.perDay)],
            ["Per traveller per day", failed ? DASH : money(result.perTravellerPerDay)],
            ["Largest single line", failed || !result.largest ? DASH : `${result.largest.label} — ${money(result.largest.amount)}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Breakdown by role</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Role</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Working</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Amount</th>
                  <th scope="col" className="py-2 text-right font-semibold">Share</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {money(row.rate)} × {row.units}
                      {row.people > 1 ? ` × ${row.people}` : ""}
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold">{money(row.amount)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">{pct(row.share)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Cash to carry</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tour-note">
              Largest note you will draw ({currency.code})
            </label>
            <input
              id="tour-note"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={noteSize}
              onChange={(event) => setNoteSize(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <p className="text-sm leading-6 text-[var(--muted-foreground)]">
              {cash
                ? `Draw ${cash.notes} notes of ${money(cash.denomination)} — ${money(cash.withdraw)}, leaving ${money(cash.spare)} spare.`
                : "Enter a note size to see how much cash to draw."}
            </p>
          </div>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational guidance only. Tipping norms differ by operator, country and season, and some
        companies now include crew gratuities in the fare — read your booking conditions before
        budgeting, and treat every figure here as a starting point rather than an obligation.
      </p>
    </main>
  );
}
