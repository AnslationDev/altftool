"use client";

import { useMemo, useState } from "react";
import { Check, Copy, LayoutTemplate, RotateCcw } from "lucide-react";
import {
  CAM_CORNERS,
  CANVAS_PRESETS,
  DEFAULT_MARGIN_PERCENT,
  SOURCE_ASPECTS,
  formatTransformList,
  planScene,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const DEC = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  preset: "1080p",
  aspect: "16:9",
  margin: String(DEFAULT_MARGIN_PERCENT),
  showChat: true,
  chat: "18",
  chatSide: "right",
  gutter: "1",
  cam: "22",
  camCorner: "bottom-right",
  camInset: "1",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const SOURCE_STYLES = {
  capture: "bg-[var(--primary)]/15 ring-[var(--primary)] text-[var(--primary)]",
  facecam: "bg-[var(--success)]/20 ring-[var(--success)] text-[var(--success)]",
  chat: "bg-[var(--muted)] ring-[var(--border)] text-[var(--muted-foreground)]",
};

export default function ToolHome() {
  const [preset, setPreset] = useState(DEFAULTS.preset);
  const [aspect, setAspect] = useState(DEFAULTS.aspect);
  const [margin, setMargin] = useState(DEFAULTS.margin);
  const [showChat, setShowChat] = useState(DEFAULTS.showChat);
  const [chat, setChat] = useState(DEFAULTS.chat);
  const [chatSide, setChatSide] = useState(DEFAULTS.chatSide);
  const [gutter, setGutter] = useState(DEFAULTS.gutter);
  const [cam, setCam] = useState(DEFAULTS.cam);
  const [camCorner, setCamCorner] = useState(DEFAULTS.camCorner);
  const [camInset, setCamInset] = useState(DEFAULTS.camInset);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planScene({
        preset,
        aspect,
        marginPercent: Number(margin),
        showChat,
        chatPercent: Number(chat),
        chatSide,
        gutterPercent: Number(gutter),
        camPercent: Number(cam),
        camCorner,
        camInsetPercent: Number(camInset),
      }),
    [preset, aspect, margin, showChat, chat, chatSide, gutter, cam, camCorner, camInset],
  );

  const failed = Boolean(plan.error);
  const transforms = useMemo(() => (failed ? "" : formatTransformList(plan)), [plan, failed]);

  const copyResult = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(transforms);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setPreset(DEFAULTS.preset);
    setAspect(DEFAULTS.aspect);
    setMargin(DEFAULTS.margin);
    setShowChat(DEFAULTS.showChat);
    setChat(DEFAULTS.chat);
    setChatSide(DEFAULTS.chatSide);
    setGutter(DEFAULTS.gutter);
    setCam(DEFAULTS.cam);
    setCamCorner(DEFAULTS.camCorner);
    setCamInset(DEFAULTS.camInset);
    setCopied(false);
  };

  const numberFields = [
    ["scene-margin", "Outer margin (% per side)", margin, setMargin, "0", "20", "0.5"],
    ["scene-cam", "Facecam width (% of canvas)", cam, setCam, "1", "60", "1"],
    ["scene-cam-inset", "Facecam inset from edge (%)", camInset, setCamInset, "0", "10", "0.5"],
    ["scene-chat", "Chat width (% of canvas)", chat, setChat, "1", "50", "1"],
    ["scene-gutter", "Gutter beside chat (%)", gutter, setGutter, "0", "10", "0.5"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <LayoutTemplate className="h-4 w-4" aria-hidden="true" />
          Stream kits
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Stream Scene Layout Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Place the capture, facecam and chat on your stream canvas and get exact pixel coordinates
          for the OBS transform dialog. Margins follow the SMPTE action-safe inset and the capture
          is aspect-fitted, so letterbox bars are reported rather than hidden.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="scene-preset">
              Stream canvas
            </label>
            <select
              id="scene-preset"
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
            <label className={LABEL_CLASS} htmlFor="scene-aspect">
              Capture aspect ratio
            </label>
            <select
              id="scene-aspect"
              className={`mt-2 ${INPUT_CLASS}`}
              value={aspect}
              onChange={(event) => setAspect(event.target.value)}
            >
              {Object.values(SOURCE_ASPECTS).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="scene-corner">
              Facecam corner
            </label>
            <select
              id="scene-corner"
              className={`mt-2 ${INPUT_CLASS}`}
              value={camCorner}
              onChange={(event) => setCamCorner(event.target.value)}
            >
              {Object.values(CAM_CORNERS).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="scene-chat-side">
              Chat side
            </label>
            <select
              id="scene-chat-side"
              className={`mt-2 ${INPUT_CLASS}`}
              value={chatSide}
              onChange={(event) => setChatSide(event.target.value)}
              disabled={!showChat}
            >
              <option value="right">Right</option>
              <option value="left">Left</option>
            </select>
          </div>
          {numberFields.map(([id, label, value, setter, min, max, step]) => (
            <div key={id}>
              <label className={LABEL_CLASS} htmlFor={id}>
                {label}
              </label>
              <input
                id={id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(event) => setter(event.target.value)}
              />
            </div>
          ))}
        </div>

        <label className="mt-4 flex min-h-11 items-center gap-3 text-sm" htmlFor="scene-show-chat">
          <input
            id="scene-show-chat"
            type="checkbox"
            className={CHECK_CLASS}
            checked={showChat}
            onChange={(event) => setShowChat(event.target.checked)}
          />
          <span>Reserve a column for a chat panel</span>
        </label>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Capture size on canvas
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? "—" : `${NUM.format(plan.capture.width)} × ${NUM.format(plan.capture.height)}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to see the layout."
                : `${DEC.format(plan.captureScalePercent)}% of canvas width · facecam covers ${DEC.format(plan.camCoveragePercent)}% of it`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the OBS transform coordinates"
              className={PRIMARY_BTN}
              disabled={failed}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy transforms"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the layout" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg ring-1 ring-[var(--border)] bg-[var(--muted)]">
          {failed ? (
            <div className="flex aspect-video items-center justify-center text-sm text-[var(--muted-foreground)]">
              No layout
            </div>
          ) : (
            <div
              className="relative w-full"
              style={{ aspectRatio: `${plan.canvas.width} / ${plan.canvas.height}` }}
              role="img"
              aria-label={`Scene layout preview: capture ${plan.capture.width} by ${plan.capture.height} pixels, facecam in the ${camCorner.replace("-", " ")} corner`}
            >
              <div
                className="absolute border border-dashed border-[var(--border)]"
                style={{
                  left: `${(plan.safeArea.title.x / plan.canvas.width) * 100}%`,
                  top: `${(plan.safeArea.title.y / plan.canvas.height) * 100}%`,
                  width: `${(plan.safeArea.title.width / plan.canvas.width) * 100}%`,
                  height: `${(plan.safeArea.title.height / plan.canvas.height) * 100}%`,
                }}
              />
              {plan.sources.map((entry) => (
                <div
                  key={entry.id}
                  className={`absolute flex items-center justify-center rounded-sm text-[10px] font-semibold ring-1 sm:text-xs ${SOURCE_STYLES[entry.id]}`}
                  style={{
                    left: `${entry.percent.x}%`,
                    top: `${entry.percent.y}%`,
                    width: `${entry.percent.width}%`,
                    height: `${entry.percent.height}%`,
                  }}
                >
                  {entry.id === "capture" ? "Capture" : entry.id === "facecam" ? "Cam" : "Chat"}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[340px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Source</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Position X, Y</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Size W × H</th>
                <th scope="col" className="py-2 text-right font-semibold">Canvas</th>
              </tr>
            </thead>
            <tbody>
              {failed ? (
                <tr>
                  <td className="py-2 pr-3 font-semibold">—</td>
                  <td className="py-2 pr-3 text-right">—</td>
                  <td className="py-2 pr-3 text-right">—</td>
                  <td className="py-2 text-right">—</td>
                </tr>
              ) : (
                plan.sources.map((entry) => (
                  <tr key={entry.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{entry.name}</td>
                    <td className="py-2 pr-3 text-right">
                      {NUM.format(entry.rect.x)}, {NUM.format(entry.rect.y)}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {NUM.format(entry.rect.width)} × {NUM.format(entry.rect.height)}
                    </td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {DEC.format(entry.areaShare)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Letterbox bars (top and bottom)", failed ? "—" : `${NUM.format(plan.letterboxPx)} px`],
            ["Pillarbox bars (left and right)", failed ? "—" : `${NUM.format(plan.pillarboxPx)} px`],
            [
              "Title-safe box",
              failed
                ? "—"
                : `${NUM.format(plan.safeArea.title.width)} × ${NUM.format(plan.safeArea.title.height)} px at ${NUM.format(plan.safeArea.title.x)}, ${NUM.format(plan.safeArea.title.y)}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && plan.warnings.length > 0 ? (
          <ul className="mt-4 space-y-1 text-xs text-[var(--muted-foreground)]">
            {plan.warnings.map((warning) => (
              <li key={warning}>• {warning}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Coordinates assume the source is scaled to the size shown, with no crop and no rotation. In
        OBS, set Positional Alignment to Top Left in Edit Transform so the X and Y values line up.
      </p>
    </main>
  );
}
