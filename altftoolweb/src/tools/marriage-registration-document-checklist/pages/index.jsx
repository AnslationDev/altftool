"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListChecks, RotateCcw } from "lucide-react";

import {
  MARITAL_HISTORY,
  MARRIAGE_ACTS,
  MIN_AGE_BRIDE,
  MIN_AGE_GROOM,
  NATIONALITIES,
  SMA_OBJECTION_DAYS,
  SMA_RESIDENCE_DAYS,
  SMA_SOLEMNISE_MONTHS,
  buildChecklist,
  checkAgeEligibility,
  computeSmaTimeline,
  parseISODate,
} from "../lib";

const DASH = "—";

const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const prettyDate = (value) => {
  if (!value) return DASH;
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return Number.isNaN(parsed) ? DASH : DATE_FMT.format(new Date(parsed));
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";

const DEFAULTS = {
  act: "hindu",
  groomNationality: "indian",
  brideNationality: "indian",
  groomHistory: "never",
  brideHistory: "never",
  groomBirthDate: "1996-04-12",
  brideBirthDate: "1998-09-30",
};

export default function ToolHome() {
  const [form, setForm] = useState(() => ({
    ...DEFAULTS,
    marriageDate: todayIso(),
    noticeDate: todayIso(),
  }));
  const [marriedAbroad, setMarriedAbroad] = useState(false);
  const [tatkal, setTatkal] = useState(false);
  const [done, setDone] = useState([]);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const checklist = useMemo(
    () => buildChecklist({ ...form, marriedAbroad, tatkal }),
    [form, marriedAbroad, tatkal],
  );

  const ages = useMemo(
    () =>
      checkAgeEligibility({
        groomBirthDate: form.groomBirthDate,
        brideBirthDate: form.brideBirthDate,
        marriageDate: form.marriageDate,
      }),
    [form.groomBirthDate, form.brideBirthDate, form.marriageDate],
  );

  const timeline = useMemo(
    () => computeSmaTimeline({ noticeDate: form.noticeDate }),
    [form.noticeDate],
  );

  const ok = !checklist.error;
  const needsNotice = ok && checklist.requiresNotice;

  // Under the Special Marriage Act, the marriage date entered above must fall
  // after the section 7 objection window closes and before the section 14
  // fresh-notice deadline. Neither the age check nor the SMA timeline compare
  // against each other on their own, so this flags the mismatch explicitly.
  const marriageDateWarning = useMemo(() => {
    if (!needsNotice || timeline.error || !parseISODate(form.marriageDate)) return null;
    if (form.marriageDate < timeline.earliestSolemnisation) {
      return `The marriage date falls inside the still-open ${SMA_OBJECTION_DAYS}-day objection window — solemnisation is not permitted until ${prettyDate(timeline.earliestSolemnisation)}.`;
    }
    if (form.marriageDate > timeline.lastDateToSolemnise) {
      return `The marriage date falls after the section 14 deadline of ${prettyDate(timeline.lastDateToSolemnise)} (${SMA_SOLEMNISE_MONTHS} calendar months from the notice) — a fresh notice will be required.`;
    }
    return null;
  }, [needsNotice, timeline, form.marriageDate]);

  const toggleDone = (item) => (event) => {
    const checked = event.target.checked;
    setDone((current) => (checked ? [...current, item] : current.filter((entry) => entry !== item)));
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Marriage registration checklist",
      checklist.act.label,
      `Witnesses needed: ${checklist.witnesses}`,
      "",
    ];
    for (const group of checklist.groups) {
      lines.push(group.title);
      for (const item of group.items) {
        lines.push(`  [${done.includes(item) ? "x" : " "}] ${item}`);
      }
      lines.push("");
    }
    if (needsNotice && !timeline.error) {
      lines.push(
        "Special Marriage Act dates",
        `Notice given: ${prettyDate(timeline.noticeDate)}`,
        `Objections may be filed until: ${prettyDate(timeline.objectionPeriodEnds)}`,
        `Earliest solemnisation: ${prettyDate(timeline.earliestSolemnisation)}`,
        `Last date before a fresh notice is needed: ${prettyDate(timeline.lastDateToSolemnise)}`,
        "",
      );
    }
    lines.push(...checklist.warnings);
    return lines.join("\n");
  }, [ok, checklist, done, needsNotice, timeline]);

  const copyChecklist = async () => {
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
    setForm({ ...DEFAULTS, marriageDate: todayIso(), noticeDate: todayIso() });
    setMarriedAbroad(false);
    setTatkal(false);
    setDone([]);
    setCopied(false);
  };

  const completed = ok
    ? checklist.groups.flatMap((group) => group.items).filter((item) => done.includes(item)).length
    : 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Family documents
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Marriage Registration Document Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The papers a registrar asks for depend on which Act you register under, whether either
          party was married before and whether anyone is a foreign national. Set those, and the
          checklist plus the Special Marriage Act notice dates fall out.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Your situation</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mrc-act">
              Registering under
            </label>
            <select
              id="mrc-act"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.act}
              onChange={set("act")}
            >
              {MARRIAGE_ACTS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
            {ok ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{checklist.act.note}</p>
            ) : null}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mrc-groom-nat">
              Groom&apos;s nationality
            </label>
            <select
              id="mrc-groom-nat"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.groomNationality}
              onChange={set("groomNationality")}
            >
              {NATIONALITIES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mrc-bride-nat">
              Bride&apos;s nationality
            </label>
            <select
              id="mrc-bride-nat"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.brideNationality}
              onChange={set("brideNationality")}
            >
              {NATIONALITIES.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mrc-groom-hist">
              Groom was previously
            </label>
            <select
              id="mrc-groom-hist"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.groomHistory}
              onChange={set("groomHistory")}
            >
              {MARITAL_HISTORY.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mrc-bride-hist">
              Bride was previously
            </label>
            <select
              id="mrc-bride-hist"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.brideHistory}
              onChange={set("brideHistory")}
            >
              {MARITAL_HISTORY.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mrc-groom-dob">
              Groom&apos;s date of birth
            </label>
            <input
              id="mrc-groom-dob"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.groomBirthDate}
              onChange={set("groomBirthDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mrc-bride-dob">
              Bride&apos;s date of birth
            </label>
            <input
              id="mrc-bride-dob"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.brideBirthDate}
              onChange={set("brideBirthDate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mrc-marriage-date">
              Date of the marriage
            </label>
            <input
              id="mrc-marriage-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.marriageDate}
              onChange={set("marriageDate")}
            />
          </div>
          {needsNotice ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="mrc-notice-date">
                Date the notice is given
              </label>
              <input
                id="mrc-notice-date"
                className={`mt-2 ${INPUT_CLASS}`}
                type="date"
                value={form.noticeDate}
                onChange={set("noticeDate")}
              />
            </div>
          ) : null}
          {marriageDateWarning ? (
            <p
              role="alert"
              className="sm:col-span-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
            >
              {marriageDateWarning}
            </p>
          ) : null}
          <div className="sm:col-span-2">
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={marriedAbroad}
                onChange={(event) => setMarriedAbroad(event.target.checked)}
              />
              The ceremony took place outside India
            </label>
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={tatkal}
                onChange={(event) => setTatkal(event.target.checked)}
              />
              Applying under a same-day / tatkal scheme
            </label>
          </div>
        </div>
      </section>

      {checklist.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {checklist.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Documents to gather
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${completed} / ${checklist.totalItems}` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${checklist.witnesses} witnesses must attend in person`
                : "Choose a valid combination above"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyChecklist}
              aria-label={copied ? "Checklist copied to clipboard" : "Copy the marriage registration checklist"}
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy checklist"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the form and clear ticked items"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>
      </section>

      <section
        className={`mt-6 rounded-xl p-5 ring-1 ${
          ages.error || !ages.bothEligible
            ? "bg-[var(--danger-soft)] ring-[var(--danger)]"
            : "bg-[var(--card)] ring-[var(--border)]"
        }`}
      >
        <h2 className="text-base font-semibold">Age eligibility</h2>
        {ages.error ? (
          <p role="alert" className="mt-2 text-sm font-medium text-[var(--danger)]">
            {ages.error}
          </p>
        ) : (
          <>
            <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
              {[
                [
                  `Groom's age on the marriage date (minimum ${MIN_AGE_GROOM})`,
                  `${ages.groomAge} years`,
                ],
                [
                  `Bride's age on the marriage date (minimum ${MIN_AGE_BRIDE})`,
                  `${ages.brideAge} years`,
                ],
                ["Groom becomes eligible on", prettyDate(ages.groomEligibleFrom)],
                ["Bride becomes eligible on", prettyDate(ages.brideEligibleFrom)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <p
              className={`mt-3 text-sm font-semibold ${
                ages.bothEligible ? "text-[var(--success)]" : "text-[var(--danger)]"
              }`}
            >
              {ages.bothEligible
                ? "Both parties meet the statutory minimum age."
                : "One party is below the statutory minimum age on the date entered — the marriage cannot be registered."}
            </p>
          </>
        )}
      </section>

      {needsNotice && !timeline.error ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Special Marriage Act timeline</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {[
              [
                "One party must have lived in the district since",
                prettyDate(timeline.residenceQualifyingSince),
              ],
              ["Notice given on", prettyDate(timeline.noticeDate)],
              ["Objections may be filed until", prettyDate(timeline.objectionPeriodEnds)],
              [
                "Earliest date the marriage may be solemnised",
                prettyDate(timeline.earliestSolemnisation),
              ],
              ["Last date before a fresh notice is needed", prettyDate(timeline.lastDateToSolemnise)],
              ["Length of the solemnisation window", `${timeline.windowDays} days`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Section 5 requires {SMA_RESIDENCE_DAYS} days of residence in the district before the
            notice; section 7 allows objections for {SMA_OBJECTION_DAYS} days after publication.
          </p>
        </section>
      ) : null}

      {ok
        ? checklist.groups.map((group) => (
            <section
              key={group.title}
              className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
            >
              <h2 className="text-base font-semibold">{group.title}</h2>
              <div className="mt-2 space-y-1">
                {group.items.map((item) => (
                  <label key={item} className="flex min-h-11 items-start gap-3 py-1 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]"
                      checked={done.includes(item)}
                      onChange={toggleDone(item)}
                    />
                    <span
                      className={
                        done.includes(item) ? "text-[var(--muted-foreground)] line-through" : ""
                      }
                    >
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </section>
          ))
        : null}

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Before you go</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
            {checklist.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Marriage registration is administered under state
        rules, so the exact forms, number of photographs, fees and accepted address proofs differ
        between states and even between districts. Check your state registrar&apos;s own portal, and
        consult a lawyer for an inter-faith, foreign-national or contested registration.
      </p>
    </main>
  );
}
