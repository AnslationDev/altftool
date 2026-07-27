"use client";

import { useMemo, useState } from "react";
import { Accessibility, Check, Copy, RotateCcw, Wand } from "lucide-react";

import {
  analyseAltText,
  buildAltDraft,
  MIN_USEFUL_CHARS,
  PLATFORMS,
  SCREEN_READER_GUIDELINE,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  altText: "A woman in a red jacket cycles across Howrah Bridge at sunrise.",
  platformId: "instagram",
  subject: "",
  action: "",
  setting: "",
  textInImage: "",
  purpose: "",
};

const SEVERITY_CLASS = {
  error: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warn: "bg-[var(--muted)] text-[var(--foreground)]",
  info: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-[7rem] w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [altText, setAltText] = useState(DEFAULTS.altText);
  const [platformId, setPlatformId] = useState(DEFAULTS.platformId);
  const [subject, setSubject] = useState(DEFAULTS.subject);
  const [action, setAction] = useState(DEFAULTS.action);
  const [setting, setSetting] = useState(DEFAULTS.setting);
  const [textInImage, setTextInImage] = useState(DEFAULTS.textInImage);
  const [purpose, setPurpose] = useState(DEFAULTS.purpose);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => analyseAltText(altText, platformId), [altText, platformId]);
  const error = result.error || null;

  const draft = useMemo(
    () => buildAltDraft({ subject, action, setting, textInImage, purpose }),
    [subject, action, setting, textInImage, purpose],
  );

  const copyResult = async () => {
    if (error) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const useDraft = () => {
    if (draft.error) return;
    setAltText(draft.draft);
    setCopied(false);
  };

  const reset = () => {
    setAltText(DEFAULTS.altText);
    setPlatformId(DEFAULTS.platformId);
    setSubject(DEFAULTS.subject);
    setAction(DEFAULTS.action);
    setSetting(DEFAULTS.setting);
    setTextInImage(DEFAULTS.textInImage);
    setPurpose(DEFAULTS.purpose);
    setCopied(false);
  };

  const activePlatform = PLATFORMS.find((platform) => platform.id === platformId);
  const limitLabel = activePlatform
    ? activePlatform.hardLimit === null
      ? `${SCREEN_READER_GUIDELINE} character guideline`
      : `${activePlatform.hardLimit} character limit`
    : "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Accessibility className="h-4 w-4" aria-hidden="true" />
          Accessibility
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Social Alt Text Writer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Draft a description of your image, check it against the platform limit and the
          125-character screen reader guideline, and fix the things that make alt text hard to
          listen to.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="atw-platform">
              Where the image will be posted
            </label>
            <select
              id="atw-platform"
              className={`mt-2 ${INPUT_CLASS}`}
              value={platformId}
              onChange={(event) => setPlatformId(event.target.value)}
            >
              {PLATFORMS.map((platform) => (
                <option key={platform.id} value={platform.id}>
                  {platform.label}
                </option>
              ))}
            </select>
            {activePlatform ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{activePlatform.note}</p>
            ) : null}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="atw-text">
              Your alt text
            </label>
            <textarea
              id="atw-text"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Aim for at least {MIN_USEFUL_CHARS} characters · {limitLabel}
            </p>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Alt text score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? "—" : `${NUM.format(result.score)} / 100`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error ? "Write a description to score it." : result.verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the alt text"
              className={GHOST_BTN}
              disabled={Boolean(error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy alt text"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Characters", error ? "—" : NUM.format(result.chars)],
            ["Words", error ? "—" : NUM.format(result.words)],
            [
              "Characters left",
              error
                ? "—"
                : `${NUM.format(result.charsRemaining)} of the ${limitLabel.replace(" character limit", "").replace(" character guideline", "")}`,
            ],
            ["Budget used", error ? "—" : `${NUM1.format(result.limitUsedPct)}%`],
            ["Problems found", error ? "—" : `${NUM.format(result.errorCount)} blocking · ${NUM.format(result.warnCount)} worth fixing`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!error ? (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Alt text scores ${result.score} out of 100`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, result.score))}%` }}
              />
            </div>
          </div>
        ) : null}

        {!error && result.issues.length > 0 ? (
          <ul className="mt-5 space-y-2 text-sm">
            {result.issues.map((issue) => (
              <li key={issue.id} className={`rounded-md px-3 py-2 ${SEVERITY_CLASS[issue.severity]}`}>
                <span className="font-semibold">{issue.message}</span>{" "}
                <span className="opacity-80">{issue.fix}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {!error && result.passes.length > 0 ? (
          <ul className="mt-3 space-y-1 text-sm text-[var(--success)]">
            {result.passes.map((pass) => (
              <li key={pass} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {pass}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Build a draft from scratch</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Fill in what the image actually shows and the tool assembles a sentence you can edit.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="atw-subject">
              Main subject
            </label>
            <input
              id="atw-subject"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="a woman in a red jacket"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="atw-action">
              What they are doing
            </label>
            <input
              id="atw-action"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="cycling across a steel bridge"
              value={action}
              onChange={(event) => setAction(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="atw-setting">
              Where it happens
            </label>
            <input
              id="atw-setting"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Kolkata at sunrise"
              value={setting}
              onChange={(event) => setSetting(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="atw-words">
              Words printed in the image
            </label>
            <input
              id="atw-words"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Ride Safe"
              value={textInImage}
              onChange={(event) => setTextInImage(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="atw-purpose">
              Why the image is there (optional)
            </label>
            <input
              id="atw-purpose"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="promotes the monsoon cycling campaign"
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 rounded-md bg-[var(--muted)] px-3 py-3 text-sm">
          {draft.error ? (
            <span className="text-[var(--muted-foreground)]">{draft.error}</span>
          ) : (
            <>
              <p className="font-medium">{draft.draft}</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {NUM.format(draft.chars)} characters
              </p>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={useDraft}
          className={`mt-4 ${PRIMARY_BTN}`}
          disabled={Boolean(draft.error)}
          aria-label="Use this draft as the alt text"
        >
          <Wand className="h-4 w-4" aria-hidden="true" />
          Use this draft
        </button>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Guidance only, not a conformance test. WCAG 2.2 success criterion 1.1.1 requires a text
        alternative but does not set a character count — decorative images should carry an empty alt
        attribute rather than a description.
      </p>
    </main>
  );
}
