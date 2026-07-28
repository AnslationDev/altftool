"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldCheck, TriangleAlert, Facebook } from "lucide-react";

import {
  CHECKLIST,
  CRITICAL_CAP_PERCENT,
  DEFAULT_DONE,
  GROUPS,
  PLATFORM,
  PROFILES,
  planToTarget,
  scoreChecklist,
} from "../lib";

const DASH = "\u2014";
const NUM = new Intl.NumberFormat("en-IN");
const CRITICAL_COUNT = CHECKLIST.filter((item) => item.critical).length;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

function exposureTone(exposure) {
  if (exposure >= 60) return "bg-[var(--danger)]";
  if (exposure >= 30) return "bg-[var(--warning)]";
  return "bg-[var(--success)]";
}

export default function ToolHome() {
  const [done, setDone] = useState(() => DEFAULT_DONE.slice());
  const [profileId, setProfileId] = useState(PROFILES[0].id);
  const [target, setTarget] = useState("90");
  const [copied, setCopied] = useState(false);

  const score = useMemo(() => scoreChecklist(done, profileId), [done, profileId]);
  const plan = useMemo(
    () => planToTarget(done, target.trim() === "" ? Number.NaN : Number(target), profileId),
    [done, target, profileId]
  );

  const hasScore = !score.error;

  const toggle = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setCopied(false);
  };

  const tickAll = () => {
    setDone(CHECKLIST.map((item) => item.id));
    setCopied(false);
  };

  const clearAll = () => {
    setDone([]);
    setCopied(false);
  };

  const reset = () => {
    setDone(DEFAULT_DONE.slice());
    setProfileId(PROFILES[0].id);
    setTarget("90");
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (!hasScore) return "";
    const lines = [
      "Facebook Privacy Settings Checklist",
      `Risk profile: ${score.profile.name}`,
      `Protection score: ${score.percent}% \u2014 ${score.bandLabel}`,
      `Settings applied: ${score.completed} of ${score.total}`,
      `Critical settings still open: ${score.missingCritical.length}`,
      "",
      "Remaining exposure by area:",
    ];
    for (const axis of score.axes) {
      lines.push(`- ${axis.name}: ${axis.exposure}% open (${axis.open}/${axis.total} settings)`);
    }
    lines.push("");
    if (score.remaining.length === 0) {
      lines.push("Nothing left \u2014 every setting is applied.");
    } else {
      lines.push("Still to do:");
      for (const item of score.remaining) {
        lines.push(`- ${item.title}${item.critical ? " (critical)" : ""} \u2014 ${item.path}`);
      }
    }
    return lines.join("\n");
  }, [score, hasScore]);

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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Facebook className="h-4 w-4" aria-hidden="true" />
          Facebook privacy audit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Facebook Privacy Settings Checklist</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Facebook keeps a decade of posts, tags and check-ins visible under settings most people set once and never revisited. Work through the 30 controls below, weighted by how much exposure each one closes for your situation.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-profile">
              Who are you locking this down for?
            </label>
            <select
              id="pc-profile"
              className={`mt-2 ${INPUT_CLASS}`}
              value={profileId}
              onChange={(event) => {
                setProfileId(event.target.value);
                setCopied(false);
              }}
            >
              {PROFILES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              {hasScore ? score.profile.description : DASH}
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pc-target">
              Target score (%)
            </label>
            <input
              id="pc-target"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              step="5"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              Anything above {CRITICAL_CAP_PERCENT}% needs every critical setting applied.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]" aria-labelledby="pc-score">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p id="pc-score" className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Protection score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasScore ? `${score.percent}%` : DASH}
            </p>
            <p className="mt-1 text-sm font-semibold">{hasScore ? score.bandLabel : DASH}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasScore ? score.bandHint : "Fix the problem below to see a score."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the privacy checklist result"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={hasScore ? `Protection score ${score.percent} out of 100` : "Score unavailable"}
        >
          <span className="block h-full bg-[var(--primary)]" style={{ width: `${hasScore ? score.percent : 0}%` }} />
        </div>

        {score.error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {score.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Settings applied", hasScore ? `${score.completed} of ${score.total}` : DASH],
            [
              "Weighted points for this profile",
              hasScore ? `${NUM.format(score.earned)} / ${NUM.format(score.available)}` : DASH,
            ],
            [
              "Critical settings still open",
              hasScore ? `${score.missingCritical.length} of ${CRITICAL_COUNT}` : DASH,
            ],
            [
              "Biggest remaining exposure",
              hasScore && score.worstAxis
                ? `${score.worstAxis.name} (${score.worstAxis.exposure}% open)`
                : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasScore && score.capped ? (
          <p className="mt-4 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Score held at {CRITICAL_CAP_PERCENT}% while a critical setting is open. Those are the
              ones a stranger can exploit today.
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

      {hasScore ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Remaining exposure by area</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Weighted for the {score.profile.name.toLowerCase()} profile. A longer bar means more is still open.
          </p>
          <ul className="mt-4 space-y-3">
            {score.axes.map((axis) => (
              <li key={axis.name}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span className="font-semibold">{axis.name}</span>
                  <span className="text-[var(--muted-foreground)]">
                    {axis.exposure}% open &middot; {axis.open}/{axis.total} settings
                    {axis.emphasis > 1 ? " \u00b7 weighted up" : axis.emphasis < 1 ? " \u00b7 weighted down" : ""}
                  </span>
                </div>
                <div
                  className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                  role="img"
                  aria-label={`${axis.name}: ${axis.exposure} percent still open`}
                >
                  <span className={`block h-full ${exposureTone(axis.exposure)}`} style={{ width: `${axis.exposure}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Shortest route to your target</h2>
        {plan.error ? (
          <p role="alert" className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {plan.error}
          </p>
        ) : plan.steps.length === 0 ? (
          <p className="mt-3 flex items-center gap-2 rounded-md bg-[var(--success-soft)] px-3 py-2 text-sm font-medium text-[var(--success)]">
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            Target already met.
          </p>
        ) : (
          <div className="mt-3">
            <p className="text-sm text-[var(--muted-foreground)]">
              {plan.steps.length} more setting{plan.steps.length === 1 ? "" : "s"} takes you to{" "}
              <span className="font-semibold text-[var(--foreground)]">{plan.projectedPercent}%</span>.
            </p>
            <ol className="mt-2 space-y-1 text-sm">
              {plan.steps.map((item) => (
                <li key={item.id} className="flex gap-2">
                  <span className="font-semibold text-[var(--primary)]">+{item.weight}</span>
                  <span>
                    {item.title}
                    <span className="block text-xs text-[var(--muted-foreground)]">{item.path}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        <button type="button" onClick={tickAll} className={GHOST_BTN} aria-label="Mark every setting as applied">
          <Check className="h-4 w-4" aria-hidden="true" />
          Mark all applied
        </button>
        <button type="button" onClick={clearAll} className={GHOST_BTN} aria-label="Clear every ticked setting">
          Clear all
        </button>
      </div>

      <section className="mt-4 space-y-4">
        {GROUPS.map((group) => {
          const items = CHECKLIST.filter((item) => item.group === group);
          const stat = hasScore ? score.groups.find((entry) => entry.name === group) : null;
          return (
            <div key={group} className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">{group}</h2>
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                  {stat ? `${stat.done}/${stat.total} done` : DASH}
                </span>
              </div>
              <ul className="mt-3 space-y-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <label
                      htmlFor={`pc-${item.id}`}
                      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                    >
                      <input
                        id={`pc-${item.id}`}
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
                            +{item.weight} &middot; {item.axis}
                          </span>
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                          {item.detail}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                          <span className="font-semibold">Where: </span>
                          {item.path}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                          <span className="font-semibold">If you skip it: </span>
                          {item.risk}
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
          <li>Running Limit Past Posts and stopping there &mdash; album audiences, tagged photos and check-ins are not covered by it.</li>
          <li>Hiding the profile from search engines but leaving the friends list public, which is what profile-cloning scams actually need.</li>
          <li>Blocking someone on Facebook and assuming Messenger is covered; the two lists are separate.</li>
          <li>Clearing off-platform activity once without using Disconnect future activity, so the record starts rebuilding the same day.</li>
          <li>Leaving date of birth and hometown public, which together are the two fields most used to open credit in someone else&rsquo;s name.</li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything you tick stays in this browser tab &mdash; nothing is uploaded and the page never asks
        for a username, password or code. {PLATFORM.note} Menu wording moves between app releases, so
        follow the description rather than hunting for exact labels, and check the platform&rsquo;s own help
        pages if a setting has been relocated.
      </p>
    </main>
  );
}
