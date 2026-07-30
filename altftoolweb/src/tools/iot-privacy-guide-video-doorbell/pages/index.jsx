"use client";

import { useMemo, useState } from "react";
import { BellRing, Check, Copy, HardDrive, RotateCcw, TriangleAlert } from "lucide-react";

import {
  CHECKLIST,
  CRITICAL_CAP_PERCENT,
  DEFAULT_DONE,
  GROUPS,
  RESOLUTIONS,
  estimateFootageStorage,
  scoreChecklist,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const CRITICAL_COUNT = CHECKLIST.filter((item) => item.critical).length;

const STORAGE_DEFAULTS = {
  resolutionId: "1080p",
  eventsPerDay: "25",
  secondsPerEvent: "30",
  storageGb: "32",
  retentionDays: "0",
};

export default function ToolHome() {
  const [done, setDone] = useState(() => DEFAULT_DONE.slice());
  const [resolutionId, setResolutionId] = useState(STORAGE_DEFAULTS.resolutionId);
  const [eventsPerDay, setEventsPerDay] = useState(STORAGE_DEFAULTS.eventsPerDay);
  const [secondsPerEvent, setSecondsPerEvent] = useState(STORAGE_DEFAULTS.secondsPerEvent);
  const [storageGb, setStorageGb] = useState(STORAGE_DEFAULTS.storageGb);
  const [retentionDays, setRetentionDays] = useState(STORAGE_DEFAULTS.retentionDays);
  const [copied, setCopied] = useState(false);

  const score = useMemo(() => scoreChecklist(done), [done]);

  const storage = useMemo(
    () =>
      estimateFootageStorage({
        resolutionId,
        eventsPerDay: eventsPerDay.trim() === "" ? Number.NaN : Number(eventsPerDay),
        secondsPerEvent: secondsPerEvent.trim() === "" ? Number.NaN : Number(secondsPerEvent),
        storageGb: storageGb.trim() === "" ? Number.NaN : Number(storageGb),
        retentionDays: retentionDays.trim() === "" ? 0 : Number(retentionDays),
      }),
    [resolutionId, eventsPerDay, secondsPerEvent, storageGb, retentionDays]
  );

  const toggle = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setCopied(false);
  };

  const reset = () => {
    setDone(DEFAULT_DONE.slice());
    setResolutionId(STORAGE_DEFAULTS.resolutionId);
    setEventsPerDay(STORAGE_DEFAULTS.eventsPerDay);
    setSecondsPerEvent(STORAGE_DEFAULTS.secondsPerEvent);
    setStorageGb(STORAGE_DEFAULTS.storageGb);
    setRetentionDays(STORAGE_DEFAULTS.retentionDays);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (score.error) return "";
    const lines = [
      "Video Doorbell Privacy Setup",
      `Setup score: ${score.percent}% — ${score.bandLabel}`,
      `Controls done: ${score.completed} of ${score.total}`,
      `Critical controls missing: ${score.missingCritical.length}`,
    ];
    if (!storage.error) {
      lines.push(
        `Footage held: about ${NUM1.format(storage.effectiveDays)} days (${NUM.format(storage.clipsHeld)} clips), limited by ${storage.limitedBy}`
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
  }, [score, storage]);

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
  const hasStorage = !storage.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BellRing className="h-4 w-4" aria-hidden="true" />
          Home IoT security
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Video Doorbell Privacy Setup Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A doorbell watches a shared space, so the setup has to protect your account and your
          neighbours at once. Tick each control as you set it; the score weights the ones that
          actually stop a stranger opening the live view.
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
              Privacy setup score
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
              aria-label="Copy the doorbell privacy result"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the guide" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={hasScore ? `Setup score ${score.percent} out of 100` : "Score unavailable"}
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
                        onChange={() => toggle(item.id)}
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
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          <h2 className="text-base font-semibold">How long your footage sticks around</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Data you no longer hold cannot leak. This estimates how many days of clips your card or
          plan keeps before the oldest ones are overwritten.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="doorbell-resolution">
              Recording resolution
            </label>
            <select
              id="doorbell-resolution"
              className={`mt-2 ${INPUT_CLASS}`}
              value={resolutionId}
              onChange={(event) => setResolutionId(event.target.value)}
            >
              {RESOLUTIONS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label} ({entry.mbps} Mbps)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="doorbell-events">
              Recorded events per day
            </label>
            <input
              id="doorbell-events"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={eventsPerDay}
              onChange={(event) => setEventsPerDay(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="doorbell-seconds">
              Clip length (seconds)
            </label>
            <input
              id="doorbell-seconds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="5"
              value={secondsPerEvent}
              onChange={(event) => setSecondsPerEvent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="doorbell-storage">
              Storage available (GB)
            </label>
            <input
              id="doorbell-storage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={storageGb}
              onChange={(event) => setStorageGb(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="doorbell-retention">
              Plan retention limit (days, 0 for none)
            </label>
            <input
              id="doorbell-retention"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={retentionDays}
              onChange={(event) => setRetentionDays(event.target.value)}
            />
          </div>
        </div>

        {storage.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {storage.error}
          </p>
        ) : null}

        <div className="mt-5 rounded-xl bg-[var(--background)] p-4 ring-1 ring-[var(--border)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Footage you are holding
          </p>
          <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
            {hasStorage ? `${NUM1.format(storage.effectiveDays)} days` : DASH}
          </p>
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["Size of one clip", hasStorage ? `${NUM1.format(storage.mbPerEvent)} MB` : DASH],
              ["Recorded per day", hasStorage ? `${NUM1.format(storage.mbPerDay)} MB` : DASH],
              ["Recorded per month", hasStorage ? `${NUM1.format(storage.gbPerMonth)} GB` : DASH],
              ["Clips held at any time", hasStorage ? NUM.format(storage.clipsHeld) : DASH],
              ["Limited by", hasStorage ? storage.limitedBy : DASH],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Mistakes worth avoiding</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            Leaving the default motion zone, which usually reaches the road and records every
            passer-by along with your visitors.
          </li>
          <li>
            Leaving audio on without thinking about it &mdash; a doorbell mic can pick up
            conversation well beyond your own boundary.
          </li>
          <li>
            Sharing the account password with a housemate instead of adding them as a named shared
            user you can remove later.
          </li>
          <li>
            Posting a clip of an identifiable person to a neighbourhood group before speaking to the
            police.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything you tick stays in this browser tab &mdash; the page stores nothing and never asks
        for an account, password or code. Storage figures are estimates: real bitrates vary with
        scene motion and vendor encoding. Camera rules differ by country and by state, so treat the
        legal points here as general information and take proper advice if a neighbour disputes your
        installation.
      </p>
    </main>
  );
}
