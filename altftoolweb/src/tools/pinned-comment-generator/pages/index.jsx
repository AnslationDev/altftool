"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Pin, RotateCcw } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  LINK_SOFT_LIMIT,
  PLATFORMS,
  PROMPT_STYLES,
  SCANNABLE_CHARS,
  analysePinnedComment,
  buildPinnedComment,
} from "../lib";

const DEFAULTS = {
  topic: "home studio acoustics",
  platformId: "youtube",
  promptId: "question",
  intro: "",
  correction: "At 4:12 I say 60 Hz — it should be 80 Hz.",
  linksText: `The panels I used | https://example.com/panels
Room measurement app | https://example.com/app`,
  timestampsText: `0:00 Intro
3:40 Measuring the room
11:20 Panel placement`,
  disclosure: true,
  nextUp: "Treating a room on no budget",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-US");

export default function ToolHome() {
  const [topic, setTopic] = useState(DEFAULTS.topic);
  const [platformId, setPlatformId] = useState(DEFAULTS.platformId);
  const [promptId, setPromptId] = useState(DEFAULTS.promptId);
  const [intro, setIntro] = useState(DEFAULTS.intro);
  const [correction, setCorrection] = useState(DEFAULTS.correction);
  const [linksText, setLinksText] = useState(DEFAULTS.linksText);
  const [timestampsText, setTimestampsText] = useState(DEFAULTS.timestampsText);
  const [disclosure, setDisclosure] = useState(DEFAULTS.disclosure);
  const [nextUp, setNextUp] = useState(DEFAULTS.nextUp);
  const { copy, isCopied, announcement } = useCopyToClipboard();

  const draft = useMemo(
    () =>
      buildPinnedComment({
        topic,
        platformId,
        promptId,
        intro,
        correction,
        linksText,
        timestampsText,
        disclosure,
        nextUp,
      }),
    [topic, platformId, promptId, intro, correction, linksText, timestampsText, disclosure, nextUp],
  );

  const analysis = useMemo(() => {
    if (draft.error) return { error: draft.error };
    return analysePinnedComment(draft.text, { platformId, affiliate: disclosure });
  }, [draft, platformId, disclosure]);

  const error = draft.error || analysis.error;
  const ok = !error;
  const dash = "—";

  const copyResult = () => {
    if (!ok) return;
    copy("comment", draft.text, { label: "the pinned comment" });
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset the generator? This clears every field — topic, platform, prompt style, opening line, correction, links, timestamps, affiliate disclosure and next-up — back to the demo example and cannot be undone.",
      )
    ) {
      return;
    }
    setTopic(DEFAULTS.topic);
    setPlatformId(DEFAULTS.platformId);
    setPromptId(DEFAULTS.promptId);
    setIntro(DEFAULTS.intro);
    setCorrection(DEFAULTS.correction);
    setLinksText(DEFAULTS.linksText);
    setTimestampsText(DEFAULTS.timestampsText);
    setDisclosure(DEFAULTS.disclosure);
    setNextUp(DEFAULTS.nextUp);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Pin className="h-4 w-4" aria-hidden="true" />
          Pinned comment
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Pinned Comment Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Corrections first, then timestamps, links, disclosure and one thing to reply to — assembled
          in order and checked against the comment character limit for your platform.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pin-topic">
              Video topic
            </label>
            <input
              id="pin-topic"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pin-platform">
              Platform
            </label>
            <select
              id="pin-platform"
              className={`mt-2 ${INPUT_CLASS}`}
              value={platformId}
              onChange={(event) => setPlatformId(event.target.value)}
            >
              {PLATFORMS.map((platform) => (
                <option key={platform.id} value={platform.id}>
                  {platform.label} — {NUM.format(platform.limit)} characters
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pin-prompt">
              Community prompt style
            </label>
            <select
              id="pin-prompt"
              className={`mt-2 ${INPUT_CLASS}`}
              value={promptId}
              onChange={(event) => setPromptId(event.target.value)}
            >
              {PROMPT_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pin-intro">
              Opening line (leave blank for a default)
            </label>
            <input
              id="pin-intro"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={intro}
              onChange={(event) => setIntro(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pin-correction">
              Correction (optional)
            </label>
            <input
              id="pin-correction"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={correction}
              onChange={(event) => setCorrection(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pin-links">
              Links, one per line as &quot;Label | https://…&quot;
            </label>
            <textarea
              id="pin-links"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={3}
              value={linksText}
              onChange={(event) => setLinksText(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pin-timestamps">
              Timestamps, one per line as &quot;0:00 Label&quot;
            </label>
            <textarea
              id="pin-timestamps"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={3}
              value={timestampsText}
              onChange={(event) => setTimestampsText(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pin-next">
              Next up (optional)
            </label>
            <input
              id="pin-next"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={nextUp}
              onChange={(event) => setNextUp(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              htmlFor="pin-disclosure"
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
            >
              <input
                id="pin-disclosure"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={disclosure}
                onChange={() => setDisclosure((value) => !value)}
              />
              <span>Links are affiliate or sponsored</span>
            </label>
          </div>
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Comment length
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? NUM.format(analysis.characters) : dash}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `characters of ${NUM.format(analysis.limit)} on ${analysis.platformLabel}`
                : "Add a topic to build the comment"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={isCopied("comment") ? "Copied the pinned comment to the clipboard" : "Copy the pinned comment"}
              className={GHOST_BTN}
            >
              {isCopied("comment") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("comment") ? "Copied!" : "Copy comment"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the generator" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Characters remaining", ok ? NUM.format(analysis.remaining) : dash],
            ["Limit used", ok ? `${analysis.usedPercent}%` : dash],
            ["Links included", ok ? String(analysis.linkCount) : dash],
            ["Timestamps parsed", ok ? String(draft.timestamps.rows.length) : dash],
            ["Ends with a question", ok ? (analysis.hasQuestion ? "Yes" : "No") : dash],
            ["Disclosure present", ok ? (analysis.hasDisclosure ? "Yes" : "No") : dash],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <>
            <div className="mt-5">
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`Using ${analysis.usedPercent} percent of the comment character limit`}
              >
                <span
                  className={`block h-full ${analysis.overLimit ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
                  style={{ width: `${Math.max(0, Math.min(100, analysis.usedPercent))}%` }}
                />
              </div>
            </div>

            <div aria-live="polite" role="status">
              {analysis.issues.length > 0 ||
              draft.timestamps.issues.length > 0 ||
              draft.links.issues.length > 0 ? (
                <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
                  {analysis.issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                  {draft.timestamps.issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                  {draft.links.issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm font-medium text-[var(--success)]">
                  Inside the limit, links parse, and it ends with something to reply to.
                </p>
              )}
            </div>
          </>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Draft pinned comment</h2>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
            {draft.text}
          </pre>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Keep it under about {SCANNABLE_CHARS} characters and roughly {LINK_SOFT_LIMIT} links so it
        stays scannable and is less likely to be held for review. Disclosure wording here is a
        starting point, not legal advice — check the rules that apply where you publish.
      </p>
    </main>
  );
}
