"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ReceiptText, RotateCcw, ShieldAlert } from "lucide-react";

import {
  ANATOMY,
  CYBER_HELPLINE,
  OFFICIAL_CHALLAN_PORTAL,
  OFFICIAL_CHECKS,
  PENALTIES,
  RED_FLAGS,
  assessChallanMessage,
  checkRegistrationNumber,
  estimateStatutoryPenalty,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm transition hover:border-[var(--primary)] has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-[var(--primary)]/35";

const BAND_TEXT = {
  "almost-certain": "text-[var(--danger)]",
  suspicious: "text-[var(--warning)]",
  watch: "text-[var(--warning)]",
  none: "text-[var(--muted-foreground)]",
};
const BAND_LABEL = {
  "almost-certain": "Fake challan",
  suspicious: "Highly suspicious",
  watch: "Worth checking",
  none: "Nothing selected",
};

const DEFAULT_FLAGS = ["mobile-sender", "non-gov-domain", "discount", "no-details"];
const DEFAULT_OFFENCES = ["no-helmet"];
const DEFAULTS = { registration: "MH12AB1234", demanded: "4500" };

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [flags, setFlags] = useState(() => new Set(DEFAULT_FLAGS));
  const [offences, setOffences] = useState(() => new Set(DEFAULT_OFFENCES));
  const [repeatOffence, setRepeatOffence] = useState(false);
  const [registration, setRegistration] = useState(DEFAULTS.registration);
  const [demanded, setDemanded] = useState(DEFAULTS.demanded);
  const [copied, setCopied] = useState(false);

  const assessment = useMemo(() => assessChallanMessage({ flagIds: Array.from(flags) }), [flags]);
  const regCheck = useMemo(() => checkRegistrationNumber(registration), [registration]);
  const penalty = useMemo(
    () =>
      estimateStatutoryPenalty({
        offenceIds: Array.from(offences),
        repeatOffence,
        demandedInr: toNumber(demanded),
      }),
    [offences, repeatOffence, demanded],
  );

  const toggle = (setter) => (id) =>
    setter((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleFlag = toggle(setFlags);
  const toggleOffence = toggle(setOffences);

  const summary = useMemo(() => {
    const lines = [
      "Fake Traffic Challan — assessment",
      `Red-flag score: ${assessment.score} of ${assessment.maxScore} (${NUM.format(assessment.percent)}%)`,
      `Verdict: ${BAND_LABEL[assessment.band]} — ${assessment.verdict}`,
    ];
    if (regCheck.error) {
      lines.push("", `Registration number: ${regCheck.error}`);
    } else {
      lines.push(
        "",
        `Registration ${regCheck.normalised}: ${regCheck.valid ? "well-formed" : "not a valid Indian mark"} — ${regCheck.reason}`,
      );
    }
    if (!penalty.error && penalty.itemCount > 0) {
      lines.push(
        "",
        `Statutory penalty for the selected offences: ${money(penalty.statutoryTotal)}`,
        `Amount demanded: ${money(penalty.demanded)}`,
        penalty.verdict,
      );
    }
    lines.push(
      "",
      `Verify only at ${OFFICIAL_CHALLAN_PORTAL}. Report fraud on ${CYBER_HELPLINE} or cybercrime.gov.in.`,
    );
    return lines.join("\n");
  }, [assessment, regCheck, penalty]);

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
    setOffences(new Set(DEFAULT_OFFENCES));
    setRepeatOffence(false);
    setRegistration(DEFAULTS.registration);
    setDemanded(DEFAULTS.demanded);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ReceiptText className="h-4 w-4" aria-hidden="true" />
          Scam literacy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Fake Traffic Challan Scam Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The e-challan SMS that ends in an APK install or a UPI transfer. Score the message you
          received, validate the registration number it quotes, and compare the fine against the
          amount the Motor Vehicles Act actually sets.
        </p>
      </header>

      <section className={CARD} aria-labelledby="flags-heading">
        <h2 id="flags-heading" className="text-base font-semibold">
          What does the message do?
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Weights run from 1 to 4. Three items are decisive on their own.
        </p>
        <ul className="mt-4 space-y-2">
          {RED_FLAGS.map((flag) => {
            const id = `challan-flag-${flag.id}`;
            return (
              <li key={flag.id}>
                <label htmlFor={id} className={CHECK_ROW}>
                  <input
                    id={id}
                    type="checkbox"
                    checked={flags.has(flag.id)}
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
            <button type="button" onClick={copyResult} aria-label="Copy the challan assessment" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset every input" className={PRIMARY_BTN}>
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

      <section className={`mt-6 ${CARD}`} aria-labelledby="reg-heading">
        <h2 id="reg-heading" className="text-base font-semibold">
          Is the registration number even real?
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Checked offline against the standard state format and the Bharat (BH) series. Nothing is
          sent anywhere.
        </p>
        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="challan-reg">
            Registration number quoted in the message
          </label>
          <input
            id="challan-reg"
            className={`mt-2 ${INPUT_CLASS} uppercase`}
            type="text"
            autoComplete="off"
            spellCheck="false"
            value={registration}
            onChange={(event) => setRegistration(event.target.value)}
          />
        </div>

        {regCheck.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {regCheck.error}
          </p>
        ) : null}

        <p
          className={`mt-4 text-2xl font-semibold ${
            regCheck.error
              ? "text-[var(--muted-foreground)]"
              : regCheck.valid
                ? "text-[var(--success)]"
                : "text-[var(--danger)]"
          }`}
        >
          {regCheck.error ? DASH : regCheck.valid ? regCheck.formatted : "Not a valid mark"}
        </p>

        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {[
            ["Format", regCheck.error || !regCheck.valid ? DASH : regCheck.format],
            [
              "Registering authority",
              regCheck.error || !regCheck.valid
                ? DASH
                : regCheck.stateName
                  ? `${regCheck.stateName} · RTO ${regCheck.rtoCode}`
                  : `Bharat series, first registered ${regCheck.registrationYear}`,
            ],
            ["Assessment", regCheck.error ? DASH : regCheck.reason],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          A well-formed number is not proof of a genuine challan — it only rules out the crudest
          blasts. The portal lookup is what settles it.
        </p>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="penalty-heading">
        <h2 id="penalty-heading" className="text-base font-semibold">
          What does the law actually charge?
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Central figures from the Motor Vehicles Act, 1988 as amended in 2019. States notify their
          own compounding amounts under Section 200, so your state figure can differ.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="challan-demanded">
              Fine the message demands (INR)
            </label>
            <input
              id="challan-demanded"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={demanded}
              onChange={(event) => setDemanded(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              htmlFor="challan-repeat"
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
            >
              <input
                id="challan-repeat"
                type="checkbox"
                checked={repeatOffence}
                onChange={(event) => setRepeatOffence(event.target.checked)}
                className="h-5 w-5 accent-[var(--primary)]"
              />
              Use repeat-offence amounts
            </label>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Offence
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Section
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Penalty
                </th>
              </tr>
            </thead>
            <tbody>
              {PENALTIES.map((item) => {
                const id = `offence-${item.id}`;
                const amount = repeatOffence ? item.subsequent : item.first;
                return (
                  <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <label htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-2.5">
                        <input
                          id={id}
                          type="checkbox"
                          checked={offences.has(item.id)}
                          onChange={() => toggleOffence(item.id)}
                          className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                        />
                        <span className="leading-5">{item.label}</span>
                      </label>
                    </td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{item.section}</td>
                    <td className="py-2 text-right font-semibold">{money(amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {penalty.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {penalty.error}
          </p>
        ) : (
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Statutory total for the selected offences
          </p>
        )}
        <p
          className={`mt-1 text-3xl font-semibold ${penalty.error ? "text-[var(--muted-foreground)]" : "text-[var(--primary)]"}`}
        >
          {penalty.error ? DASH : money(penalty.statutoryTotal)}
        </p>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Offences selected", penalty.error ? DASH : String(penalty.itemCount)],
            ["Amount demanded", penalty.error ? DASH : money(penalty.demanded)],
            [
              "Difference",
              penalty.error
                ? DASH
                : `${penalty.difference >= 0 ? "+" : "-"}${money(Math.abs(penalty.difference))}`,
            ],
            ["Demanded ÷ statutory", penalty.error || !penalty.ratio ? DASH : `${NUM.format(penalty.ratio)}x`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!penalty.error && (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {penalty.verdict}
          </p>
        )}
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
          The only safe way to check a challan
        </h2>
        <dl className="mt-4 divide-y divide-[var(--border)]">
          {OFFICIAL_CHECKS.map((step) => (
            <div key={step.id} className="py-3 first:pt-0 last:pb-0">
              <dt className="text-sm font-semibold">{step.label}</dt>
              <dd className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{step.detail}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">
          Already installed the app? Turn on aeroplane mode, uninstall it, change your net banking
          and UPI credentials from a clean device, and call {CYBER_HELPLINE} if any money has moved.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Penalty amounts are the central figures under the
        Motor Vehicles Act; the amount enforceable where you live depends on your state
        notification. Confirm any challan on {OFFICIAL_CHALLAN_PORTAL} before paying anything.
      </p>
    </main>
  );
}
