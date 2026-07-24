"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Equal,
  Info,
  RotateCcw,
  SearchCheck,
  ShieldAlert,
  XCircle,
} from "lucide-react";

import {
  buildContactReport,
  compareContact,
} from "../lib/compareContact.mjs";

const TYPE_OPTIONS = [
  ["domain", "Website hostname"],
  ["url", "Complete web address"],
  ["email", "Email address"],
  ["phone", "Phone number"],
  ["handle", "Account handle"],
];

const STATUS_META = {
  "exact-match": {
    label: "Entered values match",
    icon: CheckCircle2,
    className: "border-[var(--success)] bg-[var(--success-soft)]",
  },
  "case-only-difference": {
    label: "Letter-case difference",
    icon: AlertTriangle,
    className: "border-[var(--warning)] bg-[var(--warning-soft)]",
  },
  "same-domain-family": {
    label: "Related hostname, not exact",
    icon: AlertTriangle,
    className: "border-[var(--warning)] bg-[var(--warning-soft)]",
  },
  "same-origin-different-url": {
    label: "Same origin, different address",
    icon: AlertTriangle,
    className: "border-[var(--warning)] bg-[var(--warning-soft)]",
  },
  different: {
    label: "Entered values differ",
    icon: XCircle,
    className: "border-[var(--danger)] bg-[var(--danger-soft)]",
  },
};

function downloadReport(report) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "official-contact-comparison.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function OfficialContactVerifier() {
  const [type, setType] = useState("domain");
  const [officialValue, setOfficialValue] = useState("");
  const [claimedValue, setClaimedValue] = useState("");
  const [trustedReferenceConfirmed, setTrustedReferenceConfirmed] =
    useState(false);
  const [result, setResult] = useState(null);
  const report = useMemo(
    () => (result?.ok ? buildContactReport(result) : null),
    [result],
  );

  const invalidate = () => setResult(null);
  const reset = () => {
    setType("domain");
    setOfficialValue("");
    setClaimedValue("");
    setTrustedReferenceConfirmed(false);
    setResult(null);
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
      <header className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
              <SearchCheck className="h-4 w-4" aria-hidden="true" />
              User-controlled reference comparison
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
              Official Contact Verifier
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
              Compare contact details from a message with a reference you independently obtained
              from an official source. The values stay in this tab.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4 lg:max-w-sm">
            <p className="font-bold text-[var(--foreground)]">No live directory lookup</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              A string match does not prove ownership, message authenticity, account safety, or
              who is currently controlling the contact.
            </p>
          </div>
        </div>
      </header>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="grid gap-5 lg:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
              Contact type
            </span>
            <select
              className="input-field min-h-11 w-full"
              value={type}
              onChange={(event) => {
                setType(event.target.value);
                setTrustedReferenceConfirmed(false);
                invalidate();
              }}
            >
              {TYPE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
              Independently obtained official reference
            </span>
            <input
              className="input-field min-h-11 w-full font-mono text-sm"
              value={officialValue}
              onChange={(event) => {
                setOfficialValue(event.target.value);
                setTrustedReferenceConfirmed(false);
                invalidate();
              }}
              placeholder="Type or paste your trusted reference"
              spellCheck="false"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
              Contact from the message
            </span>
            <input
              className="input-field min-h-11 w-full font-mono text-sm"
              value={claimedValue}
              onChange={(event) => {
                setClaimedValue(event.target.value);
                invalidate();
              }}
              placeholder="Type or paste the value to compare"
              spellCheck="false"
            />
          </label>
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-[var(--primary)]"
            checked={trustedReferenceConfirmed}
            onChange={(event) => {
              setTrustedReferenceConfirmed(event.target.checked);
              invalidate();
            }}
          />
          <span>
            <span className="block text-sm font-bold text-[var(--foreground)]">
              I obtained the reference independently
            </span>
            <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
              I did not copy it from the message, caller, QR code, popup, or link that I am checking.
            </span>
          </span>
        </label>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-primary min-h-11 px-5"
            onClick={() =>
              setResult(
                compareContact({
                  type,
                  officialValue,
                  claimedValue,
                  trustedReferenceConfirmed,
                }),
              )
            }
          >
            <SearchCheck className="h-4 w-4" aria-hidden="true" />
            Compare locally
          </button>
          <button type="button" className="btn-secondary min-h-11 px-5" onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
          {report ? (
            <button
              type="button"
              className="btn-secondary min-h-11 px-5"
              onClick={() => downloadReport(report)}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download value-free report
            </button>
          ) : null}
        </div>
      </section>

      {result && !result.ok ? (
        <section
          className="rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-5"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <h2 className="font-bold text-[var(--foreground)]">Comparison not ready</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
                {result.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {result?.ok ? (() => {
        const meta = STATUS_META[result.status];
        const StatusIcon = meta.icon;
        return (
          <section
            className={`rounded-lg border p-5 sm:p-6 ${meta.className}`}
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <StatusIcon className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Local comparison result
                </p>
                <h2 className="mt-1 text-xl font-bold text-[var(--foreground)]">
                  {meta.label}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  {result.reason}
                </p>
              </div>
            </div>

            {result.cues.length ? (
              <div className="mt-5 space-y-2">
                {result.cues.map((cue) => (
                  <div
                    key={cue.id}
                    className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" aria-hidden="true" />
                    <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                      {cue.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
                <p className="text-sm font-bold text-[var(--foreground)]">
                  What this result cannot establish
                </p>
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
                {result.limitations.map((limit) => (
                  <li key={limit}>{limit}</li>
                ))}
              </ul>
            </div>
          </section>
        );
      })() : null}

      <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <Equal className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
          <div>
            <h2 className="font-bold text-[var(--foreground)]">
              Safe independent verification
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              Find the organization using a source you already trust, then start a new call,
              message, or browser session yourself. Do not continue through the original message
              simply because its displayed contact matches.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
