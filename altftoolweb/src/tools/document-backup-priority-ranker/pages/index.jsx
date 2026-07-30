"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListOrdered, Lock, RotateCcw, ShieldAlert } from "lucide-react";

import { DOCUMENTS, rankDocuments } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const ROW =
  "rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 transition focus-within:border-[var(--primary)] focus-within:ring-[3px] focus-within:ring-[var(--primary)]/25";
const CHECKBOX = "mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)] focus:outline-none";
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const TIER_TEXT = {
  danger: "text-[var(--danger)]",
  warning: "text-[var(--primary)]",
  muted: "text-[var(--muted-foreground)]",
};

/** A realistic starting household: identity and money papers held, nothing scanned yet. */
const DEFAULT_SELECTED = [
  "password-recovery",
  "aadhaar",
  "pan",
  "passport",
  "insurance",
  "bank-accounts",
  "medical-records",
  "property-deed",
  "degree",
  "birth-certificate",
  "vehicle",
  "itr",
  "photos",
];
const DEFAULT_BACKED_UP = ["aadhaar", "pan"];
const DEFAULT_MINUTES = "45";

const GROUPS = DOCUMENTS.reduce((groups, doc) => {
  const found = groups.find((entry) => entry.name === doc.group);
  if (found) found.items.push(doc);
  else groups.push({ name: doc.group, items: [doc] });
  return groups;
}, []);

function toggle(list, id) {
  return list.includes(id) ? list.filter((value) => value !== id) : [...list, id];
}

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [selectedIds, setSelectedIds] = useState(DEFAULT_SELECTED);
  const [backedUpIds, setBackedUpIds] = useState(DEFAULT_BACKED_UP);
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      rankDocuments({
        selectedIds,
        backedUpIds,
        minutesAvailable: toNumber(minutes),
      }),
    [selectedIds, backedUpIds, minutes],
  );
  const hasError = Boolean(result.error);

  const toggleHeld = (id) => {
    setSelectedIds((current) => toggle(current, id));
    setBackedUpIds((current) => current.filter((value) => value !== id));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Document backup priority",
      `Documents held: ${result.totalCount} · already backed up: ${result.doneCount} · outstanding: ${result.outstandingCount}`,
      `This session (${result.minutesAvailable} min): ${result.plan.length} document(s), ${result.minutesUsed} min used, ${result.coveragePercent}% of remaining priority covered`,
      "",
      "Do in this order:",
      ...result.outstanding
        .slice(0, 12)
        .map((entry) => `${entry.rank}. ${entry.label} — ${entry.tier.label} (${entry.minutes} min)`),
      "",
      `Encrypted storage required for ${result.encryptionCount} of the outstanding scans.`,
      `Next: ${result.verdict}`,
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
    setSelectedIds(DEFAULT_SELECTED);
    setBackedUpIds(DEFAULT_BACKED_UP);
    setMinutes(DEFAULT_MINUTES);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Documents you hold", DASH],
        ["Already backed up", DASH],
        ["Still outstanding", DASH],
        ["Tier 1 gaps", DASH],
        ["Fits in this session", DASH],
        ["Time to clear everything", DASH],
        ["Need encrypted storage", DASH],
      ]
    : [
        ["Documents you hold", NUM.format(result.totalCount)],
        ["Already backed up", NUM.format(result.doneCount)],
        ["Still outstanding", NUM.format(result.outstandingCount)],
        ["Tier 1 gaps", NUM.format(result.tier1Outstanding.length)],
        [
          "Fits in this session",
          `${NUM.format(result.plan.length)} document(s) in ${NUM.format(result.minutesUsed)} min`,
        ],
        ["Time to clear everything", `${NUM.format(result.outstandingMinutes)} min`],
        ["Need encrypted storage", NUM.format(result.encryptionCount)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ListOrdered className="h-4 w-4" aria-hidden="true" />
          Backup and recovery
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Document Backup Priority Ranker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick what your household actually holds. Each document is ranked by how hard it is to
          replace, how fast you would need it under pressure, and how much else it unlocks — then
          fitted into the time you have today, highest priority first.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold" htmlFor="minutes-available">
              Minutes you can spend today
            </label>
            <input
              id="minutes-available"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="5"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Includes finding the paper, scanning it and filing the copy — not just the scan.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            {[15, 30, 45, 90].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMinutes(String(value))}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {value} min
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What your household holds</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Tick the document, then tick &ldquo;backed up&rdquo; if a copy already sits somewhere
          other than the original.
        </p>
        {GROUPS.map((group) => (
          <fieldset key={group.name} className="mt-5">
            <legend className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {group.name}
            </legend>
            <div className="mt-2 grid gap-2">
              {group.items.map((doc) => {
                const held = selectedIds.includes(doc.id);
                return (
                  <div key={doc.id} className={ROW}>
                    <label className="flex cursor-pointer items-start gap-3 text-sm" htmlFor={`doc-${doc.id}`}>
                      <input
                        id={`doc-${doc.id}`}
                        type="checkbox"
                        className={CHECKBOX}
                        checked={held}
                        onChange={() => toggleHeld(doc.id)}
                      />
                      <span className="leading-6">
                        <span className="font-medium">{doc.label}</span>
                        <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                          {doc.note}
                        </span>
                      </span>
                    </label>
                    {held ? (
                      <label
                        className="mt-2 ml-8 flex min-h-11 cursor-pointer items-center gap-2 text-xs font-semibold text-[var(--muted-foreground)]"
                        htmlFor={`done-${doc.id}`}
                      >
                        <input
                          id={`done-${doc.id}`}
                          type="checkbox"
                          className="h-4 w-4 accent-[var(--primary)]"
                          checked={backedUpIds.includes(doc.id)}
                          onChange={() => setBackedUpIds((current) => toggle(current, doc.id))}
                        />
                        Already backed up
                      </label>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </fieldset>
        ))}
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
              Priority covered in this session
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${hasError ? "text-[var(--muted-foreground)]" : "text-[var(--primary)]"}`}
            >
              {hasError ? DASH : `${NUM.format(result.coveragePercent)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${NUM.format(result.plan.length)} of ${NUM.format(result.outstandingCount)} outstanding document(s), in priority order`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the ranked backup plan"
              className={`${GHOST_BTN} disabled:opacity-50`}
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
              aria-label="Reset the ranker to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.tier1Outstanding.length > 0 ? (
          <p className="mt-4 flex items-start gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {NUM.format(result.tier1Outstanding.length)} Tier 1 document(s) have no backup:{" "}
              {result.tier1Outstanding.map((entry) => entry.label).join("; ")}.
            </span>
          </p>
        ) : null}

        <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
          {hasError ? "Fix the input above to see a plan." : result.verdict}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.plan.length ? (
          <div className="mt-5">
            <h3 className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Do these now, in this order
            </h3>
            <ol className="mt-2 grid gap-1.5 text-sm leading-6">
              {result.plan.map((entry, index) => (
                <li key={entry.id} className="flex gap-2">
                  <span className="font-semibold text-[var(--primary)]">{index + 1}.</span>
                  <span>
                    {entry.label}{" "}
                    <span className="text-[var(--muted-foreground)]">({entry.minutes} min)</span>
                    {entry.needsEncryption ? (
                      <Lock
                        className="ml-1 inline h-3.5 w-3.5 text-[var(--danger)]"
                        aria-label="store encrypted"
                      />
                    ) : null}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {!hasError ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <caption className="sr-only">Full priority ranking</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    #
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Document
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Score
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Tier
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.ranked.map((entry) => (
                  <tr key={entry.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{entry.rank}</td>
                    <td className="py-2.5 pr-3">{entry.label}</td>
                    <td className="py-2.5 pr-3 font-semibold">{NUM.format(entry.score)}</td>
                    <td className={`py-2.5 pr-3 ${TIER_TEXT[entry.tier.tone]}`}>
                      {entry.tier.window}
                    </td>
                    <td className="py-2.5">
                      {entry.done ? (
                        <span className="text-[var(--success)]">Backed up</span>
                      ) : (
                        <span className="text-[var(--muted-foreground)]">Outstanding</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {!hasError && result.originalsToSecure.length ? (
          <div className="mt-5">
            <h3 className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              A scan is not enough for these — keep the original safe too
            </h3>
            <ul className="mt-2 grid gap-1.5 text-sm leading-6">
              {result.originalsToSecure.map((entry) => (
                <li key={entry.id} className="flex gap-2">
                  <span aria-hidden="true" className="text-[var(--primary)]">
                    &bull;
                  </span>
                  <span>{entry.label}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Planning aid only, not legal advice. Replacement processes and timelines vary by state,
        issuing authority and institution — check with the issuer before relying on a scan in place
        of an original. Nothing you tick here leaves your browser.
      </p>
    </main>
  );
}
