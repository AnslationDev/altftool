"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Linkedin, RotateCcw } from "lucide-react";
import {
  EXPORT_FILES,
  FAST_PATH_MINUTES,
  REQUEST_STEPS,
  TIER_FULL,
  estimateExport,
  formatSize,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_SELECTED = ["connections", "ad-targeting", "search", "jobs", "logins"];
const DEFAULT_YEARS = "9";
const DEFAULT_CONNECTIONS = "1200";
const DEFAULT_MESSAGES = "3000";

const DASH = "—";

export default function ToolHome() {
  const [selected, setSelected] = useState(DEFAULT_SELECTED);
  const [years, setYears] = useState(DEFAULT_YEARS);
  const [connections, setConnections] = useState(DEFAULT_CONNECTIONS);
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState([]);

  const result = useMemo(
    () =>
      estimateExport({
        selectedIds: selected,
        yearsOnLinkedIn: years.trim() === "" ? Number.NaN : Number(years),
        connections: connections.trim() === "" ? Number.NaN : Number(connections),
        messages: messages.trim() === "" ? Number.NaN : Number(messages),
      }),
    [selected, years, connections, messages],
  );

  const hasError = Boolean(result.error);

  const toggle = (id) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );

  const toggleStep = (index) =>
    setDone((current) =>
      current.includes(index) ? current.filter((value) => value !== index) : [...current, index],
    );

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "LinkedIn data export plan",
      `Files selected: ${result.count}`,
      `Estimated archive: ${result.totalLabel}`,
      `Path: ${result.needsFullArchive ? "larger archive" : "pick specific files"}`,
      `Expected wait: about ${result.waitLabel}`,
      `Largest file: ${result.largestLabel}`,
      `Rows about other people: ${result.thirdPartyRows}`,
      `Sensitivity: ${result.sensitivityScore}/100 (${result.band})`,
    ].join("\n");
  }, [hasError, result]);

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
    setSelected(DEFAULT_SELECTED);
    setYears(DEFAULT_YEARS);
    setConnections(DEFAULT_CONNECTIONS);
    setMessages(DEFAULT_MESSAGES);
    setDone([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Linkedin className="h-4 w-4" aria-hidden="true" />
          Data access
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">LinkedIn Data Export Guide</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out which LinkedIn files you actually need, whether the request lands in about{" "}
          {FAST_PATH_MINUTES} minutes or takes the full 24-hour archive, how big the zip will be, and
          what each CSV gives away about you and your contacts.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">1. Choose the files</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {EXPORT_FILES.map((file) => {
            const checked = selected.includes(file.id);
            return (
              <label
                key={file.id}
                htmlFor={`li-${file.id}`}
                className={`flex min-h-11 cursor-pointer gap-3 rounded-md border p-3 transition ${
                  checked
                    ? "border-[var(--primary)] bg-[var(--muted)]"
                    : "border-[var(--border)] bg-[var(--background)]"
                }`}
              >
                <input
                  id={`li-${file.id}`}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(file.id)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">
                    {file.label}
                    {file.tier === TIER_FULL ? (
                      <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                        full archive
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                    {file.what}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelected(EXPORT_FILES.map((file) => file.id))}
            className={GHOST_BTN}
          >
            Select all
          </button>
          <button
            type="button"
            onClick={() =>
              setSelected(EXPORT_FILES.filter((file) => file.tier !== TIER_FULL).map((file) => file.id))
            }
            className={GHOST_BTN}
          >
            Fast files only
          </button>
          <button type="button" onClick={() => setSelected([])} className={GHOST_BTN}>
            Deselect all
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">2. Describe the account</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="li-years">
              Years on LinkedIn
            </label>
            <input
              id="li-years"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="23"
              step="1"
              value={years}
              onChange={(event) => setYears(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="li-connections">
              First-degree connections
            </label>
            <input
              id="li-connections"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="30000"
              step="50"
              value={connections}
              onChange={(event) => setConnections(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="li-messages">
              Rough lifetime message count
            </label>
            <input
              id="li-messages"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={messages}
              onChange={(event) => setMessages(event.target.value)}
            />
          </div>
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

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        role="status"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Expected wait
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.waitLabel}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see an estimate."
                : result.needsFullArchive
                  ? "This selection needs the larger archive"
                  : "This selection uses the pick-specific-files path"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the LinkedIn export plan"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the LinkedIn export planner"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Estimated archive size", hasError ? DASH : result.totalLabel],
            ["Files selected", hasError ? DASH : NUM.format(result.count)],
            ["Largest file", hasError ? DASH : result.largestLabel],
            [
              "Rows describing other people",
              hasError ? DASH : NUM.format(result.thirdPartyRows),
            ],
            [
              "Sensitivity of this selection",
              hasError ? DASH : `${result.sensitivityScore}/100 — ${result.band}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.needsFullArchive ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.fullTierLabels.join(", ")} only ship with the larger archive. Deselect them to
            get everything else in about {FAST_PATH_MINUTES} minutes instead.
          </p>
        ) : null}

        {!hasError && result.criticalFiles.length > 0 ? (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            Highest-risk files here: {result.criticalFiles.join(", ")}. Keep the zip encrypted and
            never paste these CSVs into an online converter.
          </p>
        ) : null}
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Size, path and risk by file</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    File
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Path
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Estimated size
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Sensitivity
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{row.label}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                        {row.note}
                      </span>
                    </td>
                    <td className="py-2 pr-3 align-top text-xs text-[var(--muted-foreground)]">
                      {row.tier === TIER_FULL ? "Full archive" : "Fast"}
                    </td>
                    <td className="py-2 pr-3 text-right align-top">{formatSize(row.sizeMb)}</td>
                    <td className="py-2 text-right align-top">{row.sensitivity}/5</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">How to make the request</h2>
          <span className="text-xs font-semibold text-[var(--muted-foreground)]">
            {done.length}/{REQUEST_STEPS.length} done
          </span>
        </div>
        <ol className="mt-4 space-y-3">
          {REQUEST_STEPS.map(([title, detail], index) => {
            const checked = done.includes(index);
            return (
              <li key={title}>
                <label
                  htmlFor={`li-step-${index}`}
                  className="flex min-h-11 cursor-pointer gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <input
                    id={`li-step-${index}`}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleStep(index)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
                  />
                  <span className="min-w-0">
                    <span
                      className={`block text-sm font-semibold ${checked ? "text-[var(--success)]" : ""}`}
                    >
                      {index + 1}. {title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                      {detail}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ol>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Sizes are planning estimates from typical CSV row widths, not a measurement of your account.
        This page is informational and is not legal advice; consult a qualified professional about
        your data-protection rights.
      </p>
    </main>
  );
}
