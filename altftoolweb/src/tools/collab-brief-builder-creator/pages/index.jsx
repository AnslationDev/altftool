"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Handshake, RotateCcw } from "lucide-react";

import {
  DEFAULT_EXCLUSIVITY_UPLIFT,
  DEFAULT_RUSH_UPLIFT,
  DEFAULT_USAGE_UPLIFT_PER_MONTH,
  MAX_LEAD_DAYS,
  MAX_UPLIFT_PERCENT,
  MAX_USAGE_MONTHS,
  MIN_LEAD_DAYS,
  STANDARD_LEAD_DAYS,
  TDS_SECTIONS,
  TERRITORIES,
  buildCollabBrief,
  suggestedUsageUplift,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const PCT = new Intl.NumberFormat("en-IN", { style: "percent", maximumFractionDigits: 0 });
const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);

const DEFAULTS = {
  brandName: "Acme Coffee",
  campaignName: "Monsoon Roast launch",
  creatorName: "",
  objective: "Drive first-time trial of the Monsoon Roast pack among urban coffee drinkers.",
  deliverablesRaw: "2 x Instagram Reel | 25000\n1 x Story set (3 frames) | 8000",
  leadDays: String(STANDARD_LEAD_DAYS),
  usageMonths: "3",
  usageUpliftPercent: "30",
  exclusivityPercent: String(DEFAULT_EXCLUSIVITY_UPLIFT),
  rushPercent: "0",
  territoryId: "india",
  paidMedia: true,
  exclusivity: true,
  gstRegistered: true,
  tdsSectionId: "194J",
  advancePercent: "50",
  netDays: "30",
};

/** Today plus three weeks, used only as the form's starting go-live date. */
function defaultLiveDate() {
  const now = new Date();
  const target = new Date(now.getTime() + 21 * 86400000);
  const pad = (value) => String(value).padStart(2, "0");
  return `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}`;
}

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [brandName, setBrandName] = useState(DEFAULTS.brandName);
  const [campaignName, setCampaignName] = useState(DEFAULTS.campaignName);
  const [creatorName, setCreatorName] = useState(DEFAULTS.creatorName);
  const [objective, setObjective] = useState(DEFAULTS.objective);
  const [deliverablesRaw, setDeliverablesRaw] = useState(DEFAULTS.deliverablesRaw);
  const [liveDate, setLiveDate] = useState(defaultLiveDate);
  const [leadDays, setLeadDays] = useState(DEFAULTS.leadDays);
  const [usageMonths, setUsageMonths] = useState(DEFAULTS.usageMonths);
  const [usageUpliftPercent, setUsageUpliftPercent] = useState(DEFAULTS.usageUpliftPercent);
  const [exclusivityPercent, setExclusivityPercent] = useState(DEFAULTS.exclusivityPercent);
  const [rushPercent, setRushPercent] = useState(DEFAULTS.rushPercent);
  const [territoryId, setTerritoryId] = useState(DEFAULTS.territoryId);
  const [paidMedia, setPaidMedia] = useState(DEFAULTS.paidMedia);
  const [exclusivity, setExclusivity] = useState(DEFAULTS.exclusivity);
  const [gstRegistered, setGstRegistered] = useState(DEFAULTS.gstRegistered);
  const [tdsSectionId, setTdsSectionId] = useState(DEFAULTS.tdsSectionId);
  const [advancePercent, setAdvancePercent] = useState(DEFAULTS.advancePercent);
  const [netDays, setNetDays] = useState(DEFAULTS.netDays);
  const [copied, setCopied] = useState(false);

  const brief = useMemo(
    () =>
      buildCollabBrief({
        brandName,
        campaignName,
        creatorName,
        objective,
        deliverablesRaw,
        liveDate,
        leadDays: Number(leadDays),
        usageMonths: Number(usageMonths),
        usageUpliftPercent: Number(usageUpliftPercent),
        exclusivityPercent: exclusivity ? Number(exclusivityPercent) : 0,
        rushPercent: Number(rushPercent),
        territoryId,
        paidMedia,
        exclusivity,
        gstRegistered,
        tdsSectionId,
        advancePercent: Number(advancePercent),
        netDays: Number(netDays),
      }),
    [
      brandName,
      campaignName,
      creatorName,
      objective,
      deliverablesRaw,
      liveDate,
      leadDays,
      usageMonths,
      usageUpliftPercent,
      exclusivityPercent,
      rushPercent,
      territoryId,
      paidMedia,
      exclusivity,
      gstRegistered,
      tdsSectionId,
      advancePercent,
      netDays,
    ],
  );

  const hasError = Boolean(brief.error);

  const briefText = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `COLLABORATION BRIEF — ${brief.campaignName || "Untitled campaign"}`,
      `Brand: ${brief.brandName || "—"}    Creator: ${brief.creatorName || "—"}`,
      `Go live: ${brief.liveDate}`,
      "",
      "OBJECTIVE",
      brief.objective || "—",
      "",
      "DELIVERABLES",
      ...brief.items.map(
        (item) =>
          `${item.quantity} x ${item.name} — ${money(item.rate)} each = ${money(item.lineTotal)}`,
      ),
      "",
      "TIMELINE",
      ...brief.timeline.map((item) => `${item.date} — ${item.label}`),
      "",
      "USAGE RIGHTS",
      ...brief.rights.map((line) => `- ${line}`),
      "",
      "OBLIGATIONS",
      ...brief.obligations.map((line) => `- ${line}`),
      "",
      "FEE",
      `Base fee: ${money(brief.baseFee)}`,
      `Usage uplift: ${money(brief.usageFee)}`,
      `Exclusivity uplift: ${money(brief.exclusivityFee)}`,
      `Rush uplift: ${money(brief.rushFee)}`,
      `Subtotal: ${money(brief.subtotal)}`,
      `GST @ ${PCT.format(brief.gstRate)}: ${money(brief.gst)}`,
      `Invoice total: ${money(brief.invoiceTotal)}`,
      `TDS (${brief.tdsSection.label}): -${money(brief.tds)}`,
      `Net receivable: ${money(brief.netReceivable)}`,
      "",
      `Advance ${brief.advancePercent}% on signing: ${money(brief.advanceAmount)}`,
      `Balance: ${money(brief.balanceAmount)}, due ${brief.netDays} days after go live (${brief.paymentDueDate})`,
    ];
    return lines.join("\n");
  }, [brief, hasError]);

  const copyBrief = async () => {
    if (!briefText) return;
    try {
      await navigator.clipboard.writeText(briefText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const applySuggestedUsage = () => {
    setUsageUpliftPercent(
      String(suggestedUsageUplift(Number(usageMonths), DEFAULT_USAGE_UPLIFT_PER_MONTH)),
    );
  };

  const reset = () => {
    setBrandName(DEFAULTS.brandName);
    setCampaignName(DEFAULTS.campaignName);
    setCreatorName(DEFAULTS.creatorName);
    setObjective(DEFAULTS.objective);
    setDeliverablesRaw(DEFAULTS.deliverablesRaw);
    setLiveDate(defaultLiveDate());
    setLeadDays(DEFAULTS.leadDays);
    setUsageMonths(DEFAULTS.usageMonths);
    setUsageUpliftPercent(DEFAULTS.usageUpliftPercent);
    setExclusivityPercent(DEFAULTS.exclusivityPercent);
    setRushPercent(DEFAULTS.rushPercent);
    setTerritoryId(DEFAULTS.territoryId);
    setPaidMedia(DEFAULTS.paidMedia);
    setExclusivity(DEFAULTS.exclusivity);
    setGstRegistered(DEFAULTS.gstRegistered);
    setTdsSectionId(DEFAULTS.tdsSectionId);
    setAdvancePercent(DEFAULTS.advancePercent);
    setNetDays(DEFAULTS.netDays);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Handshake className="h-4 w-4" aria-hidden="true" />
          Brand collaborations
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Creator Collab Brief Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Deliverables, dated milestones, usage rights and a fee breakdown with GST and TDS — the
          four things that turn a DM conversation into an agreement.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cb-brand">
              Brand
            </label>
            <input
              id="cb-brand"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={brandName}
              onChange={(event) => setBrandName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cb-creator">
              Creator
            </label>
            <input
              id="cb-creator"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={creatorName}
              onChange={(event) => setCreatorName(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cb-campaign">
              Campaign name
            </label>
            <input
              id="cb-campaign"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={campaignName}
              onChange={(event) => setCampaignName(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cb-objective">
              Objective
            </label>
            <textarea
              id="cb-objective"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={2}
              value={objective}
              onChange={(event) => setObjective(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cb-deliverables">
              Deliverables — one per line, &quot;2 x Instagram Reel | 25000&quot;
            </label>
            <textarea
              id="cb-deliverables"
              className={`mt-2 ${TEXTAREA_CLASS} font-mono`}
              rows={4}
              value={deliverablesRaw}
              onChange={(event) => setDeliverablesRaw(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cb-live">
              Go-live date
            </label>
            <input
              id="cb-live"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={liveDate}
              onChange={(event) => setLiveDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cb-lead">
              Lead time (days before go live)
            </label>
            <input
              id="cb-lead"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_LEAD_DAYS}
              max={MAX_LEAD_DAYS}
              step="1"
              value={leadDays}
              onChange={(event) => setLeadDays(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Usage rights and uplifts</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cb-months">
              Usage term (months)
            </label>
            <input
              id="cb-months"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_USAGE_MONTHS}
              step="1"
              value={usageMonths}
              onChange={(event) => setUsageMonths(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cb-territory">
              Territory
            </label>
            <select
              id="cb-territory"
              className={`mt-2 ${INPUT_CLASS}`}
              value={territoryId}
              onChange={(event) => setTerritoryId(event.target.value)}
            >
              {TERRITORIES.map((territory) => (
                <option key={territory.id} value={territory.id}>
                  {territory.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cb-usage-uplift">
              Usage uplift (% of base fee)
            </label>
            <input
              id="cb-usage-uplift"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max={MAX_UPLIFT_PERCENT}
              step="5"
              value={usageUpliftPercent}
              onChange={(event) => setUsageUpliftPercent(event.target.value)}
            />
            <button
              type="button"
              onClick={applySuggestedUsage}
              className="mt-2 min-h-11 rounded-md px-2 text-xs font-semibold text-[var(--primary)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              Use {DEFAULT_USAGE_UPLIFT_PER_MONTH}% per month ({usageMonths || 0} months)
            </button>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cb-excl-uplift">
              Exclusivity uplift (% of base fee)
            </label>
            <input
              id="cb-excl-uplift"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max={MAX_UPLIFT_PERCENT}
              step="5"
              value={exclusivityPercent}
              onChange={(event) => setExclusivityPercent(event.target.value)}
              disabled={!exclusivity}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="cb-rush">
              Rush uplift (% of base fee) — default {DEFAULT_RUSH_UPLIFT}% under{" "}
              {STANDARD_LEAD_DAYS} days
            </label>
            <input
              id="cb-rush"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max={MAX_UPLIFT_PERCENT}
              step="5"
              value={rushPercent}
              onChange={(event) => setRushPercent(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label
            htmlFor="cb-paid"
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold"
          >
            <input
              id="cb-paid"
              type="checkbox"
              className="h-5 w-5 shrink-0 accent-[var(--primary)]"
              checked={paidMedia}
              onChange={(event) => setPaidMedia(event.target.checked)}
            />
            Paid media / whitelisting included
          </label>
          <label
            htmlFor="cb-excl"
            className="flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold"
          >
            <input
              id="cb-excl"
              type="checkbox"
              className="h-5 w-5 shrink-0 accent-[var(--primary)]"
              checked={exclusivity}
              onChange={(event) => setExclusivity(event.target.checked)}
            />
            Category exclusivity granted
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Invoice and payment terms</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cb-tds">
              TDS section applied by the brand
            </label>
            <select
              id="cb-tds"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tdsSectionId}
              onChange={(event) => setTdsSectionId(event.target.value)}
            >
              {TDS_SECTIONS.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cb-advance">
              Advance on signing (%)
            </label>
            <input
              id="cb-advance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="5"
              value={advancePercent}
              onChange={(event) => setAdvancePercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cb-net">
              Balance due (days after go live)
            </label>
            <input
              id="cb-net"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="180"
              step="5"
              value={netDays}
              onChange={(event) => setNetDays(event.target.value)}
            />
          </div>
          <label
            htmlFor="cb-gst"
            className="flex min-h-11 items-center gap-3 self-end rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold"
          >
            <input
              id="cb-gst"
              type="checkbox"
              className="h-5 w-5 shrink-0 accent-[var(--primary)]"
              checked={gstRegistered}
              onChange={(event) => setGstRegistered(event.target.checked)}
            />
            I am GST registered (charge 18%)
          </label>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {brief.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Net receivable after TDS
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(brief.netReceivable)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `Invoice ${money(brief.invoiceTotal)} · TDS ${money(brief.tds)} deducted`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyBrief}
              disabled={hasError}
              aria-label="Copy the full collaboration brief"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy brief"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the collab brief builder"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Base fee", hasError ? DASH : money(brief.baseFee)],
            ["Usage uplift", hasError ? DASH : money(brief.usageFee)],
            ["Exclusivity uplift", hasError ? DASH : money(brief.exclusivityFee)],
            ["Rush uplift", hasError ? DASH : money(brief.rushFee)],
            ["Subtotal (taxable value)", hasError ? DASH : money(brief.subtotal)],
            [
              "GST",
              hasError
                ? DASH
                : brief.gstRegistered
                  ? `${money(brief.gst)} at ${PCT.format(brief.gstRate)}`
                  : "Not charged",
            ],
            ["Invoice total", hasError ? DASH : money(brief.invoiceTotal)],
            ["TDS deducted", hasError ? DASH : `${money(brief.tds)} (${brief.tdsSection.label})`],
            [
              "Advance on signing",
              hasError ? DASH : `${money(brief.advanceAmount)} (${brief.advancePercent}%)`,
            ],
            [
              "Balance due",
              hasError ? DASH : `${money(brief.balanceAmount)} by ${brief.paymentDueDate}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        {!hasError && (
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            {brief.tdsSection.note}
          </p>
        )}
      </section>

      {!hasError && brief.warnings.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Before you send this</h2>
          <ul className="mt-3 space-y-2">
            {brief.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Deliverables</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Item
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Qty
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Rate
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {brief.items.map((item) => (
                    <tr
                      key={`${item.name}-${item.rate}`}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="py-2 pr-3 font-semibold">{item.name}</td>
                      <td className="py-2 pr-3 text-right">{item.quantity}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {money(item.rate)}
                      </td>
                      <td className="py-2 text-right font-semibold">{money(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Timeline</h2>
            <ol className="mt-3 divide-y divide-[var(--border)] text-sm">
              {brief.timeline.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 py-2.5">
                  <span className="font-mono text-xs text-[var(--muted-foreground)]">
                    {item.date}
                  </span>
                  <span className="text-right font-semibold">{item.label}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Usage rights</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              {brief.rights.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <h2 className="mt-5 text-base font-semibold">Obligations</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              {brief.obligations.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Brief to send</h2>
            <div className="mt-3 overflow-x-auto">
              <pre className="whitespace-pre-wrap break-words rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
                {briefText}
              </pre>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal or tax advice. GST at 18% and the TDS section rates shown are
        the standard figures for advertising and professional services in India, but thresholds,
        registration status and the correct section depend on your circumstances — confirm with a
        chartered accountant, and have a lawyer review any contract before you sign it.
      </p>
    </main>
  );
}
