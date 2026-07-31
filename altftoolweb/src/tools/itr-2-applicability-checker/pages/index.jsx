"use client";

import { useCallback, useMemo, useState } from "react";
import { safeCopyText } from "@/shared/utils/clipboard";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const money = (value) => inr.format(Number.isFinite(value) ? value : 0);

const INCOME_CAP = 5000000;
const AGRI_CAP = 5000;
const LTCG_112A_CAP = 125000;

const ENTITY_OPTIONS = [
  { id: "individual", label: "Individual" },
  { id: "huf", label: "Hindu Undivided Family (HUF)" },
];

const RESIDENCE_OPTIONS = [
  { id: "resident", label: "Resident and ordinarily resident" },
  { id: "rnor", label: "Resident but Not Ordinarily Resident" },
  { id: "nri", label: "Non-Resident (NRI)" },
];

const HOUSE_OPTIONS = [
  { id: "none", label: "None" },
  { id: "one", label: "One house property" },
  { id: "many", label: "Two or more house properties" },
];

const CG_OPTIONS = [
  { id: "none", label: "No capital gains this year" },
  { id: "ltcg112a", label: "Only listed shares / equity MF long-term gains (section 112A)" },
  { id: "other", label: "Other capital gains — property, debt funds, unlisted shares, gold, STCG" },
];

const TRIGGER_FLAGS = [
  { id: "foreign", label: "Foreign assets, foreign income, or signing authority in a foreign account" },
  { id: "director", label: "Was a director in a company at any time during the year" },
  { id: "unlisted", label: "Held unlisted equity shares during the year" },
  { id: "lottery", label: "Winnings from lottery, betting, gambling or race horses" },
  { id: "losses", label: "Losses brought forward, or losses to be carried forward" },
  { id: "dtaa", label: "Claiming relief under section 90 / 90A / 91 for foreign tax paid" },
  { id: "clubbing", label: "Clubbing income of spouse or minor that is not salary or interest" },
  { id: "esop", label: "Deferred tax on ESOPs received from an eligible start-up" },
  { id: "tds194n", label: "TDS deducted under section 194N on cash withdrawals" },
];

const DEFAULT_STATE = {
  entity: "individual",
  residence: "resident",
  totalIncome: "1200000",
  agriIncome: "0",
  ltcg112aAmount: "0",
  house: "one",
  capitalGains: "none",
  business: false,
  presumptive: false,
  foreign: false,
  director: false,
  unlisted: false,
  lottery: false,
  losses: false,
  dtaa: false,
  clubbing: false,
  esop: false,
  tds194n: false,
};

const toNumber = (value) => {
  const parsed = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULT_STATE);
  const [copied, setCopied] = useState(false);

  const setField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  }, []);

  const totalIncome = toNumber(form.totalIncome);
  const agriIncome = toNumber(form.agriIncome);
  const ltcgAmount = toNumber(form.ltcg112aAmount);

  const errors = useMemo(() => {
    const list = [];
    if (!Number.isFinite(totalIncome) || totalIncome < 0)
      list.push("Enter a valid total income (0 or more).");
    if (!Number.isFinite(agriIncome) || agriIncome < 0)
      list.push("Enter a valid agricultural income (0 or more).");
    if (!Number.isFinite(ltcgAmount) || ltcgAmount < 0)
      list.push("Enter a valid section 112A long-term capital gain (0 or more).");
    return list;
  }, [agriIncome, ltcgAmount, totalIncome]);

  const result = useMemo(() => {
    if (errors.length) return null;

    const triggers = [];

    if (form.capitalGains === "other") {
      triggers.push(
        "Capital gains other than small listed 112A gains need Schedule CG, which only ITR-2 (or ITR-3) carries."
      );
    } else if (form.capitalGains === "ltcg112a") {
      if (ltcgAmount > LTCG_112A_CAP) {
        triggers.push(
          `Listed LTCG of ${money(ltcgAmount)} under section 112A exceeds the ${money(
            LTCG_112A_CAP
          )} that a Sahaj return can hold.`
        );
      } else if (form.losses) {
        triggers.push(
          "Listed 112A gains are within the limit, but a capital loss to set off or carry forward still forces the capital-gains schedule."
        );
      }
    }

    if (form.house === "many")
      triggers.push("Income from two or more house properties can only be reported from ITR-2 upward.");
    if (form.residence !== "resident")
      triggers.push(
        form.residence === "nri"
          ? "Non-residents cannot use ITR-1, so ITR-2 is the base form for them."
          : "RNOR taxpayers are outside ITR-1 and file ITR-2."
      );
    if (totalIncome > INCOME_CAP)
      triggers.push(
        `Total income of ${money(totalIncome)} is above the ${money(INCOME_CAP)} ITR-1 ceiling.`
      );
    if (agriIncome > AGRI_CAP)
      triggers.push(
        `Agricultural income of ${money(agriIncome)} is above the ${money(AGRI_CAP)} ITR-1 limit.`
      );
    if (form.entity === "huf")
      triggers.push("An HUF cannot file ITR-1 at all — ITR-2 is its base return without business income.");

    const flagText = {
      foreign:
        "Foreign assets, foreign income or foreign signing authority must be disclosed in Schedule FA, available only from ITR-2.",
      director: "Company directors are excluded from ITR-1.",
      unlisted: "Holding unlisted equity shares requires the shareholding schedule in ITR-2.",
      lottery: "Winnings taxed at the special 30% rate under section 115BB need ITR-2.",
      losses: "Brought-forward or carry-forward losses need the loss schedules in ITR-2.",
      dtaa: "Relief under section 90/90A/91 needs Schedules TR and FSI.",
      clubbing: "Clubbed income of this type cannot be shown in the Sahaj form.",
      esop: "Deferred start-up ESOP tax needs the ESOP deferral schedule.",
      tds194n: "Where tax was deducted under section 194N, ITR-1 is barred.",
    };
    TRIGGER_FLAGS.forEach((flag) => {
      if (form[flag.id] && !(flag.id === "losses" && form.capitalGains === "ltcg112a" && ltcgAmount <= LTCG_112A_CAP)) {
        triggers.push(flagText[flag.id]);
      }
    });

    let recommended;
    let headline;
    if (form.business) {
      const sugamOk =
        form.presumptive &&
        form.residence === "resident" &&
        totalIncome <= INCOME_CAP &&
        agriIncome <= AGRI_CAP &&
        form.house !== "many" &&
        form.capitalGains !== "other" &&
        !form.foreign &&
        !form.director &&
        !form.unlisted &&
        !form.losses &&
        !form.dtaa &&
        !form.lottery &&
        !form.clubbing &&
        !form.esop &&
        !form.tds194n &&
        ltcgAmount <= LTCG_112A_CAP;
      recommended = sugamOk ? "ITR-4 Sugam" : "ITR-3";
      headline = `ITR-2 does not apply — ${recommended} does`;
    } else if (triggers.length) {
      recommended = "ITR-2";
      headline = "ITR-2 applies to you";
    } else {
      recommended = "ITR-1 Sahaj";
      headline = "ITR-2 is not needed — ITR-1 Sahaj is enough";
    }

    const businessNote =
      form.business && triggers.length
        ? "ITR-2 is only for individuals and HUFs without income from business or profession. Because you reported business or professional income, you fall out of ITR-2 even though the triggers below would otherwise apply."
        : null;

    return { triggers, recommended, headline, businessNote };
  }, [agriIncome, errors.length, form, ltcgAmount, totalIncome]);

  const report = useMemo(() => {
    if (!result) return "";
    const lines = [
      "ITR-2 Applicability Check",
      "",
      `Taxpayer: ${ENTITY_OPTIONS.find((o) => o.id === form.entity)?.label}`,
      `Residential status: ${RESIDENCE_OPTIONS.find((o) => o.id === form.residence)?.label}`,
      `Total income: ${money(totalIncome)}`,
      `House property: ${HOUSE_OPTIONS.find((o) => o.id === form.house)?.label}`,
      `Capital gains: ${CG_OPTIONS.find((o) => o.id === form.capitalGains)?.label}`,
      `Business or professional income: ${form.business ? "Yes" : "No"}`,
      "",
      `Verdict: ${result.headline}`,
      `Form to file: ${result.recommended}`,
    ];
    if (result.triggers.length) {
      lines.push("", "Triggers found:");
      result.triggers.forEach((t, i) => lines.push(`${i + 1}. ${t}`));
    } else {
      lines.push("", "No ITR-2 trigger found in your answers.");
    }
    lines.push("", "Informational only — confirm with the ITR instructions for the assessment year.");
    return lines.join("\n");
  }, [form.business, form.capitalGains, form.entity, form.house, form.residence, result, totalIncome]);

  const copyReport = async () => {
    if (!report) return;
    const ok = await safeCopyText(report);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const inputClass =
    "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
          <h1 className="text-2xl font-semibold sm:text-3xl">ITR-2 Applicability Checker</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Capital gains, a second flat, foreign shares or an NRI year can quietly move you out of
            the Sahaj form. Answer the questions below to see whether ITR-2 is the right return, or
            whether ITR-1, ITR-3 or ITR-4 Sugam fits better.
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Your situation</h2>

            <div className="mt-4 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="itr2-entity" className="text-sm font-semibold">
                    Filing as
                  </label>
                  <select
                    id="itr2-entity"
                    value={form.entity}
                    onChange={(e) => setField("entity", e.target.value)}
                    className={inputClass}
                  >
                    {ENTITY_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="itr2-residence" className="text-sm font-semibold">
                    Residential status
                  </label>
                  <select
                    id="itr2-residence"
                    value={form.residence}
                    onChange={(e) => setField("residence", e.target.value)}
                    className={inputClass}
                  >
                    {RESIDENCE_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="itr2-income" className="text-sm font-semibold">
                    Total income for the year (₹)
                  </label>
                  <input
                    id="itr2-income"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1000"
                    value={form.totalIncome}
                    onChange={(e) => setField("totalIncome", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="itr2-agri" className="text-sm font-semibold">
                    Agricultural income (₹)
                  </label>
                  <input
                    id="itr2-agri"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="500"
                    value={form.agriIncome}
                    onChange={(e) => setField("agriIncome", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="itr2-house" className="text-sm font-semibold">
                  House properties owned with income or loss
                </label>
                <select
                  id="itr2-house"
                  value={form.house}
                  onChange={(e) => setField("house", e.target.value)}
                  className={inputClass}
                >
                  {HOUSE_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="itr2-cg" className="text-sm font-semibold">
                  Capital gains during the year
                </label>
                <select
                  id="itr2-cg"
                  value={form.capitalGains}
                  onChange={(e) => setField("capitalGains", e.target.value)}
                  className={inputClass}
                >
                  {CG_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {form.capitalGains === "ltcg112a" ? (
                <div>
                  <label htmlFor="itr2-ltcg" className="text-sm font-semibold">
                    Listed long-term gain under section 112A (₹)
                  </label>
                  <input
                    id="itr2-ltcg"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1000"
                    value={form.ltcg112aAmount}
                    onChange={(e) => setField("ltcg112aAmount", e.target.value)}
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Up to {money(LTCG_112A_CAP)} of section 112A gains can stay in ITR-1 from AY
                    2025-26, provided there is no capital loss involved.
                  </p>
                </div>
              ) : null}
            </div>

            <h3 className="mt-6 text-sm font-semibold">Anything else that applies?</h3>
            <div className="mt-3 grid gap-2">
              <label
                htmlFor="itr2-business"
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6 hover:border-[var(--primary)]"
              >
                <input
                  id="itr2-business"
                  type="checkbox"
                  checked={form.business}
                  onChange={(e) => setField("business", e.target.checked)}
                  className="mt-1.5 h-4 w-4 accent-[var(--primary)]"
                />
                <span>Income from business or profession (freelancing, consultancy, F&amp;O, intraday)</span>
              </label>
              {form.business ? (
                <label
                  htmlFor="itr2-presumptive"
                  className="ml-4 flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6 hover:border-[var(--primary)]"
                >
                  <input
                    id="itr2-presumptive"
                    type="checkbox"
                    checked={form.presumptive}
                    onChange={(e) => setField("presumptive", e.target.checked)}
                    className="mt-1.5 h-4 w-4 accent-[var(--primary)]"
                  />
                  <span>Declared presumptively under section 44AD, 44ADA or 44AE</span>
                </label>
              ) : null}
              {TRIGGER_FLAGS.map((flag) => (
                <label
                  key={flag.id}
                  htmlFor={`itr2-${flag.id}`}
                  className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6 hover:border-[var(--primary)]"
                >
                  <input
                    id={`itr2-${flag.id}`}
                    type="checkbox"
                    checked={form[flag.id]}
                    onChange={(e) => setField(flag.id, e.target.checked)}
                    className="mt-1.5 h-4 w-4 accent-[var(--primary)]"
                  />
                  <span>{flag.label}</span>
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setForm(DEFAULT_STATE);
                setCopied(false);
              }}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              Reset answers
            </button>
          </section>

          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            {errors.length ? (
              <div
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {errors[0]}
              </div>
            ) : null}

            {result ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Verdict
                </p>
                <p className="mt-2 text-3xl font-semibold text-[var(--primary)]">{result.headline}</p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Form to file:{" "}
                  <span className="font-semibold text-[var(--foreground)]">{result.recommended}</span>
                </p>

                {result.businessNote ? (
                  <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6">
                    {result.businessNote}
                  </p>
                ) : null}

                <div className="mt-5">
                  <h3 className="text-sm font-semibold">
                    {result.triggers.length
                      ? `Triggers found (${result.triggers.length})`
                      : "No triggers found"}
                  </h3>
                  {result.triggers.length ? (
                    <ul className="mt-2 grid gap-2">
                      {result.triggers.map((trigger) => (
                        <li
                          key={trigger}
                          className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6"
                        >
                          {trigger}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                      Nothing in your answers needs the extra schedules of ITR-2 — capital gains,
                      multiple properties, foreign assets, special-rate winnings and carried-forward
                      losses are all absent.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={copyReport}
                  aria-label="Copy the ITR-2 applicability result"
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {copied ? "Copied!" : "Copy result"}
                </button>

                <div className="mt-6 grid gap-2 text-xs leading-6 text-[var(--muted-foreground)]">
                  <p>
                    <span className="font-semibold text-[var(--foreground)]">Quick map:</span> ITR-1
                    for simple salaried residents, ITR-2 for individuals and HUFs without business
                    income, ITR-3 when business or professional income exists, ITR-4 Sugam for
                    residents on presumptive taxation up to {money(INCOME_CAP)}.
                  </p>
                  <p>
                    Informational only. Form conditions are notified afresh each assessment year —
                    check the current instructions on the e-filing portal or ask a tax professional.
                  </p>
                </div>
              </>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
