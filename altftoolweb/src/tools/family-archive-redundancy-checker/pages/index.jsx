"use client";

import { useMemo, useState } from "react";
import { Archive, Check, Copy, RotateCcw, ShieldAlert } from "lucide-react";

import {
  PRACTICES,
  REQUIRED_INDEPENDENT_DOMAINS,
  STORAGE_LOCATIONS,
  assessArchiveRedundancy,
} from "../lib";

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

const TONE_TEXT = {
  success: "text-[var(--success)]",
  warning: "text-[var(--primary)]",
  danger: "text-[var(--danger)]",
};

/** First paint shows the most common real situation: a phone and its own cloud sync. */
const DEFAULT_LOCATIONS = ["phone", "phone-cloud-sync", "laptop"];
const DEFAULT_VERIFIED = [];
const DEFAULT_PRACTICES = ["recovery-contact"];
const DEFAULT_NAME = "Family photos 2010–today";

const LOCATION_GROUPS = STORAGE_LOCATIONS.reduce((groups, item) => {
  const found = groups.find((entry) => entry.name === item.group);
  if (found) found.items.push(item);
  else groups.push({ name: item.group, items: [item] });
  return groups;
}, []);

function toggle(list, id) {
  return list.includes(id) ? list.filter((value) => value !== id) : [...list, id];
}

export default function ToolHome() {
  const [archiveName, setArchiveName] = useState(DEFAULT_NAME);
  const [locationIds, setLocationIds] = useState(DEFAULT_LOCATIONS);
  const [verifiedIds, setVerifiedIds] = useState(DEFAULT_VERIFIED);
  const [practiceIds, setPracticeIds] = useState(DEFAULT_PRACTICES);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => assessArchiveRedundancy({ locationIds, verifiedIds, practiceIds }),
    [locationIds, verifiedIds, practiceIds],
  );
  const hasError = Boolean(result.error);

  const toggleLocation = (id) => {
    setLocationIds((current) => toggle(current, id));
    setVerifiedIds((current) => current.filter((value) => value !== id));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Archive redundancy check — ${archiveName.trim() || "Untitled archive"}`,
      `Verdict: ${result.band.label} (${result.readinessPercent}% ready)`,
      `Copies: ${result.copies} across ${result.independentDomains} independent failure domain(s)`,
      `Media types: ${result.mediaTypes} · Off-site: ${result.offsiteCopies} · Offline/write-once: ${result.offlineCopies}`,
      `Delete-proof copies: ${result.deleteProofCopies} · Checked recently: ${result.verifiedCopies}`,
      `Practices in place: ${result.practicesDone} of ${result.practicesTotal}`,
      `Next: ${result.verdict}`,
      result.gaps.length ? `Gaps: ${result.gaps.map((gap) => gap.label).join("; ")}` : "No structural gaps.",
    ].join("\n");
  }, [archiveName, hasError, result]);

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
    setArchiveName(DEFAULT_NAME);
    setLocationIds(DEFAULT_LOCATIONS);
    setVerifiedIds(DEFAULT_VERIFIED);
    setPracticeIds(DEFAULT_PRACTICES);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Independent failure domains", DASH],
        ["Total copies", DASH],
        ["Different storage media", DASH],
        ["Copies away from the house", DASH],
        ["Copies a delete cannot reach", DASH],
        ["Offline or write-once copies", DASH],
        ["Copies checked recently", DASH],
        ["Practices in place", DASH],
      ]
    : [
        [
          "Independent failure domains",
          `${NUM.format(result.independentDomains)} (need ${REQUIRED_INDEPENDENT_DOMAINS})`,
        ],
        ["Total copies", `${NUM.format(result.copies)} (rule asks for 3)`],
        ["Different storage media", `${NUM.format(result.mediaTypes)} (rule asks for 2)`],
        ["Copies away from the house", `${NUM.format(result.offsiteCopies)} (rule asks for 1)`],
        ["Copies a delete cannot reach", NUM.format(result.deleteProofCopies)],
        ["Offline or write-once copies", NUM.format(result.offlineCopies)],
        ["Copies checked recently", NUM.format(result.verifiedCopies)],
        ["Practices in place", `${NUM.format(result.practicesDone)} of ${NUM.format(result.practicesTotal)}`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Archive className="h-4 w-4" aria-hidden="true" />
          Backup and recovery
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Family Photo Archive Redundancy Checker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick every place this archive actually lives. Copies that share a house, a provider or a
          sign-in account are counted once, because they fail together — so the score reflects real
          redundancy rather than the number of folders you own.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className="block text-sm font-semibold" htmlFor="archive-name">
          Which archive are you checking?
        </label>
        <input
          id="archive-name"
          className={`mt-2 ${INPUT_CLASS}`}
          type="text"
          value={archiveName}
          onChange={(event) => setArchiveName(event.target.value)}
          placeholder="Family photos 2010–today"
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Check one collection at a time — wedding video, scanned negatives and the phone camera
          roll usually have very different protection.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">1. Where this archive is stored</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Tick a place only if the full archive is there right now. Then tick &ldquo;checked&rdquo;
          if you have opened files from it in the last year and they still displayed.
        </p>
        {LOCATION_GROUPS.map((group) => (
          <fieldset key={group.name} className="mt-5">
            <legend className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {group.name}
            </legend>
            <div className="mt-2 grid gap-2">
              {group.items.map((item) => {
                const held = locationIds.includes(item.id);
                return (
                  <div key={item.id} className={ROW}>
                    <label className="flex cursor-pointer items-start gap-3 text-sm" htmlFor={`loc-${item.id}`}>
                      <input
                        id={`loc-${item.id}`}
                        type="checkbox"
                        className={CHECKBOX}
                        checked={held}
                        onChange={() => toggleLocation(item.id)}
                      />
                      <span className="leading-6">
                        <span className="font-medium">{item.label}</span>
                        <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                          {item.note}
                        </span>
                      </span>
                    </label>
                    {held ? (
                      <label
                        className="mt-2 ml-8 flex min-h-11 cursor-pointer items-center gap-2 text-xs font-semibold text-[var(--muted-foreground)]"
                        htmlFor={`ver-${item.id}`}
                      >
                        <input
                          id={`ver-${item.id}`}
                          type="checkbox"
                          className="h-4 w-4 accent-[var(--primary)]"
                          checked={verifiedIds.includes(item.id)}
                          onChange={() => setVerifiedIds((current) => toggle(current, item.id))}
                        />
                        Checked in the last 12 months
                      </label>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </fieldset>
        ))}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">2. Habits already in place</h2>
        <div className="mt-3 grid gap-2">
          {PRACTICES.map((item) => (
            <label
              key={item.id}
              className={`flex min-h-11 cursor-pointer items-start gap-3 text-sm ${ROW}`}
              htmlFor={`prac-${item.id}`}
            >
              <input
                id={`prac-${item.id}`}
                type="checkbox"
                className={CHECKBOX}
                checked={practiceIds.includes(item.id)}
                onChange={() => setPracticeIds((current) => toggle(current, item.id))}
              />
              <span className="leading-6">{item.label}</span>
            </label>
          ))}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Archive readiness
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${hasError ? "text-[var(--muted-foreground)]" : TONE_TEXT[result.band.tone]}`}
            >
              {hasError ? DASH : `${NUM.format(result.readinessPercent)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm font-semibold">
              {hasError ? DASH : result.band.label}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the archive redundancy result"
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
              aria-label="Reset the checker to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && result.singlePointOfFailure ? (
          <p className="mt-4 flex items-start gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Single point of failure: everything you ticked sits in one failure domain. This
              archive is not backed up, however many copies it looks like.
            </span>
          </p>
        ) : null}

        <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
          {hasError ? "Fix the selection above to see a verdict." : result.verdict}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.correlated.length ? (
          <div className="mt-5">
            <h3 className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Counted once — these share a failure domain
            </h3>
            <ul className="mt-2 grid gap-1.5 text-sm leading-6">
              {result.correlated.map((item) => (
                <li key={item.id} className="flex gap-2">
                  <span aria-hidden="true" className="text-[var(--danger)]">
                    &bull;
                  </span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {!hasError && result.gaps.length ? (
          <div className="mt-5">
            <h3 className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Structural gaps
            </h3>
            <ul className="mt-2 grid gap-1.5 text-sm leading-6">
              {result.gaps.map((gap) => (
                <li key={gap.id} className="flex gap-2">
                  <span aria-hidden="true" className="text-[var(--primary)]">
                    &bull;
                  </span>
                  <span>{gap.label}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Planning aid only. The structure tests follow the 3-2-1 rule and its 3-2-1-1-0 extension;
        the weights behind the percentage are editorial. Nothing you type here leaves your browser.
      </p>
    </main>
  );
}
