"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";

import {
  APPLIANCE_TYPES,
  CONSUMER_CLAIM_WINDOW_MONTHS,
  EXPIRING_SOON_DAYS,
  summariseAppliances,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DASH = "—";
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const STORAGE_KEY = "altft-appliance-warranty-tracker-v1";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STATUS_STYLE = {
  active: "bg-[var(--muted)] text-[var(--success)]",
  expiring: "bg-[var(--muted)] text-[var(--primary)]",
  expired: "bg-[var(--danger-soft)] text-[var(--danger)]",
};
const STATUS_LABEL = { active: "In warranty", expiring: "Expiring soon", expired: "Out of warranty" };

const todayIso = () => new Date().toISOString().slice(0, 10);

const prettyDate = (iso) => {
  if (!iso) return DASH;
  const [year, month, day] = iso.split("-");
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

const SEED = [
  { id: 1, name: "Refrigerator", type: "fridge", purchaseIso: "2024-03-15", priceInr: 42000, extendedMonths: 24, amcAnnualInr: 2500 },
  { id: 2, name: "Bedroom split AC", type: "ac", purchaseIso: "2025-04-10", priceInr: 38000, extendedMonths: 0, amcAnnualInr: 3500 },
  { id: 3, name: "Washing machine", type: "washer", purchaseIso: "2023-09-02", priceInr: 31000, extendedMonths: 0, amcAnnualInr: 0 },
];

const blankDraft = () => ({
  name: "",
  type: "fridge",
  purchaseIso: todayIso(),
  priceInr: "",
  extendedMonths: "0",
  amcAnnualInr: "0",
});

export default function ToolHome() {
  const [items, setItems] = useState(SEED);
  const [nextId, setNextId] = useState(4);
  const [draft, setDraft] = useState(blankDraft);
  const [today, setToday] = useState(() => todayIso());
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.items)) {
          setItems(parsed.items);
          setNextId(Number(parsed.nextId) || parsed.items.length + 1);
        }
      }
    } catch {
      // A blocked or corrupt store just means we start from the sample list.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, nextId }));
    } catch {
      // Private browsing or a full quota — the tool still works for this session.
    }
  }, [items, nextId, loaded]);

  const summary = useMemo(() => summariseAppliances(items, today), [items, today]);
  const ok = !summary.error;

  const clipboardText = useMemo(() => {
    if (!ok) return "";
    const lines = ["Appliance Warranty Tracker", `As on ${prettyDate(today)}`, ""];
    for (const row of summary.rows) {
      lines.push(
        `${row.name} (${row.typeLabel}) — bought ${prettyDate(row.purchaseIso)}; comprehensive cover to ${prettyDate(row.comprehensiveEndIso)} (${STATUS_LABEL[row.comprehensiveStatus]})${
          row.partEndIso ? `; ${row.partName.toLowerCase()} to ${prettyDate(row.partEndIso)}` : ""
        }${row.amcAnnualInr > 0 ? `; AMC ${money(row.amcAnnualInr)} a year` : ""}`,
      );
    }
    lines.push("");
    lines.push(`${summary.total} appliances · ${money(summary.totalValue)} of kit · AMC ${money(summary.annualAmc)} a year`);
    return lines.join("\n");
  }, [ok, summary, today]);

  const addItem = () => {
    const entry = {
      id: nextId,
      name: draft.name.trim(),
      type: draft.type,
      purchaseIso: draft.purchaseIso,
      priceInr: draft.priceInr === "" ? 0 : Number(draft.priceInr),
      extendedMonths: draft.extendedMonths === "" ? 0 : Math.trunc(Number(draft.extendedMonths)),
      amcAnnualInr: draft.amcAnnualInr === "" ? 0 : Number(draft.amcAnnualInr),
    };
    setItems((previous) => [...previous, entry]);
    setNextId((previous) => previous + 1);
    setDraft(blankDraft());
    setCopied(false);
  };

  const removeItem = (id) => {
    setItems((previous) => previous.filter((entry) => entry.id !== id));
    setCopied(false);
  };

  const copyResult = async () => {
    if (!clipboardText) return;
    try {
      await navigator.clipboard.writeText(clipboardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setItems(SEED);
    setNextId(4);
    setDraft(blankDraft());
    setToday(todayIso());
    setCopied(false);
  };

  const setDraftField = (field, value) => setDraft((previous) => ({ ...previous, [field]: value }));

  const draftType = APPLIANCE_TYPES.find((entry) => entry.id === draft.type) ?? APPLIANCE_TYPES[0];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Home upkeep
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Appliance Warranty Tracker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every appliance runs two warranty clocks — comprehensive cover on the whole unit and a much
          longer one on the compressor or motor. Log the purchase date once and the tracker keeps both
          dates, the extended-warranty window and the AMC renewal. Everything stays in this browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Add an appliance</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="aw-name">
              Nickname
            </label>
            <input
              id="aw-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Kitchen fridge"
              value={draft.name}
              onChange={(event) => setDraftField("name", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="aw-type">
              Appliance type
            </label>
            <select
              id="aw-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={draft.type}
              onChange={(event) => setDraftField("type", event.target.value)}
            >
              {APPLIANCE_TYPES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Default: {draftType.comprehensiveMonths} months comprehensive, {draftType.partMonths}{" "}
              months on the {draftType.partName.toLowerCase()}
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="aw-purchase">
              Purchase date
            </label>
            <input
              id="aw-purchase"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={draft.purchaseIso}
              onChange={(event) => setDraftField("purchaseIso", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="aw-price">
              Price paid (₹)
            </label>
            <input
              id="aw-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="500"
              value={draft.priceInr}
              onChange={(event) => setDraftField("priceInr", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="aw-extended">
              Extended warranty bought (months)
            </label>
            <input
              id="aw-extended"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="240"
              step="6"
              value={draft.extendedMonths}
              onChange={(event) => setDraftField("extendedMonths", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="aw-amc">
              AMC cost per year (₹, 0 if none)
            </label>
            <input
              id="aw-amc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={draft.amcAnnualInr}
              onChange={(event) => setDraftField("amcAnnualInr", event.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={addItem} className={PRIMARY_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add appliance
          </button>
          <div className="min-w-[12rem] flex-1">
            <label className="sr-only" htmlFor="aw-today">
              Treat this date as today
            </label>
            <input
              id="aw-today"
              className={INPUT_CLASS}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
              aria-describedby="aw-today-help"
            />
            <p id="aw-today-help" className="mt-1 text-xs text-[var(--muted-foreground)]">
              Reference date used for every countdown
            </p>
          </div>
        </div>
      </section>

      {summary.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {summary.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Appliances still in warranty
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${summary.counts.active + summary.counts.expiring} of ${summary.total}` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? summary.nextExpiry
                  ? `Next to lapse: ${summary.nextExpiry.name} on ${prettyDate(summary.nextExpiry.comprehensiveEndIso)}`
                  : "Nothing left under comprehensive cover"
                : "Fix the reference date to see the summary"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the warranty list"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy list"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to the sample list" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["In warranty", ok ? `${summary.counts.active} appliances` : DASH],
            [`Expiring within ${EXPIRING_SOON_DAYS} days`, ok ? `${summary.counts.expiring} appliances` : DASH],
            ["Out of warranty", ok ? `${summary.counts.expired} appliances` : DASH],
            ["Total value tracked", ok ? money(summary.totalValue) : DASH],
            ["Value now uncovered", ok ? money(summary.outOfWarrantyValue) : DASH],
            ["AMC spend per year", ok ? money(summary.annualAmc) : DASH],
            ["AMC as share of value", ok ? `${NUM1.format(summary.amcAsShareOfValue)}%` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok && summary.invalid.length > 0 ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {summary.invalid.length} entr{summary.invalid.length === 1 ? "y" : "ies"} could not be read:{" "}
          {summary.invalid.map((entry) => entry.error).join(" ")}
        </p>
      ) : null}

      {ok && summary.rows.length > 0 ? (
        <section className="mt-6 space-y-3">
          {summary.rows.map((row) => (
            <article key={row.id} className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold">{row.name}</h2>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {row.typeLabel} · bought {prettyDate(row.purchaseIso)} · {NUM1.format(row.ageYears)} years
                    old{row.priceInr > 0 ? ` · ${money(row.priceInr)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[row.comprehensiveStatus]}`}
                  >
                    {STATUS_LABEL[row.comprehensiveStatus]}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(row.id)}
                    aria-label={`Remove ${row.name}`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
                {[
                  [
                    "Comprehensive cover ends",
                    `${prettyDate(row.comprehensiveEndIso)}${
                      row.daysToComprehensive >= 0
                        ? ` · ${row.daysToComprehensive} days left`
                        : ` · lapsed ${Math.abs(row.daysToComprehensive)} days ago`
                    }`,
                  ],
                  [
                    `${row.partName} warranty ends`,
                    row.partEndIso
                      ? `${prettyDate(row.partEndIso)}${
                          row.daysToPart >= 0 ? ` · ${row.daysToPart} days left` : " · lapsed"
                        }`
                      : "No separate part cover",
                  ],
                  [
                    "Extended warranty",
                    row.extendedMonths > 0
                      ? `${row.extendedMonths} months added (base cover ended ${prettyDate(row.baseWarrantyEndIso)})`
                      : row.extendedWindowOpen
                        ? `Can still be bought before ${prettyDate(row.baseWarrantyEndIso)}`
                        : "Window closed",
                  ],
                  [
                    "AMC",
                    row.amcAnnualInr > 0
                      ? `${money(row.amcAnnualInr)} a year · renewals ${row.amcRenewalDates.map(prettyDate).join(", ")}`
                      : "None",
                  ],
                  ["Complaint filing deadline if a defect arises today", prettyDate(row.claimDeadlineIso)],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Warranty lengths shown are typical Indian market defaults — your own warranty card and invoice
        govern, so keep both. Under Section 69 of the Consumer Protection Act, 2019 a consumer
        complaint must generally be filed within {CONSUMER_CLAIM_WINDOW_MONTHS} months of the cause of
        action. This is general information, not legal advice. Your list is saved only in this
        browser and never leaves your device.
      </p>
    </main>
  );
}
