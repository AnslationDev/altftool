"use client";

import { useMemo, useState } from "react";
import { Check, CircleCheckBig, CircleX, Copy, Gift, RotateCcw, TriangleAlert } from "lucide-react";

import {
  GIFT_TYPES,
  IMMOVABLE_SAFE_HARBOUR_PERCENT,
  IMMOVABLE_SAFE_HARBOUR_PERCENT_LEGACY,
  MONETARY_THRESHOLD,
  OCCASIONS,
  SPECIFIED_MOVABLE_PROPERTY,
  assessGift,
  relationshipsFor,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  recipientType: "individual",
  relationshipId: "nephewNiece",
  occasionId: "none",
  giftType: "money",
  moneyAmount: "300000",
  stampDutyValue: "5000000",
  fairMarketValue: "200000",
  consideration: "0",
};

export default function ToolHome() {
  const [recipientType, setRecipientType] = useState(DEFAULTS.recipientType);
  const [relationshipId, setRelationshipId] = useState(DEFAULTS.relationshipId);
  const [occasionId, setOccasionId] = useState(DEFAULTS.occasionId);
  const [giftType, setGiftType] = useState(DEFAULTS.giftType);
  const [moneyAmount, setMoneyAmount] = useState(DEFAULTS.moneyAmount);
  const [stampDutyValue, setStampDutyValue] = useState(DEFAULTS.stampDutyValue);
  const [fairMarketValue, setFairMarketValue] = useState(DEFAULTS.fairMarketValue);
  const [consideration, setConsideration] = useState(DEFAULTS.consideration);
  const [receivedInCash, setReceivedInCash] = useState(false);
  const [useLegacySafeHarbour, setUseLegacySafeHarbour] = useState(false);
  const [copied, setCopied] = useState(false);

  const options = relationshipsFor(recipientType);

  const changeRecipientType = (next) => {
    setRecipientType(next);
    setRelationshipId(next === "huf" ? "hufMember" : "nephewNiece");
  };

  const result = useMemo(
    () =>
      assessGift({
        recipientType,
        relationshipId,
        occasionId,
        giftType,
        moneyAmount: moneyAmount === "" ? 0 : Number(moneyAmount),
        stampDutyValue: stampDutyValue === "" ? 0 : Number(stampDutyValue),
        fairMarketValue: fairMarketValue === "" ? 0 : Number(fairMarketValue),
        consideration: consideration === "" ? 0 : Number(consideration),
        receivedInCash,
        safeHarbourPercent: useLegacySafeHarbour
          ? IMMOVABLE_SAFE_HARBOUR_PERCENT_LEGACY
          : IMMOVABLE_SAFE_HARBOUR_PERCENT,
      }),
    [
      recipientType,
      relationshipId,
      occasionId,
      giftType,
      moneyAmount,
      stampDutyValue,
      fairMarketValue,
      consideration,
      receivedInCash,
      useLegacySafeHarbour,
    ],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Gift Tax Relative Definition Checker — section 56(2)(x)",
      `Receiver: ${result.recipientType === "huf" ? "Hindu undivided family" : "Individual"}`,
      `Giver: ${result.relationship.label}`,
      `Is a relative: ${result.isRelative ? "Yes" : "No"} (${result.relationship.clause})`,
      `What was received: ${result.giftType.label}`,
      `Value: ${money(result.grossValue)}`,
      `Verdict: ${result.verdict}`,
      `Reason: ${result.exempt ? result.exemptions.map((e) => e.title).join("; ") : result.computation.basis}`,
    ];
    if (result.cashBreach) lines.push("", `Warning: ${result.cashBreachNote}`);
    if (result.clubbingApplies) lines.push("", `Note: ${result.clubbingNote}`);
    return lines.join("\n");
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
    setRecipientType(DEFAULTS.recipientType);
    setRelationshipId(DEFAULTS.relationshipId);
    setOccasionId(DEFAULTS.occasionId);
    setGiftType(DEFAULTS.giftType);
    setMoneyAmount(DEFAULTS.moneyAmount);
    setStampDutyValue(DEFAULTS.stampDutyValue);
    setFairMarketValue(DEFAULTS.fairMarketValue);
    setConsideration(DEFAULTS.consideration);
    setReceivedInCash(false);
    setUseLegacySafeHarbour(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gift className="h-4 w-4" aria-hidden="true" />
          Certificates India
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Gift Tax Relative Definition Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The statutory definition of &quot;relative&quot; is not symmetric. A gift from your uncle is
          exempt; the same gift from your nephew is taxable. Pick the relationship and see the
          answer with the exact item of section 56(2)(x) behind it.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gtr-recipient">
              Who received the gift?
            </label>
            <select
              id="gtr-recipient"
              className={`mt-2 ${INPUT_CLASS}`}
              value={recipientType}
              onChange={(event) => changeRecipientType(event.target.value)}
            >
              <option value="individual">An individual</option>
              <option value="huf">A Hindu undivided family</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gtr-relationship">
              The giver is my
            </label>
            <select
              id="gtr-relationship"
              className={`mt-2 ${INPUT_CLASS}`}
              value={relationshipId}
              onChange={(event) => setRelationshipId(event.target.value)}
            >
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gtr-occasion">
              Occasion
            </label>
            <select
              id="gtr-occasion"
              className={`mt-2 ${INPUT_CLASS}`}
              value={occasionId}
              onChange={(event) => setOccasionId(event.target.value)}
            >
              {OCCASIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gtr-type">
              What was received
            </label>
            <select
              id="gtr-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={giftType}
              onChange={(event) => setGiftType(event.target.value)}
            >
              {GIFT_TYPES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {giftType === "money" && (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="gtr-money">
                Total money received from everyone in the year (INR)
              </label>
              <input
                id="gtr-money"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="1000"
                value={moneyAmount}
                onChange={(event) => setMoneyAmount(event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                The {money(MONETARY_THRESHOLD)} test looks at the aggregate for the whole year, and
                once it is crossed the entire aggregate is taxable.
              </p>
            </div>
          )}

          {giftType === "immovable" && (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="gtr-sdv">
                  Stamp duty value of the property (INR)
                </label>
                <input
                  id="gtr-sdv"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="10000"
                  value={stampDutyValue}
                  onChange={(event) => setStampDutyValue(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="gtr-consideration-imm">
                  Price you paid, 0 if it was a gift (INR)
                </label>
                <input
                  id="gtr-consideration-imm"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="10000"
                  value={consideration}
                  onChange={(event) => setConsideration(event.target.value)}
                />
              </div>
            </>
          )}

          {giftType === "movable" && (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="gtr-fmv">
                  Fair market value received in the year (INR)
                </label>
                <input
                  id="gtr-fmv"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1000"
                  value={fairMarketValue}
                  onChange={(event) => setFairMarketValue(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="gtr-consideration-mov">
                  Price you paid, 0 if it was a gift (INR)
                </label>
                <input
                  id="gtr-consideration-mov"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1000"
                  value={consideration}
                  onChange={(event) => setConsideration(event.target.value)}
                />
              </div>
              <p className="text-xs text-[var(--muted-foreground)] sm:col-span-2">
                Only specified movable property is covered: {SPECIFIED_MOVABLE_PROPERTY.join(", ")}.
                A car, furniture or a household appliance falls outside the clause entirely.
              </p>
            </>
          )}
        </div>

        <div className="mt-4 grid gap-2">
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
            htmlFor="gtr-cash"
          >
            <input
              id="gtr-cash"
              type="checkbox"
              className="h-5 w-5 shrink-0 accent-[var(--primary)]"
              checked={receivedInCash}
              onChange={(event) => setReceivedInCash(event.target.checked)}
            />
            <span>It was received in cash</span>
          </label>
          {giftType === "immovable" && (
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              htmlFor="gtr-legacy"
            >
              <input
                id="gtr-legacy"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={useLegacySafeHarbour}
                onChange={(event) => setUseLegacySafeHarbour(event.target.checked)}
              />
              <span>
                Use the older {IMMOVABLE_SAFE_HARBOUR_PERCENT_LEGACY}% safe harbour (before
                assessment year 2021-22)
              </span>
            </label>
          )}
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
              Taxable in the receiver&apos;s hands
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.taxable)}
            </p>
            <p
              className={`mt-1 text-sm font-semibold ${
                hasError
                  ? "text-[var(--muted-foreground)]"
                  : result.taxable > 0
                    ? "text-[var(--danger)]"
                    : "text-[var(--success)]"
              }`}
            >
              {hasError ? "Fix the input above to see the answer." : result.verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the gift tax assessment"
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

        {!hasError && (
          <div
            className={`mt-4 flex items-start gap-3 rounded-lg p-3 ${
              result.isRelative ? "bg-[var(--muted)]" : "border border-[var(--border)]"
            }`}
          >
            <span className="mt-0.5 shrink-0" aria-hidden="true">
              {result.isRelative ? (
                <CircleCheckBig className="h-5 w-5 text-[var(--success)]" />
              ) : (
                <CircleX className="h-5 w-5 text-[var(--danger)]" />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">
                {result.relationship.label} —{" "}
                {result.isRelative ? "is a relative" : "is not a relative"}
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                {result.relationship.clause}.
              </p>
            </div>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Value of what was received", hasError ? DASH : money(result.grossValue)],
            [
              "Price paid, if any",
              hasError ? DASH : result.giftType.id === "money" ? "Not applicable" : money(result.consideration),
            ],
            [
              "Shortfall against value",
              hasError || result.giftType.id === "money"
                ? DASH
                : money(result.computation.difference),
            ],
            [
              "Threshold that applies",
              hasError ? DASH : money(result.computation.threshold),
            ],
            ["Exempt under the proviso", hasError ? DASH : result.exempt ? "Yes" : "No"],
            ["Amount charged as income from other sources", hasError ? DASH : money(result.taxable)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.exempt
              ? result.exemptions.map((entry) => entry.detail).join(" ")
              : result.computation.basis}
          </p>
        )}

        {!hasError && result.cashBreach && (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            <TriangleAlert className="mr-2 inline h-4 w-4" aria-hidden="true" />
            {result.cashBreachNote}
          </p>
        )}

        {!hasError && result.clubbingApplies && (
          <p className="mt-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.clubbingNote}
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Who counts as a relative</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            The list below is for the receiver you selected. Relationships shade in and out because
            the definition runs one way only — it asks how the giver stands to the receiver.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    The giver is your
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Relative?
                  </th>
                </tr>
              </thead>
              <tbody>
                {options.map((option) => (
                  <tr key={option.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3">
                      <span className="font-semibold">{option.label}</span>
                      <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                        {option.clause}
                      </span>
                    </td>
                    <td
                      className={`py-2.5 text-right align-top font-semibold ${
                        option.relative ? "text-[var(--success)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {option.relative ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not tax advice. Section 56(2)(x) taxes the receiver, not the giver —
        India has had no gift tax on the giver since 1 October 1998. Keep a signed gift deed and the
        bank trail whatever the relationship, because the burden of proving a gift is genuine sits
        with the person who received it. Speak to a chartered accountant about your own facts.
      </p>
    </main>
  );
}
