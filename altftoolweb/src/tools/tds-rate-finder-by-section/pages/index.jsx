"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Percent, RotateCcw, Search } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const money2 = (value) => INR2.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_ON =
  "min-h-11 rounded-md border border-[var(--primary)] bg-[var(--primary)] px-3 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/**
 * Resident TDS rates and thresholds for FY 2025-26 (AY 2026-27), after the
 * threshold increases and rate cuts brought in by the Finance Act 2025.
 * `rate: null` means the section has no single flat rate.
 */
const SECTIONS = [
  { id: "192", code: "192", title: "Salary", rate: null, rateNote: "Average rate on estimated annual salary (slab rates)", threshold: null, thresholdNote: "Deducted when estimated salary exceeds the basic exemption limit", group: "Salary & retirals" },
  { id: "192A", code: "192A", title: "Premature withdrawal from EPF", rate: 10, threshold: 50000, thresholdNote: "per withdrawal", group: "Salary & retirals" },
  { id: "194T", code: "194T", title: "Salary, remuneration, interest, bonus or commission paid to a partner of a firm", rate: 10, threshold: 20000, thresholdNote: "aggregate in a financial year", group: "Salary & retirals" },

  { id: "193", code: "193", title: "Interest on securities", rate: 10, threshold: 10000, thresholdNote: "aggregate in a financial year", group: "Interest, dividend & investments" },
  { id: "194", code: "194", title: "Dividend paid to a resident", rate: 10, threshold: 10000, thresholdNote: "aggregate in a financial year", group: "Interest, dividend & investments" },
  { id: "194A-sc", code: "194A", title: "Bank, post office or co-op interest — senior citizen payee", rate: 10, threshold: 100000, thresholdNote: "aggregate in a financial year", group: "Interest, dividend & investments" },
  { id: "194A-bank", code: "194A", title: "Bank, post office or co-op interest — payee below 60", rate: 10, threshold: 50000, thresholdNote: "aggregate in a financial year", group: "Interest, dividend & investments" },
  { id: "194A-other", code: "194A", title: "Interest from any other payer (loans, deposits with firms)", rate: 10, threshold: 10000, thresholdNote: "aggregate in a financial year", group: "Interest, dividend & investments" },
  { id: "194K", code: "194K", title: "Income from units of a mutual fund", rate: 10, threshold: 10000, thresholdNote: "aggregate in a financial year", group: "Interest, dividend & investments" },
  { id: "194EE", code: "194EE", title: "Payment out of a National Savings Scheme deposit", rate: 10, threshold: 2500, thresholdNote: "aggregate in a financial year", group: "Interest, dividend & investments" },
  { id: "194DA", code: "194DA", title: "Life insurance maturity payout (taxable portion)", rate: 2, rateNote: "Applied to the income component, not the whole payout", threshold: 100000, thresholdNote: "aggregate in a financial year", group: "Interest, dividend & investments" },

  { id: "194C-ind", code: "194C", title: "Payment to a contractor — individual or HUF payee", rate: 1, threshold: 30000, thresholdNote: "single payment; or Rs 1,00,000 aggregate in a year", group: "Contracts, commission & fees" },
  { id: "194C-oth", code: "194C", title: "Payment to a contractor — payee other than individual or HUF", rate: 2, threshold: 30000, thresholdNote: "single payment; or Rs 1,00,000 aggregate in a year", group: "Contracts, commission & fees" },
  { id: "194H", code: "194H", title: "Commission or brokerage", rate: 2, threshold: 20000, thresholdNote: "aggregate in a financial year", group: "Contracts, commission & fees" },
  { id: "194D-ind", code: "194D", title: "Insurance commission — resident other than a company", rate: 2, threshold: 20000, thresholdNote: "aggregate in a financial year", group: "Contracts, commission & fees" },
  { id: "194D-co", code: "194D", title: "Insurance commission — domestic company", rate: 10, threshold: 20000, thresholdNote: "aggregate in a financial year", group: "Contracts, commission & fees" },
  { id: "194G", code: "194G", title: "Commission on sale of lottery tickets", rate: 2, threshold: 20000, thresholdNote: "aggregate in a financial year", group: "Contracts, commission & fees" },
  { id: "194J-prof", code: "194J(b)", title: "Professional fees, royalty, director's fees, non-compete fees", rate: 10, threshold: 50000, thresholdNote: "aggregate in a financial year", group: "Contracts, commission & fees" },
  { id: "194J-tech", code: "194J(a)", title: "Fees for technical services, call centre, royalty for film exhibition", rate: 2, threshold: 50000, thresholdNote: "aggregate in a financial year", group: "Contracts, commission & fees" },
  { id: "194M", code: "194M", title: "Contract, commission or professional fee paid by an individual or HUF not liable to audit", rate: 2, threshold: 5000000, thresholdNote: "aggregate in a financial year", group: "Contracts, commission & fees" },
  { id: "194R", code: "194R", title: "Benefit or perquisite arising from business or profession", rate: 10, threshold: 20000, thresholdNote: "aggregate in a financial year", group: "Contracts, commission & fees" },

  { id: "194I-pm", code: "194-I(a)", title: "Rent of plant, machinery or equipment", rate: 2, threshold: 50000, thresholdNote: "per month or part of a month", group: "Rent & property" },
  { id: "194I-lb", code: "194-I(b)", title: "Rent of land, building, furniture or fittings", rate: 10, threshold: 50000, thresholdNote: "per month or part of a month", group: "Rent & property" },
  { id: "194IB", code: "194-IB", title: "Rent paid by an individual or HUF not liable to tax audit", rate: 2, threshold: 50000, thresholdNote: "per month or part of a month", group: "Rent & property" },
  { id: "194IA", code: "194-IA", title: "Purchase of immovable property (other than agricultural land)", rate: 1, threshold: 5000000, thresholdNote: "consideration or stamp duty value, whichever is higher", group: "Rent & property" },
  { id: "194IC", code: "194-IC", title: "Monetary payment under a joint development agreement", rate: 10, threshold: 0, thresholdNote: "no threshold", group: "Rent & property" },
  { id: "194LA", code: "194LA", title: "Compensation on compulsory acquisition of immovable property", rate: 10, threshold: 500000, thresholdNote: "aggregate in a financial year", group: "Rent & property" },

  { id: "194B", code: "194B", title: "Winnings from lottery, crossword puzzles or card games", rate: 30, threshold: 10000, thresholdNote: "per single transaction", group: "Winnings & gaming" },
  { id: "194BB", code: "194BB", title: "Winnings from horse races", rate: 30, threshold: 10000, thresholdNote: "per single transaction", group: "Winnings & gaming" },
  { id: "194BA", code: "194BA", title: "Net winnings from online games", rate: 30, threshold: 0, thresholdNote: "no threshold — deducted on net winnings", group: "Winnings & gaming" },

  { id: "194O", code: "194-O", title: "E-commerce operator paying an e-commerce participant", rate: 0.1, threshold: 500000, thresholdNote: "for individual or HUF participants with PAN", noPanRate: 5, group: "Business & digital" },
  { id: "194Q", code: "194Q", title: "Purchase of goods by a buyer with turnover above Rs 10 crore", rate: 0.1, rateNote: "Charged on the value above Rs 50 lakh", threshold: 5000000, thresholdNote: "aggregate purchases in a financial year", noPanRate: 5, group: "Business & digital", onExcess: true },
  { id: "194S", code: "194S", title: "Transfer of a virtual digital asset", rate: 1, threshold: 50000, thresholdNote: "Rs 50,000 for specified persons, Rs 10,000 otherwise", group: "Business & digital" },
  { id: "194N-1cr", code: "194N", title: "Cash withdrawal above Rs 1 crore in a year", rate: 2, rateNote: "Charged on the amount above the threshold", threshold: 10000000, thresholdNote: "aggregate cash withdrawals in a year", group: "Business & digital", onExcess: true },
  { id: "194N-nonfiler", code: "194N", title: "Cash withdrawal by a non-filer — Rs 20 lakh to Rs 1 crore", rate: 2, rateNote: "Charged on the amount above Rs 20 lakh; 5% beyond Rs 1 crore", threshold: 2000000, thresholdNote: "for a person who has not filed returns for the past year", group: "Business & digital", onExcess: true },
  { id: "195", code: "195", title: "Any sum paid to a non-resident", rate: null, rateNote: "Rate depends on the nature of income and any tax treaty benefit", threshold: null, thresholdNote: "No basic threshold", group: "Non-residents" },
];

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/**
 * Section 206AA: where the deductee does not furnish a PAN, tax is deducted at
 * the higher of the specified rate or 20% (5% for sections 194-O and 194Q).
 */
export function effectiveRate(section, hasPan) {
  if (section.rate === null) return null;
  if (hasPan) return section.rate;
  return Math.max(section.rate, section.noPanRate ?? 20);
}

export function computeTds(section, amount, hasPan) {
  const rate = effectiveRate(section, hasPan);
  if (rate === null) return { rate: null, crossed: null, base: 0, tds: 0, net: amount };
  const threshold = section.threshold ?? 0;
  const crossed = threshold <= 0 ? amount > 0 : amount > threshold;
  const base = !crossed ? 0 : section.onExcess ? amount - threshold : amount;
  const tds = (base * rate) / 100;
  return { rate, crossed, base, tds, net: amount - tds, threshold };
}

export default function ToolHome() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("194J-prof");
  const [amount, setAmount] = useState("200000");
  const [hasPan, setHasPan] = useState(true);
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTIONS;
    return SECTIONS.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q),
    );
  }, [query]);

  const selected = useMemo(
    () => SECTIONS.find((item) => item.id === selectedId) ?? SECTIONS[0],
    [selectedId],
  );

  const calc = useMemo(() => {
    const value = toNumber(amount);
    if (Number.isNaN(value)) return { error: "Enter a valid payment amount in rupees." };
    if (value < 0) return { error: "Payment amount cannot be negative." };
    if (value > 1e13) return { error: "Payment amount is too large to compute." };
    return computeTds(selected, value, hasPan);
  }, [amount, selected, hasPan]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    const lines = [
      "TDS rate finder",
      `Section: ${selected.code} — ${selected.title}`,
      selected.rate === null
        ? `Rate: ${selected.rateNote}`
        : `Rate: ${pct(calc.rate)}${hasPan ? "" : " (no PAN — section 206AA)"}`,
      `Threshold: ${selected.threshold === null ? "Not applicable" : selected.threshold === 0 ? "No threshold" : money(selected.threshold)}${
        selected.thresholdNote ? ` (${selected.thresholdNote})` : ""
      }`,
      `Payment amount: ${money(toNumber(amount))}`,
    ];
    if (selected.rate === null) {
      lines.push("TDS: depends on the applicable slab or treaty rate — not computed here.");
    } else {
      lines.push(
        `Amount liable to TDS: ${money2(calc.base)}`,
        `TDS deducted: ${money2(calc.tds)}`,
        `Net payable to the deductee: ${money2(calc.net)}`,
      );
    }
    return lines.join("\n");
  }, [calc, selected, amount, hasPan]);

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
    setQuery("");
    setSelectedId("194J-prof");
    setAmount("200000");
    setHasPan(true);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Percent className="h-4 w-4" aria-hidden="true" />
          Income tax
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">TDS Rate Finder by Section</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Look up the resident TDS rate and threshold for {SECTIONS.length} common sections of the
          Income-tax Act for FY 2025-26, then enter a payment to see the tax to deduct and the net
          amount payable — including the higher 206AA rate when PAN is missing.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="tds-search">
          Search by section number or payment type
        </label>
        <div className="relative mt-2">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
            aria-hidden="true"
          />
          <input
            id="tds-search"
            type="search"
            className={`${INPUT_CLASS} pl-9`}
            placeholder="e.g. 194J, rent, commission, contractor"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <p className="mt-3 text-xs text-[var(--muted-foreground)]" aria-live="polite">
          {results.length} {results.length === 1 ? "section" : "sections"} listed
        </p>

        <div className="mt-2 max-h-80 overflow-y-auto rounded-md border border-[var(--border)]">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-[var(--muted-foreground)]">
              No section matched. Try “rent”, “interest”, “194C” or “commission”.
            </p>
          ) : (
            <ul>
              {results.map((item) => {
                const active = item.id === selected.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      aria-pressed={active}
                      className={`flex w-full items-start justify-between gap-3 border-b border-[var(--border)] px-3 py-3 text-left transition last:border-0 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                        active ? "bg-[var(--muted)]" : "hover:bg-[var(--muted)]"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">
                          {item.code} — {item.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                          Threshold:{" "}
                          {item.threshold === null
                            ? "not applicable"
                            : item.threshold === 0
                              ? "none"
                              : money(item.threshold)}
                          {item.thresholdNote ? ` · ${item.thresholdNote}` : ""}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-md bg-[var(--muted)] px-2 py-1 text-xs font-bold text-[var(--primary)]">
                        {item.rate === null ? "Slab" : pct(item.rate)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Calculate the deduction</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tds-amount">
              Payment amount (INR)
            </label>
            <input
              id="tds-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>
          <div>
            <span className={LABEL_CLASS}>PAN of the deductee</span>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setHasPan(true)}
                aria-pressed={hasPan}
                className={hasPan ? CHIP_ON : CHIP}
              >
                PAN available
              </button>
              <button
                type="button"
                onClick={() => setHasPan(false)}
                aria-pressed={!hasPan}
                className={hasPan ? CHIP : CHIP_ON}
              >
                No PAN (206AA)
              </button>
            </div>
          </div>
        </div>
      </section>

      {calc.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calc.error}
        </p>
      ) : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {selected.rate === null ? `Section ${selected.code}` : "TDS to deduct"}
              </p>
              <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                {selected.rate === null ? "Slab / treaty rate" : money2(calc.tds)}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Section {selected.code} — {selected.title}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyResult}
                aria-label="Copy TDS rate and deduction result"
                className={GHOST_BTN}
              >
                {copied ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copied ? "Copied!" : "Copy result"}
              </button>
              <button type="button" onClick={reset} aria-label="Reset section and amount" className={PRIMARY_BTN}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {[
              [
                "Applicable rate",
                selected.rate === null ? selected.rateNote : pct(calc.rate),
              ],
              [
                "Threshold",
                selected.threshold === null
                  ? "Not applicable"
                  : selected.threshold === 0
                    ? "No threshold"
                    : money(selected.threshold),
              ],
              ["Threshold basis", selected.thresholdNote ?? "—"],
              ["Payment amount", money(toNumber(amount))],
              ...(selected.rate === null
                ? []
                : [
                    [
                      "Threshold crossed",
                      calc.crossed ? "Yes — deduct TDS" : "No — no deduction required",
                    ],
                    ["Amount liable to TDS", money2(calc.base)],
                    ["TDS deducted", money2(calc.tds)],
                    ["Net payable to deductee", money2(calc.net)],
                  ]),
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          {selected.rateNote && selected.rate !== null ? (
            <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
              {selected.rateNote}
            </p>
          ) : null}

          {!hasPan && selected.rate !== null ? (
            <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
              Section 206AA applied: tax deducted at the higher of {pct(selected.rate)} and{" "}
              {pct(selected.noPanRate ?? 20)} because no PAN was furnished.
            </p>
          ) : null}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, for resident deductees in FY 2025-26 (AY 2026-27). Surcharge and health
        and education cess are not added to resident TDS other than on salary. Rates, thresholds and
        exemptions change with each Finance Act and specific facts can alter the answer — confirm
        with the Income Tax Department or your chartered accountant before deducting.
      </p>
    </main>
  );
}
