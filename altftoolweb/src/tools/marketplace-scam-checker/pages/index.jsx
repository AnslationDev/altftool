"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clipboard,
  Download,
  EyeOff,
  FileSearch,
  Info,
  LockKeyhole,
  PackageSearch,
  RotateCcw,
  ShieldAlert,
  ShoppingBag,
  UserRound,
  WalletCards,
} from "lucide-react";

import { safeCopyText } from "@/shared/utils/clipboard";
import {
  analyzeMarketplaceMessage,
  analyzerLimits,
  buildSafeMarketplaceReport,
} from "../lib/analyzeMarketplaceMessage.mjs";

const EXAMPLE_MESSAGE = `Continue only on WhatsApp. I overpaid and sent extra, so refund the difference to my courier immediately.
The marketplace payment is pending, but ship the item now. Share the verification code to confirm you are the seller.`;

const ROLES = [
  { id: "seller", label: "I am selling" },
  { id: "buyer", label: "I am buying" },
  { id: "unknown", label: "Other / unsure" },
];

const LEVEL_STYLES = {
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

const SEVERITY_STYLES = {
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
  anchor.download = "marketplace-message-safe-summary.txt";
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
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Message and amount fields stay in this browser tab. Links, profiles,
          payments, couriers, and listings are never opened or verified.
        </p>
      </div>
    </div>
  );
}

function AssessmentCard({ result }) {
  const style = LEVEL_STYLES[result.assessment.level] || LEVEL_STYLES.notice;
  const Icon = style.icon;
  const matchCount = result.findings.reduce(
    (total, finding) => total + finding.count,
    0,
  );

  return (
    <section
      className={`rounded-xl border p-5 sm:p-6 ${style.box}`}
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${style.iconBox}`}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Pattern-based review
          </p>
          <h2 className="mt-1 text-xl font-black text-foreground">
            {result.assessment.label}
          </h2>
          <p className="mt-2 text-sm leading-6 text-foreground">
            {result.assessment.summary}
          </p>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Signal score",
            value: `${result.score} / 100`,
            detail: "Not a probability",
          },
          {
            label: "Review areas",
            value: result.categories.length,
            detail: "Distinct evidence categories",
          },
          {
            label: "Pattern matches",
            value: matchCount,
            detail: "Values redacted in evidence",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {item.label}
            </dt>
            <dd className="mt-1 text-2xl font-black text-foreground">
              {item.value}
            </dd>
            <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
          </div>
        ))}
      </dl>
    </section>
  );
}

function FindingCard({ finding }) {
  return (
    <article className="tool-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <FileSearch className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {finding.category}
            </p>
            <h3 className="mt-1 font-bold text-foreground">{finding.title}</h3>
          </div>
        </div>
        <span
          className={`rounded-pill px-3 py-1 text-xs font-bold uppercase ${SEVERITY_STYLES[finding.severity]}`}
        >
          {finding.severity}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
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
                Redacted evidence · line {match.line}
              </p>
              <p className="mt-1 break-words text-sm leading-6 text-foreground">
                “{match.excerpt}”
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export default function MarketplaceScamChecker() {
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("seller");
  const [listingAmount, setListingAmount] = useState("");
  const [claimedPaymentAmount, setClaimedPaymentAmount] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const report = useMemo(
    () => (result ? buildSafeMarketplaceReport(result) : ""),
    [result],
  );

  const reviewMessage = (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    setResult(
      analyzeMarketplaceMessage(message, {
        role: role === "unknown" ? undefined : role,
        listingAmount,
        claimedPaymentAmount,
      }),
    );
    setCopied(false);
  };

  const loadExample = () => {
    setMessage(EXAMPLE_MESSAGE);
    setRole("seller");
    setListingAmount("12000");
    setClaimedPaymentAmount("18000");
    setResult(null);
    setCopied(false);
  };

  const clearAll = () => {
    setMessage("");
    setRole("seller");
    setListingAmount("");
    setClaimedPaymentAmount("");
    setResult(null);
    setCopied(false);
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
                <PackageSearch className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Marketplace message review
                </p>
                <h1 className="text-2xl font-black text-foreground sm:text-3xl">
                  Marketplace Scam Checker
                </h1>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
              Review buyer or seller messages for payment, shipping, account,
              code-sharing, remote-access, fee, and pressure signals.
            </p>
          </div>
          <div className="rounded-xl border border-success bg-success-soft p-4 text-sm lg:max-w-sm">
            <p className="flex items-center gap-2 font-bold text-success">
              <EyeOff className="h-5 w-5" aria-hidden="true" />
              No upload · No lookup
            </p>
            <p className="mt-1 text-foreground">Runs entirely in your browser</p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-9">
        <section className="tool-card p-5 sm:p-6 xl:col-span-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Review a marketplace message
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Remove personal details that are not needed for the review.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={loadExample}
              className="btn btn-outline h-10 shrink-0"
            >
              Example
            </button>
          </div>

          <form className="mt-5 space-y-5" onSubmit={reviewMessage}>
            <fieldset>
              <legend className="flex items-center gap-2 text-sm font-bold text-foreground">
                <UserRound className="h-4 w-4 text-primary" aria-hidden="true" />
                Your role
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {ROLES.map((option) => (
                  <label
                    key={option.id}
                    className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-bold transition focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background ${
                      role === option.id
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-background text-foreground hover:bg-surface-soft"
                    }`}
                  >
                    <input
                      type="radio"
                      name="marketplace-role"
                      value={option.id}
                      checked={role === option.id}
                      onChange={() => {
                        setRole(option.id);
                        setResult(null);
                      }}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block">
              <span className="text-sm font-bold text-foreground">
                Message text
              </span>
              <textarea
                value={message}
                onChange={(event) => {
                  setMessage(
                    event.target.value.slice(0, analyzerLimits.maxMessageLength),
                  );
                  setResult(null);
                }}
                rows={12}
                required
                placeholder="Paste the buyer or seller message here"
                className="mt-2 min-h-64 w-full resize-y rounded-lg border border-border bg-background p-4 text-sm leading-6 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <span className="mt-1 flex justify-end text-xs text-muted-foreground">
                {message.length.toLocaleString("en-US")} /{" "}
                {analyzerLimits.maxMessageLength.toLocaleString("en-US")}
              </span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <ShoppingBag className="h-4 w-4 text-primary" aria-hidden="true" />
                  Listing amount
                </span>
                <input
                  inputMode="decimal"
                  value={listingAmount}
                  onChange={(event) => {
                    setListingAmount(event.target.value);
                    setResult(null);
                  }}
                  placeholder="Optional"
                  className="input mt-2 h-10 w-full"
                />
              </label>
              <label>
                <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <WalletCards className="h-4 w-4 text-primary" aria-hidden="true" />
                  Claimed payment amount
                </span>
                <input
                  inputMode="decimal"
                  value={claimedPaymentAmount}
                  onChange={(event) => {
                    setClaimedPaymentAmount(event.target.value);
                    setResult(null);
                  }}
                  placeholder="Optional"
                  className="input mt-2 h-10 w-full"
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row">
              <button
                type="submit"
                disabled={!message.trim()}
                className="btn btn-primary h-11 flex-1 gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                Review message
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="btn btn-outline h-11 gap-2"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Clear
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-4 xl:col-span-4">
          <PrivacyNote />
          <section className="tool-card p-5">
            <h2 className="text-lg font-bold text-foreground">
              Independent checks
            </h2>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
              <li>Open the marketplace and payment account yourself.</li>
              <li>Confirm settled funds before shipping or refunding.</li>
              <li>Never share OTPs, PINs, passwords, or remote access.</li>
              <li>Keep messages and receipts inside the protected order.</li>
            </ul>
          </section>
        </aside>
      </div>

      {result ? (
        <section className="space-y-5">
          <AssessmentCard result={result} />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-foreground">
                Evidence and safer actions
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Matched excerpts are redacted before display.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyReport}
                className="btn btn-outline h-10 gap-2"
              >
                {copied ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Clipboard className="h-4 w-4" aria-hidden="true" />
                )}
                {copied ? "Copied" : "Copy report"}
              </button>
              <button
                type="button"
                onClick={() => downloadReport(report)}
                className="btn btn-outline h-10 gap-2"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download
              </button>
            </div>
          </div>

          {result.findings.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {result.findings.map((finding) => (
                <FindingCard key={finding.id} finding={finding} />
              ))}
            </div>
          ) : (
            <div className="tool-card flex items-start gap-3 p-5">
              <CheckCircle2
                className="mt-0.5 h-5 w-5 shrink-0 text-success"
                aria-hidden="true"
              />
              <p className="text-sm leading-6 text-muted-foreground">
                No configured warning pattern matched. Continue verifying the
                listing, participant, payment, and shipping details independently.
              </p>
            </div>
          )}

          <section className="tool-card p-5 sm:p-6">
            <h2 className="text-lg font-bold text-foreground">Safer next steps</h2>
            <ol className="mt-4 space-y-3">
              {result.nextSteps.map((step, index) => (
                <li
                  key={step}
                  className="flex items-start gap-3 text-sm leading-6 text-foreground"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-xs font-black text-primary">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
              {result.disclaimer}
            </p>
          </section>
        </section>
      ) : null}
    </main>
  );
}
