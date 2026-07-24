"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  AtSign,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  Clipboard,
  Download,
  EyeOff,
  FileSearch,
  FileText,
  FileUp,
  Gift,
  IdCard,
  Info,
  Landmark,
  LockKeyhole,
  RotateCcw,
  SearchCheck,
  ShieldAlert,
  TimerReset,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import { safeCopyText } from "@/shared/utils/clipboard";
import {
  analyzeJobOffer,
  analyzerLimits,
  buildSafeJobOfferReport,
} from "../lib/analyzeJobOffer.mjs";

const MAX_FILE_BYTES = 1024 * 1024;
const ACCEPTED_FILE_PATTERN = /\.(?:txt|md|eml|html?)$/iu;

const EXAMPLE_OFFER = `Congratulations! You are selected without an interview.
Earn ₹25,000 per day from your phone.
Pay the refundable training and security deposit to the recruiter's personal account within 2 hours to reserve your slot.
After joining, receive client funds in your bank account, keep a commission, and forward the balance as USDT.
Send your Aadhaar and bank statement immediately for KYC.`;

const SOURCES = [
  { id: "email", label: "Email" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "telegram", label: "Telegram" },
  { id: "job-portal", label: "Job portal" },
  { id: "other", label: "Other" },
];

const CATEGORY_META = {
  fees: { label: "Upfront fee or deposit", icon: CircleDollarSign },
  payment: { label: "Hard-to-recover payment", icon: Gift },
  mule: { label: "Money movement or reshipping", icon: ArrowLeftRight },
  personalPayment: { label: "Personal-account payment", icon: Landmark },
  urgency: { label: "Urgency or pressure", icon: TimerReset },
  contact: { label: "Contact or domain mismatch", icon: AtSign },
  compensation: { label: "Compensation claim", icon: TrendingUp },
  identity: { label: "Identity-document pressure", icon: IdCard },
};

const LEVEL_STYLE = {
  none: {
    icon: CheckCircle2,
    box: "border-border bg-surface-soft",
    iconBox: "bg-success-soft text-success",
  },
  notice: {
    icon: Info,
    box: "border-info bg-info-soft",
    iconBox: "bg-info-soft text-info",
  },
  caution: {
    icon: AlertTriangle,
    box: "border-warning bg-warning-soft",
    iconBox: "bg-warning-soft text-warning",
  },
  strong: {
    icon: ShieldAlert,
    box: "border-danger bg-danger-soft",
    iconBox: "bg-danger-soft text-danger",
  },
};

const SEVERITY_STYLE = {
  high: "bg-danger-soft text-danger",
  medium: "bg-warning-soft text-foreground",
  low: "bg-surface-soft text-muted-foreground",
};

function downloadReport(report) {
  const url = URL.createObjectURL(
    new Blob([report], { type: "text/plain;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "job-offer-deposit-check-safe-summary.txt";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function PrivacyNote() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-soft p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-primary">
        <LockKeyhole className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="font-bold text-foreground">Local analysis only</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          The offer, contact details, and company domain stay in this tab. This tool does not
          upload, store, follow links, resolve domains, or contact any employer or recruiter.
        </p>
      </div>
    </div>
  );
}

function AssessmentCard({ result }) {
  const style = LEVEL_STYLE[result.assessment.level];
  const Icon = style.icon;
  const totalMatches = result.findings.reduce(
    (total, finding) => total + finding.count,
    0,
  );

  return (
    <section className={`rounded-xl border p-5 sm:p-6 ${style.box}`} aria-live="polite">
      <div className="flex items-start gap-4">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${style.iconBox}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Pattern-based triage
          </p>
          <h2 className="mt-1 text-xl font-black text-foreground">
            {result.assessment.label}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            {result.assessment.summary}
          </p>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Signal score
          </dt>
          <dd className="mt-1 text-2xl font-black text-foreground">
            {result.score}
            <span className="text-sm font-semibold text-muted-foreground"> / 100</span>
          </dd>
          <p className="mt-1 text-xs text-muted-foreground">Not a probability</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Categories
          </dt>
          <dd className="mt-1 text-2xl font-black text-foreground">
            {result.categories.length}
          </dd>
          <p className="mt-1 text-xs text-muted-foreground">Distinct review areas</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Pattern matches
          </dt>
          <dd className="mt-1 text-2xl font-black text-foreground">{totalMatches}</dd>
          <p className="mt-1 text-xs text-muted-foreground">Values redacted in evidence</p>
        </div>
      </dl>
    </section>
  );
}

function FindingCard({ finding }) {
  const category = CATEGORY_META[finding.category] || {
    label: "Review signal",
    icon: FileSearch,
  };
  const Icon = category.icon;
  return (
    <article className="tool-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {category.label}
            </p>
            <h3 className="mt-1 font-bold text-foreground">{finding.title}</h3>
          </div>
        </div>
        <span className={`rounded-pill px-3 py-1 text-xs font-bold uppercase ${SEVERITY_STYLE[finding.severity]}`}>
          {finding.severity}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {finding.explanation}
      </p>

      {finding.matches.length ? (
        <div className="mt-4 space-y-2">
          {finding.matches.map((match, index) => (
            <div
              key={`${finding.id}-${match.line}-${index}`}
              className="rounded-lg border border-border bg-surface-soft p-3"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Redacted local evidence · line {match.line}
              </p>
              <p className="mt-1 break-words text-sm leading-relaxed text-foreground">
                “{match.excerpt}”
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-border bg-surface-soft p-3 text-sm text-muted-foreground">
          Compared the optional contact fields locally. Raw contact and domain values are excluded
          from results and reports.
        </div>
      )}
    </article>
  );
}

export default function JobScamDepositChecker() {
  const fileInputRef = useRef(null);
  const [offerText, setOfferText] = useState("");
  const [recruiterContact, setRecruiterContact] = useState("");
  const [officialDomain, setOfficialDomain] = useState("");
  const [source, setSource] = useState("email");
  const [result, setResult] = useState(null);
  const [reading, setReading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(
    "Paste an offer or choose a local text-based file. No live verification is performed.",
  );

  const report = useMemo(
    () => (result ? buildSafeJobOfferReport(result) : ""),
    [result],
  );

  const resetResult = () => {
    setResult(null);
    setCopied(false);
  };

  const reviewOffer = (event) => {
    event.preventDefault();
    if (!offerText.trim()) return;
    setError("");
    setResult(
      analyzeJobOffer(offerText, {
        recruiterContact,
        officialDomain,
        source,
      }),
    );
    setCopied(false);
    setNotice("Local pattern review complete. Verify important findings independently.");
  };

  const loadExample = () => {
    setOfferText(EXAMPLE_OFFER);
    setRecruiterContact("hiring.manager@gmail.com");
    setOfficialDomain("example-employer.com");
    setSource("whatsapp");
    resetResult();
    setError("");
    setNotice("Example loaded locally. Choose Review job offer.");
  };

  const clearAll = () => {
    setOfferText("");
    setRecruiterContact("");
    setOfficialDomain("");
    setSource("email");
    setResult(null);
    setCopied(false);
    setError("");
    setNotice("Offer and analysis discarded from this page.");
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    if (!ACCEPTED_FILE_PATTERN.test(file.name)) {
      setError("Choose a TXT, MD, EML, HTML, or HTM file.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("This file is larger than 1 MB. Choose a smaller text-based offer.");
      return;
    }
    setReading(true);
    try {
      const text = await file.text();
      setOfferText(text.slice(0, analyzerLimits.maxOfferLength));
      resetResult();
      setNotice(
        text.length > analyzerLimits.maxOfferLength
          ? `Local file loaded. Only the first ${analyzerLimits.maxOfferLength.toLocaleString("en-US")} characters were kept.`
          : "Local file loaded as inert text. Choose Review job offer.",
      );
    } catch {
      setError("The browser could not read this local file.");
    } finally {
      setReading(false);
    }
  };

  const copyReport = async () => {
    if (!report) return;
    const didCopy = await safeCopyText(report);
    setCopied(didCopy);
    if (didCopy) window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6">
      <header className="tool-card overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <BriefcaseBusiness className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Evidence-led job offer review
                </p>
                <h1 className="text-2xl font-black text-foreground sm:text-3xl">
                  Job Scam Deposit Checker
                </h1>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Review a job message for candidate payments, hard-to-recover transfers, money
              movement, urgency, contact mismatch, compensation claims, and identity pressure.
            </p>
          </div>
          <div className="rounded-xl border border-success bg-success-soft p-4 text-sm text-foreground lg:max-w-sm">
            <div className="flex items-center gap-2 font-bold text-success">
              <EyeOff className="h-5 w-5" aria-hidden="true" />
              No upload · No lookup
            </div>
            <p className="mt-2 leading-relaxed">
              Runs in this browser tab. It does not verify a company, recruiter, listing, domain,
              account, or link.
            </p>
          </div>
        </div>
      </header>

      <div
        className="rounded-xl border border-warning bg-warning-soft p-4 text-sm text-foreground"
        role="note"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
          <p className="leading-relaxed">
            <strong>Results are clues, not a verdict.</strong> A low score cannot confirm an offer
            is genuine, and a warning match does not prove fraud. Verify the exact role and
            recruiter through contact details you find independently.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-8">
        <section className="tool-card p-5 sm:p-6 xl:col-span-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-foreground">Offer or recruiter message</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Remove personal details you do not need for this review.
              </p>
            </div>
          </div>

          <form className="mt-5" onSubmit={reviewOffer}>
            <fieldset>
              <legend className="text-sm font-bold text-foreground">Where it arrived</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {SOURCES.map((option) => (
                  <label
                    key={option.id}
                    className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-bold focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ${
                      source === option.id
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-surface text-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="offer-source"
                      value={option.id}
                      checked={source === option.id}
                      onChange={() => {
                        setSource(option.id);
                        resetResult();
                      }}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <label htmlFor="job-offer-text" className="mt-5 block text-sm font-bold text-foreground">
              Job offer text
            </label>
            <textarea
              id="job-offer-text"
              value={offerText}
              onChange={(event) => {
                setOfferText(event.target.value.slice(0, analyzerLimits.maxOfferLength));
                resetResult();
              }}
              rows={15}
              maxLength={analyzerLimits.maxOfferLength}
              placeholder="Paste the email, chat, job description, or payment instruction here…"
              className="mt-2 w-full resize-y rounded-lg border border-border bg-surface p-4 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              spellCheck={false}
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>Text is analyzed as inert data.</span>
              <span>
                {offerText.length.toLocaleString("en-US")} /{" "}
                {analyzerLimits.maxOfferLength.toLocaleString("en-US")}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={reading}
              >
                <FileUp className="h-4 w-4" aria-hidden="true" />
                {reading ? "Reading locally…" : "Choose text file"}
              </button>
              <button type="button" className="btn-secondary" onClick={loadExample}>
                <FileSearch className="h-4 w-4" aria-hidden="true" />
                Load example
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="recruiter-contact" className="text-sm font-bold text-foreground">
                  Recruiter contact
                  <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="recruiter-contact"
                  type="text"
                  value={recruiterContact}
                  onChange={(event) => {
                    setRecruiterContact(event.target.value.slice(0, 300));
                    resetResult();
                  }}
                  className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Email or contact text"
                  autoComplete="off"
                />
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Used only to detect a free-mail address or compare domains.
                </p>
              </div>
              <div>
                <label htmlFor="official-domain" className="text-sm font-bold text-foreground">
                  Official company site/domain
                  <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="official-domain"
                  type="text"
                  value={officialDomain}
                  onChange={(event) => {
                    setOfficialDomain(event.target.value.slice(0, 300));
                    resetResult();
                  }}
                  className="mt-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Domain you found independently"
                  autoComplete="off"
                />
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Enter a site you found yourself—not a link supplied in the offer.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                className="btn-primary"
                disabled={!offerText.trim()}
              >
                <SearchCheck className="h-4 w-4" aria-hidden="true" />
                Review job offer
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={clearAll}
                disabled={!offerText && !recruiterContact && !officialDomain && !result}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Clear
              </button>
            </div>
          </form>

          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.eml,.html,.htm,text/plain,text/html,message/rfc822"
            className="sr-only"
            onChange={handleFileChange}
            aria-label="Choose a local text-based job offer file"
          />
        </section>

        <aside className="min-w-0 space-y-6 xl:col-span-3">
          <PrivacyNote />
          <section className="tool-card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <WalletCards className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="font-bold text-foreground">Before paying anything</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-foreground">
              <li>Confirm the exact job requisition on a careers page you find independently.</li>
              <li>Call a published company number and verify the recruiter and payment policy.</li>
              <li>Do not rely on a refund promise, QR code, invoice, badge, or copied company logo.</li>
              <li>Do not receive or forward company money through a personal account.</li>
            </ul>
          </section>
          <div
            className={`rounded-xl border p-4 text-sm ${
              error
                ? "border-danger bg-danger-soft text-foreground"
                : "border-border bg-surface-soft text-muted-foreground"
            }`}
            role={error ? "alert" : "status"}
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              {error ? (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
              ) : (
                <BriefcaseBusiness className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              )}
              <p className="leading-relaxed">{error || notice}</p>
            </div>
          </div>
        </aside>
      </div>

      {result ? (
        <>
          <AssessmentCard result={result} />

          <div className="grid gap-6 xl:grid-cols-3">
            <section className="min-w-0 space-y-4 xl:col-span-2">
              <div className="tool-card p-5">
                <h2 className="text-xl font-bold text-foreground">Evidence categories</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Snippets are shown only on this page with contact, link, amount, phone, wallet,
                  and long-number values replaced. The shareable report contains no snippets.
                </p>
              </div>
              {result.findings.length ? (
                result.findings.map((finding) => (
                  <FindingCard key={finding.id} finding={finding} />
                ))
              ) : (
                <div className="rounded-xl border border-success bg-success-soft p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                    <div>
                      <h3 className="font-bold text-foreground">No configured pattern matched</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        This is not proof of legitimacy. Verify the employer, recruiter, role,
                        interview, and any payment or document request independently.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <aside className="min-w-0 space-y-6">
              <section className="tool-card p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Clipboard className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="font-bold text-foreground">Safe summary</h2>
                    <p className="text-sm text-muted-foreground">No raw values or excerpts</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  <button type="button" className="btn-primary" onClick={copyReport}>
                    <Clipboard className="h-4 w-4" aria-hidden="true" />
                    {copied ? "Summary copied" : "Copy safe summary"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => downloadReport(report)}
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download safe summary
                  </button>
                </div>
              </section>

              <section className="tool-card p-5">
                <h2 className="font-bold text-foreground">Safer checks</h2>
                <ol className="mt-4 space-y-3">
                  {result.nextSteps.map((step, index) => (
                    <li key={step} className="flex gap-3 text-sm leading-relaxed text-foreground">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-primary-soft text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </section>
            </aside>
          </div>

          <section className="rounded-xl border border-border bg-surface-soft p-4 text-sm leading-relaxed text-muted-foreground">
            <p className="font-bold text-foreground">Limitations</p>
            <p className="mt-1">{result.disclaimer}</p>
            {result.truncated ? (
              <p className="mt-2 font-semibold text-warning">
                Input exceeded the limit, so only the first{" "}
                {analyzerLimits.maxOfferLength.toLocaleString("en-US")} characters were reviewed.
              </p>
            ) : null}
          </section>
        </>
      ) : null}
    </main>
  );
}
