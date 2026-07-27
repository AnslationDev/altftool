"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListChecks, Mic, RotateCcw } from "lucide-react";

import {
  DEPTH_PROFILES,
  EDIT_TRIM_PERCENT,
  MAX_SEGMENTS,
  MIN_SEGMENTS,
  buildGuestBrief,
  formatBriefText,
  formatTimecode,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  guestName: "Asha Menon",
  guestRole: "head of engineering",
  company: "Nexa Labs",
  topic: "hiring your first ten engineers",
  episodeMinutes: "45",
  introMinutes: "3",
  outroMinutes: "3",
  segmentCount: "4",
  depth: "standard",
  bufferPercent: "10",
  editStyle: "normal",
};

const DASH = "—";
const round1 = (n) => Math.round(n * 10) / 10;

export default function ToolHome() {
  const [guestName, setGuestName] = useState(DEFAULTS.guestName);
  const [guestRole, setGuestRole] = useState(DEFAULTS.guestRole);
  const [company, setCompany] = useState(DEFAULTS.company);
  const [topic, setTopic] = useState(DEFAULTS.topic);
  const [episodeMinutes, setEpisodeMinutes] = useState(DEFAULTS.episodeMinutes);
  const [introMinutes, setIntroMinutes] = useState(DEFAULTS.introMinutes);
  const [outroMinutes, setOutroMinutes] = useState(DEFAULTS.outroMinutes);
  const [segmentCount, setSegmentCount] = useState(DEFAULTS.segmentCount);
  const [depth, setDepth] = useState(DEFAULTS.depth);
  const [bufferPercent, setBufferPercent] = useState(DEFAULTS.bufferPercent);
  const [editStyle, setEditStyle] = useState(DEFAULTS.editStyle);
  const [copied, setCopied] = useState(false);

  const brief = useMemo(
    () =>
      buildGuestBrief({
        guestName,
        guestRole,
        company,
        topic,
        episodeMinutes: Number(episodeMinutes),
        introMinutes: Number(introMinutes),
        outroMinutes: Number(outroMinutes),
        segmentCount: Number(segmentCount),
        depth,
        bufferPercent: Number(bufferPercent),
        editStyle,
      }),
    [
      guestName,
      guestRole,
      company,
      topic,
      episodeMinutes,
      introMinutes,
      outroMinutes,
      segmentCount,
      depth,
      bufferPercent,
      editStyle,
    ],
  );

  const hasError = Boolean(brief.error);
  const briefText = useMemo(() => (hasError ? "" : formatBriefText(brief)), [brief, hasError]);

  const copyResult = async () => {
    if (!briefText) return;
    try {
      await navigator.clipboard.writeText(briefText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setGuestName(DEFAULTS.guestName);
    setGuestRole(DEFAULTS.guestRole);
    setCompany(DEFAULTS.company);
    setTopic(DEFAULTS.topic);
    setEpisodeMinutes(DEFAULTS.episodeMinutes);
    setIntroMinutes(DEFAULTS.introMinutes);
    setOutroMinutes(DEFAULTS.outroMinutes);
    setSegmentCount(DEFAULTS.segmentCount);
    setDepth(DEFAULTS.depth);
    setBufferPercent(DEFAULTS.bufferPercent);
    setEditStyle(DEFAULTS.editStyle);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Mic className="h-4 w-4" aria-hidden="true" />
          Podcast production
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Podcast Guest Brief Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn a guest, a topic and a target runtime into a timed rundown, a question list sized to
          the tape you actually have, and a pre-record tech checklist you can send ahead.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pgb-guest">
              Guest name
            </label>
            <input
              id="pgb-guest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pgb-role">
              Guest role
            </label>
            <input
              id="pgb-role"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={guestRole}
              onChange={(event) => setGuestRole(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pgb-company">
              Company or project
            </label>
            <input
              id="pgb-company"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pgb-topic">
              Episode topic
            </label>
            <input
              id="pgb-topic"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pgb-total">
              Recorded length (minutes)
            </label>
            <input
              id="pgb-total"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="8"
              max="240"
              step="5"
              value={episodeMinutes}
              onChange={(event) => setEpisodeMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pgb-segments">
              Segments ({MIN_SEGMENTS}-{MAX_SEGMENTS})
            </label>
            <input
              id="pgb-segments"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_SEGMENTS}
              max={MAX_SEGMENTS}
              step="1"
              value={segmentCount}
              onChange={(event) => setSegmentCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pgb-intro">
              Intro (minutes)
            </label>
            <input
              id="pgb-intro"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={introMinutes}
              onChange={(event) => setIntroMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pgb-outro">
              Outro (minutes)
            </label>
            <input
              id="pgb-outro"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={outroMinutes}
              onChange={(event) => setOutroMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pgb-depth">
              Question depth
            </label>
            <select
              id="pgb-depth"
              className={`mt-2 ${INPUT_CLASS}`}
              value={depth}
              onChange={(event) => setDepth(event.target.value)}
            >
              {Object.values(DEPTH_PROFILES).map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.label} ({profile.minutesPerQuestion} min per question)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pgb-buffer">
              Technical buffer (% of recording)
            </label>
            <input
              id="pgb-buffer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="40"
              step="1"
              value={bufferPercent}
              onChange={(event) => setBufferPercent(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pgb-edit">
              Edit style (used for the published runtime estimate)
            </label>
            <select
              id="pgb-edit"
              className={`mt-2 ${INPUT_CLASS}`}
              value={editStyle}
              onChange={(event) => setEditStyle(event.target.value)}
            >
              {Object.entries(EDIT_TRIM_PERCENT).map(([key, value]) => (
                <option key={key} value={key}>
                  {key === "light" ? "Light — barely touched" : null}
                  {key === "normal" ? "Normal — tighten and remove tangents" : null}
                  {key === "heavy" ? "Heavy — highly produced" : null} ({value}% trimmed)
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {brief.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Questions to prepare
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : brief.totalQuestions}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see the rundown"
                : `${brief.questionsPerSegment} per segment across ${brief.segments} segments`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the full guest brief"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy brief"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Interview time after intro, outro and buffer", hasError ? DASH : `${round1(brief.interviewMinutes)} min`],
            ["Per segment", hasError ? DASH : `${round1(brief.perSegment)} min`],
            ["Minutes budgeted per question", hasError ? DASH : `${brief.minutesPerQuestion} min`],
            ["Technical buffer", hasError ? DASH : `${round1(brief.bufferMinutes)} min`],
            ["Estimated published runtime", hasError ? DASH : `${Math.round(brief.publishedMinutes)} min (${brief.trimPercent}% trimmed)`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Timed rundown</h2>
          <ol className="mt-4 space-y-4">
            {brief.blocks.map((block) => (
              <li key={block.id} className="rounded-lg border border-[var(--border)] p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold">{block.name}</h3>
                  <span className="font-mono text-xs text-[var(--primary)]">
                    {formatTimecode(block.start)} · {round1(block.minutes)} min
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  {block.purpose}
                </p>
                {block.questions.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-sm leading-6">
                    {block.questions.map((question) => (
                      <li key={question} className="flex gap-2">
                        <span aria-hidden="true" className="text-[var(--primary)]">
                          •
                        </span>
                        <span>{question}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <ListChecks className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          Pre-record tech checklist
        </h2>
        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {(hasError ? [] : brief.checklist).map(([title, detail]) => (
            <div key={title} className="py-2.5">
              <dt className="font-semibold">{title}</dt>
              <dd className="mt-0.5 text-[var(--muted-foreground)]">{detail}</dd>
            </div>
          ))}
        </dl>
        {hasError ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Timings are a planning estimate. Real interviews drift, so treat the buffer as untouchable
        and confirm recording consent and clip usage rights with your guest before you publish.
      </p>
    </main>
  );
}
