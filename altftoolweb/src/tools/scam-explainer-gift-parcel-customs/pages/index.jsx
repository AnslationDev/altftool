"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Package, RotateCcw, ShieldAlert } from "lucide-react";

import {
  ANATOMY,
  GIFT_DUTY_FREE_LIMIT_INR,
  LEGITIMATE_PAYMENT_ROUTES,
  RED_FLAGS,
  REPORT_CHANNELS,
  VERIFY_STEPS,
  assessEncounter,
  estimateGenuineDuty,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const DEFAULTS = { declaredValue: "40000", demanded: "45000", bcd: "35", igst: "18", isGift: true };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const BAND_TEXT = {
  "almost-certain": "text-[var(--danger)]",
  suspicious: "text-[var(--warning)]",
  watch: "text-[var(--warning)]",
  none: "text-[var(--muted-foreground)]",
};

const BAND_LABEL = {
  "almost-certain": "Almost certainly a scam",
  suspicious: "Highly suspicious",
  watch: "Worth checking",
  none: "Nothing selected",
};

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const DEFAULT_FLAGS = ["never-met", "unsolicited-gift", "personal-account", "urgent-deadline"];

export default function ToolHome() {
  const [flags, setFlags] = useState(() => new Set(DEFAULT_FLAGS));
  const [declaredValue, setDeclaredValue] = useState(DEFAULTS.declaredValue);
  const [demanded, setDemanded] = useState(DEFAULTS.demanded);
  const [bcd, setBcd] = useState(DEFAULTS.bcd);
  const [igst, setIgst] = useState(DEFAULTS.igst);
  const [isGift, setIsGift] = useState(DEFAULTS.isGift);
  const [copied, setCopied] = useState(false);

  const assessment = useMemo(() => assessEncounter({ flagIds: Array.from(flags) }), [flags]);

  const duty = useMemo(
    () =>
      estimateGenuineDuty({
        declaredValueInr: toNumber(declaredValue),
        isGift,
        bcdRatePct: toNumber(bcd),
        igstRatePct: toNumber(igst),
        demandedInr: toNumber(demanded),
      }),
    [declaredValue, isGift, bcd, igst, demanded],
  );

  const toggleFlag = (id) => {
    setFlags((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const summary = useMemo(() => {
    const lines = [
      "Gift Parcel Customs Fee Scam — assessment",
      `Red-flag score: ${assessment.score} of ${assessment.maxScore} (${NUM.format(assessment.percent)}%)`,
      `Verdict: ${BAND_LABEL[assessment.band]} — ${assessment.verdict}`,
    ];
    if (assessment.matchedCount > 0) {
      lines.push("", "Signals you reported:");
      assessment.matched.forEach((flag) => lines.push(`- ${flag.label}`));
    }
    if (!duty.error) {
      lines.push(
        "",
        duty.exempt
          ? `Genuine customs duty on a gift of ${money(duty.declaredValue)}: nil (within the ${money(GIFT_DUTY_FREE_LIMIT_INR)} gift exemption).`
          : `Genuine customs duty on ${money(duty.declaredValue)}: ${money(duty.totalDuty)} (${NUM.format(duty.effectiveRatePct)}% effective).`,
      );
      if (duty.overchargeMultiple) {
        lines.push(`Amount demanded is ${NUM.format(duty.overchargeMultiple)}x the genuine duty.`);
      }
    }
    lines.push("", "Report to cybercrime.gov.in or call 1930.");
    return lines.join("\n");
  }, [assessment, duty]);

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setFlags(new Set(DEFAULT_FLAGS));
    setDeclaredValue(DEFAULTS.declaredValue);
    setDemanded(DEFAULTS.demanded);
    setBcd(DEFAULTS.bcd);
    setIgst(DEFAULTS.igst);
    setIsGift(DEFAULTS.isGift);
    setCopied(false);
  };

  const dutyRows = duty.error
    ? [
        ["Basic customs duty", DASH],
        ["Social welfare surcharge (10% of BCD)", DASH],
        ["IGST on imports", DASH],
        ["Effective rate on declared value", DASH],
        ["Amount demanded vs genuine duty", DASH],
      ]
    : [
        ["Basic customs duty", duty.exempt ? money(0) : money(duty.basicCustomsDuty)],
        [
          "Social welfare surcharge (10% of BCD)",
          duty.exempt ? money(0) : money(duty.socialWelfareSurcharge),
        ],
        ["IGST on imports", duty.exempt ? money(0) : money(duty.igst)],
        [
          "Effective rate on declared value",
          duty.exempt ? "0%" : `${NUM.format(duty.effectiveRatePct)}%`,
        ],
        [
          "Amount demanded vs genuine duty",
          duty.overchargeMultiple
            ? `${NUM.format(duty.overchargeMultiple)}x the real figure`
            : duty.exempt && duty.demanded > 0
              ? "Any amount demanded is too much"
              : DASH,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Package className="h-4 w-4" aria-hidden="true" />
          Scam literacy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Gift Parcel Customs Fee Scam Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A foreign friend sends a surprise parcel, then a &quot;customs officer&quot; asks for a
          release fee. Tick what actually happened to score the encounter, and compare the demand
          against what Indian customs would really charge.
        </p>
      </header>

      <section className={CARD} aria-labelledby="flags-heading">
        <h2 id="flags-heading" className="text-base font-semibold">
          What has happened so far?
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Each item carries a weight of 1 to 4. Three of them cannot happen in a lawful customs
          process at all.
        </p>
        <ul className="mt-4 space-y-2">
          {RED_FLAGS.map((flag) => {
            const id = `flag-${flag.id}`;
            const checked = flags.has(flag.id);
            return (
              <li key={flag.id}>
                <label
                  htmlFor={id}
                  className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm transition hover:border-[var(--primary)] has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-[var(--primary)]/35"
                >
                  <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleFlag(flag.id)}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  />
                  <span className="flex-1 leading-6">
                    {flag.label}
                    {flag.decisive ? (
                      <span className="ml-2 rounded-sm bg-[var(--danger-soft)] px-1.5 py-0.5 text-xs font-semibold text-[var(--danger)]">
                        decisive
                      </span>
                    ) : null}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="verdict-heading">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="verdict-heading"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Red-flag score
            </h2>
            <p className={`mt-1 text-4xl font-semibold ${BAND_TEXT[assessment.band]}`}>
              {assessment.score}
              <span className="text-xl text-[var(--muted-foreground)]"> / {assessment.maxScore}</span>
            </p>
            <p className={`mt-1 text-sm font-semibold ${BAND_TEXT[assessment.band]}`}>
              {BAND_LABEL[assessment.band]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the scam assessment result"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={`Score is ${NUM.format(assessment.percent)} percent of the maximum`}
        >
          <span
            className={`block h-full ${assessment.band === "almost-certain" ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
            style={{ width: `${Math.max(0, Math.min(100, assessment.percent))}%` }}
          />
        </div>

        <p className="mt-4 text-sm leading-6">{assessment.verdict}</p>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Signals matched", `${assessment.matchedCount} of ${assessment.totalFlags}`],
            ["Weighted score", `${assessment.score} / ${assessment.maxScore}`],
            ["Share of maximum", `${NUM.format(assessment.percent)}%`],
            ["Decisive signals present", String(assessment.decisiveCount)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="duty-heading">
        <h2 id="duty-heading" className="text-base font-semibold">
          What would real customs duty be?
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          A bona fide gift up to {money(GIFT_DUTY_FREE_LIMIT_INR)} CIF is duty free. Above that,
          duty is charged on the whole declared value with an itemised assessment.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gp-value">
              Declared parcel value (INR)
            </label>
            <input
              id="gp-value"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={declaredValue}
              onChange={(event) => setDeclaredValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gp-demanded">
              Amount they are demanding (INR)
            </label>
            <input
              id="gp-demanded"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={demanded}
              onChange={(event) => setDemanded(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gp-bcd">
              Basic customs duty rate (%)
            </label>
            <input
              id="gp-bcd"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={bcd}
              onChange={(event) => setBcd(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gp-igst">
              IGST rate (%)
            </label>
            <input
              id="gp-igst"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={igst}
              onChange={(event) => setIgst(event.target.value)}
            />
          </div>
        </div>

        <label
          htmlFor="gp-gift"
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
        >
          <input
            id="gp-gift"
            type="checkbox"
            checked={isGift}
            onChange={(event) => setIsGift(event.target.checked)}
            className="h-5 w-5 accent-[var(--primary)]"
          />
          Treat it as a bona fide gift (applies the {money(GIFT_DUTY_FREE_LIMIT_INR)} exemption)
        </label>

        {duty.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {duty.error}
          </p>
        ) : (
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Duty actually payable
          </p>
        )}

        <p className={`mt-1 text-3xl font-semibold ${duty.error ? "text-[var(--muted-foreground)]" : "text-[var(--primary)]"}`}>
          {duty.error ? DASH : money(duty.exempt ? 0 : duty.totalDuty)}
        </p>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {dutyRows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!duty.error && (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {duty.note}
          </p>
        )}

        <h3 className="mt-5 text-sm font-semibold">The only lawful ways duty is collected</h3>
        <ul className="mt-2 space-y-1.5 text-sm text-[var(--muted-foreground)]">
          {LEGITIMATE_PAYMENT_ROUTES.map((route) => (
            <li key={route} className="flex gap-2 leading-6">
              <span aria-hidden="true" className="text-[var(--success)]">
                &bull;
              </span>
              <span>{route}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="anatomy-heading">
        <h2 id="anatomy-heading" className="text-base font-semibold">
          The script, step by step
        </h2>
        <ol className="mt-4 space-y-4">
          {ANATOMY.map((stage) => (
            <li key={stage.step} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--primary)]">
                {stage.step}
              </span>
              <div className="min-w-0">
                <p className="font-semibold">{stage.title}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{stage.detail}</p>
                <p className="mt-1.5 flex gap-2 text-sm leading-6">
                  <ShieldAlert className="mt-1 h-4 w-4 shrink-0 text-[var(--warning)]" aria-hidden="true" />
                  <span>{stage.tell}</span>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="verify-heading">
        <h2 id="verify-heading" className="text-base font-semibold">
          How to check for yourself
        </h2>
        <dl className="mt-4 divide-y divide-[var(--border)]">
          {VERIFY_STEPS.map((step) => (
            <div key={step.id} className="py-3 first:pt-0 last:pb-0">
              <dt className="text-sm font-semibold">{step.label}</dt>
              <dd className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{step.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="report-heading">
        <h2 id="report-heading" className="text-base font-semibold">
          If money has already moved
        </h2>
        <dl className="mt-4 divide-y divide-[var(--border)]">
          {REPORT_CHANNELS.map((channel) => (
            <div key={channel.name} className="py-3 first:pt-0 last:pb-0">
              <dt className="text-sm font-semibold">{channel.name}</dt>
              <dd className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{channel.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal or customs advice. Duty rates, exemption limits and
        surcharges change with each Finance Act — confirm current figures with the Central Board of
        Indirect Taxes and Customs before relying on any number here.
      </p>
    </main>
  );
}
