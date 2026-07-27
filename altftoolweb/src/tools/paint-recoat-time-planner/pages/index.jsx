"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Timer } from "lucide-react";

import { PAINT_TYPES, REF_RH_PCT, REF_TEMP_C, planRecoat } from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const WHEN = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "UTC",
});

const when = (iso) => (iso ? WHEN.format(new Date(iso)) : DASH);
const hours = (v) => (Number.isFinite(v) ? `${NUM1.format(v)} h` : DASH);

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

function todayIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
    .toISOString()
    .slice(0, 10);
}

const buildDefaults = () => ({
  paintTypeId: "interior-emulsion",
  tempC: "28",
  humidityPct: "70",
  coats: "2",
  startDate: todayIso(),
  startTime: "09:00",
});

const toNum = (raw) => (String(raw).trim() === "" ? Number.NaN : Number(String(raw).trim()));

export default function ToolHome() {
  const [form, setForm] = useState(buildDefaults);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      planRecoat({
        paintTypeId: form.paintTypeId,
        tempC: toNum(form.tempC),
        humidityPct: toNum(form.humidityPct),
        coats: toNum(form.coats),
        startDate: form.startDate,
        startTime: form.startTime,
      }),
    [form],
  );

  const ok = !result.error;

  const summary = ok
    ? [
        "Paint Recoat Time Planner",
        `${result.paint.label} at ${NUM1.format(result.tempC)} C and ${NUM1.format(result.humidityPct)}% RH`,
        `Drying runs ${NUM2.format(result.factor)}x the datasheet time (temperature ${NUM2.format(result.tempFactor)}x, humidity ${NUM2.format(result.humidityFactor)}x)`,
        "",
        `Touch dry: ${hours(result.touchDryHours)} (datasheet ${hours(result.datasheet.touchDry)})`,
        `Recoat after: ${hours(result.recoatHours)} (datasheet ${hours(result.datasheet.recoat)})`,
        `Hard dry: ${hours(result.hardDryHours)} (datasheet ${hours(result.datasheet.hardDry)})`,
        "",
        ...result.schedule.map(
          (row) =>
            `Coat ${row.coat}: start ${when(row.startAt)}, touch dry ${when(row.touchDryAt)}${row.readyForNextAt ? `, next coat ${when(row.readyForNextAt)}` : ""}`,
        ),
        `Hard dry / ready for light use: ${when(result.hardDryAt)}`,
        `Full cure: ${when(result.fullCureAt)}`,
        ...result.warnings.map((w) => `! ${w}`),
      ].join("\n")
    : "";

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
    setForm(buildDefaults());
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Timer className="h-4 w-4" aria-hidden="true" />
          Paint estimation
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Paint Recoat Time Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The four hours printed on the tin assume {REF_TEMP_C} C and {REF_RH_PCT}% humidity. In a
          cold room or a monsoon afternoon it is nothing like four hours. Enter the real conditions
          and this stretches the touch-dry, recoat and hard-dry times and lays every coat out on the
          clock.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Conditions</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="rt-type">
              Paint type
            </label>
            <select
              id="rt-type"
              className={INPUT}
              value={form.paintTypeId}
              onChange={set("paintTypeId")}
            >
              {PAINT_TYPES.map((paint) => (
                <option key={paint.id} value={paint.id}>
                  {paint.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="rt-temp">
              Air temperature (C)
            </label>
            <input
              id="rt-temp"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="0"
              max="50"
              step="1"
              value={form.tempC}
              onChange={set("tempC")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="rt-rh">
              Relative humidity (%)
            </label>
            <input
              id="rt-rh"
              className={INPUT}
              type="number"
              inputMode="decimal"
              min="10"
              max="95"
              step="1"
              value={form.humidityPct}
              onChange={set("humidityPct")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="rt-coats">
              Number of coats
            </label>
            <input
              id="rt-coats"
              className={INPUT}
              type="number"
              inputMode="numeric"
              min="1"
              max="6"
              step="1"
              value={form.coats}
              onChange={set("coats")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="rt-date">
              First coat starts on
            </label>
            <input
              id="rt-date"
              className={INPUT}
              type="date"
              value={form.startDate}
              onChange={set("startDate")}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="rt-time">
              At (24-hour)
            </label>
            <input
              id="rt-time"
              className={INPUT}
              type="time"
              value={form.startTime}
              onChange={set("startTime")}
            />
          </div>
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Wait before the next coat
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? hours(result.recoatHours) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.fasterThanDatasheet
                  ? `Faster than the ${hours(result.datasheet.recoat)} on the tin — the air is warmer and drier than the test condition.`
                  : `Against ${hours(result.datasheet.recoat)} on the tin, ${NUM2.format(result.factor)} times longer in these conditions.`
                : "Fix the inputs above to see a result."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the recoat schedule"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(ok
            ? [
                ["Temperature effect", `${NUM2.format(result.tempFactor)}x`],
                ["Humidity effect", `${NUM2.format(result.humidityFactor)}x`],
                ["Combined slowdown", `${NUM2.format(result.factor)}x`],
                [
                  "Touch dry",
                  `${hours(result.touchDryHours)} (tin says ${hours(result.datasheet.touchDry)})`,
                ],
                [
                  "Recoat window opens",
                  `${hours(result.recoatHours)} (tin says ${hours(result.datasheet.recoat)})`,
                ],
                [
                  "Hard dry",
                  `${hours(result.hardDryHours)} (tin says ${hours(result.datasheet.hardDry)})`,
                ],
                ["Extra waiting per coat", hours(result.extraRecoatHours)],
                ["Last coat goes on", when(result.lastCoatAt)],
                ["Hard dry reached", when(result.hardDryAt)],
                ["Full cure", `${when(result.fullCureAt)} (${result.fullCureDays} days)`],
                ["Total job time to hard dry", `${NUM1.format(result.totalJobDays)} days`],
              ]
            : [
                ["Combined slowdown", DASH],
                ["Touch dry", DASH],
                ["Recoat window opens", DASH],
                ["Hard dry reached", DASH],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok && result.warnings.length > 0 ? (
        <div className="mt-4 grid gap-2">
          {result.warnings.map((warning) => (
            <p
              key={warning}
              className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]"
            >
              {warning}
            </p>
          ))}
        </div>
      ) : null}

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Coat schedule</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Coat
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Start
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Touch dry
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Next coat can go on
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.map((row) => (
                  <tr key={row.coat} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3 font-semibold">{row.coat}</td>
                    <td className="py-2.5 pr-3 whitespace-nowrap">{when(row.startAt)}</td>
                    <td className="py-2.5 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                      {when(row.touchDryAt)}
                    </td>
                    <td className="py-2.5 whitespace-nowrap">
                      {row.readyForNextAt ? (
                        when(row.readyForNextAt)
                      ) : (
                        <span className="text-[var(--success)] font-semibold">Final coat</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Times run straight through the night. If work stops at sundown, push the next coat to the
            first working hour after the window opens — recoating late is harmless, recoating early is
            not.
          </p>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational planning model, not a laboratory prediction. Drying also depends on air
        movement, film thickness, how porous the surface is and direct sun, none of which are
        modelled here. The technical data sheet for the product you are actually using overrides
        every figure on this page.
      </p>
    </main>
  );
}
