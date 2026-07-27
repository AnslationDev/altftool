"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw } from "lucide-react";

import {
  DEFAULT_FREE_PIPING_M,
  LPG_CYLINDER_KG,
  estimatePngConnection,
} from "../lib";

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
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);
const money2 = (v) => (Number.isFinite(v) ? INR2.format(v) : DASH);
const num1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : DASH);
const num2 = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);

const DEFAULTS = {
  registration: "750",
  deposit: "6000",
  installation: "1500",
  piping: "12",
  freePiping: String(DEFAULT_FREE_PIPING_M),
  pipingRate: "250",
  points: "1",
  pointRate: "1200",
  holes: "2",
  holeRate: "300",
  conversion: "800",
  civil: "0",
  lpgRefund: "2200",
  cylinders: "1.2",
  cylinderPrice: "900",
  pngRate: "48",
  pngFixed: "25",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNum = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [values, setValues] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) =>
    setValues((prev) => ({ ...prev, [key]: event.target.value }));

  const result = useMemo(
    () =>
      estimatePngConnection({
        registrationFee: toNum(values.registration),
        securityDeposit: toNum(values.deposit),
        installationCharge: toNum(values.installation),
        pipingMetres: toNum(values.piping),
        freePipingMetres: toNum(values.freePiping),
        pipingRatePerMetre: toNum(values.pipingRate),
        extraPoints: toNum(values.points),
        ratePerPoint: toNum(values.pointRate),
        coreHoles: toNum(values.holes),
        coreRate: toNum(values.holeRate),
        applianceConversion: toNum(values.conversion),
        civilWork: toNum(values.civil),
        lpgDepositRefund: toNum(values.lpgRefund),
        cylindersPerMonth: toNum(values.cylinders),
        cylinderPrice: toNum(values.cylinderPrice),
        pngRatePerScm: toNum(values.pngRate),
        pngFixedPerMonth: toNum(values.pngFixed),
      }),
    [values],
  );

  const hasError = Boolean(result.error);

  const rows = hasError
    ? [
        ["Registration or application fee", DASH],
        ["Installation and commissioning", DASH],
        ["Internal piping", DASH],
        ["Extra gas points", DASH],
        ["Core drilling", DASH],
        ["Appliance conversion", DASH],
        ["Civil work and making good", DASH],
        ["Refundable security deposit", DASH],
        ["Total paid upfront", DASH],
        ["Less LPG deposit refunded", DASH],
        ["Net cash needed today", DASH],
        ["LPG cost per month now", DASH],
        ["Piped gas per month", DASH],
        ["Saving per month", DASH],
        ["Saving per year", DASH],
        ["Payback on non-refundable charges", DASH],
      ]
    : [
        ...result.nonRefundableItems.map(([label, value]) => [label, money(value)]),
        ["Refundable security deposit", money(result.securityDeposit)],
        ["Total paid upfront", money(result.upfrontTotal)],
        ["Less LPG deposit refunded", `-${money(result.lpgDepositRefund)}`],
        ["Net cash needed today", money(result.netUpfrontAfterLpgRefund)],
        ["LPG cost per month now", money2(result.monthlyLpgCost)],
        [
          "Piped gas per month",
          `${money2(result.monthlyPngCost)} for ${num2(result.monthlyScm)} SCM`,
        ],
        ["Saving per month", money2(result.monthlySaving)],
        ["Saving per year", money2(result.annualSaving)],
        [
          "Payback on non-refundable charges",
          result.paybackMonths === null
            ? "no payback at these rates"
            : `${num1(result.paybackMonths)} months`,
        ],
      ];

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "PNG Connection Cost Estimator",
      `Non-refundable cost of the connection: ${money(result.nonRefundable)}`,
      `Total paid upfront including the refundable deposit: ${money(result.upfrontTotal)}`,
      ...rows.map(([label, value]) => `${label}: ${value}`),
      ...result.notes.map((note) => `Note: ${note}`),
    ].join("\n");
  }, [hasError, result, rows]);

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
    setValues(DEFAULTS);
    setCopied(false);
  };

  const connectionFields = [
    ["pcc-registration", "Registration or application fee (₹)", "registration", "50"],
    ["pcc-deposit", "Refundable security deposit (₹)", "deposit", "100"],
    ["pcc-installation", "Installation and commissioning (₹)", "installation", "100"],
    ["pcc-conversion", "Hob or appliance conversion (₹)", "conversion", "50"],
  ];

  const pipingFields = [
    ["pcc-piping", "Internal piping needed (m)", "piping", "0.5"],
    ["pcc-freepiping", "Piping included free (m)", "freePiping", "0.5"],
    ["pcc-pipingrate", "Piping rate (₹ per m)", "pipingRate", "10"],
    ["pcc-points", "Extra gas points beyond the first", "points", "1"],
    ["pcc-pointrate", "Rate per extra point (₹)", "pointRate", "50"],
    ["pcc-holes", "Core-drilled wall holes", "holes", "1"],
    ["pcc-holerate", "Core drilling rate (₹ per hole)", "holeRate", "25"],
    ["pcc-civil", "Civil work and making good (₹)", "civil", "100"],
  ];

  const compareFields = [
    ["pcc-lpgrefund", "LPG deposit you get back (₹)", "lpgRefund", "100"],
    ["pcc-cylinders", `Cylinders used per month (${LPG_CYLINDER_KG} kg)`, "cylinders", "0.1"],
    ["pcc-cylinderprice", "Cylinder price you pay (₹)", "cylinderPrice", "10"],
    ["pcc-pngrate", "PNG rate (₹ per SCM)", "pngRate", "0.5"],
    ["pcc-pngfixed", "PNG fixed charge per month (₹)", "pngFixed", "5"],
  ];

  const groups = [
    ["Connection charges", connectionFields],
    ["Piping and points", pipingFields],
    ["Compared with your LPG", compareFields],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          New connection
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          PNG Connection Cost Estimator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Most of what you pay at connection time comes back. This separates the refundable
          deposit from the charges that do not return, and pays back only the latter against LPG.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        {groups.map(([title, fields], groupIndex) => (
          <div
            key={title}
            className={groupIndex === 0 ? "" : "mt-5 border-t border-[var(--border)] pt-5"}
          >
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
              {title}
            </h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {fields.map(([id, label, key, step]) => (
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
                    value={values[key]}
                    onChange={set(key)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Cost you never get back
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.nonRefundable)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the estimate."
                : `${money(result.upfrontTotal)} paid upfront, of which ${money(result.securityDeposit)} is a refundable deposit`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy PNG connection estimate"
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

        {!hasError &&
          result.notes.map((note) => (
            <p
              key={note}
              className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
            >
              {note}
            </p>
          ))}

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
        Charges differ by distributor, city and scheme and are revised periodically — take the
        figures from your distributor's published schedule rather than the defaults here. The LPG
        comparison uses calorific equivalence, so it moves with the cylinder price you actually pay
        and your city's per-SCM rate. All gas work, including hob conversion, must be done by the
        distributor's authorised technician.
      </p>
    </main>
  );
}
