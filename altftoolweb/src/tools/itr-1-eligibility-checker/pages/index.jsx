"use client";

import { useCallback, useMemo, useState } from "react";
import { safeCopyText } from "@/shared/utils/clipboard";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const money = (value) => inr.format(Number.isFinite(value) ? value : 0);

const TOTAL_INCOME_CAP = 5000000;
const AGRI_CAP = 5000;
const LTCG_112A_CAP = 125000;

const RESIDENCE_OPTIONS = [
  { id: "resident", label: "Resident (ordinarily resident)" },
  { id: "rnor", label: "Resident but Not Ordinarily Resident" },
  { id: "nri", label: "Non-Resident (NRI)" },
];

const HOUSE_OPTIONS = [
  { id: "none", label: "No house property income" },
  { id: "one", label: "One house property" },
  { id: "many", label: "More than one house property" },
];

const FLAGS = [
  {
    id: "business",
    label: "Income from business or profession (including freelancing, F&O, intraday)",
  },
  { id: "capitalGains", label: "Capital gains other than listed LTCG under section 112A" },
  { id: "director", label: "Was a director in any company during the year" },
  { id: "unlisted", label: "Held unlisted equity shares at any time during the year" },
  {
    id: "foreign",
    label: "Foreign assets, foreign income, or signing authority in a foreign account",
  },
  { id: "lottery", label: "Winnings from lottery, betting, gambling or race horses" },
  { id: "losses", label: "Brought-forward loss or loss to be carried forward under any head" },
  { id: "dtaa", label: "Claiming relief under section 90 / 90A / 91 (DTAA)" },
  { id: "tds194n", label: "TDS deducted under section 194N on cash withdrawals" },
  { id: "esop", label: "Deferred tax on ESOPs from an eligible start-up (section 191(2))" },
  { id: "section5a", label: "Income to be apportioned under section 5A (Portuguese Civil Code)" },
];

const DEFAULT_STATE = {
  residence: "resident",
  totalIncome: "900000",
  agriIncome: "0",
  ltcg112a: "0",
  house: "one",
  presumptive: false,
  business: false,
  capitalGains: false,
  director: false,
  unlisted: false,
  foreign: false,
  lottery: false,
  losses: false,
  dtaa: false,
  tds194n: false,
  esop: false,
  section5a: false,
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
  const ltcg = toNumber(form.ltcg112a);

  const errors = useMemo(() => {
    const list = [];
    if (!Number.isFinite(totalIncome) || totalIncome < 0) {
      list.push("Enter a valid total income (0 or more).");
    }
    if (!Number.isFinite(agriIncome) || agriIncome < 0) {
      list.push("Enter a valid agricultural income (0 or more).");
    }
    if (!Number.isFinite(ltcg) || ltcg < 0) {
      list.push("Enter a valid section 112A long-term capital gain (0 or more).");
    }
    return list;
  }, [agriIncome, ltcg, totalIncome]);

  const verdict = useMemo(() => {
    if (errors.length) return null;

    const blockers = [];
    const notes = [];

    if (form.residence !== "resident") {
      blockers.push({
        reason:
          form.residence === "nri"
            ? "ITR-1 is only for ordinarily resident individuals — non-residents cannot use it."
            : "Resident but Not Ordinarily Resident (RNOR) taxpayers cannot file ITR-1.",
        form: "ITR-2",
      });
    }
    if (totalIncome > TOTAL_INCOME_CAP) {
      blockers.push({
        reason: `Total income of ${money(totalIncome)} exceeds the ${money(
          TOTAL_INCOME_CAP
        )} ceiling for ITR-1.`,
        form: "ITR-2",
      });
    }
    if (agriIncome > AGRI_CAP) {
      blockers.push({
        reason: `Agricultural income of ${money(agriIncome)} is above the ${money(
          AGRI_CAP
        )} limit allowed in ITR-1.`,
        form: "ITR-2",
      });
    }
    if (form.house === "many") {
      blockers.push({
        reason: "Income from more than one house property is outside the scope of ITR-1.",
        form: "ITR-2",
      });
    }
    if (ltcg > LTCG_112A_CAP) {
      blockers.push({
        reason: `Listed LTCG under section 112A of ${money(ltcg)} exceeds the ${money(
          LTCG_112A_CAP
        )} that ITR-1 can accommodate.`,
        form: "ITR-2",
      });
    } else if (ltcg > 0) {
      notes.push(
        `Listed LTCG of ${money(ltcg)} under section 112A is within the ${money(
          LTCG_112A_CAP
        )} allowance, so it does not block ITR-1 (allowed from AY 2025-26 onwards, provided there is no capital loss to set off or carry forward).`
      );
    }

    const flagBlockers = {
      business: {
        reason: "Business or professional income cannot be reported in ITR-1.",
        form: form.presumptive ? "ITR-4 Sugam" : "ITR-3",
      },
      capitalGains: {
        reason: "Capital gains other than the small listed 112A gain require a capital-gains schedule.",
        form: "ITR-2",
      },
      director: { reason: "Directors in a company are barred from ITR-1.", form: "ITR-2" },
      unlisted: {
        reason: "Holding unlisted equity shares during the year bars ITR-1.",
        form: "ITR-2",
      },
      foreign: {
        reason:
          "Foreign assets, foreign income or foreign signing authority must be disclosed in Schedule FA, which ITR-1 does not have.",
        form: "ITR-2",
      },
      lottery: {
        reason: "Winnings taxed at special rates under section 115BB cannot go in ITR-1.",
        form: "ITR-2",
      },
      losses: {
        reason: "ITR-1 has no schedule to carry forward or set off brought-forward losses.",
        form: "ITR-2",
      },
      dtaa: { reason: "Relief under section 90/90A/91 needs Schedule TR/FSI.", form: "ITR-2" },
      tds194n: {
        reason: "Where tax has been deducted under section 194N, ITR-1 cannot be used.",
        form: "ITR-2",
      },
      esop: {
        reason: "Deferred ESOP tax from an eligible start-up requires the deferral schedule.",
        form: "ITR-2",
      },
      section5a: {
        reason: "Income apportioned under section 5A cannot be reported in ITR-1.",
        form: "ITR-2",
      },
    };

    FLAGS.forEach((flag) => {
      if (form[flag.id]) blockers.push(flagBlockers[flag.id]);
    });

    let recommended = "ITR-1 Sahaj";
    if (blockers.length) {
      if (form.business) {
        const presumptiveOk =
          form.presumptive &&
          form.residence === "resident" &&
          totalIncome <= TOTAL_INCOME_CAP &&
          agriIncome <= AGRI_CAP &&
          form.house !== "many" &&
          !form.capitalGains &&
          !form.foreign &&
          !form.director &&
          !form.unlisted &&
          !form.losses &&
          !form.dtaa &&
          !form.lottery &&
          !form.tds194n &&
          !form.esop &&
          !form.section5a &&
          ltcg <= LTCG_112A_CAP;
        recommended = presumptiveOk ? "ITR-4 Sugam" : "ITR-3";
      } else {
        recommended = "ITR-2";
      }
    }

    const satisfied = [];
    if (form.residence === "resident") satisfied.push("Ordinarily resident individual.");
    if (totalIncome <= TOTAL_INCOME_CAP)
      satisfied.push(`Total income ${money(totalIncome)} is within the ${money(TOTAL_INCOME_CAP)} cap.`);
    if (form.house !== "many")
      satisfied.push(
        form.house === "one" ? "Only one house property." : "No house property income."
      );
    if (agriIncome <= AGRI_CAP)
      satisfied.push(`Agricultural income ${money(agriIncome)} is within ${money(AGRI_CAP)}.`);

    return { eligible: blockers.length === 0, blockers, notes, recommended, satisfied };
  }, [agriIncome, errors.length, form, ltcg, totalIncome]);

  const report = useMemo(() => {
    if (!verdict) return "";
    const lines = [
      "ITR-1 Sahaj Eligibility Check",
      "",
      `Residential status: ${RESIDENCE_OPTIONS.find((o) => o.id === form.residence)?.label}`,
      `Total income: ${money(totalIncome)}`,
      `House property: ${HOUSE_OPTIONS.find((o) => o.id === form.house)?.label}`,
      `Agricultural income: ${money(agriIncome)}`,
      `Listed LTCG u/s 112A: ${money(ltcg)}`,
      "",
      `Verdict: ${verdict.eligible ? "ITR-1 Sahaj can be filed" : "ITR-1 Sahaj cannot be filed"}`,
      `Suggested form: ${verdict.recommended}`,
    ];
    if (verdict.blockers.length) {
      lines.push("", "Reasons ITR-1 is blocked:");
      verdict.blockers.forEach((b, i) => lines.push(`${i + 1}. ${b.reason}`));
    }
    if (verdict.notes.length) {
      lines.push("", "Notes:");
      verdict.notes.forEach((n) => lines.push(`- ${n}`));
    }
    lines.push("", "Informational only — confirm with the current ITR instructions or your tax adviser.");
    return lines.join("\n");
  }, [agriIncome, form.house, form.residence, ltcg, totalIncome, verdict]);

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
          <h1 className="text-2xl font-semibold sm:text-3xl">ITR-1 Sahaj Eligibility Checker</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Answer a few questions about your income sources and residential status to see whether
            the simplified ITR-1 Sahaj return is open to you, and which form to use instead if it is
            not.
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Your details</h2>

            <div className="mt-4 grid gap-4">
              <div>
                <label htmlFor="itr1-residence" className="text-sm font-semibold">
                  Residential status
                </label>
                <select
                  id="itr1-residence"
                  value={form.residence}
                  onChange={(e) => setField("residence", e.target.value)}
                  className={inputClass}
                >
                  {RESIDENCE_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="itr1-total" className="text-sm font-semibold">
                    Total income for the year (₹)
                  </label>
                  <input
                    id="itr1-total"
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
                  <label htmlFor="itr1-agri" className="text-sm font-semibold">
                    Agricultural income (₹)
                  </label>
                  <input
                    id="itr1-agri"
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="itr1-house" className="text-sm font-semibold">
                    House property income
                  </label>
                  <select
                    id="itr1-house"
                    value={form.house}
                    onChange={(e) => setField("house", e.target.value)}
                    className={inputClass}
                  >
                    {HOUSE_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="itr1-ltcg" className="text-sm font-semibold">
                    Listed LTCG u/s 112A (₹)
                  </label>
                  <input
                    id="itr1-ltcg"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1000"
                    value={form.ltcg112a}
                    onChange={(e) => setField("ltcg112a", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <h3 className="mt-6 text-sm font-semibold">Tick anything that applies to you</h3>
            <div className="mt-3 grid gap-2">
              {FLAGS.map((flag) => (
                <label
                  key={flag.id}
                  htmlFor={`itr1-${flag.id}`}
                  className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6 hover:border-[var(--primary)]"
                >
                  <input
                    id={`itr1-${flag.id}`}
                    type="checkbox"
                    checked={form[flag.id]}
                    onChange={(e) => setField(flag.id, e.target.checked)}
                    className="mt-1.5 h-4 w-4 accent-[var(--primary)]"
                  />
                  <span>{flag.label}</span>
                </label>
              ))}
              {form.business ? (
                <label
                  htmlFor="itr1-presumptive"
                  className="ml-4 flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6 hover:border-[var(--primary)]"
                >
                  <input
                    id="itr1-presumptive"
                    type="checkbox"
                    checked={form.presumptive}
                    onChange={(e) => setField("presumptive", e.target.checked)}
                    className="mt-1.5 h-4 w-4 accent-[var(--primary)]"
                  />
                  <span>
                    That business/profession is declared under presumptive taxation (section 44AD,
                    44ADA or 44AE)
                  </span>
                </label>
              ) : null}
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

            {verdict ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Verdict
                </p>
                <p
                  className={`mt-2 text-3xl font-semibold ${
                    verdict.eligible ? "text-[var(--success)]" : "text-[var(--danger)]"
                  }`}
                >
                  {verdict.eligible ? "ITR-1 Sahaj can be filed" : "ITR-1 Sahaj is not available"}
                </p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  Suggested return form:{" "}
                  <span className="font-semibold text-[var(--foreground)]">
                    {verdict.recommended}
                  </span>
                </p>

                {verdict.blockers.length ? (
                  <div className="mt-5">
                    <h3 className="text-sm font-semibold">
                      Why ITR-1 is blocked ({verdict.blockers.length})
                    </h3>
                    <ul className="mt-2 grid gap-2">
                      {verdict.blockers.map((blocker) => (
                        <li
                          key={blocker.reason}
                          className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6"
                        >
                          <span>{blocker.reason}</span>
                          <span className="mt-1 block text-xs font-semibold text-[var(--muted-foreground)]">
                            Points to {blocker.form}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="mt-5">
                    <h3 className="text-sm font-semibold">Conditions you meet</h3>
                    <ul className="mt-2 grid gap-2">
                      {verdict.satisfied.map((item) => (
                        <li
                          key={item}
                          className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {verdict.notes.length ? (
                  <ul className="mt-4 grid gap-2">
                    {verdict.notes.map((note) => (
                      <li
                        key={note}
                        className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs leading-6 text-[var(--muted-foreground)]"
                      >
                        {note}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <button
                  type="button"
                  onClick={copyReport}
                  aria-label="Copy the ITR-1 eligibility result"
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {copied ? "Copied!" : "Copy result"}
                </button>

                <p className="mt-4 text-xs leading-6 text-[var(--muted-foreground)]">
                  Informational only. ITR form conditions are notified each assessment year — check
                  the current ITR instructions on the income tax portal or ask a tax professional
                  before filing.
                </p>
              </>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
