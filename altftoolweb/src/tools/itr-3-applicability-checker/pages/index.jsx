"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileCheck2, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const ITR4_CAP = 5000000;
const LTCG_112A_CAP = 125000;

const FLAG_GROUPS = [
  {
    title: "Business and professional income",
    items: [
      ["hasBusiness", "I have income from a business (trading, shop, manufacturing, contracts)"],
      ["hasProfession", "I have professional income (doctor, lawyer, CA, architect, freelancer, consultant)"],
      ["isPartner", "I am a partner in a firm and receive share of profit, interest or remuneration"],
      ["presumptive", "I want to declare this income presumptively under Section 44AD / 44ADA / 44AE"],
      ["speculative", "I have intraday equity (speculative) trading income"],
      ["fno", "I have F&O / derivatives trading income treated as business income"],
      ["booksMaintained", "I maintain regular books of account or my accounts were audited"],
    ],
  },
  {
    title: "Facts that rule out the simpler forms",
    items: [
      ["nonResident", "I am a non-resident or resident but not ordinarily resident (RNOR)"],
      ["director", "I was a director in a company at any time during the year"],
      ["unlistedShares", "I held unlisted equity shares at any time during the year"],
      ["foreignAssets", "I hold foreign assets, foreign income, or signing authority abroad"],
      ["multipleHouse", "I own more than one house property"],
      ["capitalGains", "I have capital gains beyond LTCG under Section 112A of ₹1.25 lakh"],
      ["agriAbove5k", "My agricultural income is more than ₹5,000"],
      ["carryForwardLoss", "I have losses to carry forward or brought forward from earlier years"],
    ],
  },
];

const DEFAULT_FLAGS = {
  hasBusiness: false,
  hasProfession: true,
  isPartner: false,
  presumptive: true,
  speculative: false,
  fno: false,
  booksMaintained: false,
  nonResident: false,
  director: false,
  unlistedShares: false,
  foreignAssets: false,
  multipleHouse: false,
  capitalGains: false,
  agriAbove5k: false,
  carryForwardLoss: false,
};

const DEFAULT_ENTITY = "individual";
const DEFAULT_INCOME = "4200000";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

/**
 * Decide the correct ITR form for an individual / HUF based on the facts entered.
 * Returns a verdict plus the reasons that drove it.
 */
function decide(entity, totalIncome, f) {
  if (entity === "firm") {
    return {
      verdict: "not-applicable",
      form: "ITR-5",
      headline: "ITR-3 does not apply",
      reasons: [
        "ITR-3 is only for individuals and HUFs. A firm, LLP, AOP or BOI files ITR-5 instead.",
      ],
    };
  }
  if (entity === "company") {
    return {
      verdict: "not-applicable",
      form: "ITR-6",
      headline: "ITR-3 does not apply",
      reasons: [
        "ITR-3 is only for individuals and HUFs. A company files ITR-6 (or ITR-7 if it claims exemption under Sections 11 to 13A).",
      ],
    };
  }

  const businessLike =
    f.hasBusiness || f.hasProfession || f.isPartner || f.speculative || f.fno || f.booksMaintained;

  if (!businessLike) {
    const itr2Reasons = [];
    if (f.nonResident) itr2Reasons.push("You are a non-resident or RNOR, so ITR-1 is not available.");
    if (totalIncome > ITR4_CAP)
      itr2Reasons.push(`Total income above ${money(ITR4_CAP)} rules out ITR-1.`);
    if (f.capitalGains)
      itr2Reasons.push("Capital gains beyond the limited Section 112A allowance need ITR-2.");
    if (f.multipleHouse) itr2Reasons.push("Owning more than one house property needs ITR-2.");
    if (f.director) itr2Reasons.push("Being a company director needs ITR-2.");
    if (f.unlistedShares) itr2Reasons.push("Holding unlisted equity shares needs ITR-2.");
    if (f.foreignAssets) itr2Reasons.push("Foreign assets, income or signing authority need ITR-2.");
    if (f.agriAbove5k) itr2Reasons.push("Agricultural income above ₹5,000 rules out ITR-1.");
    if (f.carryForwardLoss) itr2Reasons.push("Carried-forward losses cannot be reported in ITR-1.");

    return {
      verdict: "not-applicable",
      form: itr2Reasons.length ? "ITR-2" : "ITR-1 (Sahaj)",
      headline: "ITR-3 is not required",
      reasons: itr2Reasons.length
        ? [
            "You reported no business or professional income, so ITR-3 does not apply.",
            ...itr2Reasons,
          ]
        : [
            "You reported no business or professional income, so ITR-3 does not apply.",
            `You are a resident with total income up to ${money(ITR4_CAP)} and no disqualifying facts, so ITR-1 (Sahaj) is enough.`,
          ],
    };
  }

  // Business-like income exists. Work out whether the presumptive form ITR-4 can be used.
  const blockers = [];
  if (f.isPartner)
    blockers.push("A partner in a firm reporting share of profit, interest or remuneration cannot use ITR-4.");
  if (totalIncome > ITR4_CAP)
    blockers.push(`Total income of ${money(totalIncome)} exceeds the ${money(ITR4_CAP)} ceiling for ITR-4.`);
  if (f.nonResident) blockers.push("ITR-4 is only for resident and ordinarily resident taxpayers.");
  if (f.speculative)
    blockers.push("Intraday speculative business income cannot be declared under Section 44AD, so ITR-4 is out.");
  if (f.director) blockers.push("A director in a company cannot file ITR-4.");
  if (f.unlistedShares) blockers.push("Holding unlisted equity shares blocks ITR-4.");
  if (f.foreignAssets)
    blockers.push("Foreign assets, foreign income or signing authority abroad block ITR-4.");
  if (f.multipleHouse) blockers.push("More than one house property cannot be reported in ITR-4.");
  if (f.capitalGains)
    blockers.push(`Capital gains beyond LTCG under Section 112A of ${money(LTCG_112A_CAP)} cannot go in ITR-4.`);
  if (f.agriAbove5k) blockers.push("Agricultural income above ₹5,000 blocks ITR-4.");
  if (f.carryForwardLoss)
    blockers.push("Brought-forward or carried-forward losses cannot be handled by ITR-4.");
  if (!f.presumptive)
    blockers.push("You are not declaring income presumptively under Section 44AD, 44ADA or 44AE.");
  if (f.booksMaintained)
    blockers.push("Maintaining regular books of account or undergoing a tax audit points to ITR-3, not the presumptive ITR-4.");

  if (blockers.length === 0) {
    return {
      verdict: "optional",
      form: "ITR-4 (Sugam)",
      headline: "ITR-3 is optional for you",
      reasons: [
        "You have business or professional income, which is what ITR-3 covers.",
        `Because you are declaring it presumptively and stay within every ITR-4 condition (resident, total income up to ${money(ITR4_CAP)}, no disqualifying holdings), the shorter ITR-4 (Sugam) is enough.`,
        "You may still file ITR-3 voluntarily if you prefer to report actual profits with a full balance sheet and profit and loss account.",
      ],
    };
  }

  const drivers = [];
  if (f.hasBusiness) drivers.push("business income");
  if (f.hasProfession) drivers.push("professional income");
  if (f.fno) drivers.push("F&O trading treated as business income");
  if (f.speculative) drivers.push("intraday speculative income");
  if (f.isPartner) drivers.push("share of profit or remuneration from a firm");

  return {
    verdict: "required",
    form: "ITR-3",
    headline: "You need to file ITR-3",
    reasons: [
      drivers.length
        ? `You have ${drivers.join(", ")}, which falls under "profits and gains of business or profession".`
        : "You maintain books of account for a business or profession.",
      ...blockers,
    ],
  };
}

export default function ToolHome() {
  const [entity, setEntity] = useState(DEFAULT_ENTITY);
  const [income, setIncome] = useState(DEFAULT_INCOME);
  const [flags, setFlags] = useState(DEFAULT_FLAGS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const total = toNumber(income);
    if (Number.isNaN(total)) return { error: "Enter a valid total income figure." };
    if (total < 0) return { error: "Total income cannot be negative." };
    if (total > 10000000000) return { error: "Enter a total income below 1,000 crore." };
    return { ...decide(entity, total, flags), total };
  }, [entity, income, flags]);

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "ITR-3 Applicability Checker",
      `Taxpayer type: ${entity === "individual" ? "Individual" : entity === "huf" ? "HUF" : entity === "firm" ? "Firm / LLP / AOP / BOI" : "Company"}`,
      `Estimated total income: ${money(result.total)}`,
      `Verdict: ${result.headline}`,
      `Suggested form: ${result.form}`,
      "",
      "Why:",
      ...result.reasons.map((reason) => `- ${reason}`),
    ].join("\n");
  }, [result, entity]);

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
    setEntity(DEFAULT_ENTITY);
    setIncome(DEFAULT_INCOME);
    setFlags(DEFAULT_FLAGS);
    setCopied(false);
  };

  const toggle = (key) => setFlags((prev) => ({ ...prev, [key]: !prev[key] }));

  const verdictTone =
    result.verdict === "required"
      ? "text-[var(--primary)]"
      : result.verdict === "optional"
        ? "text-[var(--warning)]"
        : "text-[var(--success)]";

  const entityIsIndividual = entity === "individual" || entity === "huf";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileCheck2 className="h-4 w-4" aria-hidden="true" />
          Return form finder
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          ITR-3 Applicability Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Answer a few questions about your business, profession and holdings, and see whether you
          must file ITR-3 or whether the shorter ITR-1, ITR-2 or ITR-4 (Sugam) will do.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="itr3-entity">
              Who is filing?
            </label>
            <select
              id="itr3-entity"
              className={`mt-2 ${INPUT_CLASS}`}
              value={entity}
              onChange={(event) => setEntity(event.target.value)}
            >
              <option value="individual">Individual</option>
              <option value="huf">HUF (Hindu Undivided Family)</option>
              <option value="firm">Firm / LLP / AOP / BOI</option>
              <option value="company">Company</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="itr3-income">
              Estimated total income for the year (INR)
            </label>
            <input
              id="itr3-income"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50000"
              value={income}
              onChange={(event) => setIncome(event.target.value)}
            />
          </div>
        </div>

        {entityIsIndividual ? (
          <div className="mt-5 space-y-5">
            {FLAG_GROUPS.map((group) => (
              <fieldset key={group.title} className="border-0 p-0">
                <legend className="mb-2 text-sm font-semibold text-[var(--foreground)]">
                  {group.title}
                </legend>
                <div className="space-y-2">
                  {group.items.map(([key, label]) => (
                    <label
                      key={key}
                      htmlFor={`itr3-${key}`}
                      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm transition hover:border-[var(--primary)]"
                    >
                      <input
                        id={`itr3-${key}`}
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
                        checked={flags[key]}
                        onChange={() => toggle(key)}
                      />
                      <span className="leading-6">{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            ITR-3 is reserved for individuals and HUFs, so the detailed questions do not apply to
            this taxpayer type.
          </p>
        )}
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Verdict
              </p>
              <p className={`mt-1 text-3xl font-semibold sm:text-4xl ${verdictTone}`}>
                {result.headline}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Form to use: <span className="font-semibold text-[var(--foreground)]">{result.form}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyResult}
                aria-label="Copy ITR-3 applicability verdict"
                className={GHOST_BTN}
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
                aria-label="Reset all answers"
                className={PRIMARY_BTN}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <h2 className="mt-5 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Why this answer
          </h2>
          <ul className="mt-2 space-y-2 text-sm">
            {result.reasons.map((reason) => (
              <li key={reason} className="flex gap-2.5 leading-6">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {[
              ["Total income entered", money(result.total)],
              ["ITR-4 (Sugam) income ceiling", money(ITR4_CAP)],
              ["LTCG under Section 112A allowed in ITR-1 / ITR-4", money(LTCG_112A_CAP)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational guidance based on the ITR form eligibility rules notified for AY 2025-26 and
        AY 2026-27. Form applicability can turn on details this checker does not ask about, such as
        clubbing of income, trust income or Section 44AB audit triggers. Confirm with a chartered
        accountant before you file.
      </p>
    </main>
  );
}
