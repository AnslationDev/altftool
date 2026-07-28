"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Megaphone, RotateCcw } from "lucide-react";

import {
  FORMATS,
  JURISDICTIONS,
  PLATFORMS,
  RELATIONSHIPS,
  buildDisclosure,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  jurisdiction: "in",
  platform: "instagram",
  format: "shortVideo",
  relationship: "paid",
  brand: "Acme Coffee",
  leadIn: "",
  videoSeconds: "45",
};

const DASH = "—";

export default function ToolHome() {
  const [jurisdiction, setJurisdiction] = useState(DEFAULTS.jurisdiction);
  const [platform, setPlatform] = useState(DEFAULTS.platform);
  const [format, setFormat] = useState(DEFAULTS.format);
  const [relationship, setRelationship] = useState(DEFAULTS.relationship);
  const [brand, setBrand] = useState(DEFAULTS.brand);
  const [leadIn, setLeadIn] = useState(DEFAULTS.leadIn);
  const [videoSeconds, setVideoSeconds] = useState(DEFAULTS.videoSeconds);
  const [copied, setCopied] = useState(false);

  const activePlatform = PLATFORMS.find((item) => item.id === platform) ?? PLATFORMS[0];

  const result = useMemo(
    () =>
      buildDisclosure({
        jurisdiction,
        platform,
        format,
        relationship,
        brand,
        leadIn,
        videoSeconds: Number(videoSeconds),
      }),
    [jurisdiction, platform, format, relationship, brand, leadIn, videoSeconds],
  );

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      result.caption,
      "",
      result.plainSentence,
      "",
      `Rules followed: ${result.jurisdictionLabel}`,
      `Placement: ${result.placement.join(" ")}`,
      result.duration && !result.duration.continuous
        ? `On-screen label: at least ${result.duration.seconds} seconds`
        : result.duration
          ? "On-screen label: continuous through the promoted segment"
          : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [result]);

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

  const reset = () => {
    setJurisdiction(DEFAULTS.jurisdiction);
    setPlatform(DEFAULTS.platform);
    setFormat(DEFAULTS.format);
    setRelationship(DEFAULTS.relationship);
    setBrand(DEFAULTS.brand);
    setLeadIn(DEFAULTS.leadIn);
    setVideoSeconds(DEFAULTS.videoSeconds);
    setCopied(false);
  };

  const showVideoLength = ["shortVideo", "longVideo", "story"].includes(format);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Megaphone className="h-4 w-4" aria-hidden="true" />
          Disclosure
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Influencer Disclosure Label Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick your country, platform and the kind of deal, and get the exact label to use, where to
          put it and how long it has to stay on screen.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="disc-jurisdiction">
              Rules to follow
            </label>
            <select
              id="disc-jurisdiction"
              className={`mt-2 ${INPUT_CLASS}`}
              value={jurisdiction}
              onChange={(event) => setJurisdiction(event.target.value)}
            >
              {JURISDICTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="disc-platform">
              Platform
            </label>
            <select
              id="disc-platform"
              className={`mt-2 ${INPUT_CLASS}`}
              value={platform}
              onChange={(event) => {
                const next = event.target.value;
                setPlatform(next);
                const nextPlatform = PLATFORMS.find((item) => item.id === next);
                if (nextPlatform && !nextPlatform.formats.includes(format)) {
                  setFormat(nextPlatform.formats[0]);
                }
              }}
            >
              {PLATFORMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="disc-format">
              Content format
            </label>
            <select
              id="disc-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={format}
              onChange={(event) => setFormat(event.target.value)}
            >
              {FORMATS.filter((item) => activePlatform.formats.includes(item.id)).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="disc-relationship">
              How you are connected
            </label>
            <select
              id="disc-relationship"
              className={`mt-2 ${INPUT_CLASS}`}
              value={relationship}
              onChange={(event) => setRelationship(event.target.value)}
            >
              {RELATIONSHIPS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="disc-brand">
              Brand name
            </label>
            <input
              id="disc-brand"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
            />
          </div>
          {showVideoLength ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="disc-seconds">
                Video length (seconds)
              </label>
              <input
                id="disc-seconds"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={videoSeconds}
                onChange={(event) => setVideoSeconds(event.target.value)}
              />
            </div>
          ) : null}
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="disc-lead">
              Text before the label (optional)
            </label>
            <input
              id="disc-lead"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder="Leave blank to keep the label first — that is the safest place for it"
              value={leadIn}
              onChange={(event) => setLeadIn(event.target.value)}
            />
          </div>
        </div>
      </section>

      {result.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
          <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Disclosure label
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Caption line", "Plain-language sentence", "On-screen duration"].map((item) => (
                <div key={item} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{item}</dt>
                  <dd className="text-right font-semibold">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Disclosure label
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{result.label}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {result.jurisdictionLabel} · {result.platformLabel} · {result.formatLabel}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy the disclosure text"
                  className={GHOST_BTN}
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? "Copied!" : "Copy result"}
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

            <pre className="mt-5 overflow-x-auto whitespace-pre-wrap rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm">
              {result.caption}
            </pre>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Hashtag form", result.hashtag],
                ["Plain-language sentence", result.plainSentence],
                [
                  "On-screen duration",
                  result.duration
                    ? result.duration.continuous
                      ? "Whole promoted segment"
                      : `At least ${result.duration.seconds}s`
                    : "Not a video format",
                ],
                [
                  "Visible before truncation",
                  result.labelVisible
                    ? `Yes — ${result.charsBeforeCut} characters to spare`
                    : "No — move the label to the front",
                ],
                ["Caption characters", String(result.captionChars)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Where to put it</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
              {result.placement.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="text-[var(--primary)]">
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {result.duration ? (
              <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm">
                {result.duration.rule}
              </p>
            ) : null}
          </section>

          {result.warnings.length > 0 ? (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Watch out for</h2>
              <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
                {result.warnings.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true" className="text-[var(--danger)]">
                      !
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Labels regulators have rejected</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.rejected.map((item) => (
                <span
                  key={item}
                  className="rounded-md bg-[var(--danger-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--danger)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Advertising codes are updated regularly and platform
        rules sit on top of them — check the regulator&apos;s current guidance, and your contract,
        before you publish.
      </p>
    </main>
  );
}
