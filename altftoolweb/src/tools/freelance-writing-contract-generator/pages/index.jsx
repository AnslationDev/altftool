"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PenLine, RotateCcw } from "lucide-react";

import {
  CLAUSES,
  CURRENCIES,
  PRICING_MODELS,
  PROFILE_TAGS,
  buildWritingContract,
  requiredClauses,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_CLASS =
  "h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DASH = "—";

const DEFAULT_PROFILE = ["uk", "ai-restricted"];
const DEFAULT_INCLUDED = [
  ...requiredClauses(DEFAULT_PROFILE).map((clause) => clause.id),
  "byline",
  "portfolio",
];

const DEFAULTS = {
  clientName: "Acme Ltd",
  writerName: "R. Iyer",
  projectName: "SaaS blog posts",
  jurisdiction: "England and Wales",
  format: "Google Docs with tracked changes",
  bylineName: "R. Iyer",
  currency: "GBP",
  pricingModel: "per-word",
  wordsPerPiece: 1200,
  pieces: 4,
  ratePerWord: 0.35,
  flatPerPiece: 450,
  hours: 20,
  hourlyRate: 75,
  depositPercent: 30,
  killFeePercent: 50,
  includedRevisions: 2,
  extraRevisionFee: 60,
  feedbackDays: 5,
  netDays: 14,
  noticeDays: 14,
  startDate: "2026-04-06",
  deliveryDate: "2026-05-20",
  ukBaseRatePercent: 4,
};

export default function ToolHome() {
  const [clientName, setClientName] = useState(DEFAULTS.clientName);
  const [writerName, setWriterName] = useState(DEFAULTS.writerName);
  const [projectName, setProjectName] = useState(DEFAULTS.projectName);
  const [jurisdiction, setJurisdiction] = useState(DEFAULTS.jurisdiction);
  const [format, setFormat] = useState(DEFAULTS.format);
  const [bylineName, setBylineName] = useState(DEFAULTS.bylineName);
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [pricingModel, setPricingModel] = useState(DEFAULTS.pricingModel);
  const [wordsPerPiece, setWordsPerPiece] = useState(String(DEFAULTS.wordsPerPiece));
  const [pieces, setPieces] = useState(String(DEFAULTS.pieces));
  const [ratePerWord, setRatePerWord] = useState(String(DEFAULTS.ratePerWord));
  const [flatPerPiece, setFlatPerPiece] = useState(String(DEFAULTS.flatPerPiece));
  const [hours, setHours] = useState(String(DEFAULTS.hours));
  const [hourlyRate, setHourlyRate] = useState(String(DEFAULTS.hourlyRate));
  const [depositPercent, setDepositPercent] = useState(String(DEFAULTS.depositPercent));
  const [killFeePercent, setKillFeePercent] = useState(String(DEFAULTS.killFeePercent));
  const [includedRevisions, setIncludedRevisions] = useState(String(DEFAULTS.includedRevisions));
  const [extraRevisionFee, setExtraRevisionFee] = useState(String(DEFAULTS.extraRevisionFee));
  const [feedbackDays, setFeedbackDays] = useState(String(DEFAULTS.feedbackDays));
  const [netDays, setNetDays] = useState(String(DEFAULTS.netDays));
  const [noticeDays, setNoticeDays] = useState(String(DEFAULTS.noticeDays));
  const [startDate, setStartDate] = useState(DEFAULTS.startDate);
  const [deliveryDate, setDeliveryDate] = useState(DEFAULTS.deliveryDate);
  const [ukBaseRatePercent, setUkBaseRatePercent] = useState(String(DEFAULTS.ukBaseRatePercent));
  const [indiaGstRegistered, setIndiaGstRegistered] = useState(false);
  const [profileTags, setProfileTags] = useState(DEFAULT_PROFILE);
  const [includedIds, setIncludedIds] = useState(DEFAULT_INCLUDED);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildWritingContract({
        clientName,
        writerName,
        projectName,
        jurisdiction,
        format,
        bylineName,
        currency,
        pricingModel,
        wordsPerPiece: Number(wordsPerPiece),
        pieces: Number(pieces),
        ratePerWord: Number(ratePerWord),
        flatPerPiece: Number(flatPerPiece),
        hours: Number(hours),
        hourlyRate: Number(hourlyRate),
        depositPercent: Number(depositPercent),
        killFeePercent: Number(killFeePercent),
        includedRevisions: Number(includedRevisions),
        extraRevisionFee: Number(extraRevisionFee),
        feedbackDays: Number(feedbackDays),
        netDays: Number(netDays),
        noticeDays: Number(noticeDays),
        startDate,
        deliveryDate,
        ukBaseRatePercent: Number(ukBaseRatePercent),
        indiaGstRegistered,
        profileTags,
        includedIds,
      }),
    [
      clientName,
      writerName,
      projectName,
      jurisdiction,
      format,
      bylineName,
      currency,
      pricingModel,
      wordsPerPiece,
      pieces,
      ratePerWord,
      flatPerPiece,
      hours,
      hourlyRate,
      depositPercent,
      killFeePercent,
      includedRevisions,
      extraRevisionFee,
      feedbackDays,
      netDays,
      noticeDays,
      startDate,
      deliveryDate,
      ukBaseRatePercent,
      indiaGstRegistered,
      profileTags,
      includedIds,
    ],
  );

  const hasError = Boolean(result.error);

  const money = useMemo(() => {
    const entry = CURRENCIES.find((item) => item.code === currency) ?? CURRENCIES[0];
    return new Intl.NumberFormat(entry.locale, {
      style: "currency",
      currency: entry.code,
      maximumFractionDigits: 2,
    });
  }, [currency]);
  const number = useMemo(() => new Intl.NumberFormat(undefined), []);

  const requiredIds = useMemo(
    () => new Set(requiredClauses(profileTags).map((clause) => clause.id)),
    [profileTags],
  );

  const toggleProfile = (id) => {
    const nextProfile = profileTags.includes(id)
      ? profileTags.filter((tag) => tag !== id)
      : [...profileTags, id];
    const nextRequired = requiredClauses(nextProfile).map((clause) => clause.id);
    setProfileTags(nextProfile);
    setIncludedIds([...new Set([...includedIds, ...nextRequired])]);
  };

  const toggleClause = (id) => {
    setIncludedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyContract = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.contract);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setClientName(DEFAULTS.clientName);
    setWriterName(DEFAULTS.writerName);
    setProjectName(DEFAULTS.projectName);
    setJurisdiction(DEFAULTS.jurisdiction);
    setFormat(DEFAULTS.format);
    setBylineName(DEFAULTS.bylineName);
    setCurrency(DEFAULTS.currency);
    setPricingModel(DEFAULTS.pricingModel);
    setWordsPerPiece(String(DEFAULTS.wordsPerPiece));
    setPieces(String(DEFAULTS.pieces));
    setRatePerWord(String(DEFAULTS.ratePerWord));
    setFlatPerPiece(String(DEFAULTS.flatPerPiece));
    setHours(String(DEFAULTS.hours));
    setHourlyRate(String(DEFAULTS.hourlyRate));
    setDepositPercent(String(DEFAULTS.depositPercent));
    setKillFeePercent(String(DEFAULTS.killFeePercent));
    setIncludedRevisions(String(DEFAULTS.includedRevisions));
    setExtraRevisionFee(String(DEFAULTS.extraRevisionFee));
    setFeedbackDays(String(DEFAULTS.feedbackDays));
    setNetDays(String(DEFAULTS.netDays));
    setNoticeDays(String(DEFAULTS.noticeDays));
    setStartDate(DEFAULTS.startDate);
    setDeliveryDate(DEFAULTS.deliveryDate);
    setUkBaseRatePercent(String(DEFAULTS.ukBaseRatePercent));
    setIndiaGstRegistered(false);
    setProfileTags(DEFAULT_PROFILE);
    setIncludedIds(DEFAULT_INCLUDED);
    setCopied(false);
  };

  const isIndia = profileTags.includes("india");
  const isUk = profileTags.includes("uk");

  const breakdown = hasError
    ? []
    : [
        ["Deposit before work starts", `${money.format(result.deposit)} (${depositPercent}%)`],
        ["Balance on delivery", money.format(result.balance)],
        ["Balance due by", result.dueLong],
        ["Kill fee if cancelled mid-piece", `${money.format(result.killFee)} (${killFeePercent}%)`],
        [
          "Total words commissioned",
          result.totalWords > 0 ? number.format(result.totalWords) : "not word-based",
        ],
        [
          "Effective rate per word",
          result.totalWords > 0 ? money.format(result.effectiveRatePerWord) : DASH,
        ],
        ...(isUk
          ? [
              [
                "Statutory late-payment interest",
                `${result.statutoryRate.toFixed(2)}% a year — about ${money.format(result.dailyLateInterest)} a day on the balance`,
              ],
              ["Section 5A fixed compensation", money.format(result.fixedCompensation)],
            ]
          : []),
        ...(isIndia
          ? [
              ["GST added to the invoice", money.format(result.gstAmount)],
              ["TDS deducted by the client", money.format(result.tdsAmount)],
              ["Invoice total (fee plus GST)", money.format(result.invoiceTotal)],
              ["Net received by the writer", money.format(result.netToWriter)],
            ]
          : []),
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <PenLine className="h-4 w-4" aria-hidden="true" />
          Freelance contracts
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Freelance Writing Contract Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Prices a content engagement from a per-word, per-piece or hourly rate, works out the
          deposit, kill fee, due date and statutory late-payment charge, and assembles a contract
          with clauses for revisions, byline, copyright assignment and freelance-payment statutes.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Parties and scope</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fw-client">
              Client name
            </label>
            <input
              id="fw-client"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fw-writer">
              Writer name
            </label>
            <input
              id="fw-writer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={writerName}
              onChange={(event) => setWriterName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fw-project">
              What is being written
            </label>
            <input
              id="fw-project"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fw-format">
              Delivery format
            </label>
            <input
              id="fw-format"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={format}
              onChange={(event) => setFormat(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fw-byline">
              Byline name
            </label>
            <input
              id="fw-byline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={bylineName}
              onChange={(event) => setBylineName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fw-law">
              Governing law
            </label>
            <input
              id="fw-law"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={jurisdiction}
              onChange={(event) => setJurisdiction(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fw-start">
              Start date
            </label>
            <input
              id="fw-start"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fw-delivery">
              Final delivery date
            </label>
            <input
              id="fw-delivery"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={deliveryDate}
              onChange={(event) => setDeliveryDate(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Money</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fw-model">
              Pricing model
            </label>
            <select
              id="fw-model"
              className={`mt-2 ${INPUT_CLASS}`}
              value={pricingModel}
              onChange={(event) => setPricingModel(event.target.value)}
            >
              {PRICING_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fw-currency">
              Currency
            </label>
            <select
              id="fw-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {CURRENCIES.map((entry) => (
                <option key={entry.code} value={entry.code}>
                  {entry.code}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fw-pieces">
              Number of pieces
            </label>
            <input
              id="fw-pieces"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="500"
              step="1"
              inputMode="numeric"
              value={pieces}
              onChange={(event) => setPieces(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fw-words">
              Words per piece
            </label>
            <input
              id="fw-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0"
              step="50"
              inputMode="numeric"
              value={wordsPerPiece}
              onChange={(event) => setWordsPerPiece(event.target.value)}
            />
          </div>
          {pricingModel === "per-word" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="fw-rate">
                Rate per word
              </label>
              <input
                id="fw-rate"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={ratePerWord}
                onChange={(event) => setRatePerWord(event.target.value)}
              />
            </div>
          ) : null}
          {pricingModel === "per-piece" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="fw-flat">
                Flat fee per piece
              </label>
              <input
                id="fw-flat"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                min="0"
                step="10"
                inputMode="decimal"
                value={flatPerPiece}
                onChange={(event) => setFlatPerPiece(event.target.value)}
              />
            </div>
          ) : null}
          {pricingModel === "hourly" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="fw-hours">
                  Estimated hours
                </label>
                <input
                  id="fw-hours"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  min="1"
                  step="1"
                  inputMode="decimal"
                  value={hours}
                  onChange={(event) => setHours(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="fw-hourly">
                  Hourly rate
                </label>
                <input
                  id="fw-hourly"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  min="0"
                  step="5"
                  inputMode="decimal"
                  value={hourlyRate}
                  onChange={(event) => setHourlyRate(event.target.value)}
                />
              </div>
            </>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="fw-deposit">
              Deposit (% of fee)
            </label>
            <input
              id="fw-deposit"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0"
              max="100"
              step="5"
              inputMode="decimal"
              value={depositPercent}
              onChange={(event) => setDepositPercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fw-kill">
              Kill fee (% of fee)
            </label>
            <input
              id="fw-kill"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0"
              max="100"
              step="5"
              inputMode="decimal"
              value={killFeePercent}
              onChange={(event) => setKillFeePercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fw-net">
              Payment terms (days)
            </label>
            <input
              id="fw-net"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0"
              max="180"
              step="1"
              inputMode="numeric"
              value={netDays}
              onChange={(event) => setNetDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fw-revisions">
              Included revision rounds
            </label>
            <input
              id="fw-revisions"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0"
              max="20"
              step="1"
              inputMode="numeric"
              value={includedRevisions}
              onChange={(event) => setIncludedRevisions(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fw-extra">
              Fee per extra revision round
            </label>
            <input
              id="fw-extra"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0"
              step="5"
              inputMode="decimal"
              value={extraRevisionFee}
              onChange={(event) => setExtraRevisionFee(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fw-feedback">
              Feedback window (working days)
            </label>
            <input
              id="fw-feedback"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="1"
              max="60"
              step="1"
              inputMode="numeric"
              value={feedbackDays}
              onChange={(event) => setFeedbackDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fw-notice">
              Termination notice (days)
            </label>
            <input
              id="fw-notice"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              min="0"
              max="180"
              step="1"
              inputMode="numeric"
              value={noticeDays}
              onChange={(event) => setNoticeDays(event.target.value)}
            />
          </div>
          {isUk ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="fw-base">
                Bank of England base rate today (%)
              </label>
              <input
                id="fw-base"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                min="0"
                max="30"
                step="0.05"
                inputMode="decimal"
                value={ukBaseRatePercent}
                onChange={(event) => setUkBaseRatePercent(event.target.value)}
              />
            </div>
          ) : null}
        </div>

        {isIndia ? (
          <label
            className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm"
            htmlFor="fw-gst"
          >
            <input
              id="fw-gst"
              type="checkbox"
              className={CHECKBOX_CLASS}
              checked={indiaGstRegistered}
              onChange={(event) => setIndiaGstRegistered(event.target.checked)}
            />
            Writer is registered for GST and will charge 18%
          </label>
        ) : null}

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Engagement profile</legend>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Ticking a box adds the clauses it makes necessary.
          </p>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {PROFILE_TAGS.map((tag) => (
              <label
                key={tag.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`fw-profile-${tag.id}`}
              >
                <input
                  id={`fw-profile-${tag.id}`}
                  type="checkbox"
                  className={CHECKBOX_CLASS}
                  checked={profileTags.includes(tag.id)}
                  onChange={() => toggleProfile(tag.id)}
                />
                {tag.label}
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
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Total fee
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money.format(result.totalFee)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${result.coveragePercent}% of required clauses included · ${result.wordCount}-word contract`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyContract}
              disabled={hasError}
              aria-label="Copy the assembled writing contract"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy contract"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {hasError ? (
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Breakdown</dt>
              <dd className="text-right font-semibold">{DASH}</dd>
            </div>
          ) : (
            breakdown.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))
          )}
        </dl>

        {!hasError && result.missing.length > 0 ? (
          <ul className="mt-5 space-y-2 text-sm">
            {result.missing.map((gap) => (
              <li
                key={gap.id}
                className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-[var(--warning)]"
              >
                <span className="font-semibold">{gap.title}</span> — {gap.why}
              </li>
            ))}
          </ul>
        ) : null}

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-3 space-y-2 text-sm">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-[var(--warning)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-5">
          <h3 className="text-sm font-semibold text-[var(--muted-foreground)]">Contract</h3>
          <div className="mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 whitespace-pre-wrap">
            {hasError ? DASH : result.contract}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-semibold">Clauses</h2>
        <ul className="mt-4 space-y-3">
          {CLAUSES.map((clause) => (
            <li
              key={clause.id}
              className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <label
                className="flex min-h-11 cursor-pointer items-start gap-3"
                htmlFor={`fw-clause-${clause.id}`}
              >
                <input
                  id={`fw-clause-${clause.id}`}
                  type="checkbox"
                  className={`mt-0.5 ${CHECKBOX_CLASS}`}
                  checked={includedIds.includes(clause.id)}
                  onChange={() => toggleClause(clause.id)}
                />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{clause.title}</span>
                    {requiredIds.has(clause.id) ? (
                      <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">
                        Required
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                    {clause.body.slice(0, 150)}
                    {clause.body.length > 150 ? "…" : ""}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template, not legal or tax advice. The clauses reference the work made for hire
        definition at 17 U.S.C. section 101, section 77 of the UK Copyright, Designs and Patents Act
        1988, section 57 of India&rsquo;s Copyright Act 1957, the Late Payment of Commercial Debts
        (Interest) Act 1998, the New York and Illinois freelance worker protection statutes, and
        sections 194J and 206AA of India&rsquo;s Income-tax Act 1961. Rates and thresholds change —
        confirm them with a professional before you sign.
      </p>
    </main>
  );
}
