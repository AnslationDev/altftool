"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, PackageOpen, RotateCcw } from "lucide-react";

import {
  CATEGORIES,
  DEFAULT_SECONDS_PER_DECISION,
  SELL_LISTING_MINUTES_PER_ITEM,
  formatMinutes,
  planDeclutter,
} from "../lib";

const INT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const n0 = (v) => (Number.isFinite(v) ? INT.format(v) : "—");
const money = (v) => (Number.isFinite(v) ? INR.format(v) : "—");

const STARTER_CATEGORIES = ["clothes", "papers", "kitchen", "garage"];
const FALLBACK_START_DATE = "2026-01-01";

const DEFAULTS = {
  minutesPerSession: "90",
  sessionsPerWeek: "3",
  keepPercent: "60",
  secondsPerDecision: String(DEFAULT_SECONDS_PER_DECISION),
  listSellItems: true,
  averageSalePrice: "400",
  startDate: FALLBACK_START_DATE,
  included: Object.fromEntries(CATEGORIES.map((c) => [c.id, STARTER_CATEGORIES.includes(c.id)])),
  counts: Object.fromEntries(CATEGORIES.map((c) => [c.id, String(c.defaultItems)])),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  // Seeded after mount so the server-rendered markup stays deterministic.
  useEffect(() => {
    const today = new Date();
    const iso = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
    setForm((prev) => (prev.startDate === FALLBACK_START_DATE ? { ...prev, startDate: iso } : prev));
  }, []);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSell = (event) => {
    const { checked } = event.target;
    setForm((prev) => ({ ...prev, listSellItems: checked }));
  };

  const toggleCategory = (id) => (event) => {
    const { checked } = event.target;
    setForm((prev) => ({ ...prev, included: { ...prev.included, [id]: checked } }));
  };

  const setCount = (id) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, counts: { ...prev.counts, [id]: value } }));
  };

  const result = useMemo(
    () =>
      planDeclutter({
        areas: CATEGORIES.filter((c) => form.included[c.id]).map((c) => ({
          id: c.id,
          items: form.counts[c.id] === "" ? 0 : Number(form.counts[c.id]),
        })),
        minutesPerSession: form.minutesPerSession === "" ? NaN : Number(form.minutesPerSession),
        sessionsPerWeek: form.sessionsPerWeek === "" ? NaN : Number(form.sessionsPerWeek),
        keepPercent: form.keepPercent === "" ? NaN : Number(form.keepPercent),
        secondsPerDecision:
          form.secondsPerDecision === "" ? NaN : Number(form.secondsPerDecision),
        listSellItems: form.listSellItems,
        averageSalePrice: form.averageSalePrice === "" ? 0 : Number(form.averageSalePrice),
        startDate: form.startDate,
      }),
    [form],
  );

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Declutter Planner",
      `${n0(result.totalItems)} items · keep ${n0(result.keepCount)} · release ${n0(result.releaseCount)}`,
      `Sell ${n0(result.sellCount)} · Donate ${n0(result.donateCount)} · Bin or recycle ${n0(result.binCount)}`,
      "",
      `Sorting ${formatMinutes(result.sortingMinutes)} · Listing ${formatMinutes(result.listingMinutes)} · Setup ${formatMinutes(result.setupMinutes)}`,
      `Trips: ${result.donationTrips} donation, ${result.disposalTrips} disposal — ${formatMinutes(result.logisticsMinutes)}`,
      `Total ${formatMinutes(result.totalMinutes)} across ${result.sessionCount} sessions of ${formatMinutes(result.sessionMinutes)}`,
      `${result.startDate} to ${result.finishDate}`,
    ];
    if (result.listSellItems) {
      lines.push(`Estimated resale at ${money(result.averageSalePrice)} an item: ${money(result.estimatedRevenue)}`);
    }
    lines.push("", "Schedule:");
    result.sessions.forEach((s) => {
      lines.push(
        `Session ${s.number} — ${s.date} (${formatMinutes(s.minutes)}): ${s.blocks.map((b) => `${b.label} ${formatMinutes(b.minutes)}`).join(", ")}`,
      );
    });
    return lines.join("\n");
  }, [ok, result]);

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <PackageOpen className="h-4 w-4" aria-hidden="true" />
          Home projects
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Declutter Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick the categories, estimate how many items are in each, and get a dated session plan
          with keep, sell, donate and bin counts — including the listing time and charity runs that
          the piles actually create.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What are you sorting?</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Rough counts are fine. Worked in KonMari order whatever order you tick them.
        </p>
        <ul className="mt-4 space-y-2">
          {CATEGORIES.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--border)] p-3"
            >
              <label className="flex min-h-11 flex-1 items-center gap-3 text-sm font-semibold" htmlFor={`dp-on-${c.id}`}>
                <input
                  id={`dp-on-${c.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={form.included[c.id]}
                  onChange={toggleCategory(c.id)}
                />
                <span>
                  {c.label}
                  <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                    decision pace ×{c.difficulty}
                  </span>
                </span>
              </label>
              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor={`dp-n-${c.id}`}>
                  Number of items in {c.label.toLowerCase()}
                </label>
                <input
                  id={`dp-n-${c.id}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="10"
                  className={`${INPUT_CLASS} w-28`}
                  value={form.counts[c.id]}
                  onChange={setCount(c.id)}
                  disabled={!form.included[c.id]}
                />
                <span className="text-xs text-[var(--muted-foreground)]">items</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">How you are working</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dp-session">
              Minutes per session
            </label>
            <input
              id="dp-session"
              type="number"
              inputMode="numeric"
              min="15"
              step="15"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.minutesPerSession}
              onChange={set("minutesPerSession")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dp-week">
              Sessions per week
            </label>
            <input
              id="dp-week"
              type="number"
              inputMode="numeric"
              min="1"
              max="7"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.sessionsPerWeek}
              onChange={set("sessionsPerWeek")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dp-keep">
              Share you expect to keep (%)
            </label>
            <input
              id="dp-keep"
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              step="5"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.keepPercent}
              onChange={set("keepPercent")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dp-pace">
              Seconds per decision
            </label>
            <input
              id="dp-pace"
              type="number"
              inputMode="numeric"
              min="1"
              max="600"
              step="5"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.secondsPerDecision}
              onChange={set("secondsPerDecision")}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Multiplied by each category&rsquo;s difficulty — sentimental items run three times
              slower than clothes.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dp-start">
              First session
            </label>
            <input
              id="dp-start"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.startDate}
              onChange={set("startDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dp-price">
              Average resale price per item
            </label>
            <input
              id="dp-price"
              type="number"
              inputMode="numeric"
              min="0"
              step="50"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.averageSalePrice}
              onChange={set("averageSalePrice")}
              disabled={!form.listSellItems}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="dp-sell">
              <input
                id="dp-sell"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={form.listSellItems}
                onChange={toggleSell}
              />
              <span>
                I will actually list the sell pile
                <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                  Adds {SELL_LISTING_MINUTES_PER_ITEM} minutes per item for photographs, listing and
                  messages.
                </span>
              </span>
            </label>
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
              Total time
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? formatMinutes(result.totalMinutes) : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.sessionCount} sessions of ${formatMinutes(result.sessionMinutes)}, finishing ${result.finishDate}`
                : "Fix the inputs above to see a plan"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the declutter plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Items to handle", ok ? n0(result.totalItems) : "—"],
            ["Keep", ok ? `${n0(result.keepCount)} (${n0(result.keepPercent)}%)` : "—"],
            ["Sell", ok ? n0(result.sellCount) : "—"],
            ["Donate", ok ? n0(result.donateCount) : "—"],
            ["Bin or recycle", ok ? n0(result.binCount) : "—"],
            ["Sorting time", ok ? formatMinutes(result.sortingMinutes) : "—"],
            ["Listing time", ok ? formatMinutes(result.listingMinutes) : "—"],
            ["Setup time", ok ? formatMinutes(result.setupMinutes) : "—"],
            [
              "Trips out",
              ok
                ? `${result.donationTrips} donation, ${result.disposalTrips} disposal — ${formatMinutes(result.logisticsMinutes)}`
                : "—",
            ],
            [
              "Estimated resale",
              ok ? (result.listSellItems ? money(result.estimatedRevenue) : "Not listing the sell pile") : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok
          ? result.warnings.map((warning) => (
              <p
                key={warning}
                className="mt-3 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{warning}</span>
              </p>
            ))
          : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Session schedule</h2>
          <ol className="mt-3 space-y-2">
            {result.sessions.map((s) => (
              <li key={s.number} className="rounded-lg border border-[var(--border)] p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold">
                    Session {s.number} · {s.date}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">{formatMinutes(s.minutes)}</p>
                </div>
                <ul className="mt-1 space-y-0.5 text-sm text-[var(--muted-foreground)]">
                  {s.blocks.map((b) => (
                    <li key={`${s.number}-${b.id}`}>
                      {b.label} — {formatMinutes(b.minutes)}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Category by category</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Category</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Items</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Keep</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Sell</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Donate</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Bin</th>
                  <th scope="col" className="py-2 text-right font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {result.byArea.map((a) => (
                  <tr key={a.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{a.label}</td>
                    <td className="py-2 pr-3 text-right">{n0(a.items)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{n0(a.keepCount)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{n0(a.sellCount)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{n0(a.donateCount)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{n0(a.binCount)}</td>
                    <td className="py-2 text-right whitespace-nowrap">{formatMinutes(a.totalMinutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {result.byArea.map((a) => (
              <li key={`tip-${a.id}`} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                <span>
                  <span className="font-semibold">{a.label}:</span>{" "}
                  <span className="text-[var(--muted-foreground)]">{a.tip}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Times are estimates from your own item counts and pace, not measurements. Check what your
        local charity shop and recycling centre will actually accept before loading the car, and
        shred anything carrying account numbers rather than putting it out whole.
      </p>
    </main>
  );
}
