"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Receipt, RotateCcw } from "lucide-react";

import { LOAD_PRESETS, computeExitLoad, unitsFromAmount } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const units = (value) => NUM.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${PCT.format(Number.isFinite(value) ? value : 0)}%`;

const DASH = "—";

const DEFAULTS = {
  inputMode: "units",
  unitsHeld: "1000",
  investedAmount: "100000",
  unitsRedeemed: "1000",
  purchaseNav: "100",
  currentNav: "130",
  holdingDays: "200",
  loadPercent: "1",
  loadDays: "365",
  freeExitPercent: "10",
  fundType: "equity",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [inputMode, setInputMode] = useState(DEFAULTS.inputMode);
  const [unitsHeld, setUnitsHeld] = useState(DEFAULTS.unitsHeld);
  const [investedAmount, setInvestedAmount] = useState(DEFAULTS.investedAmount);
  const [unitsRedeemed, setUnitsRedeemed] = useState(DEFAULTS.unitsRedeemed);
  const [purchaseNav, setPurchaseNav] = useState(DEFAULTS.purchaseNav);
  const [currentNav, setCurrentNav] = useState(DEFAULTS.currentNav);
  const [holdingDays, setHoldingDays] = useState(DEFAULTS.holdingDays);
  const [loadPercent, setLoadPercent] = useState(DEFAULTS.loadPercent);
  const [loadDays, setLoadDays] = useState(DEFAULTS.loadDays);
  const [freeExitPercent, setFreeExitPercent] = useState(DEFAULTS.freeExitPercent);
  const [fundType, setFundType] = useState(DEFAULTS.fundType);
  const [redeemAll, setRedeemAll] = useState(true);
  const [copied, setCopied] = useState(false);

  const derivedUnitsHeld = useMemo(() => {
    if (inputMode === "units") return toNumber(unitsHeld);
    return unitsFromAmount(toNumber(investedAmount), toNumber(purchaseNav));
  }, [inputMode, unitsHeld, investedAmount, purchaseNav]);

  const result = useMemo(
    () =>
      computeExitLoad({
        unitsHeld: derivedUnitsHeld,
        unitsRedeemed: redeemAll ? derivedUnitsHeld : toNumber(unitsRedeemed),
        purchaseNav: toNumber(purchaseNav),
        currentNav: toNumber(currentNav),
        holdingDays: toNumber(holdingDays),
        loadPercent: toNumber(loadPercent),
        loadDays: toNumber(loadDays),
        freeExitPercent: toNumber(freeExitPercent),
        equityOriented: fundType === "equity",
      }),
    [
      derivedUnitsHeld,
      redeemAll,
      unitsRedeemed,
      purchaseNav,
      currentNav,
      holdingDays,
      loadPercent,
      loadDays,
      freeExitPercent,
      fundType,
    ],
  );

  const hasError = Boolean(result.error);
  const show = (value) => (hasError ? DASH : money(value));

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Mutual fund exit load",
      `Units redeemed: ${units(result.unitsRedeemed)} of ${units(result.unitsHeld)} held`,
      `Redemption value: ${money(result.redemptionValue)}`,
      `Holding period: ${result.holdingDays} days against a ${result.loadDays}-day load period`,
      `Units charged the load: ${units(result.unitsCharged)} (free allowance ${units(result.freeUnitsAllowed)})`,
      `Exit load at ${pct(result.loadPercent)}: ${money(result.exitLoad)}`,
      `STT at ${pct(result.sttRate)}: ${money(result.stt)}`,
      `Net proceeds: ${money(result.netProceeds)}`,
      result.daysToWait > 0 ? `Wait ${result.daysToWait} more days to save ${money(result.savingIfYouWait)}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result]);

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
    setInputMode(DEFAULTS.inputMode);
    setUnitsHeld(DEFAULTS.unitsHeld);
    setInvestedAmount(DEFAULTS.investedAmount);
    setUnitsRedeemed(DEFAULTS.unitsRedeemed);
    setPurchaseNav(DEFAULTS.purchaseNav);
    setCurrentNav(DEFAULTS.currentNav);
    setHoldingDays(DEFAULTS.holdingDays);
    setLoadPercent(DEFAULTS.loadPercent);
    setLoadDays(DEFAULTS.loadDays);
    setFreeExitPercent(DEFAULTS.freeExitPercent);
    setFundType(DEFAULTS.fundType);
    setRedeemAll(true);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          Redemption cost
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Mutual Fund Exit Load Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Exit load is charged on the redemption value, not on your gain, and most equity schemes let
          10% of the units out free. See exactly what leaves your redemption cheque.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="el-inputmode">
              Describe my holding by
            </label>
            <select
              id="el-inputmode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={inputMode}
              onChange={(event) => setInputMode(event.target.value)}
            >
              <option value="units">Number of units</option>
              <option value="amount">Amount invested</option>
            </select>
          </div>

          {inputMode === "units" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="el-units-held">
                Units held
              </label>
              <input
                id="el-units-held"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.001"
                value={unitsHeld}
                onChange={(event) => setUnitsHeld(event.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="el-invested">
                Amount invested (INR)
              </label>
              <input
                id="el-invested"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1000"
                value={investedAmount}
                onChange={(event) => setInvestedAmount(event.target.value)}
              />
              <p className={HINT_CLASS}>
                Works out to {units(derivedUnitsHeld)} units at the purchase NAV.
              </p>
            </div>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="el-purchase-nav">
              Purchase NAV (INR)
            </label>
            <input
              id="el-purchase-nav"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={purchaseNav}
              onChange={(event) => setPurchaseNav(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="el-current-nav">
              Current / applicable NAV (INR)
            </label>
            <input
              id="el-current-nav"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={currentNav}
              onChange={(event) => setCurrentNav(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="el-holding-days">
              Holding period (days since allotment)
            </label>
            <input
              id="el-holding-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={holdingDays}
              onChange={(event) => setHoldingDays(event.target.value)}
            />
            <p className={HINT_CLASS}>Units are taken out first in, first out.</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="el-fund-type">
              Scheme type
            </label>
            <select
              id="el-fund-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={fundType}
              onChange={(event) => setFundType(event.target.value)}
            >
              <option value="equity">Equity-oriented (STT applies)</option>
              <option value="other">Debt / other (no STT)</option>
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="el-load-percent">
              Exit load (%)
            </label>
            <input
              id="el-load-percent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="7"
              step="0.05"
              value={loadPercent}
              onChange={(event) => setLoadPercent(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="el-load-days">
              Load period (days)
            </label>
            <input
              id="el-load-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={loadDays}
              onChange={(event) => setLoadDays(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="el-free-percent">
              Free-exit allowance (% of units held)
            </label>
            <input
              id="el-free-percent"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={freeExitPercent}
              onChange={(event) => setFreeExitPercent(event.target.value)}
            />
            <p className={HINT_CLASS}>Set to 0 if your scheme has no free-exit facility.</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="el-units-redeemed">
              Units being redeemed
            </label>
            <input
              id="el-units-redeemed"
              className={`mt-2 ${INPUT_CLASS} disabled:opacity-60`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.001"
              disabled={redeemAll}
              value={redeemAll ? String(derivedUnitsHeld) : unitsRedeemed}
              onChange={(event) => setUnitsRedeemed(event.target.value)}
            />
            <label className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={redeemAll}
                onChange={(event) => setRedeemAll(event.target.checked)}
              />
              Redeem everything
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {LOAD_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setLoadPercent(String(preset.loadPercent));
                setLoadDays(String(preset.loadDays));
                setFreeExitPercent(String(preset.freePercent));
              }}
              className={CHIP_BTN}
            >
              {preset.label}
            </button>
          ))}
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
              Net redemption proceeds
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {show(result.netProceeds)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see your figures."
                : result.insideLoadPeriod
                  ? `Exit load ${money(result.exitLoad)} deducted — ${result.daysToWait} days short of the load period`
                  : "No exit load: the units are past the load period"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the exit load result"
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Redemption value", show(result.redemptionValue)],
            ["Cost of the units redeemed", show(result.costValue)],
            ["Gross gain before charges", show(result.grossGain)],
            [
              "Units free of load",
              hasError ? DASH : `${units(result.freeUnitsUsed)} of ${units(result.freeUnitsAllowed)} allowed`,
            ],
            ["Units charged the load", hasError ? DASH : units(result.unitsCharged)],
            ["Value attracting the load", show(result.chargeableValue)],
            ["Exit load", show(result.exitLoad)],
            [
              "Securities transaction tax",
              hasError ? DASH : `${money(result.stt)} at ${pct(result.sttRate)}`,
            ],
            ["Total deductions", show(result.totalDeductions)],
            ["Deductions as a share of redemption value", hasError ? DASH : pct(result.deductionPercent)],
            ["Net gain after charges", show(result.netGain)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.daysToWait > 0 && result.exitLoad > 0 && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            Waiting {result.daysToWait} more days takes the units past the load period and saves{" "}
            {money(result.savingIfYouWait)}, before any change in NAV.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Estimate only. Capital gains tax is not included here and depends on your holding period and
        the scheme category. Always check the exit load clause in the scheme information document,
        which the AMC can change with notice.
      </p>
    </main>
  );
}
