"use client";

import { useMemo, useState } from "react";
import { Check, Clapperboard, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  DEFAULT_CONTINGENCY_PCT,
  DEFAULT_PRODUCTION_FEE_PCT,
  GST_SERVICE_RATE_PCT,
  computeVideoBudget,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const RATE = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);
const pct = (value) => (Number.isFinite(value) ? `${RATE.format(value)}%` : DASH);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_CREW = [
  { id: 1, label: "Director", rate: "15000", days: "2", quantity: "1" },
  { id: 2, label: "Director of photography", rate: "12000", days: "2", quantity: "1" },
  { id: 3, label: "Camera assistant", rate: "5000", days: "2", quantity: "1" },
  { id: 4, label: "Sound recordist", rate: "6000", days: "2", quantity: "1" },
];

const DEFAULT_GEAR = [
  { id: 1, label: "Camera body + lenses", rate: "9000", days: "2", quantity: "1" },
  { id: 2, label: "Lighting kit", rate: "6000", days: "2", quantity: "1" },
];

const DEFAULT_OTHER = [
  { id: 1, label: "Travel and transport", amount: "18000" },
  { id: 2, label: "Location fee", amount: "20000" },
  { id: 3, label: "Music licence", amount: "6000" },
];

const DEFAULT_SETTINGS = {
  postHours: "24",
  postRate: "1500",
  contingency: String(DEFAULT_CONTINGENCY_PCT),
  fee: String(DEFAULT_PRODUCTION_FEE_PCT),
  tax: String(GST_SERVICE_RATE_PCT),
  finishedMinutes: "3",
  shootDays: "2",
};

const nextId = (rows) => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

export default function ToolHome() {
  const [crew, setCrew] = useState(DEFAULT_CREW);
  const [gear, setGear] = useState(DEFAULT_GEAR);
  const [other, setOther] = useState(DEFAULT_OTHER);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [copied, setCopied] = useState(false);

  const setSetting = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const budget = useMemo(
    () =>
      computeVideoBudget({
        crew: crew.map((row) => ({
          label: row.label,
          rate: Number(row.rate),
          days: Number(row.days),
          quantity: Number(row.quantity),
        })),
        gear: gear.map((row) => ({
          label: row.label,
          rate: Number(row.rate),
          days: Number(row.days),
          quantity: Number(row.quantity),
        })),
        other: other.map((row) => ({ label: row.label, amount: Number(row.amount) })),
        postHours: Number(settings.postHours),
        postHourlyRate: Number(settings.postRate),
        contingencyPct: Number(settings.contingency),
        productionFeePct: Number(settings.fee),
        taxPct: Number(settings.tax),
        finishedMinutes: Number(settings.finishedMinutes),
        shootDays: Number(settings.shootDays),
      }),
    [crew, gear, other, settings],
  );

  const failed = Boolean(budget.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Video Production Budget",
      `Crew: ${money(budget.crewTotal)}`,
      `Gear: ${money(budget.gearTotal)}`,
      `Post-production: ${money(budget.postTotal)}`,
      `Other costs: ${money(budget.otherTotal)}`,
      `Direct costs: ${money(budget.directTotal)}`,
      `Contingency (${settings.contingency}%): ${money(budget.contingency)}`,
      `Production fee (${settings.fee}%): ${money(budget.productionFee)}`,
      `Pre-tax total: ${money(budget.preTaxTotal)}`,
      `Tax (${settings.tax}%): ${money(budget.tax)}`,
      `Grand total: ${money(budget.grandTotal)}`,
      `Cost per finished minute: ${budget.costPerFinishedMinute === null ? DASH : money(budget.costPerFinishedMinute)}`,
      `Cost per shoot day: ${budget.costPerShootDay === null ? DASH : money(budget.costPerShootDay)}`,
    ].join("\n");
  }, [budget, failed, settings]);

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
    setCrew(DEFAULT_CREW);
    setGear(DEFAULT_GEAR);
    setOther(DEFAULT_OTHER);
    setSettings(DEFAULT_SETTINGS);
    setCopied(false);
  };

  const renderHireSection = (title, rows, setRows, prefix, addLabel) => (
    <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        <button
          type="button"
          className={GHOST_BTN}
          aria-label={addLabel}
          onClick={() =>
            setRows((prev) =>
              prev.length >= 20
                ? prev
                : [...prev, { id: nextId(prev), label: "New line", rate: "0", days: "1", quantity: "1" }],
            )
          }
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add line
        </button>
      </div>
      <div className="mt-4 grid gap-4">
        {rows.map((row) => (
          <div key={row.id} className="rounded-md border border-[var(--border)] p-3">
            <label className={LABEL_CLASS} htmlFor={`${prefix}-label-${row.id}`}>
              Line item
            </label>
            <input
              id={`${prefix}-label-${row.id}`}
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={row.label}
              onChange={(event) =>
                setRows((prev) =>
                  prev.map((item) => (item.id === row.id ? { ...item, label: event.target.value } : item)),
                )
              }
            />
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <label className={SMALL_LABEL} htmlFor={`${prefix}-rate-${row.id}`}>
                  Day rate (INR)
                </label>
                <input
                  id={`${prefix}-rate-${row.id}`}
                  className={`mt-1 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="500"
                  value={row.rate}
                  onChange={(event) =>
                    setRows((prev) =>
                      prev.map((item) => (item.id === row.id ? { ...item, rate: event.target.value } : item)),
                    )
                  }
                />
              </div>
              <div>
                <label className={SMALL_LABEL} htmlFor={`${prefix}-days-${row.id}`}>
                  Days
                </label>
                <input
                  id={`${prefix}-days-${row.id}`}
                  className={`mt-1 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  value={row.days}
                  onChange={(event) =>
                    setRows((prev) =>
                      prev.map((item) => (item.id === row.id ? { ...item, days: event.target.value } : item)),
                    )
                  }
                />
              </div>
              <div>
                <label className={SMALL_LABEL} htmlFor={`${prefix}-qty-${row.id}`}>
                  Quantity
                </label>
                <input
                  id={`${prefix}-qty-${row.id}`}
                  className={`mt-1 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={row.quantity}
                  onChange={(event) =>
                    setRows((prev) =>
                      prev.map((item) =>
                        item.id === row.id ? { ...item, quantity: event.target.value } : item,
                      ),
                    )
                  }
                />
              </div>
            </div>
            <button
              type="button"
              className={`${GHOST_BTN} mt-3 w-full`}
              aria-label={`Remove ${row.label || "line item"}`}
              onClick={() => setRows((prev) => (prev.length > 0 ? prev.filter((item) => item.id !== row.id) : prev))}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Remove
            </button>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Clapperboard className="h-4 w-4" aria-hidden="true" />
          Production budgeting
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Video Production Budget Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add crew day rates, gear rental, post-production hours and flat costs, then layer on
          contingency, your production fee and GST to reach a quotable grand total.
        </p>
      </header>

      {renderHireSection("Crew", crew, setCrew, "vpb-crew", "Add a crew line")}
      {renderHireSection("Gear and rental", gear, setGear, "vpb-gear", "Add a gear line")}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Post-production</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vpb-post-hours">
              Edit, grade and mix hours
            </label>
            <input
              id="vpb-post-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={settings.postHours}
              onChange={(event) => setSetting("postHours", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vpb-post-rate">
              Post hourly rate (INR)
            </label>
            <input
              id="vpb-post-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={settings.postRate}
              onChange={(event) => setSetting("postRate", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Other flat costs</h2>
          <button
            type="button"
            className={GHOST_BTN}
            aria-label="Add another flat cost"
            onClick={() =>
              setOther((prev) =>
                prev.length >= 20 ? prev : [...prev, { id: nextId(prev), label: "New cost", amount: "0" }],
              )
            }
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add cost
          </button>
        </div>
        <div className="mt-4 grid gap-4">
          {other.map((row) => (
            <div key={row.id} className="grid gap-3 rounded-md border border-[var(--border)] p-3 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor={`vpb-other-label-${row.id}`}>
                  Cost name
                </label>
                <input
                  id={`vpb-other-label-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={row.label}
                  onChange={(event) =>
                    setOther((prev) =>
                      prev.map((item) => (item.id === row.id ? { ...item, label: event.target.value } : item)),
                    )
                  }
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`vpb-other-amount-${row.id}`}>
                  Amount (INR)
                </label>
                <input
                  id={`vpb-other-amount-${row.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="500"
                  value={row.amount}
                  onChange={(event) =>
                    setOther((prev) =>
                      prev.map((item) => (item.id === row.id ? { ...item, amount: event.target.value } : item)),
                    )
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="button"
                  className={`${GHOST_BTN} w-full`}
                  aria-label={`Remove ${row.label || "cost"}`}
                  onClick={() => setOther((prev) => prev.filter((item) => item.id !== row.id))}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Mark-ups and delivery</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            ["contingency", "Contingency (%)", "1"],
            ["fee", "Production fee (%)", "1"],
            ["tax", "GST / sales tax (%)", "1"],
            ["finishedMinutes", "Finished runtime (minutes)", "0.5"],
            ["shootDays", "Shoot days", "0.5"],
          ].map(([key, label, step]) => (
            <div key={key}>
              <label className={LABEL_CLASS} htmlFor={`vpb-${key}`}>
                {label}
              </label>
              <input
                id={`vpb-${key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={step}
                value={settings[key]}
                onChange={(event) => setSetting(key, event.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {budget.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Grand total including tax
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : money(budget.grandTotal)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? DASH
                : `${money(budget.directTotal)} of direct costs before contingency, fee and tax`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the budget breakdown" className={GHOST_BTN}>
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the whole budget" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Crew", failed ? DASH : `${money(budget.crewTotal)} (${pct(budget.shares.crew)} of direct)`],
            ["Gear and rental", failed ? DASH : `${money(budget.gearTotal)} (${pct(budget.shares.gear)})`],
            ["Post-production", failed ? DASH : `${money(budget.postTotal)} (${pct(budget.shares.post)})`],
            ["Other flat costs", failed ? DASH : `${money(budget.otherTotal)} (${pct(budget.shares.other)})`],
            ["Direct costs", failed ? DASH : money(budget.directTotal)],
            ["Contingency", failed ? DASH : money(budget.contingency)],
            ["Production fee", failed ? DASH : money(budget.productionFee)],
            ["Pre-tax total", failed ? DASH : money(budget.preTaxTotal)],
            ["Tax", failed ? DASH : money(budget.tax)],
            [
              "Cost per finished minute",
              failed || budget.costPerFinishedMinute === null ? DASH : money(budget.costPerFinishedMinute),
            ],
            [
              "Cost per shoot day",
              failed || budget.costPerShootDay === null ? DASH : money(budget.costPerShootDay),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        An estimating aid, not tax advice. The default 18% reflects the GST slab that applies to
        audio-visual production services in India — confirm the correct rate, place of supply and
        reverse-charge treatment with your accountant before invoicing.
      </p>
    </main>
  );
}
