"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ListChecks, RotateCcw, TriangleAlert } from "lucide-react";

import {
  PLATFORMS,
  RESOLUTIONS,
  buildPreLiveChecklist,
  countChecklistItems,
  recommendStreamSettings,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX =
  "h-5 w-5 shrink-0 rounded border border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DEFAULTS = {
  platform: "twitch",
  resolution: "1080p60",
  uploadMbps: "20",
  audioKbps: "160",
  videoKbps: "",
  hasGuests: false,
  hasGameplay: true,
  hasMusic: false,
  hasAlerts: true,
  hasChatOverlay: true,
  recordsLocally: true,
  hasSecondScreen: true,
  hasCaptureCard: false,
};

const TOGGLES = [
  ["hasGameplay", "Capturing a game or an app window"],
  ["hasSecondScreen", "Using a second monitor"],
  ["hasCaptureCard", "Using a capture card for a console or second device"],
  ["hasGuests", "Guests or a co-host on a call"],
  ["hasMusic", "Playing music on stream"],
  ["hasAlerts", "Follow / sub / donation alerts"],
  ["hasChatOverlay", "Chat overlay on screen"],
  ["recordsLocally", "Recording locally as well"],
];

const DASH = "—";
const NUM = new Intl.NumberFormat("en-US");

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [done, setDone] = useState([]);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const settings = useMemo(
    () =>
      recommendStreamSettings({
        platform: form.platform,
        resolution: form.resolution,
        uploadMbps: form.uploadMbps,
        audioKbps: form.audioKbps,
        videoKbps: form.videoKbps,
      }),
    [form.platform, form.resolution, form.uploadMbps, form.audioKbps, form.videoKbps],
  );

  const sections = useMemo(
    () =>
      buildPreLiveChecklist({
        hasGuests: form.hasGuests,
        hasGameplay: form.hasGameplay,
        hasMusic: form.hasMusic,
        hasAlerts: form.hasAlerts,
        hasChatOverlay: form.hasChatOverlay,
        recordsLocally: form.recordsLocally,
        hasSecondScreen: form.hasSecondScreen,
        hasCaptureCard: form.hasCaptureCard,
        platformLabel: settings.error ? "your platform" : settings.platformLabel,
        keyframeSeconds: settings.error ? undefined : settings.keyframeSeconds,
        videoKbps: settings.error ? 0 : settings.videoKbps,
      }),
    [form, settings],
  );

  const total = countChecklistItems(sections);
  const completed = sections.reduce(
    (count, section) =>
      count + section.items.filter((_, index) => done.includes(`${section.id}-${index}`)).length,
    0,
  );

  const toggleItem = (itemId) => {
    setDone((prev) => (prev.includes(itemId) ? prev.filter((entry) => entry !== itemId) : [...prev, itemId]));
    setCopied(false);
  };

  const summary = useMemo(() => {
    const header = settings.error
      ? ["Pre-live checklist"]
      : [
          `Pre-live checklist — ${settings.platformLabel} ${settings.resolutionLabel}`,
          `Video ${settings.videoKbps} kbps + audio ${settings.audioKbps} kbps = ${settings.totalKbps} kbps`,
          `Upload needed: about ${settings.requiredUploadMbps} Mbps`,
          `Keyframe interval: ${settings.keyframeSeconds} seconds`,
        ];
    const body = sections.flatMap((section) => [
      "",
      `## ${section.title}`,
      ...section.items.map(
        (item, index) => `${done.includes(`${section.id}-${index}`) ? "[x]" : "[ ]"} ${item}`,
      ),
    ]);
    return [...header, ...body].join("\n");
  }, [settings, sections, done]);

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
    if (
      !window.confirm(
        "Reset the builder? This clears every setting and every item you've ticked as done, and cannot be undone.",
      )
    ) {
      return;
    }
    setForm(DEFAULTS);
    setDone([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          Go live
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">OBS Scene Checklist Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out the bitrate and upload headroom your stream actually needs, then run a
          pre-live checklist built around the sources, guests and alerts you really use.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="obs-platform">
              Platform
            </label>
            <select
              id="obs-platform"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.platform}
              onChange={setField("platform")}
            >
              {Object.entries(PLATFORMS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="obs-resolution">
              Output resolution
            </label>
            <select
              id="obs-resolution"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.resolution}
              onChange={setField("resolution")}
            >
              {Object.entries(RESOLUTIONS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="obs-upload">
              Measured upload speed (Mbps)
            </label>
            <input
              id="obs-upload"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={form.uploadMbps}
              onChange={setField("uploadMbps")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="obs-audio">
              Audio bitrate (kbps)
            </label>
            <input
              id="obs-audio"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="32"
              value={form.audioKbps}
              onChange={setField("audioKbps")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="obs-video">
              Video bitrate override (kbps, blank = recommended)
            </label>
            <input
              id="obs-video"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="250"
              value={form.videoKbps}
              onChange={setField("videoKbps")}
              placeholder="Leave blank for the platform recommendation"
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">What is in this stream?</legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {TOGGLES.map(([key, text]) => (
              <label
                key={key}
                className="flex min-h-11 cursor-pointer items-center gap-3 px-1 text-sm font-medium"
                htmlFor={`obs-${key}`}
              >
                <input
                  id={`obs-${key}`}
                  type="checkbox"
                  className={CHECKBOX}
                  checked={Boolean(form[key])}
                  onChange={setField(key)}
                />
                <span>{text}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {settings.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {settings.error}
          </p>
          <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total ingest bitrate
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {["Video", "Audio", "Upload needed", "Keyframe interval"].map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold text-[var(--muted-foreground)]">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div aria-live="polite" role="status">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Total ingest bitrate
              </p>
              <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                {NUM.format(settings.totalKbps)}
                <span className="text-xl text-[var(--muted-foreground)]"> kbps</span>
              </p>
              <p
                className={`mt-1 text-sm font-medium ${settings.headroomOk ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
              >
                {settings.headroomOk
                  ? `Your upload has ${settings.headroomRatio.toFixed(1)}x headroom — comfortable`
                  : `Only ${settings.headroomRatio.toFixed(1)}x headroom — not enough`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={copyResult} aria-label="Copy the checklist and settings" className={GHOST_BTN}>
                {copied ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copied ? "Copied!" : "Copy result"}
              </button>
              <button type="button" onClick={reset} aria-label="Reset the builder" className={PRIMARY_BTN}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {[
              ["Video", `${NUM.format(settings.videoKbps)} kbps (range ${NUM.format(settings.range.min)}–${NUM.format(settings.range.max)})`],
              ["Audio", `${NUM.format(settings.audioKbps)} kbps`],
              ["Upload needed", `about ${settings.requiredUploadMbps} Mbps at a 1.5x margin`],
              ["Keyframe interval", `${settings.keyframeSeconds} seconds`],
              ["Checklist progress", `${completed} of ${total} done`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          {settings.warnings.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm leading-6">
              {settings.warnings.map((warning, index) => (
                <li
                  key={warning}
                  className={
                    index === 0 && !settings.headroomOk
                      ? "flex items-start gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-[var(--danger)]"
                      : "flex items-start gap-2 rounded-md bg-[var(--muted)] px-3 py-2 text-[var(--muted-foreground)]"
                  }
                >
                  <TriangleAlert className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {sections.map((section) => (
        <section key={section.id} className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">{section.title}</h2>
          <ul className="mt-3 space-y-2">
            {section.items.map((item, index) => {
              const itemId = `${section.id}-${index}`;
              const isDone = done.includes(itemId);
              return (
                <li key={itemId} className="rounded-md bg-[var(--muted)] p-3">
                  <label className="flex cursor-pointer items-start gap-3" htmlFor={itemId}>
                    <input
                      id={itemId}
                      type="checkbox"
                      className={`mt-0.5 ${CHECKBOX}`}
                      checked={isDone}
                      onChange={() => toggleItem(itemId)}
                    />
                    <span
                      className={`text-sm leading-6 ${isDone ? "text-[var(--muted-foreground)] line-through" : "text-[var(--foreground)]"}`}
                    >
                      {item}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Bitrate ranges follow each platform&apos;s published live-encoding recommendations and can
        change — check the current ingest guidance if a stream will not transcode.
      </p>
    </main>
  );
}
