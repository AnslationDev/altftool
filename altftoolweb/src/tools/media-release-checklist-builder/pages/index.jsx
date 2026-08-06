"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListChecks, RotateCcw } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import {
  CHANNEL_OPTIONS,
  MUSIC_OPTIONS,
  USAGE_OPTIONS,
  assessReadiness,
  buildChecklist,
  checklistToText,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

// Keyed by RISK_BANDS[].tone — the note's colour reflects what the band note
// actually says, independent of the separate safeToPublish verdict above it.
const NOTE_TONE_CLASS = {
  success: "text-[var(--success-text)]",
  warning: "text-[var(--warning-text)]",
  danger: "text-[var(--danger-text)]",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "inline-flex min-h-11 w-full items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm";

const CONTENT_TOGGLES = [
  ["peopleRecognisable", "Recognisable people appear"],
  ["minorsPresent", "Anyone under 18 appears"],
  ["crowdPublic", "A crowd or audience is filmed"],
  ["paidTalent", "Paid actors, models or presenters"],
  ["freelanceCrew", "Freelance crew shot or edited it"],
  ["locationPrivate", "Identifiable private property"],
  ["locationInstitution", "Museum, school, hospital or transport hub"],
  ["publicPermitNeeded", "Street filming with crew or tripod"],
  ["stockAssets", "Uses stock or licensed assets"],
  ["stockEditorialOnly", "Any asset is marked editorial use only"],
  ["archiveFootage", "Uses archive footage or photos"],
  ["ugc", "Uses someone else's social post or user clip"],
  ["artworkVisible", "Artwork, murals or posters in shot"],
  ["brandsVisible", "Logos or branded products visible"],
  ["droneUsed", "Shot with a drone"],
  ["aiGenerated", "Contains AI-generated likeness or voice"],
];

const DEFAULT_ANSWERS = {
  usage: "commercial",
  channels: ["web", "social", "ads"],
  musicSource: "library",
  peopleRecognisable: true,
  minorsPresent: false,
  crowdPublic: false,
  paidTalent: true,
  freelanceCrew: true,
  locationPrivate: false,
  locationInstitution: false,
  publicPermitNeeded: false,
  stockAssets: true,
  stockEditorialOnly: false,
  archiveFootage: false,
  ugc: false,
  artworkVisible: false,
  brandsVisible: true,
  droneUsed: false,
  aiGenerated: false,
  territoryWorldwide: true,
};

export default function ToolHome() {
  const [answers, setAnswers] = useState(DEFAULT_ANSWERS);
  const [done, setDone] = useState({});
  const { copy: copyToClipboard, isCopied, announcement, reset: resetCopyState } =
    useCopyToClipboard();

  const checklist = useMemo(() => buildChecklist(answers), [answers]);

  const readiness = useMemo(
    () =>
      checklist.error
        ? { error: checklist.error }
        : assessReadiness({ items: checklist.items, done }),
    [checklist, done],
  );

  const setFlag = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const toggleChannel = (id) => {
    setAnswers((prev) => ({
      ...prev,
      channels: prev.channels.includes(id)
        ? prev.channels.filter((item) => item !== id)
        : [...prev.channels, id],
    }));
  };

  const copyResult = () => {
    if (checklist.error) return;
    copyToClipboard(
      "checklist",
      checklistToText({ items: checklist.items, done, title: "Media release checklist" }),
      { label: "the release checklist" },
    );
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset the checklist? This clears every answer above and every item you've ticked as done, and cannot be undone.",
      )
    ) {
      return;
    }
    setAnswers(DEFAULT_ANSWERS);
    setDone({});
    resetCopyState();
  };

  const required = checklist.error ? [] : checklist.items.filter((i) => i.severity === "required");
  const recommended = checklist.error
    ? []
    : checklist.items.filter((i) => i.severity === "recommended");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Media privacy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Media Release Checklist Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describe what is in the shot and where it is going. You get the releases, licences and
          permissions that apply, split into what you must have and what is prudent to have.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">How it will be used</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mrc-usage">
              Type of use
            </label>
            <select
              id="mrc-usage"
              className={`mt-2 ${INPUT_CLASS}`}
              value={answers.usage}
              onChange={(event) => setFlag("usage", event.target.value)}
            >
              {USAGE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mrc-music">
              Music in the piece
            </label>
            <select
              id="mrc-music"
              className={`mt-2 ${INPUT_CLASS}`}
              value={answers.musicSource}
              onChange={(event) => setFlag("musicSource", event.target.value)}
            >
              {MUSIC_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Channels</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {CHANNEL_OPTIONS.map((option) => (
              <label key={option.id} htmlFor={`mrc-ch-${option.id}`} className={CHECK_ROW}>
                <input
                  id={`mrc-ch-${option.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={answers.channels.includes(option.id)}
                  onChange={() => toggleChannel(option.id)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label htmlFor="mrc-territory" className={`mt-4 ${CHECK_ROW}`}>
          <input
            id="mrc-territory"
            type="checkbox"
            className="h-5 w-5 shrink-0 accent-[var(--primary)]"
            checked={answers.territoryWorldwide}
            onChange={(event) => setFlag("territoryWorldwide", event.target.checked)}
          />
          Distributed worldwide
        </label>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What is in the material</h2>
        <fieldset className="mt-3">
          <legend className="sr-only">Content characteristics</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {CONTENT_TOGGLES.map(([key, label]) => (
              <label key={key} htmlFor={`mrc-${key}`} className={CHECK_ROW}>
                <input
                  id={`mrc-${key}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={Boolean(answers[key])}
                  onChange={(event) => setFlag(key, event.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {checklist.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger-text)]"
        >
          {checklist.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div role="status" aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Clearance readiness
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {readiness.error ? DASH : `${NUM.format(readiness.readiness)}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {readiness.error
                ? "Fix the answers above to build the checklist."
                : `${readiness.completed} of ${readiness.total} items ticked · residual risk ${readiness.band.label}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={
                isCopied("checklist") ? "Copied the release checklist to clipboard" : "Copy the release checklist"
              }
              className={GHOST_BTN}
              disabled={Boolean(checklist.error)}
            >
              {isCopied("checklist") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("checklist") ? "Copied!" : "Copy checklist"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all answers" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
          <span className="sr-only" role="status" aria-live="polite">
            {announcement}
          </span>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm" role="status" aria-live="polite">
          {[
            ["Required releases", readiness.error ? DASH : NUM.format(readiness.requiredTotal)],
            [
              "Required still open",
              readiness.error ? DASH : NUM.format(readiness.requiredTotal - readiness.requiredDone),
            ],
            ["Recommended items", checklist.error ? DASH : NUM.format(recommended.length)],
            ["Residual risk score", readiness.error ? DASH : `${NUM1.format(readiness.riskScore)} / 100`],
            ["Risk band", readiness.error ? DASH : readiness.band.label],
            [
              "Safe to publish on this checklist",
              readiness.error ? DASH : readiness.safeToPublish ? "Yes" : "Not yet",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!readiness.error ? (
          <p
            role="status"
            aria-live="polite"
            className={`mt-4 text-xs leading-5 ${NOTE_TONE_CLASS[readiness.band.tone] || "text-[var(--muted-foreground)]"}`}
          >
            {readiness.band.note}
          </p>
        ) : null}

        {!checklist.error && checklist.note ? (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">{checklist.note}</p>
        ) : null}
      </section>

      {!checklist.error && checklist.items.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your checklist</h2>
          {[
            ["Required", required],
            ["Recommended", recommended],
          ].map(([heading, rows]) =>
            rows.length === 0 ? null : (
              <div key={heading} className="mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {heading}
                </h3>
                <ul className="mt-2 space-y-2">
                  {rows.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                    >
                      <label htmlFor={`mrc-done-${item.id}`} className="flex min-h-11 items-start gap-3">
                        <input
                          id={`mrc-done-${item.id}`}
                          type="checkbox"
                          className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                          checked={done[item.id] === true}
                          onChange={(event) =>
                            setDone((prev) => ({ ...prev, [item.id]: event.target.checked }))
                          }
                        />
                        <span>
                          <span
                            className={`block text-sm font-semibold ${done[item.id] ? "text-[var(--muted-foreground)] line-through" : ""}`}
                          >
                            {item.title}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                            {item.why}
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ),
          )}
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Publicity, privacy, copyright and drone rules differ by
        country and by platform, and broadcasters and insurers often demand more than this list. Have
        a media lawyer review anything high-value or high-risk before release.
      </p>
    </main>
  );
}
