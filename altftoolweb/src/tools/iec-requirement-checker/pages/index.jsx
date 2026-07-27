"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Ship } from "lucide-react";

import {
  BORDER_ROUTE_OPTIONS,
  BORDER_TRADE_CIF_LIMIT,
  DEALING_OPTIONS,
  NATHULA_CIF_LIMIT,
  checkIecRequirement,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => (Number.isFinite(value) ? INR.format(value) : "—");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm transition hover:border-[var(--primary)] focus-within:ring-[3px] focus-within:ring-[var(--primary)]/25";
const CHECKBOX_CLASS =
  "mt-0.5 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DEFAULTS = {
  dealing: "goods",
  personalUse: false,
  isGovernment: false,
  borderRoute: "none",
  consignmentCif: "",
  claimsFtpBenefits: false,
  isScomet: false,
};

const DASH = "—";

export default function ToolHome() {
  const [dealing, setDealing] = useState(DEFAULTS.dealing);
  const [personalUse, setPersonalUse] = useState(DEFAULTS.personalUse);
  const [isGovernment, setIsGovernment] = useState(DEFAULTS.isGovernment);
  const [borderRoute, setBorderRoute] = useState(DEFAULTS.borderRoute);
  const [consignmentCif, setConsignmentCif] = useState(DEFAULTS.consignmentCif);
  const [claimsFtpBenefits, setClaimsFtpBenefits] = useState(DEFAULTS.claimsFtpBenefits);
  const [isScomet, setIsScomet] = useState(DEFAULTS.isScomet);
  const [copied, setCopied] = useState(false);

  const isGoods = dealing === "goods";
  const isBorder = isGoods && borderRoute !== "none";

  const result = useMemo(() => {
    const trimmed = consignmentCif.trim();
    const cif = trimmed === "" ? 0 : Number(trimmed);
    if (trimmed !== "" && !Number.isFinite(cif)) {
      return { error: "Enter the consignment CIF value as a number." };
    }
    return checkIecRequirement({
      dealing,
      personalUse,
      isGovernment,
      borderRoute: isGoods ? borderRoute : "none",
      consignmentCif: cif,
      claimsFtpBenefits,
      isScomet,
    });
  }, [dealing, personalUse, isGovernment, borderRoute, consignmentCif, claimsFtpBenefits, isScomet, isGoods]);

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Import Export Code (IEC) requirement check",
      `Activity: ${DEALING_OPTIONS.find((option) => option.id === dealing)?.label ?? dealing}`,
      `Verdict: ${result.headline}`,
      "",
      "Why:",
      ...result.reasons.map((reason) => `- ${reason}`),
      "",
      "Next steps:",
      ...result.nextSteps.map((step) => `- ${step}`),
    ].join("\n");
  }, [hasError, result, dealing]);

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
    setDealing(DEFAULTS.dealing);
    setPersonalUse(DEFAULTS.personalUse);
    setIsGovernment(DEFAULTS.isGovernment);
    setBorderRoute(DEFAULTS.borderRoute);
    setConsignmentCif(DEFAULTS.consignmentCif);
    setClaimsFtpBenefits(DEFAULTS.claimsFtpBenefits);
    setIsScomet(DEFAULTS.isScomet);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Ship className="h-4 w-4" aria-hidden="true" />
          FTP 2023, Para 2.05
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Import Export Code Requirement Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Commercial goods always need an IEC; services usually do not; and a short exemption list
          — personal use, government departments and small border-trade consignments — takes the
          rest out. Answer the questions to see where you stand.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="iec-dealing">
              What will you import or export
            </label>
            <select
              id="iec-dealing"
              className={`mt-2 ${INPUT_CLASS}`}
              value={dealing}
              onChange={(event) => setDealing(event.target.value)}
            >
              {DEALING_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {isGoods ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="iec-route">
                Trade route
              </label>
              <select
                id="iec-route"
                className={`mt-2 ${INPUT_CLASS}`}
                value={borderRoute}
                onChange={(event) => setBorderRoute(event.target.value)}
              >
                {BORDER_ROUTE_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {isBorder ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="iec-cif">
                CIF value of one consignment (INR)
              </label>
              <input
                id="iec-cif"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1000"
                value={consignmentCif}
                onChange={(event) => setConsignmentCif(event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Exempt up to {money(BORDER_TRADE_CIF_LIMIT)} per consignment on this route (
                {money(NATHULA_CIF_LIMIT)} through Nathula).
              </p>
            </div>
          ) : null}
        </div>

        <fieldset className="mt-5 border-t border-[var(--border)] pt-5">
          <legend className={LABEL_CLASS}>Tick whatever applies</legend>
          <div className="mt-3 grid gap-2">
            {isGoods ? (
              <label className={CHECK_ROW} htmlFor="iec-personal">
                <input
                  id="iec-personal"
                  type="checkbox"
                  className={CHECKBOX_CLASS}
                  checked={personalUse}
                  onChange={(event) => setPersonalUse(event.target.checked)}
                />
                <span className="flex-1">
                  For personal use only — not connected with trade, manufacture or agriculture
                </span>
              </label>
            ) : (
              <label className={CHECK_ROW} htmlFor="iec-ftp">
                <input
                  id="iec-ftp"
                  type="checkbox"
                  className={CHECKBOX_CLASS}
                  checked={claimsFtpBenefits}
                  onChange={(event) => setClaimsFtpBenefits(event.target.checked)}
                />
                <span className="flex-1">
                  I claim (or plan to claim) benefits under the Foreign Trade Policy
                </span>
              </label>
            )}
            <label className={CHECK_ROW} htmlFor="iec-govt">
              <input
                id="iec-govt"
                type="checkbox"
                className={CHECKBOX_CLASS}
                checked={isGovernment}
                onChange={(event) => setIsGovernment(event.target.checked)}
              />
              <span className="flex-1">
                Applicant is a Ministry or Department of the Central or a State Government
              </span>
            </label>
            <label className={CHECK_ROW} htmlFor="iec-scomet">
              <input
                id="iec-scomet"
                type="checkbox"
                className={CHECKBOX_CLASS}
                checked={isScomet}
                onChange={(event) => setIsScomet(event.target.checked)}
              />
              <span className="flex-1">
                The item is on the SCOMET dual-use list (special chemicals, organisms, materials,
                equipment and technologies)
              </span>
            </label>
          </div>
        </fieldset>
      </section>

      {hasError ? (
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
              Verdict
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? DASH : result.headline}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the IEC requirement result"
              className={GHOST_BTN}
              disabled={hasError}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["DGFT application fee (form ANF-2A)", hasError ? DASH : money(result.applicationFee)],
            ["Annual update window", hasError ? DASH : result.updateWindow],
            ["Border-trade exemption ceiling", money(BORDER_TRADE_CIF_LIMIT)],
            ["Nathula route ceiling", money(NATHULA_CIF_LIMIT)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Why</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
              {result.reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]"
                    aria-hidden="true"
                  />
                  {reason}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Next steps</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {result.nextSteps.map((step) => (
                <li key={step} className="flex items-start gap-2">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]"
                    aria-hidden="true"
                  />
                  {step}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. The Foreign Trade Policy and its exemption list are
        amended by DGFT notifications from time to time; confirm the current position on
        dgft.gov.in or with a customs broker before shipping.
      </p>
    </main>
  );
}
