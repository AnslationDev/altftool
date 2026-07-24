"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Clipboard,
  EyeOff,
  FileSearch,
  Info,
  KeyRound,
  Languages,
  Link2,
  LockKeyhole,
  MessageSquareText,
  RotateCcw,
  SearchCheck,
  ShieldAlert,
  TimerReset,
  UserRoundCheck,
  WalletCards,
} from "lucide-react";

import { safeCopyText } from "@/shared/utils/clipboard";
import {
  analyzeMessage,
  analyzerLimits,
  buildTriageReport,
} from "../lib/analyzeMessage.mjs";

const EXAMPLE_MESSAGE =
  "URGENT: This is your bank support team. Your account will be blocked today. Verify your KYC at http://198.51.100.5/secure and share your OTP.";

const CHANNELS = [
  { id: "sms", label: "SMS" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "email", label: "Email" },
];

const CATEGORY_ICONS = {
  urgency: TimerReset,
  payment: WalletCards,
  credentials: KeyRound,
  impersonation: UserRoundCheck,
  links: Link2,
  unicode: Languages,
};

const LEVEL_STYLES = {
  none: {
    icon: SearchCheck,
    box: "border-[var(--border)] bg-[var(--section-highlight)]",
    iconBox: "bg-[var(--success-soft)] text-[var(--success)]",
  },
  notice: {
    icon: Info,
    box: "border-[var(--info)] bg-[var(--info-soft)]",
    iconBox: "bg-[var(--info-soft)] text-[var(--info)]",
  },
  caution: {
    icon: AlertTriangle,
    box: "border-[var(--warning)] bg-[var(--warning-soft)]",
    iconBox: "bg-[var(--warning-soft)] text-[var(--warning)]",
  },
  strong: {
    icon: ShieldAlert,
    box: "border-[var(--danger)] bg-[var(--danger-soft)]",
    iconBox: "bg-[var(--danger-soft)] text-[var(--danger)]",
  },
};

function PrivacyNote() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--section-highlight)] p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--card)] text-[var(--primary)]">
        <LockKeyhole className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="font-bold text-[var(--foreground)]">Local analysis only</p>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          Your text stays in this browser tab. This tool does not send, store, track, or share the
          message and does not contact any link or sender.
        </p>
      </div>
    </div>
  );
}

function AssessmentCard({ result }) {
  const style = LEVEL_STYLES[result.assessment.level];
  const Icon = style.icon;

  return (
    <section
      className={`rounded-xl border p-5 shadow-sm sm:p-6 ${style.box}`}
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${style.iconBox}`}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
            Pattern-based assessment
          </p>
          <h2 className="mt-1 text-xl font-black text-[var(--foreground)]">
            {result.assessment.label}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
            {result.assessment.summary}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
            Signal score
          </p>
          <p className="mt-1 text-2xl font-black text-[var(--foreground)]">
            {result.score}
            <span className="text-sm font-semibold text-[var(--muted-foreground)]"> / 100</span>
          </p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">Not a probability</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
            Evidence groups
          </p>
          <p className="mt-1 text-2xl font-black text-[var(--foreground)]">
            {result.findings.length}
          </p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Observable pattern matches
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
            Links found
          </p>
          <p className="mt-1 text-2xl font-black text-[var(--foreground)]">
            {result.linkCount}
          </p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">Never opened by this tool</p>
        </div>
      </div>
    </section>
  );
}

function FindingCard({ finding }) {
  const Icon = CATEGORY_ICONS[finding.category] || FileSearch;

  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-[var(--primary)]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
            {finding.category}
          </p>
          <h3 className="mt-1 font-bold text-[var(--foreground)]">{finding.title}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {finding.explanation}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {finding.matches.map((match) => (
          <div
            key={`${match.index}-${match.text}`}
            className="rounded-lg border border-[var(--border)] bg-[var(--section-highlight)] px-3 py-2"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
              Matched evidence
            </p>
            <p className="mt-1 break-words text-sm text-[var(--foreground)]">
              “{match.excerpt}”
            </p>
          </div>
        ))}
        {finding.details.map((detail) => (
          <p key={detail} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
            <span>{detail}</span>
          </p>
        ))}
      </div>
    </article>
  );
}

export default function ScamMessageTriage() {
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState("sms");
  const [reviewed, setReviewed] = useState(null);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => (reviewed ? analyzeMessage(reviewed.message, { channel: reviewed.channel }) : null),
    [reviewed],
  );

  const reviewMessage = (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    setReviewed({ message, channel });
  };

  const clearAll = () => {
    setMessage("");
    setReviewed(null);
    setCopied(false);
  };

  const loadExample = () => {
    setMessage(EXAMPLE_MESSAGE);
    setReviewed(null);
  };

  const copyChecklist = async () => {
    if (!result) return;
    const didCopy = await safeCopyText(buildTriageReport(result));
    setCopied(didCopy);
    if (didCopy) window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 text-[var(--foreground)] sm:px-6 sm:pt-10 lg:px-8">
      <header className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--section-highlight)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              Evidence-led safety check
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
              Scam Message Triage
            </h1>
            <p className="mt-3 text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
              Review message text for common pressure, payment, credential, impersonation, link,
              and Unicode warning patterns. Results are cautious clues, not a definitive verdict.
            </p>
          </div>
          <div className="shrink-0 rounded-lg border border-[var(--border)] bg-[var(--section-highlight)] px-4 py-3 text-sm">
            <p className="flex items-center gap-2 font-bold text-[var(--foreground)]">
              <EyeOff className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
              No upload · No lookup
            </p>
            <p className="mt-1 text-[var(--muted-foreground)]">Runs entirely in your browser</p>
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-[var(--primary)]">
              <MessageSquareText className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">Paste the message</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                Remove personal details first if you do not need them for the review.
              </p>
            </div>
          </div>

          <form className="mt-5" onSubmit={reviewMessage}>
            <fieldset>
              <legend className="text-sm font-bold text-[var(--foreground)]">Message source</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {CHANNELS.map((option) => (
                  <label
                    key={option.id}
                    className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-bold transition focus-within:ring-2 focus-within:ring-[var(--primary)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--background)] ${
                      channel === option.id
                        ? "border-[var(--primary)] bg-[var(--section-highlight)] text-[var(--primary)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="message-channel"
                      value={option.id}
                      checked={channel === option.id}
                      onChange={() => setChannel(option.id)}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <label
              htmlFor="message-to-review"
              className="mt-5 block text-sm font-bold text-[var(--foreground)]"
            >
              Message text
            </label>
            <textarea
              id="message-to-review"
              value={message}
              onChange={(event) => {
                setMessage(event.target.value.slice(0, analyzerLimits.maxMessageLength));
                setReviewed(null);
              }}
              rows={13}
              maxLength={analyzerLimits.maxMessageLength}
              placeholder="Paste the SMS, WhatsApp message, or email body here…"
              className="mt-2 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-6 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--muted-foreground)]">
              <span>Analysis is deterministic and offline.</span>
              <span>
                {message.length.toLocaleString()} / {analyzerLimits.maxMessageLength.toLocaleString()}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={!message.trim()}
                className="btn-primary inline-flex min-h-11 items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <SearchCheck className="h-4 w-4" aria-hidden="true" />
                Review message
              </button>
              <button
                type="button"
                onClick={loadExample}
                className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2"
              >
                <FileSearch className="h-4 w-4" aria-hidden="true" />
                Load example
              </button>
              <button
                type="button"
                onClick={clearAll}
                disabled={!message && !result}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-transparent px-4 text-sm font-bold text-[var(--foreground)] transition hover:bg-[var(--section-highlight)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Clear
              </button>
            </div>
          </form>

          <div className="mt-6">
            <PrivacyNote />
          </div>
        </section>

        <div className="min-w-0">
          {result ? (
            <div className="space-y-6">
              <AssessmentCard result={result} />

              <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--foreground)]">Safer next steps</h2>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      Use a separate, trusted route to verify the claim.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copyChecklist}
                    className="btn-secondary inline-flex min-h-11 items-center justify-center gap-2"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Clipboard className="h-4 w-4" aria-hidden="true" />
                    )}
                    {copied ? "Copied" : "Copy checklist"}
                  </button>
                </div>
                <ol className="mt-5 space-y-3">
                  {result.nextSteps.map((step, index) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--section-highlight)] text-xs font-black text-[var(--primary)]">
                        {index + 1}
                      </span>
                      <span className="pt-0.5 text-sm leading-6 text-[var(--foreground)]">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          ) : (
            <section className="flex min-h-full flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-sm">
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--section-highlight)] text-[var(--primary)]">
                <SearchCheck className="h-7 w-7" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-xl font-bold text-[var(--foreground)]">
                Your review will appear here
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
                Paste a message and choose “Review message.” The tool only reports text patterns it
                can point to, and it never labels a sender with certainty.
              </p>
            </section>
          )}
        </div>
      </div>

      {result ? (
        <section className="mt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-[var(--foreground)]">Observed evidence</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                Each item is tied to wording or characters found in the pasted text.
              </p>
            </div>
            <p className="text-sm font-semibold text-[var(--muted-foreground)]">
              {result.findings.length} evidence {result.findings.length === 1 ? "group" : "groups"}
            </p>
          </div>

          {result.findings.length ? (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {result.findings.map((finding) => (
                <FindingCard key={finding.id} finding={finding} />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
              <p className="font-bold text-[var(--foreground)]">No listed patterns matched</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                Treat this as “no match,” not “safe.” Verify unexpected requests independently,
                especially when money, account access, or personal data is involved.
              </p>
            </div>
          )}

          <div className="mt-5 flex items-start gap-3 rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" aria-hidden="true" />
            <p className="text-sm leading-6 text-[var(--foreground)]">{result.disclaimer}</p>
          </div>
        </section>
      ) : null}
    </main>
  );
}
