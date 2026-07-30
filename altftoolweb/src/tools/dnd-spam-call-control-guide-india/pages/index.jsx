"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PhoneOff, RotateCcw } from "lucide-react";

import {
  COMPLAINT_WINDOW_DAYS,
  PREFERENCE_ACTIVATION_DAYS,
  PREFERENCE_CATEGORIES,
  PREFERENCE_SHORT_CODE,
  REGISTRATION_ROUTES,
  SCOPE_NOTES,
  buildPreferenceCommand,
  checkComplaintWindow,
  classifyCallerNumber,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const showDate = (iso) => (iso ? DATE_FMT.format(new Date(`${iso}T00:00:00Z`)) : "—");
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const MODES = [
  { id: "block-all", label: "Block everything (fully blocked)" },
  { id: "block-selected", label: "Block only the categories I choose" },
  { id: "unblock-all", label: "Remove my preference entirely" },
];

const CATEGORY_TEXT = {
  promotional: "text-[var(--warning)]",
  transactional: "text-[var(--primary)]",
  mobile: "text-[var(--danger)]",
  shortcode: "text-[var(--primary)]",
  other: "text-[var(--warning)]",
  unknown: "text-[var(--danger)]",
};

const DEFAULTS = {
  mode: "block-selected",
  categories: [1, 2, 5],
  number: "1409876543",
  received: "2026-07-27",
  today: "2026-07-29",
};

export default function ToolHome() {
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [categories, setCategories] = useState(() => new Set(DEFAULTS.categories));
  const [number, setNumber] = useState(DEFAULTS.number);
  const [received, setReceived] = useState(DEFAULTS.received);
  const [today, setToday] = useState(DEFAULTS.today);
  const [copied, setCopied] = useState(false);

  const preference = useMemo(
    () => buildPreferenceCommand({ mode, categoryCodes: Array.from(categories) }),
    [mode, categories],
  );
  const caller = useMemo(() => classifyCallerNumber(number), [number]);
  const complaintWindow = useMemo(
    () => checkComplaintWindow({ receivedDate: received, todayDate: today }),
    [received, today],
  );

  const toggleCategory = (code) =>
    setCategories((previous) => {
      const next = new Set(previous);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  const summary = useMemo(() => {
    const lines = ["DND and spam call control"];
    if (preference.error) {
      lines.push(`Preference: ${preference.error}`);
    } else {
      lines.push(
        `Send "${preference.command}" to ${PREFERENCE_SHORT_CODE}.`,
        `Blocks ${preference.blockedCount} of ${PREFERENCE_CATEGORIES.length} categories. ${preference.explanation}`,
      );
    }
    if (!caller.error) {
      lines.push("", `Caller ${caller.normalised}: ${caller.title}. ${caller.action}`);
    }
    if (!complaintWindow.error) {
      lines.push("", complaintWindow.verdict);
    }
    lines.push(
      "",
      `Preferences take up to ${PREFERENCE_ACTIVATION_DAYS} days to take effect. Suspected fraud goes to Chakshu on Sanchar Saathi, not to DND.`,
    );
    return lines.join("\n");
  }, [preference, caller, complaintWindow]);

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
    setMode(DEFAULTS.mode);
    setCategories(new Set(DEFAULTS.categories));
    setNumber(DEFAULTS.number);
    setReceived(DEFAULTS.received);
    setToday(DEFAULTS.today);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PhoneOff className="h-4 w-4" aria-hidden="true" />
          Privacy rights
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          DND and Spam Call Control Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build the exact preference command to send to {PREFERENCE_SHORT_CODE}, work out what
          series a nuisance caller is using, and check whether you are still inside the{" "}
          {COMPLAINT_WINDOW_DAYS}-day complaint window TRAI allows.
        </p>
      </header>

      <section className={CARD} aria-labelledby="pref-heading">
        <h2 id="pref-heading" className="text-base font-semibold">
          Build your preference
        </h2>
        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="dnd-mode">
            What do you want to do?
          </label>
          <select
            id="dnd-mode"
            className={`mt-2 ${INPUT_CLASS}`}
            value={mode}
            onChange={(event) => setMode(event.target.value)}
          >
            {MODES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {mode === "block-selected" && (
          <ul className="mt-4 space-y-2">
            {PREFERENCE_CATEGORIES.map((item) => {
              const id = `cat-${item.code}`;
              return (
                <li key={item.code}>
                  <label
                    htmlFor={id}
                    className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm transition hover:border-[var(--primary)] has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-[var(--primary)]/35"
                  >
                    <input
                      id={id}
                      type="checkbox"
                      checked={categories.has(item.code)}
                      onChange={() => toggleCategory(item.code)}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                    />
                    <span className="flex-1 leading-6">
                      <span className="font-semibold">{item.code}.</span> {item.label}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        {preference.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {preference.error}
          </p>
        ) : (
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Send this to {PREFERENCE_SHORT_CODE}
          </p>
        )}

        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <p
            className={`break-all text-4xl font-semibold ${preference.error ? "text-[var(--muted-foreground)]" : "text-[var(--primary)]"}`}
          >
            {preference.error ? DASH : preference.command}
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the DND command and findings" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset every input" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Categories blocked",
              preference.error
                ? DASH
                : `${preference.blockedCount} of ${PREFERENCE_CATEGORIES.length}`,
            ],
            [
              "Coverage",
              preference.error ? DASH : `${NUM.format(preference.coveragePct)}%`,
            ],
            [
              "Still allowed",
              preference.error
                ? DASH
                : preference.allowedLabels.length === 0
                  ? "Nothing"
                  : preference.allowedLabels.join("; "),
            ],
            ["Takes effect within", `${PREFERENCE_ACTIVATION_DAYS} days`],
          ].map(([label, item]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{item}</dd>
            </div>
          ))}
        </dl>

        {!preference.error && (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">
            {preference.explanation}
          </p>
        )}
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="caller-heading">
        <h2 id="caller-heading" className="text-base font-semibold">
          Who is calling you?
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          The number series says whether the sender is registered at all. Checked in your browser;
          nothing is looked up online.
        </p>
        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="dnd-number">
            Number the call or message came from
          </label>
          <input
            id="dnd-number"
            className={`mt-2 ${INPUT_CLASS}`}
            type="tel"
            inputMode="tel"
            autoComplete="off"
            value={number}
            onChange={(event) => setNumber(event.target.value)}
          />
        </div>

        {caller.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {caller.error}
          </p>
        ) : null}

        <p
          className={`mt-4 text-2xl font-semibold ${caller.error ? "text-[var(--muted-foreground)]" : CATEGORY_TEXT[caller.category]}`}
        >
          {caller.error ? DASH : caller.title}
        </p>

        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {[
            ["Number read as", caller.error ? DASH : caller.normalised],
            ["What that means", caller.error ? DASH : caller.detail],
            ["What to do", caller.error ? DASH : caller.action],
          ].map(([label, item]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{item}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="window-heading">
        <h2 id="window-heading" className="text-base font-semibold">
          Are you still in time to complain?
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          A complaint about an unsolicited commercial communication must be registered within{" "}
          {COMPLAINT_WINDOW_DAYS} days of receiving it.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dnd-received">
              Date it arrived
            </label>
            <input
              id="dnd-received"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={received}
              onChange={(event) => setReceived(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dnd-today">
              Today&apos;s date
            </label>
            <input
              id="dnd-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
        </div>

        {complaintWindow.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {complaintWindow.error}
          </p>
        ) : (
          <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Days left to complain
          </p>
        )}
        <p
          className={`mt-1 text-4xl font-semibold ${
            complaintWindow.error
              ? "text-[var(--muted-foreground)]"
              : complaintWindow.withinWindow
                ? "text-[var(--success)]"
                : "text-[var(--danger)]"
          }`}
        >
          {complaintWindow.error ? DASH : String(complaintWindow.daysLeft)}
        </p>

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Days since it arrived", complaintWindow.error ? DASH : String(complaintWindow.daysElapsed)],
            ["Window", `${COMPLAINT_WINDOW_DAYS} days`],
            ["Window closes on", complaintWindow.error ? DASH : showDate(complaintWindow.deadline)],
          ].map(([label, item]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{item}</dd>
            </div>
          ))}
        </dl>

        {!complaintWindow.error && (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">{complaintWindow.verdict}</p>
        )}
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="routes-heading">
        <h2 id="routes-heading" className="text-base font-semibold">
          Where to register and complain
        </h2>
        <dl className="mt-4 divide-y divide-[var(--border)]">
          {REGISTRATION_ROUTES.map((route) => (
            <div key={route.id} className="py-3 first:pt-0 last:pb-0">
              <dt className="text-sm font-semibold">{route.name}</dt>
              <dd className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{route.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="scope-heading">
        <h2 id="scope-heading" className="text-base font-semibold">
          What DND does not cover
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          {SCOPE_NOTES.map((note) => (
            <li key={note} className="flex gap-2 leading-6">
              <span aria-hidden="true" className="text-[var(--primary)]">
                &bull;
              </span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Preference categories, complaint windows and numbering series are set by
        TRAI under the Telecom Commercial Communications Customer Preference Regulations, 2018 and
        can be revised — confirm the current command syntax and status in your operator&apos;s app
        before relying on it.
      </p>
    </main>
  );
}
