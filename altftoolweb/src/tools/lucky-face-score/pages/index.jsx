"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { Check, Clover, Copy, RotateCcw, Upload } from "lucide-react";

import { calculateLuckyScore, MAX_SCORE } from "../lib";

/** Bytes accepted from one photo — 20 MB covers any phone camera JPEG. */
const MAX_FILE_BYTES = 20 * 1024 * 1024;

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-60";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const FILE_INPUT_CLASS =
  "h-11 w-full cursor-pointer rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] file:mr-3 file:h-full file:cursor-pointer file:border-0 file:bg-transparent file:font-semibold file:text-[var(--primary)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN");

function Row({ label, value }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border)] py-2 last:border-b-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-sm font-semibold text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

export default function ToolHome() {
  const [bytes, setBytes] = useState(null);
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [loadError, setLoadError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!previewUrl) return undefined;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const reading = useMemo(
    () => calculateLuckyScore({ bytes, fileName }),
    [bytes, fileName],
  );

  const hasError = Boolean(reading.error) || Boolean(loadError);
  const errorMessage = loadError || reading.error;

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    setCopied(false);
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLoadError("That is not an image file — pick a JPEG, PNG, WebP or HEIC photo.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setLoadError(`That photo is ${NUM.format(Math.round(file.size / 1024 / 1024))} MB. Keep it under 20 MB.`);
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      setBytes(new Uint8Array(buffer));
      setFileName(file.name);
      // The effect above revokes the previous object URL when this changes.
      setPreviewUrl(URL.createObjectURL(file));
      setLoadError("");
    } catch {
      setLoadError("The photo could not be read. Try a different file.");
    }
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Lucky Face Score (for entertainment only)",
      `Score: ${reading.score}/${MAX_SCORE} — ${reading.badgeEmoji} ${reading.badge}`,
      ...reading.facets.map((facet) => `${facet.label}: ${facet.value}/100`),
      `Lucky number: ${reading.luckyNumber}`,
      `Lucky day: ${reading.luckyDay}`,
      `Lucky colour: ${reading.luckyColour}`,
      `Fortune: ${reading.fortune}`,
      `Image fingerprint: ${reading.fingerprint}`,
    ].join("\n");
  }, [hasError, reading]);

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
    setBytes(null);
    setFileName("");
    setPreviewUrl("");
    setLoadError("");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Clover className="h-4 w-4" aria-hidden="true" />
          Just for fun
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Lucky Face Score</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a photo and get a made-up luck score out of 100, with a badge, a fortune and your
          lucky number, day and colour. The score comes from an FNV-1a hash of the file&rsquo;s
          bytes, so the same picture always gives the same reading — and a different picture always
          gives a different one. Your photo never leaves the browser.
        </p>
      </header>

      <section className="grid gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="luck-photo">
            Your photo
          </label>
          <input
            id="luck-photo"
            className={`${FILE_INPUT_CLASS} mt-1`}
            type="file"
            accept="image/*"
            onChange={handleFile}
          />
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Nothing is uploaded — the file is read in the page and hashed locally.
          </p>
        </div>

        {previewUrl ? (
          <img
            src={previewUrl}
            alt="The photo you selected"
            className="max-h-64 w-full rounded-xl object-contain ring-1 ring-[var(--border)]"
          />
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        {hasError ? (
          <p role="alert" className="mb-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {errorMessage}
          </p>
        ) : null}

        <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          Luck score
        </p>
        <p className="mt-1 text-5xl leading-none font-bold">
          {hasError ? DASH : reading.score}
          <span className="ml-1 text-2xl font-semibold text-[var(--muted-foreground)]">/100</span>
        </p>
        <p className="mt-2 text-lg font-semibold text-[var(--primary)]">
          {hasError ? DASH : `${reading.badgeEmoji} ${reading.badge}`}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {hasError ? DASH : reading.badgeNote}
        </p>

        <dl className="mt-4">
          {(hasError
            ? [
                { id: "charm", label: "Charm", value: null },
                { id: "timing", label: "Timing", value: null },
                { id: "fortune", label: "Fortune", value: null },
                { id: "aura", label: "Aura", value: null },
              ]
            : reading.facets
          ).map((facet) => (
            <Row
              key={facet.id}
              label={facet.note ? `${facet.label} — ${facet.note}` : facet.label}
              value={facet.value === null ? DASH : `${facet.value}/100`}
            />
          ))}
          <Row label="Lucky number" value={hasError ? DASH : reading.luckyNumber} />
          <Row label="Lucky day" value={hasError ? DASH : reading.luckyDay} />
          <Row label="Lucky colour" value={hasError ? DASH : reading.luckyColour} />
          <Row
            label="Image fingerprint"
            value={hasError ? DASH : <span className="font-mono">{reading.fingerprint}</span>}
          />
        </dl>

        <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-3 text-sm leading-6 italic">
          {hasError ? "Pick a photo to read your fortune." : `“${reading.fortune}”`}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={copyResult}
            aria-label="Copy the luck reading to the clipboard"
            disabled={hasError}
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied!" : "Copy result"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
          <label className={`${GHOST_BTN} cursor-pointer`} htmlFor="luck-photo">
            <Upload className="h-4 w-4" aria-hidden="true" />
            Choose another photo
          </label>
        </div>
      </section>

      <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
        This is entertainment. There is no face detection, no AI and no measurement of anything
        about you — the numbers are a hash of the file&rsquo;s bytes, which is why they never change
        for the same photo. No image, and no result, is uploaded or stored anywhere.
      </p>
    </main>
  );
}
