"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, MonitorPlay, RotateCcw } from "lucide-react";
import {
  CANVAS_PRESETS,
  DEFAULT_ACCENT_RGB,
  DEFAULT_BACKGROUND_RGB,
  DEFAULT_TEXT_RGB,
  buildBrbScene,
  hexToRgb,
  rgbToHex,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DEC = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DEFAULTS = {
  preset: "1080p",
  headline: "BE RIGHT BACK",
  message: "Grabbing a coffee — chat is open",
  minutes: "5",
  background: rgbToHex(DEFAULT_BACKGROUND_RGB),
  text: rgbToHex(DEFAULT_TEXT_RGB),
  accent: rgbToHex(DEFAULT_ACCENT_RGB),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const COLOR_CLASS =
  "h-11 w-14 shrink-0 cursor-pointer rounded-md border border-[var(--border)] bg-[var(--background)] p-1 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const gradeTone = (grade) =>
  grade && grade.passesAA ? "text-[var(--success)]" : "text-[var(--danger)]";

export default function ToolHome() {
  const [preset, setPreset] = useState(DEFAULTS.preset);
  const [headline, setHeadline] = useState(DEFAULTS.headline);
  const [message, setMessage] = useState(DEFAULTS.message);
  const [minutes, setMinutes] = useState(DEFAULTS.minutes);
  const [background, setBackground] = useState(DEFAULTS.background);
  const [text, setText] = useState(DEFAULTS.text);
  const [accent, setAccent] = useState(DEFAULTS.accent);
  const [showSafeAreas, setShowSafeAreas] = useState(false);
  const [showAccentBar, setShowAccentBar] = useState(true);
  const [copied, setCopied] = useState(false);

  const scene = useMemo(
    () =>
      buildBrbScene({
        preset,
        headline,
        message,
        countdownSeconds: Math.round((Number(minutes) || 0) * 60),
        backgroundRgb: hexToRgb(background),
        textRgb: hexToRgb(text),
        accentRgb: hexToRgb(accent),
        showSafeAreas,
        showAccentBar,
      }),
    [preset, headline, message, minutes, background, text, accent, showSafeAreas, showAccentBar],
  );

  const failed = Boolean(scene.error);

  const previewSrc = useMemo(() => {
    if (failed) return "";
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(scene.svg)}`;
  }, [scene, failed]);

  const copyResult = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(scene.svg);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const downloadSvg = () => {
    if (failed) return;
    const blob = new Blob([scene.svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "brb-screen.svg";
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = () => {
    if (failed) return;
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = scene.width;
      canvas.height = scene.height;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(image, 0, 0, scene.width, scene.height);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "brb-screen.png";
        link.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    };
    image.src = previewSrc;
  };

  const reset = () => {
    setPreset(DEFAULTS.preset);
    setHeadline(DEFAULTS.headline);
    setMessage(DEFAULTS.message);
    setMinutes(DEFAULTS.minutes);
    setBackground(DEFAULTS.background);
    setText(DEFAULTS.text);
    setAccent(DEFAULTS.accent);
    setShowSafeAreas(false);
    setShowAccentBar(true);
    setCopied(false);
  };

  const colourRows = [
    ["brb-bg", "Background", background, setBackground],
    ["brb-text", "Headline & countdown", text, setText],
    ["brb-accent", "Accent & message", accent, setAccent],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MonitorPlay className="h-4 w-4" aria-hidden="true" />
          Stream kits
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Stream BRB Screen Maker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a be-right-back scene at full stream resolution, check the text contrast against
          WCAG 2.2 before you go live, and export it as SVG or PNG for OBS. Layout guides follow the
          SMPTE RP 218 safe areas.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="brb-preset">
              Canvas size
            </label>
            <select
              id="brb-preset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={preset}
              onChange={(event) => setPreset(event.target.value)}
            >
              {Object.values(CANVAS_PRESETS).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="brb-minutes">
              Countdown (minutes, 0 to hide)
            </label>
            <input
              id="brb-minutes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="120"
              step="1"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="brb-headline">
              Headline
            </label>
            <input
              id="brb-headline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={40}
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="brb-message">
              Message under the countdown
            </label>
            <input
              id="brb-message"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              maxLength={70}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {colourRows.map(([id, label, value, setter]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id={id}
                  className={COLOR_CLASS}
                  type="color"
                  value={value}
                  onChange={(event) => setter(event.target.value)}
                />
                <input
                  className={INPUT_CLASS}
                  type="text"
                  value={value}
                  aria-label={`${label} hex value`}
                  onChange={(event) => setter(event.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold">Scene options</legend>
          <div className="mt-2 grid gap-2">
            {[
              ["brb-opt-bar", "Show the accent rule under the headline", showAccentBar, setShowAccentBar],
              ["brb-opt-safe", "Overlay SMPTE action-safe and title-safe guides", showSafeAreas, setShowSafeAreas],
            ].map(([id, label, value, setter]) => (
              <label key={id} className="flex min-h-11 items-center gap-3 text-sm" htmlFor={id}>
                <input
                  id={id}
                  type="checkbox"
                  className={CHECK_CLASS}
                  checked={value}
                  onChange={(event) => setter(event.target.checked)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {scene.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Headline contrast
            </p>
            <p className={`mt-1 text-4xl font-semibold ${failed ? "text-[var(--primary)]" : gradeTone(scene.headlineGrade)}`}>
              {failed ? "—" : `${DEC.format(scene.headlineContrast)}:1`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to render the scene."
                : `${scene.headlineGrade.level} for large text · needs ${scene.headlineGrade.required}:1`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the scene as SVG markup"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy SVG"}
            </button>
            <button
              type="button"
              onClick={downloadPng}
              aria-label="Download the scene as a PNG image"
              className={PRIMARY_BTN}
              disabled={failed}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              PNG
            </button>
            <button
              type="button"
              onClick={downloadSvg}
              aria-label="Download the scene as an SVG file"
              className={GHOST_BTN}
              disabled={failed}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              SVG
            </button>
            <button type="button" onClick={reset} aria-label="Reset the scene" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg ring-1 ring-[var(--border)]">
          {failed ? (
            <div className="flex aspect-video items-center justify-center bg-[var(--muted)] text-sm text-[var(--muted-foreground)]">
              No preview
            </div>
          ) : (
            <img
              src={previewSrc}
              alt={`Preview of the ${headline || "be right back"} scene`}
              width={scene.width}
              height={scene.height}
              className="block h-auto w-full"
            />
          )}
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Export size", failed ? "—" : `${NUM.format(scene.width)} × ${NUM.format(scene.height)} px`],
            ["Headline type size", failed ? "—" : `${NUM.format(scene.headlineSize)} px`],
            ["Countdown shown", failed ? "—" : scene.countdownLabel || "Hidden"],
            [
              "Message contrast",
              failed ? "—" : `${DEC.format(scene.messageContrast)}:1 · ${scene.messageGrade.level}`,
            ],
            [
              "Title-safe box",
              failed
                ? "—"
                : `${NUM.format(scene.safeArea.title.width)} × ${NUM.format(scene.safeArea.title.height)} px inset ${NUM.format(scene.safeArea.title.x)} px`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The countdown is drawn as static text — it does not tick. Use it as a still holding card, or
        pair the exported image with a timer source in OBS if you need live counting.
      </p>
    </main>
  );
}
