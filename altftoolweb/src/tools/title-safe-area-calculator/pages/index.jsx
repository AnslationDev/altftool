"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scan } from "lucide-react";
import { RESOLUTION_PRESETS, SAFE_STANDARDS, computeSafeAreas, findStandard } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  frameWidth: "1920",
  frameHeight: "1080",
  standardId: "ebu-r95",
  actionPercent: "93",
  titlePercent: "90",
};

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [frameWidth, setFrameWidth] = useState(DEFAULTS.frameWidth);
  const [frameHeight, setFrameHeight] = useState(DEFAULTS.frameHeight);
  const [standardId, setStandardId] = useState(DEFAULTS.standardId);
  const [actionPercent, setActionPercent] = useState(DEFAULTS.actionPercent);
  const [titlePercent, setTitlePercent] = useState(DEFAULTS.titlePercent);
  const [copied, setCopied] = useState(false);

  const isCustom = standardId === "custom";
  const standard = findStandard(standardId);

  const result = useMemo(
    () =>
      computeSafeAreas({
        frameWidth: toNumber(frameWidth),
        frameHeight: toNumber(frameHeight),
        standardId,
        actionPercent: toNumber(actionPercent),
        titlePercent: toNumber(titlePercent),
      }),
    [frameWidth, frameHeight, standardId, actionPercent, titlePercent],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Safe area margins",
      `Standard: ${result.standardLabel}`,
      `Frame: ${result.frameWidth} x ${result.frameHeight}`,
      `Action safe (${result.action.percent}%): ${result.action.widthRounded} x ${result.action.heightRounded} px, margin ${result.action.marginXRounded} px left/right and ${result.action.marginYRounded} px top/bottom`,
      `Title safe (${result.title.percent}%): ${result.title.widthRounded} x ${result.title.heightRounded} px, margin ${result.title.marginXRounded} px left/right and ${result.title.marginYRounded} px top/bottom`,
      `Title safe box corners: (${result.title.marginXRounded}, ${result.title.marginYRounded}) to (${Math.round(result.title.right)}, ${Math.round(result.title.bottom)})`,
    ].join("\n");
  }, [hasError, result]);

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
    setFrameWidth(DEFAULTS.frameWidth);
    setFrameHeight(DEFAULTS.frameHeight);
    setStandardId(DEFAULTS.standardId);
    setActionPercent(DEFAULTS.actionPercent);
    setTitlePercent(DEFAULTS.titlePercent);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Action safe size", DASH],
        ["Action safe margins", DASH],
        ["Title safe size", DASH],
        ["Title safe margins", DASH],
        ["Title safe box (left, top)", DASH],
        ["Title safe box (right, bottom)", DASH],
      ]
    : [
        [
          `Action safe size (${result.action.percent}%)`,
          `${NUM.format(result.action.width)} x ${NUM.format(result.action.height)} px`,
        ],
        [
          "Action safe margins (each edge)",
          `${NUM.format(result.action.marginX)} px side · ${NUM.format(result.action.marginY)} px top/bottom`,
        ],
        [
          `Title safe size (${result.title.percent}%)`,
          `${NUM.format(result.title.width)} x ${NUM.format(result.title.height)} px`,
        ],
        [
          "Title safe margins (each edge)",
          `${NUM.format(result.title.marginX)} px side · ${NUM.format(result.title.marginY)} px top/bottom`,
        ],
        [
          "Title safe box (left, top)",
          `${NUM.format(result.title.left)}, ${NUM.format(result.title.top)}`,
        ],
        [
          "Title safe box (right, bottom)",
          `${NUM.format(result.title.right)}, ${NUM.format(result.title.bottom)}`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scan className="h-4 w-4" aria-hidden="true" />
          Broadcast layout
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Title Safe Area Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Action safe and title safe margins in pixels for any frame size, using the EBU R 95 93/90
          rule or the older SMPTE RP 218 90/80 margins.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-width">
              Frame width (px)
            </label>
            <input
              id="ts-width"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={frameWidth}
              onChange={(event) => setFrameWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ts-height">
              Frame height (px)
            </label>
            <input
              id="ts-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={frameHeight}
              onChange={(event) => setFrameHeight(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ts-standard">
              Safe area standard
            </label>
            <select
              id="ts-standard"
              className={`mt-2 ${INPUT_CLASS}`}
              value={standardId}
              onChange={(event) => setStandardId(event.target.value)}
            >
              {SAFE_STANDARDS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {standard ? (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">{standard.note}</p>
            ) : null}
          </div>

          {isCustom ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="ts-action">
                  Action safe (% of frame)
                </label>
                <input
                  id="ts-action"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="50"
                  max="100"
                  step="0.5"
                  value={actionPercent}
                  onChange={(event) => setActionPercent(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ts-title">
                  Title safe (% of frame)
                </label>
                <input
                  id="ts-title"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="50"
                  max="100"
                  step="0.5"
                  value={titlePercent}
                  onChange={(event) => setTitlePercent(event.target.value)}
                />
              </div>
            </>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {RESOLUTION_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setFrameWidth(String(preset.width));
                setFrameHeight(String(preset.height));
              }}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {preset.label}
            </button>
          ))}
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
              Title safe margin
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${NUM.format(result.title.marginX)} px`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the inputs above to see the margins."
                : `left and right · ${NUM.format(result.title.marginY)} px top and bottom`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy safe area margins"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError ? (
          <div className="mt-5">
            <div
              className="relative mx-auto w-full max-w-sm rounded-md border border-[var(--border)] bg-[var(--muted)]"
              style={{ aspectRatio: `${result.frameWidth} / ${result.frameHeight}` }}
              role="img"
              aria-label={`Preview of the ${result.action.percent}% action safe and ${result.title.percent}% title safe rectangles`}
            >
              <div
                className="absolute border border-dashed border-[var(--foreground)]/50"
                style={{
                  left: `${(100 - result.action.percent) / 2}%`,
                  top: `${(100 - result.action.percent) / 2}%`,
                  width: `${result.action.percent}%`,
                  height: `${result.action.percent}%`,
                }}
              />
              <div
                className="absolute border-2 border-[var(--primary)]"
                style={{
                  left: `${(100 - result.title.percent) / 2}%`,
                  top: `${(100 - result.title.percent) / 2}%`,
                  width: `${result.title.percent}%`,
                  height: `${result.title.percent}%`,
                }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
              Dashed line: action safe · solid teal: title safe
            </p>
          </div>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Safe areas are a layout guide, not a legal requirement — always check the delivery
        specification of the broadcaster or platform, which may add its own caption, logo or
        interface exclusion zones on top of these margins.
      </p>
    </main>
  );
}
