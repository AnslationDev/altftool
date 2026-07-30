"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, RotateCcw, Search, Youtube } from "lucide-react";

import {
  GOOGLE_MAX_QUERY_WORDS,
  IDENTIFIER_LABELS,
  buildYoutubeAuditQueries,
  formatQueryPlan,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const DEFAULTS = {
  fullName: "Priya Sharma",
  handle: "@priyacodes",
  channelId: "",
  email: "priya.sharma@example.com",
  phone: "",
  city: "Pune",
  employer: "",
  school: "",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const FIELDS = [
  { key: "fullName", label: "Real name", placeholder: "Priya Sharma", type: "text" },
  { key: "handle", label: "YouTube handle", placeholder: "@priyacodes", type: "text" },
  { key: "channelId", label: "Channel ID (optional)", placeholder: "UC…", type: "text" },
  { key: "email", label: "Email you have used publicly", placeholder: "you@example.com", type: "email" },
  { key: "phone", label: "Phone number (optional)", placeholder: "+91 98765 43210", type: "tel" },
  { key: "city", label: "City or area", placeholder: "Pune", type: "text" },
  { key: "employer", label: "Employer", placeholder: "Infosys", type: "text" },
  { key: "school", label: "School or college", placeholder: "Fergusson College", type: "text" },
];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copiedId, setCopiedId] = useState("");

  const result = useMemo(() => buildYoutubeAuditQueries(form), [form]);
  const plan = useMemo(() => formatQueryPlan(result), [result]);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const reset = () => {
    setForm(DEFAULTS);
    setCopiedId("");
  };

  const clearAll = () => {
    setForm({
      fullName: "",
      handle: "",
      channelId: "",
      email: "",
      phone: "",
      city: "",
      employer: "",
      school: "",
    });
    setCopiedId("");
  };

  const copy = async (id, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 1500);
    } catch {
      setCopiedId("");
    }
  };

  const hasError = Boolean(result.error);
  const queryCount = hasError ? null : result.queries.length;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Youtube className="h-4 w-4" aria-hidden="true" />
          Self OSINT audit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          YouTube Self Exposure Query Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn what you already know about yourself into the exact search-operator queries a
          stranger would run. Everything happens in your browser — nothing you type is sent
          anywhere.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Your identifiers</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Fill in only what is already public. Leave a field blank to skip that query group.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.key}>
              <label className={LABEL_CLASS} htmlFor={`yt-${field.key}`}>
                {field.label}
              </label>
              <input
                id={`yt-${field.key}`}
                className={`mt-2 ${INPUT_CLASS}`}
                type={field.type}
                autoComplete="off"
                placeholder={field.placeholder}
                value={form[field.key]}
                onChange={(event) => setField(field.key, event.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={clearAll} className={GHOST_BTN}>
            Clear every field
          </button>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Queries to run
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : NUM.format(queryCount)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Add an identifier above to build your audit plan."
                : `Across ${result.groups.length} exposure areas`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("plan", plan)}
              aria-label="Copy the whole search plan"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copiedId === "plan" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedId === "plan" ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset to the example inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Search surface (0-100)", hasError ? "—" : `${result.surfaceScore}/100`],
            [
              "Identifiers audited",
              hasError ? "—" : result.provided.map((key) => IDENTIFIER_LABELS[key]).join(", "),
            ],
            ["Exposure areas covered", hasError ? "—" : NUM.format(result.groups.length)],
            [
              "Queries over Google's word limit",
              hasError ? "—" : NUM.format(result.queries.filter((item) => item.tooLong).length),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Search surface ${result.surfaceScore} out of 100`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${result.surfaceScore}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              The more of these identifiers are public, the fewer searches a stranger needs to
              pivot from your channel to your front door.
            </p>
          </div>
        )}
      </section>

      {!hasError && (result.handleWarning || result.channelWarning || result.warnings.length > 0) && (
        <ul className="mt-4 space-y-2">
          {[result.handleWarning, result.channelWarning, ...result.warnings]
            .filter(Boolean)
            .map((message) => (
              <li
                key={message}
                className="rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
              >
                {message}
              </li>
            ))}
        </ul>
      )}

      {!hasError &&
        result.groups.map((group) => (
          <section
            key={group.group}
            className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          >
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Search className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
              {group.label}
            </h2>
            <ul className="mt-4 space-y-4">
              {group.items.map((item) => (
                <li key={item.id} className="rounded-lg border border-[var(--border)] p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]">
                      {item.engineLabel}
                    </span>
                    {item.tooLong && (
                      <span className="rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--danger)]">
                        Over {GOOGLE_MAX_QUERY_WORDS} words
                      </span>
                    )}
                  </div>
                  <div className="mt-2 overflow-x-auto">
                    <code className="block whitespace-pre text-sm text-[var(--foreground)]">
                      {item.query}
                    </code>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{item.why}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copy(item.id, item.query)}
                      aria-label={`Copy the ${item.engineLabel} query for ${group.label}`}
                      className={GHOST_BTN}
                    >
                      {copiedId === item.id ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      )}
                      {copiedId === item.id ? "Copied!" : "Copy"}
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={GHOST_BTN}
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      Open in {item.engineLabel}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Run these against your own identity only. Searching for information about other people
        without their consent may breach platform terms and local privacy law. Results reflect what
        each engine has indexed today, so repeat the audit periodically.
      </p>
    </main>
  );
}
