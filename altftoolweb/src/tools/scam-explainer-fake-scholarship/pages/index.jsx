"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, RotateCcw, ShieldAlert } from "lucide-react";

import {
  ANATOMY,
  LEGIT_CHANNELS,
  NATIONAL_PORTAL_HOST,
  NEVER_HAPPENS,
  RED_FLAGS,
  analyseFeeDemands,
  assessOffer,
  checkPortalDomain,
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
const AREA_CLASS =
  "min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
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
  "almost-certain": "Fake offer",
  suspicious: "Highly suspicious",
  watch: "Verify first",
  none: "Nothing selected",
};
const CATEGORY_LABEL = {
  official: "The official portal",
  government: "Government domain",
  academic: "Academic domain",
  other: "Not an official domain",
  invalid: "Unusable hostname",
};
const CATEGORY_TEXT = {
  official: "text-[var(--success)]",
  government: "text-[var(--success)]",
  academic: "text-[var(--primary)]",
  other: "text-[var(--danger)]",
  invalid: "text-[var(--danger)]",
};

const DEFAULT_FLAGS = ["never-applied", "fee-demanded", "non-gov-portal", "deadline"];
const DEFAULTS = {
  award: "50000",
  fees: "1500\n2500",
  link: "https://scholarships.gov.in@nsp-scholarship-india.xyz/apply",
};

const parseFees = (raw) =>
  String(raw)
    .split(/[\n,]/)
    .map((line) => line.replace(/[₹,\s]/g, "").trim())
    .filter((line) => line !== "");

export default function ToolHome() {
  const [flags, setFlags] = useState(() => new Set(DEFAULT_FLAGS));
  const [award, setAward] = useState(DEFAULTS.award);
  const [fees, setFees] = useState(DEFAULTS.fees);
  const [link, setLink] = useState(DEFAULTS.link);
  const [copied, setCopied] = useState(false);

  const assessment = useMemo(() => assessOffer({ flagIds: Array.from(flags) }), [flags]);
  const feeTally = useMemo(
    () =>
      analyseFeeDemands({
        promisedAwardInr: award.trim() === "" ? NaN : Number(award),
        feesInr: parseFees(fees),
      }),
    [award, fees],
  );
  const domain = useMemo(() => checkPortalDomain(link), [link]);

  const toggleFlag = (id) =>
    setFlags((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const summary = useMemo(() => {
    const lines = [
      "Fake Scholarship Offer — assessment",
      `Red-flag score: ${assessment.score} of ${assessment.maxScore} (${NUM.format(assessment.percent)}%)`,
      `Verdict: ${BAND_LABEL[assessment.band]} — ${assessment.verdict}`,
    ];
    if (!feeTally.error) {
      lines.push(
        "",
        `Fees demanded: ${money(feeTally.totalDemanded)} across ${feeTally.feeCount} demand(s).`,
        `Correct amount a student pays: ${money(feeTally.correctAmountPayable)}.`,
      );
    }
    if (!domain.error) {
      lines.push("", `Link host: ${domain.host} — ${CATEGORY_LABEL[domain.category]}. ${domain.verdict}`);
      domain.warnings.forEach((warning) => lines.push(`- ${warning}`));
    }
    lines.push("", `Verify every scheme on ${NATIONAL_PORTAL_HOST} or with your college scholarship cell.`);
    return lines.join("\n");
  }, [assessment, feeTally, domain]);

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
    setAward(DEFAULTS.award);
    setFees(DEFAULTS.fees);
    setLink(DEFAULTS.link);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Scam literacy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Fake Scholarship Scam Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Selected for an award you never applied for, then asked for a small processing fee. Score
          the offer, add up what has been demanded, and check whether the &quot;portal&quot; link is
          a government domain at all.
        </p>
      </header>

      <section className={CARD} aria-labelledby="flags-heading">
        <h2 id="flags-heading" className="text-base font-semibold">
          What is true of this offer?
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Weights run from 2 to 4. Four items rule out a genuine scheme on their own.
        </p>
        <ul className="mt-4 space-y-2">
          {RED_FLAGS.map((flag) => {
            const id = `sch-flag-${flag.id}`;
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
            <button type="button" onClick={copyResult} aria-label="Copy the scholarship assessment" className={GHOST_BTN}>
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

      <section className={`mt-6 ${CARD}`} aria-labelledby="fees-heading">
        <h2 id="fees-heading" className="text-base font-semibold">
          Add up what they have asked for
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          The right answer is always the same number, whatever the award. Enter one amount per line.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sch-award">
              Scholarship promised (INR)
            </label>
            <input
              id="sch-award"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={award}
              onChange={(event) => setAward(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sch-fees">
              Fees demanded so far, one per line
            </label>
            <textarea
              id="sch-fees"
              className={`mt-2 ${AREA_CLASS}`}
              value={fees}
              onChange={(event) => setFees(event.target.value)}
            />
          </div>
        </div>

        {feeTally.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {feeTally.error}
          </p>
        ) : (
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Correct amount a student pays
          </p>
        )}
        <p
          className={`mt-1 text-4xl font-semibold ${feeTally.error ? "text-[var(--muted-foreground)]" : "text-[var(--success)]"}`}
        >
          {feeTally.error ? DASH : money(feeTally.correctAmountPayable)}
        </p>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Award promised", feeTally.error ? DASH : money(feeTally.promisedAward)],
            ["Separate fee demands", feeTally.error ? DASH : String(feeTally.feeCount)],
            ["Total demanded", feeTally.error ? DASH : money(feeTally.totalDemanded)],
            [
              "Demanded as share of award",
              feeTally.error || feeTally.sharePct === null ? DASH : `${NUM.format(feeTally.sharePct)}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!feeTally.error && (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">{feeTally.verdict}</p>
        )}
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="domain-heading">
        <h2 id="domain-heading" className="text-base font-semibold">
          Where does the link really go?
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Parsed in your browser. Nothing is fetched, and the link is never opened.
        </p>
        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="sch-link">
            Paste the scholarship link
          </label>
          <input
            id="sch-link"
            className={`mt-2 ${INPUT_CLASS}`}
            type="text"
            autoComplete="off"
            spellCheck="false"
            value={link}
            onChange={(event) => setLink(event.target.value)}
          />
        </div>

        {domain.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {domain.error}
          </p>
        ) : (
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Host you would actually reach
          </p>
        )}
        <p
          className={`mt-1 break-all text-2xl font-semibold ${domain.error ? "text-[var(--muted-foreground)]" : CATEGORY_TEXT[domain.category]}`}
        >
          {domain.error ? DASH : domain.host}
        </p>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Classification", domain.error ? DASH : CATEGORY_LABEL[domain.category]],
            ["Assessment", domain.error ? DASH : domain.verdict],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!domain.error && domain.warnings.length > 0 && (
          <ul className="mt-3 space-y-2">
            {domain.warnings.map((warning) => (
              <li
                key={warning}
                className="flex gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm leading-6 text-[var(--danger)]"
              >
                <ShieldAlert className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
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

      <section className={`mt-6 ${CARD}`} aria-labelledby="never-heading">
        <h2 id="never-heading" className="text-base font-semibold">
          Things that never happen
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          {NEVER_HAPPENS.map((line) => (
            <li key={line} className="flex gap-2 leading-6">
              <span aria-hidden="true" className="text-[var(--danger)]">
                &bull;
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="legit-heading">
        <h2 id="legit-heading" className="text-base font-semibold">
          Where a real scholarship lives
        </h2>
        <dl className="mt-4 divide-y divide-[var(--border)]">
          {LEGIT_CHANNELS.map((item) => (
            <div key={item.id} className="py-3 first:pt-0 last:pb-0">
              <dt className="text-sm font-semibold">{item.name}</dt>
              <dd className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{item.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal or tax advice. Scheme rules, eligibility and deadlines are set
        by the awarding ministry or institution and change every cycle — confirm on the official
        portal. If money has already been paid, report at cybercrime.gov.in or on helpline 1930.
      </p>
    </main>
  );
}
