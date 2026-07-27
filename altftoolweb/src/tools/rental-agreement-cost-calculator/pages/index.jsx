"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileText, RotateCcw } from "lucide-react";
import {
  GST_ON_BROKERAGE_PERCENT,
  STATE_PRESETS,
  computeAgreementCost,
  getPreset,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;
const DASH = "—";

const presetDefaults = (id) => {
  const preset = getPreset(id);
  return {
    presetId: preset.id,
    base: preset.base,
    stampPercent: String(preset.stampPercent),
    registrationMode: preset.registrationMode,
    registrationPercent: String(preset.registrationPercent),
    registrationFlat: String(preset.registrationUrban),
  };
};

const DEFAULTS = {
  ...presetDefaults("maharashtra"),
  monthlyRent: "25000",
  termMonths: "11",
  refundableDeposit: "100000",
  nonRefundableDeposit: "0",
  advanceRentMonths: "1",
  registerAgreement: true,
  brokerageMonths: "1",
  brokerageGstApplies: true,
  otherCharges: "0",
  statutorySharePercent: "50",
  brokerageSharePercent: "100",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium text-[var(--foreground)]";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const setToggle = (key) => (event) => {
    const { checked } = event.target;
    setForm((prev) => ({ ...prev, [key]: checked }));
    setCopied(false);
  };

  const changePreset = (event) => {
    const next = presetDefaults(event.target.value);
    setForm((prev) => ({ ...prev, ...next }));
    setCopied(false);
  };

  const preset = getPreset(form.presetId);

  const result = useMemo(
    () =>
      computeAgreementCost({
        monthlyRent: toNumber(form.monthlyRent),
        termMonths: toNumber(form.termMonths),
        refundableDeposit: toNumber(form.refundableDeposit),
        nonRefundableDeposit: toNumber(form.nonRefundableDeposit),
        advanceRentMonths: toNumber(form.advanceRentMonths),
        base: form.base,
        stampPercent: toNumber(form.stampPercent),
        registrationMode: form.registrationMode,
        registrationPercent: toNumber(form.registrationPercent),
        registrationFlat: toNumber(form.registrationFlat),
        registerAgreement: form.registerAgreement,
        brokerageMonths: toNumber(form.brokerageMonths),
        brokerageGstApplies: form.brokerageGstApplies,
        otherCharges: toNumber(form.otherCharges),
        statutorySharePercent: toNumber(form.statutorySharePercent),
        brokerageSharePercent: toNumber(form.brokerageSharePercent),
      }),
    [form],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Rent Agreement Cost",
      `State rule: ${preset.label}`,
      `Amount stamp duty is charged on: ${money(result.consideration)}`,
      `Stamp duty: ${money(result.stampDuty)}`,
      `Registration fee: ${money(result.registrationFee)}`,
      `Brokerage incl. GST: ${money(result.brokerageTotal)}`,
      `Total paperwork cost of the deal: ${money(result.transactionCost)}`,
      `Your share of paperwork: ${money(result.yourPaperwork)}`,
      `Cash you need on signing day: ${money(result.upfrontCash)}`,
    ].join("\n");
  }, [hasError, preset.label, result]);

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

  const rows = hasError
    ? [
        ["Amount stamp duty is charged on", DASH],
        ["Stamp duty", DASH],
        ["Registration fee", DASH],
        ["Brokerage", DASH],
        [`GST on brokerage (${GST_ON_BROKERAGE_PERCENT}%)`, DASH],
        ["Other charges you entered", DASH],
        ["Total paperwork cost of the deal", DASH],
        ["Your share of the paperwork", DASH],
        ["Deposits payable", DASH],
        ["Rent paid in advance", DASH],
      ]
    : [
        ["Amount stamp duty is charged on", money(result.consideration)],
        ["Stamp duty", money(result.stampDuty)],
        [
          "Registration fee",
          form.registerAgreement ? money(result.registrationFee) : "Not registering",
        ],
        ["Brokerage", money(result.brokerage)],
        [`GST on brokerage (${GST_ON_BROKERAGE_PERCENT}%)`, money(result.brokerageGst)],
        ["Other charges you entered", money(toNumber(form.otherCharges) || 0)],
        [
          "Total paperwork cost of the deal",
          `${money(result.transactionCost)} (${pct(result.costAsPercentOfRent)} of rent)`,
        ],
        [
          "Your share of the paperwork",
          `${money(result.yourPaperwork)} (${money(result.paperworkPerMonth)}/month)`,
        ],
        [
          "Deposits payable",
          money(result.refundableDeposit + result.nonRefundableDeposit),
        ],
        ["Rent paid in advance", money(result.advanceRent)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileText className="h-4 w-4" aria-hidden="true" />
          Property finance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Rental Agreement Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Adds up stamp duty, the sub-registrar fee, brokerage and GST on a rent agreement using
          your state&apos;s consideration formula, then shows the cash you actually hand over on
          signing day.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="rac-state">
            State stamp rule
          </label>
          <select
            id="rac-state"
            className={`mt-2 ${INPUT_CLASS}`}
            value={form.presetId}
            onChange={changePreset}
          >
            {STATE_PRESETS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{preset.note}</p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rac-rent">
              Monthly rent (INR)
            </label>
            <input
              id="rac-rent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={form.monthlyRent}
              onChange={setField("monthlyRent")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rac-term">
              Agreement term (months)
            </label>
            <input
              id="rac-term"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={form.termMonths}
              onChange={setField("termMonths")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rac-deposit">
              Refundable security deposit (INR)
            </label>
            <input
              id="rac-deposit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5000"
              value={form.refundableDeposit}
              onChange={setField("refundableDeposit")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rac-nonrefund">
              Non-refundable deposit (INR)
            </label>
            <input
              id="rac-nonrefund"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={form.nonRefundableDeposit}
              onChange={setField("nonRefundableDeposit")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rac-stamp">
              Stamp duty rate (%)
            </label>
            <input
              id="rac-stamp"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={form.stampPercent}
              onChange={setField("stampPercent")}
            />
          </div>
          {form.registrationMode === "flat" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="rac-regflat">
                Registration fee (flat, INR)
              </label>
              <input
                id="rac-regflat"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="100"
                value={form.registrationFlat}
                onChange={setField("registrationFlat")}
              />
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="rac-regpct">
                Registration fee (%)
              </label>
              <input
                id="rac-regpct"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.05"
                value={form.registrationPercent}
                onChange={setField("registrationPercent")}
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="rac-broker">
              Brokerage (months of rent)
            </label>
            <input
              id="rac-broker"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="12"
              step="0.25"
              value={form.brokerageMonths}
              onChange={setField("brokerageMonths")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rac-advance">
              Rent paid in advance (months)
            </label>
            <input
              id="rac-advance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={form.advanceRentMonths}
              onChange={setField("advanceRentMonths")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rac-other">
              Notary, e-stamp service, scanning (INR)
            </label>
            <input
              id="rac-other"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={form.otherCharges}
              onChange={setField("otherCharges")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rac-share">
              Your share of stamp &amp; registration (%)
            </label>
            <input
              id="rac-share"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="5"
              value={form.statutorySharePercent}
              onChange={setField("statutorySharePercent")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rac-brokershare">
              Your share of brokerage (%)
            </label>
            <input
              id="rac-brokershare"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="5"
              value={form.brokerageSharePercent}
              onChange={setField("brokerageSharePercent")}
            />
          </div>
          <label className={`mt-2 sm:mt-8 ${CHECK_ROW}`} htmlFor="rac-register">
            <input
              id="rac-register"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={form.registerAgreement}
              onChange={setToggle("registerAgreement")}
            />
            Register the agreement
          </label>
          <label className={CHECK_ROW} htmlFor="rac-gst">
            <input
              id="rac-gst"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={form.brokerageGstApplies}
              onChange={setToggle("brokerageGstApplies")}
            />
            Agent charges GST on brokerage
          </label>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Cash needed on signing day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.upfrontCash)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Deposits, advance rent and your share of the paperwork
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy rent agreement cost breakdown"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only. Stamp and registration rates are set by state law and revised
        from time to time, and sub-registrars may add handling or scanning charges. Confirm the
        current article and fee with the registration department or a lawyer before you pay.
      </p>
    </main>
  );
}
