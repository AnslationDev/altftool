"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Stamp } from "lucide-react";

import { STATE_PRESETS, estimateRegistrationCost, presetById } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const DASH = "—";

const DEFAULT_STATE = "maharashtra";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const initialFrom = (preset) => ({
  stampDutyPercent: String(preset.stampDutyPercent),
  cessPercentOfStampDuty: String(preset.cessPercentOfStampDuty),
  transferDutyPercent: String(preset.transferDutyPercent),
  registrationPercent: String(preset.registrationPercent),
  registrationCap: preset.registrationCap === null ? "" : String(preset.registrationCap),
  scanningPerPage: String(preset.scanningPerPage),
});

const START = initialFrom(presetById(DEFAULT_STATE));

export default function ToolHome() {
  const [stateId, setStateId] = useState(DEFAULT_STATE);
  const [considerationValue, setConsiderationValue] = useState("8000000");
  const [circleRateValue, setCircleRateValue] = useState("7500000");
  const [stampDutyPercent, setStampDutyPercent] = useState(START.stampDutyPercent);
  const [cessPercent, setCessPercent] = useState(START.cessPercentOfStampDuty);
  const [transferDutyPercent, setTransferDutyPercent] = useState(START.transferDutyPercent);
  const [registrationPercent, setRegistrationPercent] = useState(START.registrationPercent);
  const [registrationCap, setRegistrationCap] = useState(START.registrationCap);
  const [pages, setPages] = useState("40");
  const [scanningPerPage, setScanningPerPage] = useState(START.scanningPerPage);
  const [frankingPercent, setFrankingPercent] = useState("0");
  const [frankingFlat, setFrankingFlat] = useState("0");
  const [documentHandlingCharge, setDocumentHandlingCharge] = useState("0");
  const [legalFee, setLegalFee] = useState("0");
  const [agriculturalLand, setAgriculturalLand] = useState(false);
  const [copied, setCopied] = useState(false);

  const preset = presetById(stateId);

  const applyState = (id) => {
    const next = presetById(id);
    const values = initialFrom(next);
    setStateId(id);
    setStampDutyPercent(values.stampDutyPercent);
    setCessPercent(values.cessPercentOfStampDuty);
    setTransferDutyPercent(values.transferDutyPercent);
    setRegistrationPercent(values.registrationPercent);
    setRegistrationCap(values.registrationCap);
    setScanningPerPage(values.scanningPerPage);
  };

  const result = useMemo(
    () =>
      estimateRegistrationCost({
        considerationValue: toNumber(considerationValue),
        circleRateValue: toNumber(circleRateValue),
        stampDutyPercent: toNumber(stampDutyPercent),
        cessPercentOfStampDuty: toNumber(cessPercent),
        transferDutyPercent: toNumber(transferDutyPercent),
        registrationPercent: toNumber(registrationPercent),
        registrationCap: String(registrationCap).trim() === "" ? null : toNumber(registrationCap),
        pages: toNumber(pages),
        scanningPerPage: toNumber(scanningPerPage),
        frankingPercent: toNumber(frankingPercent),
        frankingFlat: toNumber(frankingFlat),
        documentHandlingCharge: toNumber(documentHandlingCharge),
        legalFee: toNumber(legalFee),
        agriculturalLand,
      }),
    [
      considerationValue,
      circleRateValue,
      stampDutyPercent,
      cessPercent,
      transferDutyPercent,
      registrationPercent,
      registrationCap,
      pages,
      scanningPerPage,
      frankingPercent,
      frankingFlat,
      documentHandlingCharge,
      legalFee,
      agriculturalLand,
    ],
  );

  const hasError = Boolean(result.error);
  const show = (value) => (hasError ? DASH : money(value));

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Property registration cost — ${preset.name}`,
      `Agreement value: ${money(result.considerationValue)}`,
      `Chargeable value: ${money(result.chargeableValue)}${result.usesCircleRate ? " (circle rate is higher)" : ""}`,
      `Stamp duty at ${pct(result.stampDutyPercent)}: ${money(result.stampDuty)}`,
      result.cess > 0 ? `Cess on stamp duty: ${money(result.cess)}` : "",
      result.transferDuty > 0 ? `Transfer duty: ${money(result.transferDuty)}` : "",
      `Registration fee: ${money(result.registrationFee)}${result.registrationCapped ? " (capped)" : ""}`,
      result.incidentalCharges > 0 ? `Scanning, franking and other charges: ${money(result.incidentalCharges)}` : "",
      `Total charges: ${money(result.totalCharges)} (${pct(result.totalChargesPercent)} of value)`,
      `All-in cost: ${money(result.allInCost)}`,
      result.tdsApplies ? `Section 194-IA TDS to withhold: ${money(result.tds194ia)}` : "Section 194-IA TDS: not applicable",
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result, preset]);

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
    applyState(DEFAULT_STATE);
    setConsiderationValue("8000000");
    setCircleRateValue("7500000");
    setPages("40");
    setFrankingPercent("0");
    setFrankingFlat("0");
    setDocumentHandlingCharge("0");
    setLegalFee("0");
    setAgriculturalLand(false);
    setCopied(false);
  };

  const rateFields = [
    ["pr-stamp", "Stamp duty (% of chargeable value)", stampDutyPercent, setStampDutyPercent, "0.05", null],
    [
      "pr-cess",
      "Cess or surcharge (% of stamp duty)",
      cessPercent,
      setCessPercent,
      "1",
      "Karnataka and Rajasthan compute this on the duty, not on the value.",
    ],
    [
      "pr-transfer",
      "Transfer duty (% of chargeable value)",
      transferDutyPercent,
      setTransferDutyPercent,
      "0.1",
      "Used by Telangana and Andhra Pradesh.",
    ],
    [
      "pr-reg",
      "Registration fee (% of chargeable value)",
      registrationPercent,
      setRegistrationPercent,
      "0.1",
      null,
    ],
  ];

  const chargeFields = [
    ["pr-pages", "Pages in the deed", pages, setPages, "1", null],
    ["pr-scan", "Scanning charge per page (INR)", scanningPerPage, setScanningPerPage, "1", null],
    [
      "pr-franking-pct",
      "Franking service charge (% of value)",
      frankingPercent,
      setFrankingPercent,
      "0.01",
      "The agent's fee for franking, not the stamp duty itself.",
    ],
    ["pr-franking-flat", "Flat franking / e-stamping fee (INR)", frankingFlat, setFrankingFlat, "50", null],
    [
      "pr-dhc",
      "Document handling / pasting charge (INR)",
      documentHandlingCharge,
      setDocumentHandlingCharge,
      "50",
      null,
    ],
    ["pr-legal", "Advocate or deed-writer fee (INR)", legalFee, setLegalFee, "500", null],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Stamp className="h-4 w-4" aria-hidden="true" />
          Sale deed costs
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Property Registration Charge Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Stamp duty and the registration fee are charged on the higher of the agreement value and
          the government circle rate. Add scanning, franking and legal fees to get the cash you
          actually need on the day of registration.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pr-state">
              State
            </label>
            <select
              id="pr-state"
              className={`mt-2 ${INPUT_CLASS}`}
              value={stateId}
              onChange={(event) => applyState(event.target.value)}
            >
              {STATE_PRESETS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>{preset.note}</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="pr-consideration">
              Agreement value (INR)
            </label>
            <input
              id="pr-consideration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100000"
              value={considerationValue}
              onChange={(event) => setConsiderationValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-circle">
              Circle / ready reckoner value (INR)
            </label>
            <input
              id="pr-circle"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100000"
              value={circleRateValue}
              onChange={(event) => setCircleRateValue(event.target.value)}
            />
            <p className={HINT_CLASS}>Duty is charged on whichever of the two is higher.</p>
          </div>

          {rateFields.map(([id, label, value, setter, step, hint]) => (
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
              {hint && <p className={HINT_CLASS}>{hint}</p>}
            </div>
          ))}

          <div>
            <label className={LABEL_CLASS} htmlFor="pr-reg-cap">
              Registration fee cap (INR)
            </label>
            <input
              id="pr-reg-cap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              placeholder="No cap"
              value={registrationCap}
              onChange={(event) => setRegistrationCap(event.target.value)}
            />
            <p className={HINT_CLASS}>Leave blank where the state does not cap it.</p>
          </div>

          {chargeFields.map(([id, label, value, setter, step, hint]) => (
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
              {hint && <p className={HINT_CLASS}>{hint}</p>}
            </div>
          ))}

          <div className="sm:col-span-2">
            <label className="inline-flex min-h-11 items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={agriculturalLand}
                onChange={(event) => setAgriculturalLand(event.target.checked)}
              />
              This is agricultural land (outside section 194-IA)
            </label>
          </div>
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
              Total registration cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {show(result.totalCharges)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your figures."
                : `${pct(result.totalChargesPercent)} of a chargeable value of ${money(result.chargeableValue)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the property registration cost estimate"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.lineItems.length > 0 && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Charge</th>
                  <th scope="col" className="py-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {result.lineItems.map((row) => (
                  <tr key={row.label} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.label}</td>
                    <td className="py-2 text-right font-semibold">{money(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Chargeable value", show(result.chargeableValue)],
            ["Statutory charges (duty, cess, registration)", show(result.statutoryCharges)],
            ["Incidental charges (scanning, franking, legal)", show(result.incidentalCharges)],
            [
              "Registration fee before any cap",
              hasError
                ? DASH
                : result.registrationCapped
                  ? `${money(result.registrationBeforeCap)} — capped to ${money(result.registrationFee)}`
                  : money(result.registrationBeforeCap),
            ],
            ["All-in cost including the price", show(result.allInCost)],
            [
              "Section 194-IA TDS at 1%",
              hasError
                ? DASH
                : result.tdsApplies
                  ? money(result.tds194ia)
                  : `Not applicable below ${money(result.tdsThreshold)}`,
            ],
            ["Amount payable to the seller after TDS", show(result.netToSeller)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.usesCircleRate && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            The circle rate is above the agreement value, so duty is charged on{" "}
            {money(result.chargeableValue)}. The difference may also be taxed in the buyer's hands
            under section 56(2)(x) — worth checking with a tax professional.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Indicative estimate. State rates carry district, municipal and gender-based variations, are
        revised from time to time, and concessions may apply. Every rate here is editable — confirm
        the current figures with the sub-registrar or your state's registration department before
        paying. Not legal or tax advice.
      </p>
    </main>
  );
}
