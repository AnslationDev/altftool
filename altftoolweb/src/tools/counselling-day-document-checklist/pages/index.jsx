"use client";

import { useMemo, useState } from "react";
import { Check, Copy, GraduationCap, Info, RotateCcw, TriangleAlert } from "lucide-react";

import {
  CATEGORIES,
  COUNSELLING_TYPES,
  buildCounsellingDocuments,
  computeCounsellingCost,
  computeCounsellingReadiness,
  computeReportingWindow,
  defaultFeesFor,
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
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3";
const CHECKBOX = "mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]";

const PROFILE_OPTIONS = [
  { key: "stateQuota", label: "Reporting against a state-quota seat" },
  { key: "pwd", label: "Allotted under the PwD category" },
  { key: "needsMigration", label: "Coming from another board or university" },
  { key: "needsTransfer", label: "Transfer and character certificate asked for" },
  { key: "gapYear", label: "There is a gap year to explain" },
  { key: "antiRagging", label: "Anti-ragging undertaking required" },
];

const DEFAULT_PROFILE = {
  stateQuota: false,
  pwd: false,
  needsMigration: true,
  needsTransfer: true,
  gapYear: false,
  antiRagging: true,
};

const DEFAULT_TYPE = "josaa";
const DEFAULT_CATEGORY = "general";

export default function ToolHome() {
  const seed = defaultFeesFor(DEFAULT_TYPE, DEFAULT_CATEGORY);

  const [typeId, setTypeId] = useState(DEFAULT_TYPE);
  const [categoryId, setCategoryId] = useState(DEFAULT_CATEGORY);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [seatFee, setSeatFee] = useState(String(seed.fee));
  const [securityDeposit, setSecurityDeposit] = useState(String(seed.deposit));
  const [instituteFee, setInstituteFee] = useState("80000");
  const [travelCost, setTravelCost] = useState("6000");
  const [lodgingCost, setLodgingCost] = useState("4000");
  const [incidentalCost, setIncidentalCost] = useState("1500");
  const [allotmentDate, setAllotmentDate] = useState("");
  const [lastReportingDate, setLastReportingDate] = useState("");
  const [todayDate, setTodayDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [readyIds, setReadyIds] = useState([]);
  const [copied, setCopied] = useState(false);

  const applyDefaults = (nextType, nextCategory) => {
    const fees = defaultFeesFor(nextType, nextCategory);
    if (fees) {
      setSeatFee(String(fees.fee));
      setSecurityDeposit(String(fees.deposit));
    }
  };

  const chooseType = (nextId) => {
    setTypeId(nextId);
    applyDefaults(nextId, categoryId);
  };
  const chooseCategory = (nextId) => {
    setCategoryId(nextId);
    applyDefaults(typeId, nextId);
  };

  const build = useMemo(
    () => buildCounsellingDocuments({ typeId, categoryId, profile }),
    [typeId, categoryId, profile],
  );
  const buildError = Boolean(build.error);
  const documents = buildError ? [] : build.documents;

  const cost = useMemo(
    () =>
      computeCounsellingCost({
        typeId,
        seatFee: seatFee === "" ? 0 : Number(seatFee),
        securityDeposit: securityDeposit === "" ? 0 : Number(securityDeposit),
        instituteFee: instituteFee === "" ? 0 : Number(instituteFee),
        travelCost: travelCost === "" ? 0 : Number(travelCost),
        lodgingCost: lodgingCost === "" ? 0 : Number(lodgingCost),
        incidentalCost: incidentalCost === "" ? 0 : Number(incidentalCost),
      }),
    [typeId, seatFee, securityDeposit, instituteFee, travelCost, lodgingCost, incidentalCost],
  );

  const costError = Boolean(cost.error);
  const hasError = buildError || costError;
  const errorMessage = build.error || cost.error || "";

  const windowInfo = useMemo(
    () => computeReportingWindow({ allotmentDate, lastReportingDate, todayDate }),
    [allotmentDate, lastReportingDate, todayDate],
  );
  const windowReady = !windowInfo.error;

  const readiness = useMemo(
    () => computeCounsellingReadiness(documents, readyIds),
    [documents, readyIds],
  );

  const toggleProfile = (key) => setProfile((current) => ({ ...current, [key]: !current[key] }));
  const toggleReady = (id) =>
    setReadyIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Counselling Day Checklist",
      `${build.type.label} — ${build.category.label}`,
      `Arrange ${cost.totalToArrange} rupees on reporting day`,
      `Recoverable later: ${cost.recoverable} (deposit ${cost.refundable}, adjusted ${cost.adjustable})`,
      `Net cost: ${cost.netCost}`,
    ];
    if (windowReady) lines.push("", windowInfo.message);
    lines.push("", "Documents:");
    documents.forEach((doc) =>
      lines.push(`[${readyIds.includes(doc.id) ? "x" : " "}] ${doc.label}${doc.retained ? " (institute keeps the original)" : ""}`),
    );
    return lines.join("\n");
  }, [hasError, build, cost, windowReady, windowInfo, documents, readyIds]);

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
    setTypeId(DEFAULT_TYPE);
    setCategoryId(DEFAULT_CATEGORY);
    applyDefaults(DEFAULT_TYPE, DEFAULT_CATEGORY);
    setProfile(DEFAULT_PROFILE);
    setInstituteFee("80000");
    setTravelCost("6000");
    setLodgingCost("4000");
    setIncidentalCost("1500");
    setAllotmentDate("");
    setLastReportingDate("");
    setReadyIds([]);
    setCopied(false);
  };

  const currentType = COUNSELLING_TYPES.find((entry) => entry.id === typeId) || COUNSELLING_TYPES[0];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          Counselling day
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Counselling Day Checklist</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Two things decide a reporting day: whether the folder is complete, and whether the money is
          in the account. This handles both, and separates what you get back from what is gone.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cdc-type">
              Counselling
            </label>
            <select
              id="cdc-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={typeId}
              onChange={(event) => chooseType(event.target.value)}
            >
              {COUNSELLING_TYPES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cdc-category">
              Category allotted under
            </label>
            <select
              id="cdc-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={categoryId}
              onChange={(event) => chooseCategory(event.target.value)}
            >
              {CATEGORIES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cdc-seatfee">
              {currentType.feeLabel} (INR)
            </label>
            <input
              id="cdc-seatfee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="500"
              value={seatFee}
              onChange={(event) => setSeatFee(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cdc-deposit">
              Refundable security deposit (INR)
            </label>
            <input
              id="cdc-deposit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="500"
              value={securityDeposit}
              onChange={(event) => setSecurityDeposit(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cdc-institute">
              Institute fee due at reporting (INR)
            </label>
            <input
              id="cdc-institute"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1000"
              value={instituteFee}
              onChange={(event) => setInstituteFee(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cdc-travel">
              Travel for candidate and parent (INR)
            </label>
            <input
              id="cdc-travel"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="500"
              value={travelCost}
              onChange={(event) => setTravelCost(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cdc-lodging">
              Stay near the centre (INR)
            </label>
            <input
              id="cdc-lodging"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="500"
              value={lodgingCost}
              onChange={(event) => setLodgingCost(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cdc-incidental">
              Photocopies, affidavits, photographs (INR)
            </label>
            <input
              id="cdc-incidental"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={incidentalCost}
              onChange={(event) => setIncidentalCost(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Reporting window</legend>
          <div className="mt-2 grid gap-4 sm:grid-cols-3">
            <div>
              <label className={LABEL_CLASS} htmlFor="cdc-allot">
                Allotment date
              </label>
              <input
                id="cdc-allot"
                className={`mt-2 ${INPUT_CLASS}`}
                type="date"
                value={allotmentDate}
                onChange={(event) => setAllotmentDate(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="cdc-last">
                Last date to report
              </label>
              <input
                id="cdc-last"
                className={`mt-2 ${INPUT_CLASS}`}
                type="date"
                value={lastReportingDate}
                onChange={(event) => setLastReportingDate(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="cdc-today">
                Today
              </label>
              <input
                id="cdc-today"
                className={`mt-2 ${INPUT_CLASS}`}
                type="date"
                value={todayDate}
                onChange={(event) => setTodayDate(event.target.value)}
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Which of these apply?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {PROFILE_OPTIONS.map((option) => (
              <label key={option.key} className={CHECK_ROW} htmlFor={`cdc-p-${option.key}`}>
                <input
                  id={`cdc-p-${option.key}`}
                  type="checkbox"
                  className={CHECKBOX}
                  checked={profile[option.key]}
                  onChange={() => toggleProfile(option.key)}
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {errorMessage}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Arrange on reporting day
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(cost.totalToArrange)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the costing."
                : `${money(cost.recoverable)} of that comes back or is adjusted later — ${cost.recoverablePercent}% of the total.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the counselling checklist and costing"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy checklist"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [currentType.feeLabel, hasError ? DASH : money(cost.seatFee)],
            ["Refundable deposit", hasError ? DASH : money(cost.refundable)],
            ["Adjusted against institute fee", hasError ? DASH : money(cost.adjustable)],
            ["Net cost after refunds", hasError ? DASH : money(cost.netCost)],
            ["Deposit at risk on a no-show", hasError ? DASH : money(cost.depositAtRisk)],
            ["Documents ready", hasError ? DASH : `${readiness.ready} of ${readiness.total}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <>
            <div className="mt-4">
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`${readiness.percent} percent of the documents are ready`}
              >
                <span
                  className={`block h-full ${readiness.complete ? "bg-[var(--success)]" : "bg-[var(--primary)]"}`}
                  style={{ width: `${readiness.percent}%` }}
                />
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{currentType.note}</p>
          </>
        )}
      </section>

      {windowReady && (
        <p
          role={windowInfo.closed || windowInfo.urgent ? "alert" : undefined}
          className={`mt-6 flex items-start gap-3 rounded-lg p-3 text-sm leading-5 ${
            windowInfo.closed
              ? "bg-[var(--danger-soft)] text-[var(--danger)]"
              : windowInfo.urgent
                ? "bg-[var(--warning-soft)] text-[var(--warning)]"
                : "border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)]"
          }`}
        >
          {windowInfo.closed || windowInfo.urgent ? (
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          ) : (
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
          )}
          <span>{windowInfo.message}</span>
        </p>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">The reporting folder</h2>
          <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
            Anything marked &ldquo;institute keeps it&rdquo; is retained until the admission process
            closes. Photocopy every page before you hand it across the desk.
          </p>
          <ul className="mt-3 grid gap-3">
            {documents.map((doc) => (
              <li key={doc.id}>
                <label className={CHECK_ROW} htmlFor={`cdc-d-${doc.id}`}>
                  <input
                    id={`cdc-d-${doc.id}`}
                    type="checkbox"
                    className={CHECKBOX}
                    checked={readyIds.includes(doc.id)}
                    onChange={() => toggleReady(doc.id)}
                  />
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-baseline gap-2">
                      <span className="text-sm font-semibold">{doc.label}</span>
                      {doc.retained ? (
                        <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                          institute keeps it
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                      {doc.detail}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Every fee, deposit, refund rule and document format shown here is
        republished for each counselling cycle and differs between central and state processes — the
        information bulletin and business rules for your own round are the authority, and the amounts
        above are editable for exactly that reason.
      </p>
    </main>
  );
}
