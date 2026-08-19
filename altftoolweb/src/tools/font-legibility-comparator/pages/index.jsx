"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Download,
  ExternalLink,
  Eye,
  Info,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  TextCursorInput,
  Type,
} from "lucide-react";

import {
  DEFAULT_TYPOGRAPHY,
  FONT_PRESETS,
  TYPOGRAPHY_LIMITS,
  applyTextSpacingStress,
  buildPreviewStyle,
  buildTypographyReport,
  normalizeTypographySettings,
  summarizeText,
} from "../lib/typographyComparison.mjs";

const SAMPLE =
  "Reading comfort depends on the reader, language, device, lighting, content, and task. Compare the same passage carefully instead of assuming one font works best for everyone.\n\nAdjust size, spacing, line height, weight, and line length. Then test the real interface at zoom and with user overrides.";

const SOURCES = [
  {
    title: "Understanding WCAG 2.2 — Text Spacing",
    href: "https://www.w3.org/WAI/WCAG22/Understanding/text-spacing",
  },
  {
    title: "Understanding WCAG 2.2 — Resize Text",
    href: "https://www.w3.org/WAI/WCAG22/Understanding/resize-text",
  },
];

function downloadJson(value) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "font-legibility-comparison.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function SliderField({
  label,
  value,
  minimum,
  maximum,
  step,
  suffix,
  onChange,
}) {
  return (
    <label className="block">
      <span className="flex justify-between gap-3 text-xs font-bold text-foreground">
        {label}
        <span className="font-mono text-muted-foreground">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={minimum}
        max={maximum}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full accent-primary"
      />
    </label>
  );
}

function SettingsPanel({ label, value, onChange }) {
  const update = (key, next) => {
    onChange(normalizeTypographySettings({ ...value, [key]: next }));
  };

  return (
    <section className="tool-card p-4">
      <h3 className="flex items-center gap-2 font-bold text-foreground">
        <SlidersHorizontal
          className="h-4 w-4 text-primary"
          aria-hidden="true"
        />
        {label}
      </h3>
      <label className="mt-4 block">
        <span className="text-xs font-bold text-foreground">
          Local font stack
        </span>
        <select
          className="input-field mt-2 w-full"
          value={value.preset}
          onChange={(event) => update("preset", event.target.value)}
        >
          {Object.entries(FONT_PRESETS).map(([id, preset]) => (
            <option key={id} value={id}>
              {preset.label}
            </option>
          ))}
        </select>
      </label>
      <div className="mt-5 space-y-5">
        <SliderField
          label="Font size"
          value={value.fontSize}
          minimum={TYPOGRAPHY_LIMITS.fontSize[0]}
          maximum={TYPOGRAPHY_LIMITS.fontSize[1]}
          step={1}
          suffix="px"
          onChange={(next) => update("fontSize", next)}
        />
        <SliderField
          label="Line height"
          value={value.lineHeight}
          minimum={TYPOGRAPHY_LIMITS.lineHeight[0]}
          maximum={TYPOGRAPHY_LIMITS.lineHeight[1]}
          step={0.05}
          suffix="×"
          onChange={(next) => update("lineHeight", next)}
        />
        <SliderField
          label="Letter spacing"
          value={value.letterSpacing}
          minimum={TYPOGRAPHY_LIMITS.letterSpacing[0]}
          maximum={TYPOGRAPHY_LIMITS.letterSpacing[1]}
          step={0.01}
          suffix="em"
          onChange={(next) => update("letterSpacing", next)}
        />
        <SliderField
          label="Word spacing"
          value={value.wordSpacing}
          minimum={TYPOGRAPHY_LIMITS.wordSpacing[0]}
          maximum={TYPOGRAPHY_LIMITS.wordSpacing[1]}
          step={0.01}
          suffix="em"
          onChange={(next) => update("wordSpacing", next)}
        />
        <SliderField
          label="Line measure"
          value={value.measure}
          minimum={TYPOGRAPHY_LIMITS.measure[0]}
          maximum={TYPOGRAPHY_LIMITS.measure[1]}
          step={1}
          suffix="ch"
          onChange={(next) => update("measure", next)}
        />
        <label className="block">
          <span className="text-xs font-bold text-foreground">Font weight</span>
          <select
            className="input-field mt-2 w-full"
            value={value.weight}
            onChange={(event) => update("weight", Number(event.target.value))}
          >
            <option value="400">400 — Regular</option>
            <option value="500">500 — Medium</option>
            <option value="600">600 — Semi-bold</option>
            <option value="700">700 — Bold</option>
          </select>
        </label>
        <SliderField
          label="Paragraph spacing"
          value={value.paragraphSpacing}
          minimum={0}
          maximum={3}
          step={0.1}
          suffix="em"
          onChange={(next) => update("paragraphSpacing", next)}
        />
      </div>
    </section>
  );
}

function PreviewPanel({ label, text, settings, preferred, onPreference }) {
  const style = buildPreviewStyle(settings);
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
  return (
    <article
      className={`tool-card overflow-hidden ${
        preferred ? "border-primary" : ""
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-soft p-4">
        <div>
          <h3 className="font-bold text-foreground">{label}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {FONT_PRESETS[settings.preset].label}
          </p>
        </div>
        <button
          type="button"
          className={preferred ? "btn-primary" : "btn-secondary"}
          aria-pressed={preferred}
          onClick={onPreference}
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          {preferred ? "Preferred here" : "Prefer this view"}
        </button>
      </div>
      <div className="min-h-80 overflow-auto p-5 sm:p-6">
        <div style={style} className="mx-auto text-foreground">
          {paragraphs.length ? (
            paragraphs.map((paragraph, index) => (
              <p
                key={`${index}-${paragraph.slice(0, 20)}`}
                style={{
                  marginBottom:
                    index === paragraphs.length - 1
                      ? 0
                      : `${settings.paragraphSpacing}em`,
                }}
              >
                {paragraph}
              </p>
            ))
          ) : (
            <p className="text-muted-foreground">
              Enter a reading sample above.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export default function FontLegibilityComparator() {
  const [text, setText] = useState(SAMPLE);
  const [left, setLeft] = useState({ ...DEFAULT_TYPOGRAPHY });
  const [right, setRight] = useState({
    ...DEFAULT_TYPOGRAPHY,
    preset: "serif",
    fontSize: 20,
  });
  const [preference, setPreference] = useState("");
  const summary = useMemo(() => summarizeText(text), [text]);
  const report = useMemo(
    () => buildTypographyReport({ text, left, right }),
    [left, right, text],
  );

  const reset = () => {
    setText(SAMPLE);
    setLeft({ ...DEFAULT_TYPOGRAPHY });
    setRight({
      ...DEFAULT_TYPOGRAPHY,
      preset: "serif",
      fontSize: 20,
    });
    setPreference("");
  };

  const swap = () => {
    setLeft(right);
    setRight(left);
    setPreference((current) =>
      current === "left" ? "right" : current === "right" ? "left" : "",
    );
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="tool-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-pill bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              <Type className="h-4 w-4" aria-hidden="true" />
              Side-by-side local preview
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Font Legibility Comparator
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Compare the same text under two local font stacks and adjustable
              reading settings, then record which view works better for this
              reader and task.
            </p>
          </div>
          <div className="rounded-lg border border-warning bg-warning-soft p-4 lg:max-w-sm">
            <p className="flex items-center gap-2 font-bold text-foreground">
              <Info className="h-5 w-5 text-warning" aria-hidden="true" />
              No universal “best font”
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Font availability, rendering, script coverage, zoom, vision,
              cognition, language, and personal preference can change the
              result.
            </p>
          </div>
        </div>
      </header>

      <section className="tool-card p-5 sm:p-6">
        <label className="block">
          <span className="flex items-center gap-2 text-lg font-bold text-foreground">
            <TextCursorInput
              className="h-5 w-5 text-primary"
              aria-hidden="true"
            />
            Private reading sample
          </span>
          <textarea
            className="input-field mt-3 min-h-36 w-full resize-y"
            value={text}
            maxLength={TYPOGRAPHY_LIMITS.textCharacters}
            onChange={(event) => {
              setText(event.target.value);
              setPreference("");
            }}
            placeholder="Paste the exact language and content type you need to review…"
          />
        </label>
        <div className="mt-2 flex flex-wrap justify-between gap-3 text-xs text-muted-foreground">
          <span>
            {summary.words} words · {summary.paragraphs} paragraphs ·{" "}
            {summary.scriptCount} detected script group
            {summary.scriptCount === 1 ? "" : "s"}
          </span>
          <span>
            {summary.characters.toLocaleString("en-US")} /{" "}
            {TYPOGRAPHY_LIMITS.textCharacters.toLocaleString("en-US")}{" "}
            characters
            {summary.truncated ? " (truncated to the limit)" : ""}
          </span>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsPanel
          label="View A settings"
          value={left}
          onChange={setLeft}
        />
        <SettingsPanel
          label="View B settings"
          value={right}
          onChange={setRight}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn-secondary min-h-11" onClick={swap}>
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
          Swap views
        </button>
        <button
          type="button"
          className="btn-secondary min-h-11"
          onClick={() => {
            setRight(applyTextSpacingStress(right));
            setPreference("");
          }}
        >
          <Type className="h-4 w-4" aria-hidden="true" />
          Apply spacing stress to B
        </button>
        <button
          type="button"
          className="btn-secondary min-h-11"
          onClick={reset}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
        <button
          type="button"
          className="btn-secondary min-h-11"
          onClick={() => downloadJson(report)}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Download settings-only report
        </button>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <PreviewPanel
          label="View A"
          text={text}
          settings={left}
          preferred={preference === "left"}
          onPreference={() =>
            setPreference((current) => (current === "left" ? "" : "left"))
          }
        />
        <PreviewPanel
          label="View B"
          text={text}
          settings={right}
          preferred={preference === "right"}
          onPreference={() =>
            setPreference((current) => (current === "right" ? "" : "right"))
          }
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-lg border border-border bg-surface-soft p-5 xl:col-span-2">
          <h2 className="font-bold text-foreground">
            How to use the comparison
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>
              Use real content, language, device, zoom, and lighting where
              possible.
            </li>
            <li>
              Check sustained reading as well as quick labels, forms, and dense
              data.
            </li>
            <li>
              Ask the intended reader; a selected preference here is not
              exported or generalized.
            </li>
            <li>
              The spacing-stress button applies WCAG test values to preview
              adaptability. Those values are not a required default design.
            </li>
          </ul>
        </section>

        <aside className="tool-card p-5">
          <h2 className="flex items-center gap-2 font-bold text-foreground">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            Official references
          </h2>
          <ul className="mt-4 space-y-3">
            {SOURCES.map((source) => (
              <li key={source.href}>
                <a
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-start gap-2 text-sm font-semibold leading-relaxed text-primary underline-offset-4 hover:underline"
                >
                  {source.title}
                  <ExternalLink
                    className="mt-1 h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            W3C/WAI sources accessed 24 July 2026. The settings report excludes
            sample text, preference, and any external font request.
          </p>
        </aside>
      </div>
    </main>
  );
}
