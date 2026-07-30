"use client";

import { useMemo, useState } from "react";
import { Check, Copy, History, RotateCcw, Speaker, TriangleAlert } from "lucide-react";

import {
  CHECKLIST,
  CRITICAL_CAP_PERCENT,
  DEFAULT_DONE,
  GROUPS,
  MAX_ACCOUNT_AGE_MONTHS,
  MAX_QUERIES_PER_DAY,
  RETENTION_PRESETS,
  estimateStoredRecordings,
  scoreChecklist,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const CRITICAL_COUNT = CHECKLIST.filter((item) => item.critical).length;
const DEFAULT_QUERIES_PER_DAY = 15;
const DEFAULT_ACCOUNT_AGE_MONTHS = 24;
const DEFAULT_RETENTION_ID = "keep-forever";

export default function ToolHome() {
  const [done, setDone] = useState(() => DEFAULT_DONE.slice());
  const [queriesPerDay, setQueriesPerDay] = useState(String(DEFAULT_QUERIES_PER_DAY));
  const [accountAgeMonths, setAccountAgeMonths] = useState(String(DEFAULT_ACCOUNT_AGE_MONTHS));
  const [retentionId, setRetentionId] = useState(DEFAULT_RETENTION_ID);
  const [copied, setCopied] = useState(false);

  const score = useMemo(() => scoreChecklist(done), [done]);
  const retention = useMemo(
    () =>
      estimateStoredRecordings({
        queriesPerDay: Number(queriesPerDay),
        accountAgeMonths: Number(accountAgeMonths),
        retentionId,
      }),
    [queriesPerDay, accountAgeMonths, retentionId]
  );

  const toggleStep = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setCopied(false);
  };

  const reset = () => {
    setDone(DEFAULT_DONE.slice());
    setQueriesPerDay(String(DEFAULT_QUERIES_PER_DAY));
    setAccountAgeMonths(String(DEFAULT_ACCOUNT_AGE_MONTHS));
    setRetentionId(DEFAULT_RETENTION_ID);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (score.error) return "";
    const lines = [
      "Smart Speaker Privacy Setup Guide",
      `Hardening score: ${score.percent}% — ${score.bandLabel}`,
      `Controls done: ${score.completed} of ${score.total}`,
      `Critical controls missing: ${score.missingCritical.length}`,
    ];
    if (!retention.error) {
      lines.push(
        `Retention setting: ${retention.presetLabel}`,
        `Recordings currently stored: about ${NUM.format(retention.stored)} (${retention.bandLabel})`
      );
    }
    lines.push("");
    if (score.remaining.length === 0) {
      lines.push("Nothing left — every control is ticked.");
    } else {
      lines.push("Still to do:");
      for (const item of score.remaining) {
        lines.push(`- ${item.title}${item.critical ? " (critical)" : ""}`);
      }
    }
    return lines.join("\n");
  }, [score, retention]);

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

  const hasScore = !score.error;
  const hasRetention = !retention.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Speaker className="h-4 w-4" aria-hidden="true" />
          Home IoT security
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Smart Speaker Privacy Setup Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Alexa, Google and Siri speakers all keep listening for a wake word, but what happens after
          that wake word fires — whether audio is stored, for how long, and who can review it — is
          controlled by settings almost nobody changes from the default. Work through the sixteen
          controls below, then see how much history your own usage actually builds up.
        </p>
      </header>

      <section
        className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-labelledby="score-heading"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              id="score-heading"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Hardening score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasScore ? `${score.percent}%` : DASH}
            </p>
            <p className="mt-1 text-sm font-semibold">{hasScore ? score.bandLabel : DASH}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasScore ? score.bandHint : "Fix the problem shown below to see a score."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the smart speaker privacy result"
              className={GHOST_BTN}
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
              aria-label="Reset the checklist"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={hasScore ? `Hardening score ${score.percent} out of 100` : "Score unavailable"}
        >
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${hasScore ? score.percent : 0}%` }}
          />
        </div>

        {score.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {score.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Controls completed", hasScore ? `${score.completed} of ${score.total}` : DASH],
            [
              "Weighted points",
              hasScore ? `${NUM.format(score.points)} / ${NUM.format(score.maxPoints)}` : DASH,
            ],
            [
              "Critical controls missing",
              hasScore ? `${score.missingCritical.length} of ${CRITICAL_COUNT}` : DASH,
            ],
            ["Score band", hasScore ? score.bandLabel : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasScore && score.capped ? (
          <p className="mt-4 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Score held at {CRITICAL_CAP_PERCENT}% while a critical control is open. Tick every
              control marked critical to score higher.
            </span>
          </p>
        ) : null}

        {hasScore && score.nextActions.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Do these next
            </p>
            <ol className="mt-2 space-y-1 text-sm">
              {score.nextActions.map((item) => (
                <li key={item.id} className="flex gap-2">
                  <span className="font-semibold text-[var(--primary)]">+{item.weight}</span>
                  <span>{item.title}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          <h2 className="text-base font-semibold">How much history you're actually building up</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Auto-delete windows sound small until you multiply them by daily use. Describe how often
          the speaker is used and how long the account has gone without a full clear-out to see the
          real count.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="retention-setting">
              Current retention setting
            </label>
            <select
              id="retention-setting"
              className={`mt-2 ${INPUT_CLASS}`}
              value={retentionId}
              onChange={(event) => {
                setRetentionId(event.target.value);
                setCopied(false);
              }}
            >
              {RETENTION_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="queries-per-day">
              Voice requests per day, roughly
            </label>
            <input
              id="queries-per-day"
              type="number"
              inputMode="numeric"
              min={0}
              max={MAX_QUERIES_PER_DAY}
              step={1}
              className={`mt-2 ${INPUT_CLASS}`}
              value={queriesPerDay}
              onChange={(event) => {
                setQueriesPerDay(event.target.value);
                setCopied(false);
              }}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="account-age-months">
              Months since setup, or since you last fully cleared the history
            </label>
            <input
              id="account-age-months"
              type="number"
              inputMode="numeric"
              min={0}
              max={MAX_ACCOUNT_AGE_MONTHS}
              step={1}
              className={`mt-2 ${INPUT_CLASS}`}
              value={accountAgeMonths}
              onChange={(event) => {
                setAccountAgeMonths(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>

        {retention.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {retention.error}
          </p>
        ) : null}

        <div className="mt-5 rounded-xl bg-[var(--background)] p-4 ring-1 ring-[var(--border)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Recordings stored right now
          </p>
          <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
            {hasRetention ? NUM.format(retention.stored) : DASH}
          </p>
          <p className="mt-1 text-sm font-semibold">{hasRetention ? retention.bandLabel : DASH}</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {hasRetention ? retention.bandHint : "Fill in the fields above to see an estimate."}
          </p>

          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["Effective retention window", hasRetention ? retention.effectiveWindowReadable : DASH],
              [
                "At the shortest 3-month window instead",
                hasRetention ? NUM.format(retention.storedAtShortest) : DASH,
              ],
              [
                "What switching to 3 months would remove",
                hasRetention
                  ? retention.alreadyAtOrBelowShortest
                    ? "Nothing — already at or below that"
                    : `about ${NUM.format(retention.reduction)} recordings`
                  : DASH,
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="max-w-[60%] text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          {hasRetention ? (
            <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
              {retention.presetNote}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mt-6 space-y-4">
        {GROUPS.map((group) => {
          const items = CHECKLIST.filter((item) => item.group === group);
          const groupStat = hasScore ? score.groups.find((entry) => entry.name === group) : null;
          return (
            <div key={group} className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">{group}</h2>
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                  {groupStat ? `${groupStat.done}/${groupStat.total} done` : DASH}
                </span>
              </div>
              <ul className="mt-3 space-y-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <label
                      htmlFor={`step-${item.id}`}
                      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                    >
                      <input
                        id={`step-${item.id}`}
                        type="checkbox"
                        checked={done.includes(item.id)}
                        onChange={() => toggleStep(item.id)}
                        className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">{item.title}</span>
                          {item.critical ? (
                            <span className="rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--danger)]">
                              Critical
                            </span>
                          ) : null}
                          <span className="text-[11px] font-semibold text-[var(--muted-foreground)]">
                            +{item.weight}
                          </span>
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                          {item.detail}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Mistakes worth avoiding</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            Assuming the mic-off button and the wake word do the same job — the wake word only
            decides what gets sent to the cloud, it does not power the microphone down.
          </li>
          <li>
            Changing the retention setting and stopping there. It only affects new recordings; the
            existing backlog needs a separate, deliberate delete.
          </li>
          <li>
            Enabling every skill offered during setup and never revisiting the list, so permissions
            granted once keep working long after the skill is forgotten.
          </li>
          <li>
            Leaving voice purchasing on with no PIN on a speaker anyone in the house, including
            children and guests, can talk to.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything you tick or type stays in this browser tab &mdash; nothing is stored or sent, and
        the page never asks for your Amazon or Google login. The retention estimate is a rough guide
        to scale, not an export of your real history; check the assistant&rsquo;s own activity page
        for the exact count.
      </p>
    </main>
  );
}
