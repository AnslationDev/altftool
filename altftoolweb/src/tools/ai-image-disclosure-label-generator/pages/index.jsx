"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Check, Copy, RotateCcw, TriangleAlert } from "lucide-react";

import {
  INVOLVEMENT_LEVELS,
  MEDIA_TYPES,
  PLATFORMS,
  buildDisclosureLabel,
} from "../lib";

const NUM = new Intl.NumberFormat("en-US");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const CHECKBOX_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-6 text-[var(--foreground)]";
const CHECKBOX =
  "mt-0.5 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DEFAULTS = {
  platformId: "instagram",
  involvementId: "fully-generated",
  mediaTypeId: "image",
  toolName: "Midjourney v7",
  photorealistic: true,
  realPerson: false,
  commercial: false,
  contentCredentials: false,
};

const DASH = "—";

export default function ToolHome() {
  const [platformId, setPlatformId] = useState(DEFAULTS.platformId);
  const [involvementId, setInvolvementId] = useState(DEFAULTS.involvementId);
  const [mediaTypeId, setMediaTypeId] = useState(DEFAULTS.mediaTypeId);
  const [toolName, setToolName] = useState(DEFAULTS.toolName);
  const [photorealistic, setPhotorealistic] = useState(DEFAULTS.photorealistic);
  const [realPerson, setRealPerson] = useState(DEFAULTS.realPerson);
  const [commercial, setCommercial] = useState(DEFAULTS.commercial);
  const [contentCredentials, setContentCredentials] = useState(DEFAULTS.contentCredentials);
  const [copied, setCopied] = useState("");

  const result = useMemo(
    () =>
      buildDisclosureLabel({
        platformId,
        involvementId,
        mediaTypeId,
        toolName,
        photorealistic,
        realPerson,
        commercial,
        contentCredentials,
      }),
    [
      platformId,
      involvementId,
      mediaTypeId,
      toolName,
      photorealistic,
      realPerson,
      commercial,
      contentCredentials,
    ],
  );

  const hasError = Boolean(result.error);
  const involvement =
    INVOLVEMENT_LEVELS.find((level) => level.id === involvementId) ?? INVOLVEMENT_LEVELS[0];

  const bundle = useMemo(() => {
    if (hasError) return "";
    return [
      `Badge: ${result.badge}`,
      `Caption: ${result.caption}`,
      `Alt text ending:${result.altTextSuffix || " (none needed)"}`,
      result.hashtags.length ? `Hashtags: ${result.hashtags.join(" ")}` : null,
      `IPTC DigitalSourceType: ${result.iptcUri}`,
      `Embed with: ${result.exiftoolCommand}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result]);

  const copy = async (key, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setPlatformId(DEFAULTS.platformId);
    setInvolvementId(DEFAULTS.involvementId);
    setMediaTypeId(DEFAULTS.mediaTypeId);
    setToolName(DEFAULTS.toolName);
    setPhotorealistic(DEFAULTS.photorealistic);
    setRealPerson(DEFAULTS.realPerson);
    setCommercial(DEFAULTS.commercial);
    setContentCredentials(DEFAULTS.contentCredentials);
    setCopied("");
  };

  const budgetText = hasError
    ? DASH
    : result.captionLimit === null
      ? `${NUM.format(result.captionLength)} characters (no fixed limit tracked)`
      : `${NUM.format(result.captionLength)} of ${NUM.format(result.captionLimit)} characters · ${NUM.format(result.remainingCharacters)} left`;

  const rows = hasError
    ? [
        ["Disclosure needed", DASH],
        ["Caption length", DASH],
        ["IPTC digital source type", DASH],
        ["Platform control to switch on", DASH],
      ]
    : [
        ["Disclosure needed", result.disclosureRequired ? "Yes" : "Optional"],
        ["Caption length", budgetText],
        ["IPTC digital source type", result.iptcTerm],
        ["Alt text ending", result.altTextSuffix.trim() || "no change needed"],
        ["Hashtags", result.hashtags.length ? result.hashtags.join(" ") : "none"],
        ["Platform control to switch on", result.platformControl],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <BadgeCheck className="h-4 w-4" aria-hidden="true" />
          Content provenance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AI Disclosure Label Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describe how the media was made and get the badge, caption, alt text and the IPTC
          Digital Source Type tag that belongs in the file — sized to the platform you are
          posting on.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dis-platform">
              Publishing on
            </label>
            <select
              id="dis-platform"
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
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dis-media">
              Media type
            </label>
            <select
              id="dis-media"
              className={`mt-2 ${INPUT_CLASS}`}
              value={mediaTypeId}
              onChange={(event) => setMediaTypeId(event.target.value)}
            >
              {MEDIA_TYPES.map((media) => (
                <option key={media.id} value={media.id}>
                  {media.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dis-involvement">
              How much did the model do?
            </label>
            <select
              id="dis-involvement"
              className={`mt-2 ${INPUT_CLASS}`}
              value={involvementId}
              onChange={(event) => setInvolvementId(event.target.value)}
            >
              {INVOLVEMENT_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{involvement.hint}</p>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dis-tool">
              Model or product used (optional)
            </label>
            <input
              id="dis-tool"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={60}
              placeholder="Midjourney v7, Firefly, Veo, Topaz Photo AI…"
              value={toolName}
              onChange={(event) => setToolName(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className={CHECKBOX_ROW} htmlFor="dis-photoreal">
            <input
              id="dis-photoreal"
              type="checkbox"
              className={CHECKBOX}
              checked={photorealistic}
              onChange={(event) => setPhotorealistic(event.target.checked)}
            />
            Photorealistic — a viewer could take it for a real photo or recording
          </label>
          <label className={CHECKBOX_ROW} htmlFor="dis-person">
            <input
              id="dis-person"
              type="checkbox"
              className={CHECKBOX}
              checked={realPerson}
              onChange={(event) => setRealPerson(event.target.checked)}
            />
            Shows an identifiable real person, place or event
          </label>
          <label className={CHECKBOX_ROW} htmlFor="dis-commercial">
            <input
              id="dis-commercial"
              type="checkbox"
              className={CHECKBOX}
              checked={commercial}
              onChange={(event) => setCommercial(event.target.checked)}
            />
            Advertising, endorsement or anything that sells
          </label>
          <label className={CHECKBOX_ROW} htmlFor="dis-c2pa">
            <input
              id="dis-c2pa"
              type="checkbox"
              className={CHECKBOX}
              checked={contentCredentials}
              onChange={(event) => setContentCredentials(event.target.checked)}
            />
            Content Credentials (C2PA) are already embedded in the file
          </label>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Badge to show
            </p>
            <p className="mt-1 text-3xl font-semibold leading-tight text-[var(--primary)] sm:text-4xl">
              {hasError ? DASH : result.badge}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a label."
                : `${result.involvementLabel} · ${result.platformLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("bundle", bundle)}
              disabled={hasError}
              aria-label="Copy the full disclosure bundle"
              className={GHOST_BTN}
            >
              {copied === "bundle" ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "bundle" ? "Copied!" : "Copy all"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Caption to publish</h2>
          <button
            type="button"
            onClick={() => copy("caption", hasError ? "" : result.caption)}
            disabled={hasError}
            aria-label="Copy the disclosure caption"
            className={GHOST_BTN}
          >
            {copied === "caption" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied === "caption" ? "Copied!" : "Copy caption"}
          </button>
        </div>
        <p className="mt-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
          {hasError ? DASH : result.caption}
        </p>
        {!hasError && result.usedShortVersion ? (
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Shortened to one sentence so it fits the {NUM.format(result.captionLimit)}-character
            caption limit.
          </p>
        ) : null}
        {!hasError && result.hashtags.length ? (
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            Optional hashtags: {result.hashtags.join(" ")}
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Machine-readable tag</h2>
          <button
            type="button"
            onClick={() => copy("exif", hasError ? "" : result.exiftoolCommand)}
            disabled={hasError}
            aria-label="Copy the ExifTool command that writes the IPTC digital source type"
            className={GHOST_BTN}
          >
            {copied === "exif" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied === "exif" ? "Copied!" : "Copy command"}
          </button>
        </div>
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">
          Write this into the file so search engines and platforms can label it without being
          told twice.
        </p>
        <div className="mt-3 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="p-3 text-xs leading-6">
            <code>{hasError ? DASH : result.exiftoolCommand}</code>
          </pre>
        </div>
        {!hasError ? (
          <p className="mt-2 break-all text-xs text-[var(--muted-foreground)]">
            {result.xmpProperty} = {result.iptcUri}
          </p>
        ) : null}
      </section>

      {!hasError && result.warnings.length ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <TriangleAlert className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
            Worth checking before you post
          </h2>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--danger)]">
                  •
                </span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational drafting aid, not legal advice. Disclosure duties differ by jurisdiction,
        platform and contract — check the EU AI Act text, your platform&apos;s current policy and,
        for advertising or likeness use, a qualified lawyer.
      </p>
    </main>
  );
}
