"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";

import {
  DISPATCH_MODES,
  DEFAULT_PRINT_RATE_PER_PAGE,
  GST_RATE_PERCENT,
  compareDispatchModes,
  estimateNoticeCost,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const DEFAULTS = {
  draftingFee: "5000",
  addGst: true,
  recipients: "2",
  pages: "3",
  copiesPerRecipient: "1",
  printRatePerPage: String(DEFAULT_PRINT_RATE_PER_PAGE),
  mode: "registered-ad",
  dispatchCostPerRecipient: "60",
  stampPaperCost: "100",
  notarisationFee: "200",
  followUpCount: "1",
  followUpDispatchCost: "45",
  miscCost: "0",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [draftingFee, setDraftingFee] = useState(DEFAULTS.draftingFee);
  const [addGst, setAddGst] = useState(DEFAULTS.addGst);
  const [recipients, setRecipients] = useState(DEFAULTS.recipients);
  const [pages, setPages] = useState(DEFAULTS.pages);
  const [copiesPerRecipient, setCopiesPerRecipient] = useState(DEFAULTS.copiesPerRecipient);
  const [printRatePerPage, setPrintRatePerPage] = useState(DEFAULTS.printRatePerPage);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [dispatchCost, setDispatchCost] = useState(DEFAULTS.dispatchCostPerRecipient);
  const [stampPaperCost, setStampPaperCost] = useState(DEFAULTS.stampPaperCost);
  const [notarisationFee, setNotarisationFee] = useState(DEFAULTS.notarisationFee);
  const [followUpCount, setFollowUpCount] = useState(DEFAULTS.followUpCount);
  const [followUpDispatchCost, setFollowUpDispatchCost] = useState(DEFAULTS.followUpDispatchCost);
  const [miscCost, setMiscCost] = useState(DEFAULTS.miscCost);
  const [copied, setCopied] = useState(false);

  const payload = useMemo(
    () => ({
      draftingFee: toNumber(draftingFee),
      addGst,
      recipients: toNumber(recipients),
      pages: toNumber(pages),
      copiesPerRecipient: toNumber(copiesPerRecipient),
      printRatePerPage: toNumber(printRatePerPage),
      dispatchCostPerRecipient: toNumber(dispatchCost),
      stampPaperCost: toNumber(stampPaperCost),
      notarisationFee: toNumber(notarisationFee),
      followUpCount: toNumber(followUpCount),
      followUpDispatchCost: toNumber(followUpDispatchCost),
      miscCost: toNumber(miscCost),
    }),
    [
      draftingFee,
      addGst,
      recipients,
      pages,
      copiesPerRecipient,
      printRatePerPage,
      dispatchCost,
      stampPaperCost,
      notarisationFee,
      followUpCount,
      followUpDispatchCost,
      miscCost,
    ],
  );

  const result = useMemo(() => estimateNoticeCost(payload), [payload]);
  const comparison = useMemo(() => compareDispatchModes(payload), [payload]);
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Legal Notice Cost Estimate",
      ...result.lines.map((line) => `${line.label}: ${money(line.amount)}`),
      `Total estimated cost: ${money(result.total)}`,
      `Cost per addressee: ${money(result.perRecipient)}`,
    ].join("\n");
  }, [hasError, result]);

  const applyMode = (id) => {
    setMode(id);
    const found = DISPATCH_MODES.find((item) => item.id === id);
    if (found) {
      setDispatchCost(String(found.defaultCost));
      setFollowUpDispatchCost(String(found.defaultCost));
    }
  };

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
    setDraftingFee(DEFAULTS.draftingFee);
    setAddGst(DEFAULTS.addGst);
    setRecipients(DEFAULTS.recipients);
    setPages(DEFAULTS.pages);
    setCopiesPerRecipient(DEFAULTS.copiesPerRecipient);
    setPrintRatePerPage(DEFAULTS.printRatePerPage);
    setMode(DEFAULTS.mode);
    setDispatchCost(DEFAULTS.dispatchCostPerRecipient);
    setStampPaperCost(DEFAULTS.stampPaperCost);
    setNotarisationFee(DEFAULTS.notarisationFee);
    setFollowUpCount(DEFAULTS.followUpCount);
    setFollowUpDispatchCost(DEFAULTS.followUpDispatchCost);
    setMiscCost(DEFAULTS.miscCost);
    setCopied(false);
  };

  const activeMode = DISPATCH_MODES.find((item) => item.id === mode);

  const numberFields = [
    ["notice-fee", "Drafting / advocate fee (INR)", draftingFee, setDraftingFee, "500"],
    ["notice-recipients", "Number of addressees", recipients, setRecipients, "1"],
    ["notice-pages", "Pages in the notice", pages, setPages, "1"],
    ["notice-copies", "Copies posted per addressee", copiesPerRecipient, setCopiesPerRecipient, "1"],
    ["notice-print", "Printing cost per page (INR)", printRatePerPage, setPrintRatePerPage, "0.5"],
    ["notice-dispatch", "Dispatch cost per addressee (INR)", dispatchCost, setDispatchCost, "5"],
    ["notice-stamp", "Stamp paper (INR)", stampPaperCost, setStampPaperCost, "10"],
    ["notice-notary", "Notarisation / attestation (INR)", notarisationFee, setNotarisationFee, "10"],
    ["notice-followups", "Reminder notices planned", followUpCount, setFollowUpCount, "1"],
    ["notice-followup-cost", "Dispatch per reminder, per addressee (INR)", followUpDispatchCost, setFollowUpDispatchCost, "5"],
    ["notice-misc", "Travel / miscellaneous (INR)", miscCost, setMiscCost, "50"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Legal notices
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Legal Notice Cost Estimator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add up what it actually costs to send a legal notice {DASH} drafting fee and GST, stamp
          paper, notarisation, printing for every addressee, postage and the reminders that usually
          follow.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="notice-mode">
              Dispatch mode
            </label>
            <select
              id="notice-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mode}
              onChange={(event) => applyMode(event.target.value)}
            >
              {DISPATCH_MODES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {activeMode ? (
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{activeMode.note}</p>
            ) : null}
          </div>

          {numberFields.map(([id, label, value, setter, step]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step={step}
                value={value}
                onChange={(event) => setter(event.target.value)}
              />
            </div>
          ))}

          <div className="sm:col-span-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium"
              htmlFor="notice-gst"
            >
              <input
                id="notice-gst"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={addGst}
                onChange={(event) => setAddGst(event.target.checked)}
              />
              Add {GST_RATE_PERCENT}% GST on the professional fee (skip it if the advocate bills you
              under reverse charge)
            </label>
          </div>
        </div>
      </section>

      {hasError ? (
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
              Estimated total cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.total)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see a figure."
                : `${money(result.perRecipient)} per addressee across ${result.recipients} addressee${result.recipients === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the legal notice cost estimate"
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
            ["Professional fee incl. GST", hasError ? DASH : money(result.professionalTotal)],
            ["GST component", hasError ? DASH : money(result.gstAmount)],
            ["Stamp paper + notarisation", hasError ? DASH : money(result.stationeryTotal)],
            [
              "Printing",
              hasError ? DASH : `${money(result.printingTotal)} (${result.totalPages} pages)`,
            ],
            ["Dispatch of the notice", hasError ? DASH : money(result.dispatchTotal)],
            ["Reminder notices", hasError ? DASH : money(result.followUpTotal)],
            ["Travel / miscellaneous", hasError ? DASH : money(result.miscCost)],
            [
              "Professional fee as share of total",
              hasError ? DASH : `${NUM.format(result.professionalShare)}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Same notice, different dispatch mode</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Totals below use each mode&apos;s default postage for the first notice and every reminder.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Mode</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Per addressee</th>
                <th scope="col" className="py-2 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {hasError || comparison.error
                ? DISPATCH_MODES.map((item) => (
                    <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{item.label}</td>
                      <td className="py-2 pr-3 text-right">{DASH}</td>
                      <td className="py-2 text-right">{DASH}</td>
                    </tr>
                  ))
                : comparison.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.label}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {money(row.cost)}
                      </td>
                      <td className="py-2 text-right font-semibold">{money(row.total)}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only, not legal advice. Advocate fees, stamp duty on non-judicial
        paper and postal tariffs vary by state, weight and vendor, and court fees are not included.
        Confirm the actual charges with the advocate you engage.
      </p>
    </main>
  );
}
