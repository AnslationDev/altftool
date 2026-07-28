"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Moon, RotateCcw } from "lucide-react";
import {
  GROUPS,
  SLEEP_HYGIENE_ITEMS,
  bedtimeCutoffs,
  scoreSleepHygiene,
} from "../lib";

const DASH = "—";

/** A plausible starting profile so the page shows a real score at first paint. */
const DEFAULT_CHECKED = ["b1", "b2", "b3", "b4", "d3", "d4", "d5", "d6", "r2", "r3", "r5"];
const DEFAULT_BEDTIME = "22:30";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const BAND_TONE = {
  strong: "text-[var(--success)]",
  good: "text-[var(--primary)]",
  mixed: "text-[var(--foreground)]",
  poor: "text-[var(--danger)]",
};

const IMPACT_LABEL = { 3: "High impact", 2: "Moderate", 1: "Supporting" };

export default function ToolHome() {
  const [checked, setChecked] = useState(DEFAULT_CHECKED);
  const [bedtime, setBedtime] = useState(DEFAULT_BEDTIME);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => scoreSleepHygiene(checked), [checked]);
  const cutoffs = useMemo(() => bedtimeCutoffs(bedtime), [bedtime]);
  const cutoffsOk = !cutoffs.error;

  const toggle = (id) => {
    setChecked((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
    setCopied(false);
  };

  const summary = useMemo(() => {
    const lines = [
      "Sleep Hygiene Checklist",
      `Score: ${result.score}% (${result.earned} of ${result.possible} impact points)`,
      `Band: ${result.bandLabel}`,
      `Items in place: ${result.checkedCount} of ${result.itemCount}`,
      "",
      ...result.groups.map((group) => `${group.label}: ${group.percent}% (${group.done}/${group.items})`),
    ];
    if (result.priorityFixes.length > 0) {
      lines.push("", "Highest-impact gaps:");
      result.priorityFixes.forEach((item) => lines.push(`- ${item.text} :: ${item.fix}`));
    }
    if (cutoffsOk) {
      lines.push(
        "",
        `Bedtime ${cutoffs.bedtime}`,
        `Last caffeine by ${cutoffs.caffeine}`,
        `Last alcohol by ${cutoffs.alcohol}`,
        `Last large meal by ${cutoffs.largeMeal}`,
        `Start wind-down at ${cutoffs.windDown}`,
      );
    }
    return lines.join("\n");
  }, [result, cutoffs, cutoffsOk]);

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setChecked(DEFAULT_CHECKED);
    setBedtime(DEFAULT_BEDTIME);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Moon className="h-4 w-4" aria-hidden="true" />
          Sleep
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Sleep Hygiene Checklist</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sixteen checks covering the bedroom, the day before, and what happens once you are in bed
          — the standard sleep hygiene and stimulus-control advice. Each item carries an impact
          weight, so the gaps come back ranked by how much they usually matter.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-5">
          {Object.values(GROUPS).map((group) => (
            <div key={group.key}>
              <h2 className="text-base font-semibold">{group.label}</h2>
              <ul className="mt-2 grid gap-2">
                {SLEEP_HYGIENE_ITEMS.filter((item) => item.group === group.key).map((item) => (
                  <li key={item.id}>
                    <label
                      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
                      htmlFor={`sleep-${item.id}`}
                    >
                      <input
                        id={`sleep-${item.id}`}
                        type="checkbox"
                        className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                        checked={checked.includes(item.id)}
                        onChange={() => toggle(item.id)}
                      />
                      <span>
                        {item.text}
                        <span className="ml-2 whitespace-nowrap text-xs text-[var(--muted-foreground)]">
                          · {IMPACT_LABEL[item.weight]}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sleep-bedtime">
              Target bedtime (24-hour, HH:MM)
            </label>
            <input
              id="sleep-bedtime"
              className={`mt-2 ${INPUT_CLASS}`}
              type="time"
              value={bedtime}
              onChange={(event) => setBedtime(event.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the sleep hygiene result"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Sleep hygiene score
        </p>
        <p className={`mt-1 text-4xl font-semibold ${BAND_TONE[result.bandKey]}`}>{result.score}%</p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {result.bandLabel} · {result.checkedCount} of {result.itemCount} checks in place
        </p>

        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${Math.max(1, result.score)}%` }}
            aria-hidden="true"
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {result.groups.map((group) => (
            <div key={group.key} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{group.label}</dt>
              <dd className="text-right font-semibold tabular-nums">
                {group.percent}% ({group.done}/{group.items})
              </dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Impact points earned</dt>
            <dd className="text-right font-semibold tabular-nums">
              {result.earned} / {result.possible}
            </dd>
          </div>
          {result.missedCount > 0 ? (
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">Weakest area</dt>
              <dd className="text-right font-semibold">{result.weakestGroupLabel}</dd>
            </div>
          ) : null}
        </dl>

        <p className="mt-4 text-sm leading-6">{result.bandSummary}</p>
      </section>

      {result.priorityFixes.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Fix these first</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Ranked by impact. Change one at a time and give each about two weeks.
          </p>
          <ol className="mt-3 grid gap-3 text-sm">
            {result.priorityFixes.map((item) => (
              <li key={item.id} className="rounded-md border border-[var(--border)] px-3 py-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">{item.text}</span>
                  <span className="shrink-0 rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]">
                    {IMPACT_LABEL[item.weight]}
                  </span>
                </div>
                <p className="mt-1 text-[var(--muted-foreground)]">{item.fix}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Nothing left on the checklist</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Every item is ticked. If sleep is still broken, hygiene is not the lever — persistent
            insomnia responds far better to CBT-I, which a doctor can refer you for.
          </p>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Cut-off times for a {cutoffsOk ? cutoffs.bedtime : "—"} bedtime</h2>
        {cutoffs.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {cutoffs.error}
          </p>
        ) : null}
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {[
            [`Last caffeine (${cutoffsOk ? cutoffs.caffeineHours : 6}h before)`, cutoffsOk ? cutoffs.caffeine : DASH],
            [`Last alcohol (${cutoffsOk ? cutoffs.alcoholHours : 3}h before)`, cutoffsOk ? cutoffs.alcohol : DASH],
            [`Last large meal (${cutoffsOk ? cutoffs.largeMealHours : 3}h before)`, cutoffsOk ? cutoffs.largeMeal : DASH],
            [`Start wind-down (${cutoffsOk ? cutoffs.windDownHours : 1}h before)`, cutoffsOk ? cutoffs.windDown : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Sleep hygiene helps ordinary poor sleep but is not a treatment for
        insomnia disorder, sleep apnoea or restless legs. If you snore heavily, stop breathing in
        your sleep, or cannot sleep three nights a week for three months despite good habits,
        speak to a doctor.
      </p>
    </main>
  );
}
