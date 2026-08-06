"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardList, Copy, RotateCcw } from "lucide-react";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const PROFILE_QUESTIONS = [
  {
    title: "Income sources",
    items: [
      ["salary", "Salary or pension"],
      ["houseProperty", "Rent from a house property"],
      ["homeLoan", "I repay a home loan"],
      ["capitalGains", "Shares, mutual funds or property sold during the year"],
      ["business", "Business or professional income (including freelancing)"],
      ["fno", "F&O, intraday or crypto (VDA) trading"],
      ["otherSources", "Bank or FD interest, dividends, gifts"],
      ["foreign", "Foreign income, foreign assets or an overseas bank account"],
    ],
  },
  {
    title: "Deductions and payments you plan to claim",
    items: [
      ["hra", "House rent allowance (HRA)"],
      ["d80c", "Section 80C — LIC, PPF, ELSS, tuition fees, principal repayment"],
      ["d80d", "Section 80D — health insurance premium"],
      ["nps", "Section 80CCD(1B) — extra ₹50,000 NPS contribution"],
      ["d80g", "Section 80G — donations"],
      ["d80e", "Section 80E — education loan interest"],
      ["disability", "Section 80DD / 80DDB / 80U — disability or specified illness"],
      ["advanceTax", "I paid advance tax or self-assessment tax"],
    ],
  },
];

const DEFAULT_PROFILE = {
  salary: true,
  houseProperty: false,
  homeLoan: false,
  capitalGains: false,
  business: false,
  fno: false,
  otherSources: true,
  foreign: false,
  hra: true,
  d80c: true,
  d80d: true,
  nps: false,
  d80g: false,
  d80e: false,
  disability: false,
  advanceTax: false,
};

/**
 * Build the personalised document checklist.
 * Each section is emitted only when the profile actually calls for it.
 */
const INCOME_KEYS = [
  "salary",
  "houseProperty",
  "homeLoan",
  "capitalGains",
  "business",
  "fno",
  "otherSources",
  "foreign",
];

function buildChecklist(profile, regime, seniorCitizen, resident) {
  const sections = [];
  if (!INCOME_KEYS.some((key) => profile[key])) return sections;
  const push = (title, note, items) => {
    if (!Array.isArray(items)) return;
    const kept = items.filter(Boolean);
    if (kept.length) sections.push({ title, note, items: kept });
  };
  const oldRegime = regime === "old";

  push("Identity and account basics", "Needed by every taxpayer, whatever your income.", [
    "PAN card",
    "Aadhaar number, linked to your PAN (mandatory under Section 139AA)",
    "All bank account numbers with IFSC codes, and the one nominated for refunds",
    "Login credentials for the income tax e-filing portal",
    "Form 26AS downloaded from the e-filing portal (TDS, TCS and tax paid)",
    "Annual Information Statement (AIS) and Taxpayer Information Summary (TIS)",
    "Last year's ITR and its acknowledgement (ITR-V)",
    "Bank statements or passbooks for the full financial year",
  ]);

  push(
    "Salary and pension",
    "Cross-check every figure in Form 16 against Form 26AS and the AIS.",
    profile.salary && [
      "Form 16 Part A (TDS details) and Part B (salary breakup) from each employer",
      "Monthly salary slips, especially for March",
      "Form 12BA if you received perquisites such as a car, ESOPs or accommodation",
      "Form 12BB submitted to your employer with investment declarations",
      "Leave travel allowance travel bills, if claimed",
      profile.hra && "Rent receipts for the whole year plus the rent agreement",
      profile.hra &&
        "Landlord's PAN, mandatory once annual rent crosses ₹1,00,000",
      "Pension payment statement from the bank, if you draw a pension",
    ],
  );

  push(
    "House property and home loan",
    "Interest on a let-out property is deductible in full; a self-occupied property is capped at ₹2,00,000 in the old regime.",
    (profile.houseProperty || profile.homeLoan) && [
      profile.homeLoan &&
        "Home loan interest and principal certificate from the lender for the financial year",
      profile.homeLoan && "Loan sanction letter and possession or completion certificate",
      profile.houseProperty && "Rent agreement and rent received statement for each tenant",
      profile.houseProperty && "Municipal or property tax receipts paid during the year",
      profile.houseProperty && "Tenant's PAN if annual rent exceeds ₹1,00,000",
      "Co-owner names, PANs and ownership share, if the property is jointly held",
      profile.houseProperty && "Form 16C if your tenant deducted TDS on rent under Section 194-IB",
    ],
  );

  push(
    "Capital gains",
    "Equity LTCG above ₹1.25 lakh in a year is taxable; keep the cost of acquisition evidence.",
    profile.capitalGains && [
      "Consolidated capital gains statement from your broker or the RTA (CAMS / KFintech)",
      "Contract notes and demat transaction statement for the year",
      "Purchase and sale deeds for any property sold, with stamp duty valuation",
      "Bills for cost of improvement on property, for indexation",
      "Fair market value or NAV as on 31 January 2018 for grandfathered equity holdings",
      "Form 16B if the buyer deducted TDS on a property sale under Section 194-IA",
      "Proof of reinvestment for exemption under Sections 54, 54EC or 54F, if claimed",
    ],
  );

  push(
    "Business and professional income",
    "Presumptive filers under Sections 44AD, 44ADA or 44AE still need turnover evidence.",
    profile.business && [
      "Profit and loss account and balance sheet for the year",
      "Cash book, ledger and journal, or your accounting software export",
      "Sales and purchase invoices plus expense bills",
      "GST returns (GSTR-1 and GSTR-3B) and the annual return, if registered",
      "Current account bank statements for the business",
      "Form 16A TDS certificates from every client who deducted tax",
      "Tax audit report in Form 3CA/3CB with Form 3CD, if Section 44AB audit applies",
      "Closing stock valuation and fixed asset or depreciation schedule",
      "Form 10-IEA acknowledgement if you opt out of, or back into, the new regime",
    ],
  );

  push(
    "Trading and virtual digital assets",
    "F&O and intraday results are business income; crypto is taxed at a flat 30% under Section 115BBH.",
    profile.fno && [
      "Broker profit and loss statement separating intraday, F&O and delivery trades",
      "Trade-wise ledger and turnover computation for the audit threshold check",
      "Exchange or wallet statement for every virtual digital asset transaction",
      "Form 16A / 26QE showing 1% TDS on crypto transfers under Section 194S",
    ],
  );

  push(
    "Interest, dividends and other sources",
    "Bank interest appears in the AIS even when no TDS was deducted, so report all of it.",
    profile.otherSources && [
      "Interest certificates for savings accounts, fixed deposits and recurring deposits",
      "Post office, NSC and Senior Citizen Savings Scheme interest statements",
      "Dividend statements from companies and mutual funds",
      "Form 16A for TDS deducted on interest under Section 194A",
      "Details of any gift above ₹50,000 received from a non-relative",
    ],
  );

  push(
    "Foreign income and assets",
    "Schedule FA is mandatory for residents holding foreign assets, and non-disclosure is penalised.",
    profile.foreign && [
      "Foreign bank account statements with account opening date and peak balance",
      "Details of foreign shares, ESOPs, property and any signing authority abroad",
      "Form 67 filed for foreign tax credit, along with the foreign tax payment proof",
      "Tax Residency Certificate (TRC) if you claim treaty relief",
    ],
  );

  push(
    "Deduction proofs (old regime)",
    "These deductions are available only if you file under the old regime.",
    oldRegime && [
      profile.d80c && "Section 80C: LIC premium receipts, PPF passbook, ELSS statements, NSC and Sukanya Samriddhi entries",
      profile.d80c && "Section 80C: children's school tuition fee receipts and home loan principal certificate",
      profile.d80d && "Section 80D: health insurance premium receipts for self, family and parents",
      profile.d80d && "Section 80D: preventive health check-up bills, up to ₹5,000 within the overall limit",
      profile.nps && "Section 80CCD(1B): NPS Tier-I contribution statement or transaction receipt",
      profile.d80g && "Section 80G: stamped donation receipts plus Form 10BE certificate from the donee",
      profile.d80e && "Section 80E: education loan interest certificate from the bank",
      profile.disability && "Section 80DD / 80U: disability certificate in Form 10-IA from a prescribed authority",
      profile.disability && "Section 80DDB: prescription and treatment bills for the specified illness",
      !profile.hra && "Form 10BA declaration if you claim rent deduction under Section 80GG",
      profile.otherSources &&
        "Savings interest certificate for Section 80TTA, or Section 80TTB if you are 60 or above",
    ],
  );

  push(
    "New regime note",
    "Most Chapter VI-A deductions are switched off under Section 115BAC.",
    !oldRegime && [
      "No 80C, 80D or HRA proofs are needed, but keep them if you may switch regimes later",
      "Employer's NPS contribution certificate — Section 80CCD(2) still works in the new regime",
      "Form 10-IEA acknowledgement, required only if you have business or professional income",
    ],
  );

  push(
    "Tax paid and refunds",
    "Match every challan with Form 26AS before you file.",
    profile.advanceTax && [
      "Challan 280 receipts for advance tax, with BSR code, date and serial number",
      "Self-assessment tax challan for any balance paid before filing",
      "Form 27D for TCS collected on car purchases, foreign remittances or tour packages",
    ],
  );

  push(
    "Senior citizen extras",
    "Age-based relief that many senior filers miss.",
    seniorCitizen && [
      "Age proof for the higher basic exemption in the old regime (₹3,00,000 from 60, ₹5,00,000 from 80)",
      "Section 80TTB interest certificates — deduction up to ₹50,000 on deposit interest",
      "Form 15H copies submitted to banks during the year",
      "Section 194P declaration if you are 75 or above with only pension and interest income",
    ],
  );

  push(
    "Non-resident extras",
    "Residential status decides how much of your global income India can tax.",
    !resident && [
      "Passport pages showing every entry and exit stamp, to count days of stay",
      "NRE, NRO and FCNR account statements",
      "Tax Residency Certificate and Form 10F for treaty benefits",
      "Form 16A for TDS deducted under Section 195",
    ],
  );

  return sections;
}

export default function ToolHome() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [regime, setRegime] = useState("old");
  const [seniorCitizen, setSeniorCitizen] = useState(false);
  const [resident, setResident] = useState(true);
  const [done, setDone] = useState({});
  const [copied, setCopied] = useState(false);

  const sections = useMemo(
    () => buildChecklist(profile, regime, seniorCitizen, resident),
    [profile, regime, seniorCitizen, resident],
  );

  const totals = useMemo(() => {
    const all = sections.flatMap((section) => section.items);
    const checked = all.filter((item) => done[item]).length;
    return {
      total: all.length,
      checked,
      percent: all.length ? Math.round((checked / all.length) * 100) : 0,
    };
  }, [sections, done]);

  const invalid = totals.total === 0;

  const summary = useMemo(() => {
    if (invalid) return "";
    return [
      "ITR Document Checklist",
      `Regime: ${regime === "old" ? "Old regime" : "New regime (Section 115BAC)"}`,
      `Residential status: ${resident ? "Resident" : "Non-resident"}`,
      `${totals.total} documents across ${sections.length} sections`,
      "",
      ...sections.flatMap((section) => [
        section.title.toUpperCase(),
        ...section.items.map((item) => `  [${done[item] ? "x" : " "}] ${item}`),
        "",
      ]),
    ].join("\n");
  }, [sections, done, regime, resident, totals.total, invalid]);

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
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Reset the checklist? This clears your profile answers and every ticked document, and cannot be undone.",
      )
    ) {
      return;
    }
    setProfile(DEFAULT_PROFILE);
    setRegime("old");
    setSeniorCitizen(false);
    setResident(true);
    setDone({});
    setCopied(false);
  };

  const toggleProfile = (key) => setProfile((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleDone = (item) => setDone((prev) => ({ ...prev, [item]: !prev[item] }));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Filing prep
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          ITR Document Checklist Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick the income sources and deductions that apply to you, and get a personalised list of
          every certificate, statement and receipt to collect before you file your return.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="itrdoc-regime">
              Tax regime you will file under
            </label>
            <select
              id="itrdoc-regime"
              className={`mt-2 ${INPUT_CLASS}`}
              value={regime}
              onChange={(event) => setRegime(event.target.value)}
            >
              <option value="old">Old regime (deductions allowed)</option>
              <option value="new">New regime (Section 115BAC)</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="itrdoc-status">
              Residential status
            </label>
            <select
              id="itrdoc-status"
              className={`mt-2 ${INPUT_CLASS}`}
              value={resident ? "resident" : "nonresident"}
              onChange={(event) => setResident(event.target.value === "resident")}
            >
              <option value="resident">Resident</option>
              <option value="nonresident">Non-resident / RNOR</option>
            </select>
          </div>
        </div>

        <label
          htmlFor="itrdoc-senior"
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
        >
          <input
            id="itrdoc-senior"
            type="checkbox"
            className="h-4 w-4 accent-[var(--primary)]"
            checked={seniorCitizen}
            onChange={(event) => setSeniorCitizen(event.target.checked)}
          />
          I am 60 or above (senior citizen)
        </label>

        <div className="mt-5 space-y-5">
          {PROFILE_QUESTIONS.map((group) => (
            <fieldset key={group.title} className="border-0 p-0">
              <legend className="mb-2 text-sm font-semibold text-[var(--foreground)]">
                {group.title}
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {group.items.map(([key, label]) => (
                  <label
                    key={key}
                    htmlFor={`itrdoc-${key}`}
                    className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm transition hover:border-[var(--primary)]"
                  >
                    <input
                      id={`itrdoc-${key}`}
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
                      checked={profile[key]}
                      onChange={() => toggleProfile(key)}
                    />
                    <span className="leading-6">{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      {invalid ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          Select at least one income source to build your checklist.
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Documents to collect
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{totals.total}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Across {sections.length} sections · {totals.checked} ready ({totals.percent}%)
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label={copied ? "Copied" : "Copy the document checklist"}
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
                  aria-label="Reset the checklist and all answers"
                  className={PRIMARY_BTN}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <div
              className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="progressbar"
              aria-valuenow={totals.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Checklist completion"
            >
              <span
                className="block h-full rounded-full bg-[var(--success)] transition-all motion-reduce:transition-none"
                style={{ width: `${totals.percent}%` }}
              />
            </div>
          </section>

          <div className="mt-6 space-y-6">
            {sections.map((section) => {
              const sectionDone = section.items.filter((item) => done[item]).length;
              return (
                <section
                  key={section.title}
                  className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-base font-semibold">{section.title}</h2>
                    <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                      {sectionDone} / {section.items.length} ready
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">{section.note}</p>
                  <ul className="mt-3 space-y-2">
                    {section.items.map((item) => (
                      <li key={item}>
                        <label
                          htmlFor={`doc-${item.slice(0, 40).replace(/\W+/g, "-")}`}
                          className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm transition hover:border-[var(--primary)]"
                        >
                          <input
                            id={`doc-${item.slice(0, 40).replace(/\W+/g, "-")}`}
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
                            checked={Boolean(done[item])}
                            onChange={() => toggleDone(item)}
                          />
                          <span
                            className={`leading-6 ${done[item] ? "text-[var(--muted-foreground)] line-through" : ""}`}
                          >
                            {item}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational checklist for Indian income tax returns. Your exact requirements depend on your
        ITR form, residential status and any notices you have received. Documents are generally not
        attached to the return itself, but you must be able to produce them if the return is picked
        for scrutiny.
      </p>
    </main>
  );
}
