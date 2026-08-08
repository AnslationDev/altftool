"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Utensils } from "lucide-react";

import {
  ISSUE_TYPES,
  PAYOUT_MODES,
  REFUND_ROUTES,
  REFUND_SCOPES,
  buildRefundPolicy,
  computeRefundEntitlement,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const ERROR_CLASS =
  "rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]";

const DASH = "—";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);

const DEFAULTS = {
  brandName: "Spice Route Kitchen",
  city: "Pune",
  contactEmail: "care@spiceroutekitchen.in",
  contactPhone: "+91 20 4000 1234",
  effectiveDate: "2026-08-01",
  issueIds: ["missing-item", "wrong-item", "late-delivery", "quality", "foreign-object", "kitchen-cancel"],
  ackHours: 24,
  redressDays: 7,
  graceMinutes: 20,
  routeIds: ["upi", "card", "cod"],
  goodwillPercent: 10,
  orderValue: 820,
  deliveryFee: 40,
  packagingFee: 25,
  affectedItemsValue: 260,
  calcScope: "affected-items",
  calcPayout: "original",
};

export default function ToolHome() {
  const [brandName, setBrandName] = useState(DEFAULTS.brandName);
  const [city, setCity] = useState(DEFAULTS.city);
  const [contactEmail, setContactEmail] = useState(DEFAULTS.contactEmail);
  const [contactPhone, setContactPhone] = useState(DEFAULTS.contactPhone);
  const [effectiveDate, setEffectiveDate] = useState(DEFAULTS.effectiveDate);
  const [issueIds, setIssueIds] = useState(DEFAULTS.issueIds);
  const [overrides, setOverrides] = useState({});
  const [ackHours, setAckHours] = useState(String(DEFAULTS.ackHours));
  const [redressDays, setRedressDays] = useState(String(DEFAULTS.redressDays));
  const [graceMinutes, setGraceMinutes] = useState(String(DEFAULTS.graceMinutes));
  const [routeIds, setRouteIds] = useState(DEFAULTS.routeIds);
  const [goodwillPercent, setGoodwillPercent] = useState(String(DEFAULTS.goodwillPercent));

  const [orderValue, setOrderValue] = useState(String(DEFAULTS.orderValue));
  const [deliveryFee, setDeliveryFee] = useState(String(DEFAULTS.deliveryFee));
  const [packagingFee, setPackagingFee] = useState(String(DEFAULTS.packagingFee));
  const [affectedItemsValue, setAffectedItemsValue] = useState(String(DEFAULTS.affectedItemsValue));
  const [calcScope, setCalcScope] = useState(DEFAULTS.calcScope);
  const [calcPayout, setCalcPayout] = useState(DEFAULTS.calcPayout);

  const [copied, setCopied] = useState(false);

  const entitlement = useMemo(
    () =>
      computeRefundEntitlement({
        orderValue: Number(orderValue),
        deliveryFee: Number(deliveryFee),
        packagingFee: Number(packagingFee),
        affectedItemsValue: Number(affectedItemsValue),
        scope: calcScope,
        payout: calcPayout,
        goodwillPercent: Number(goodwillPercent),
      }),
    [orderValue, deliveryFee, packagingFee, affectedItemsValue, calcScope, calcPayout, goodwillPercent],
  );

  const policy = useMemo(
    () =>
      buildRefundPolicy({
        brandName,
        city,
        contactEmail,
        contactPhone,
        effectiveDate,
        issueIds,
        overrides,
        ackHours: Number(ackHours),
        redressDays: Number(redressDays),
        graceMinutes: Number(graceMinutes),
        routeIds,
        goodwillPercent: Number(goodwillPercent),
      }),
    [
      brandName,
      city,
      contactEmail,
      contactPhone,
      effectiveDate,
      issueIds,
      overrides,
      ackHours,
      redressDays,
      graceMinutes,
      routeIds,
      goodwillPercent,
    ],
  );

  const calcError = Boolean(entitlement.error);
  const policyError = Boolean(policy.error);

  const toggleIssue = (id) => {
    setIssueIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const toggleRoute = (id) => {
    setRouteIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const patchIssue = (id, key, value) => {
    setOverrides((current) => ({ ...current, [id]: { ...current[id], [key]: value } }));
  };

  const copyPolicy = async () => {
    if (policyError) return;
    try {
      await navigator.clipboard.writeText(policy.policyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setBrandName(DEFAULTS.brandName);
    setCity(DEFAULTS.city);
    setContactEmail(DEFAULTS.contactEmail);
    setContactPhone(DEFAULTS.contactPhone);
    setEffectiveDate(DEFAULTS.effectiveDate);
    setIssueIds(DEFAULTS.issueIds);
    setOverrides({});
    setAckHours(String(DEFAULTS.ackHours));
    setRedressDays(String(DEFAULTS.redressDays));
    setGraceMinutes(String(DEFAULTS.graceMinutes));
    setRouteIds(DEFAULTS.routeIds);
    setGoodwillPercent(String(DEFAULTS.goodwillPercent));
    setOrderValue(String(DEFAULTS.orderValue));
    setDeliveryFee(String(DEFAULTS.deliveryFee));
    setPackagingFee(String(DEFAULTS.packagingFee));
    setAffectedItemsValue(String(DEFAULTS.affectedItemsValue));
    setCalcScope(DEFAULTS.calcScope);
    setCalcPayout(DEFAULTS.calcPayout);
    setCopied(false);
  };

  const selectedIssues = ISSUE_TYPES.filter((issue) => issueIds.includes(issue.id));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Utensils className="h-4 w-4" aria-hidden="true" />
          Food business policy
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Restaurant Refund Policy Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Choose which order problems you will refund, how long a customer has to report each one
          and how the money goes back. The draft keeps the 48-hour acknowledgement and one-month
          redressal limits of the Consumer Protection (E-Commerce) Rules 2020.
        </p>
      </header>

      <section className={CARD} aria-labelledby="calc-heading">
        <h2 id="calc-heading" className="text-base font-semibold">
          Refund amount check
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Test one order against the rule you are about to publish.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-order">
              Food value on the bill (INR)
            </label>
            <input
              id="rr-order"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={orderValue}
              onChange={(event) => setOrderValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-affected">
              Value of the affected items (INR)
            </label>
            <input
              id="rr-affected"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={affectedItemsValue}
              onChange={(event) => setAffectedItemsValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-delivery">
              Delivery charge (INR)
            </label>
            <input
              id="rr-delivery"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={deliveryFee}
              onChange={(event) => setDeliveryFee(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-packaging">
              Packaging / handling charge (INR)
            </label>
            <input
              id="rr-packaging"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5"
              value={packagingFee}
              onChange={(event) => setPackagingFee(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-scope">
              Refund measured against
            </label>
            <select
              id="rr-scope"
              className={`mt-2 ${INPUT_CLASS}`}
              value={calcScope}
              onChange={(event) => setCalcScope(event.target.value)}
            >
              {REFUND_SCOPES.map((scope) => (
                <option key={scope.id} value={scope.id}>
                  {scope.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-payout">
              Paid back as
            </label>
            <select
              id="rr-payout"
              className={`mt-2 ${INPUT_CLASS}`}
              value={calcPayout}
              onChange={(event) => setCalcPayout(event.target.value)}
            >
              {PAYOUT_MODES.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {calcError ? (
        <p role="alert" className={`mt-6 ${ERROR_CLASS}`}>
          {entitlement.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`}>
        <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          Customer receives
        </p>
        <p aria-live="polite" aria-atomic="true" className="mt-1 text-4xl font-semibold text-[var(--primary)]">
          {calcError ? DASH : money(entitlement.customerKeeps)}
        </p>
        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Bill total (food + charges)", calcError ? DASH : money(entitlement.billTotal)],
            ["Refundable base", calcError ? DASH : money(entitlement.refundBase)],
            ["Cash back to original method", calcError ? DASH : money(entitlement.cashRefund)],
            ["Store credit issued", calcError ? DASH : money(entitlement.storeCredit)],
            ["Replacement order value", calcError ? DASH : money(entitlement.replacementValue)],
            [
              "Share of the bill returned",
              calcError ? DASH : `${entitlement.sharePercent}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="policy-heading">
        <h2 id="policy-heading" className="text-base font-semibold">
          Policy details
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-brand">
              Restaurant or brand name
            </label>
            <input
              id="rr-brand"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={brandName}
              onChange={(event) => setBrandName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-city">
              City
            </label>
            <input
              id="rr-city"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-email">
              Grievance email
            </label>
            <input
              id="rr-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-phone">
              Grievance phone (optional)
            </label>
            <input
              id="rr-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              type="tel"
              value={contactPhone}
              onChange={(event) => setContactPhone(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-effective">
              Effective from
            </label>
            <input
              id="rr-effective"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={effectiveDate}
              onChange={(event) => setEffectiveDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-ack">
              Acknowledge within (hours, max 48)
            </label>
            <input
              id="rr-ack"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="48"
              step="1"
              value={ackHours}
              onChange={(event) => setAckHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-redress">
              Close complaint within (days, max 30)
            </label>
            <input
              id="rr-redress"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="30"
              step="1"
              value={redressDays}
              onChange={(event) => setRedressDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-grace">
              Late only after (minutes past ETA)
            </label>
            <input
              id="rr-grace"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="240"
              step="5"
              value={graceMinutes}
              onChange={(event) => setGraceMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rr-goodwill">
              Store credit goodwill uplift (%)
            </label>
            <input
              id="rr-goodwill"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="5"
              value={goodwillPercent}
              onChange={(event) => setGoodwillPercent(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Payment methods you accept</legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {REFUND_ROUTES.map((route) => (
              <label
                key={route.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`rr-route-${route.id}`}
              >
                <input
                  id={`rr-route-${route.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={routeIds.includes(route.id)}
                  onChange={() => toggleRoute(route.id)}
                />
                <span>
                  {route.label}
                  <span className="block text-xs text-[var(--muted-foreground)]">{route.credit}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Problems this policy covers</legend>
          <div className="mt-2 grid gap-1">
            {ISSUE_TYPES.map((issue) => (
              <label
                key={issue.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`rr-issue-${issue.id}`}
              >
                <input
                  id={`rr-issue-${issue.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={issueIds.includes(issue.id)}
                  onChange={() => toggleIssue(issue.id)}
                />
                {issue.label}
              </label>
            ))}
          </div>
        </fieldset>

        {selectedIssues.length > 0 ? (
          <div className="mt-5 space-y-4">
            <p className={LABEL_CLASS}>Tune each covered problem</p>
            {selectedIssues.map((issue) => (
              <div
                key={issue.id}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <p className="text-sm font-semibold">{issue.label}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted-foreground)]" htmlFor={`rr-win-${issue.id}`}>
                      Report within (hours)
                    </label>
                    <input
                      id={`rr-win-${issue.id}`}
                      className={`mt-1 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="168"
                      step="1"
                      value={overrides[issue.id]?.windowHours ?? String(issue.windowHours)}
                      onChange={(event) => patchIssue(issue.id, "windowHours", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted-foreground)]" htmlFor={`rr-scope-${issue.id}`}>
                      Refund covers
                    </label>
                    <select
                      id={`rr-scope-${issue.id}`}
                      className={`mt-1 ${INPUT_CLASS}`}
                      value={overrides[issue.id]?.scope ?? issue.scope}
                      onChange={(event) => patchIssue(issue.id, "scope", event.target.value)}
                    >
                      {REFUND_SCOPES.map((scope) => (
                        <option key={scope.id} value={scope.id}>
                          {scope.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--muted-foreground)]" htmlFor={`rr-pay-${issue.id}`}>
                      Paid back as
                    </label>
                    <select
                      id={`rr-pay-${issue.id}`}
                      className={`mt-1 ${INPUT_CLASS}`}
                      value={overrides[issue.id]?.payout ?? issue.payout}
                      onChange={(event) => patchIssue(issue.id, "payout", event.target.value)}
                    >
                      {PAYOUT_MODES.map((mode) => (
                        <option key={mode.id} value={mode.id}>
                          {mode.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {policyError ? (
        <p role="alert" className={`mt-6 ${ERROR_CLASS}`}>
          {policy.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Policy effective from
            </p>
            <p aria-live="polite" aria-atomic="true" className="mt-1 text-2xl font-semibold text-[var(--primary)]">
              {policyError ? DASH : policy.effectiveLong}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {policyError
                ? DASH
                : `${policy.issueCount} problem types covered, acknowledged in ${policy.ackHours}h, closed in ${policy.redressDays}d`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPolicy}
              disabled={policyError}
              aria-label="Copy the generated refund policy"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy policy"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset every field to its default"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 whitespace-pre-wrap">
          {policyError ? DASH : policy.policyText}
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template, not legal advice. Rule 4(5) of the Consumer Protection (E-Commerce)
        Rules 2020 requires acknowledgement within 48 hours and redressal within one month; Section
        69 of the Consumer Protection Act 2019 gives a consumer two years to file. Have a lawyer
        review the final wording before you publish it, and check any marketplace contract that may
        impose stricter refund terms.
      </p>
    </main>
  );
}
