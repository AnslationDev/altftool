"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Copy, Download, MessageSquareQuote, RotateCcw } from "lucide-react";

import {
  buildQuoteCard,
  CARD_PRESETS,
  DISPLAY_NAME_MAX,
  POST_CHAR_LIMIT,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULTS = {
  text: "Ship the boring version first, then earn the right to make it clever.",
  displayName: "ALTFTool",
  handle: "@altftool",
  dateISO: "2026-07-28",
  time24: "09:41",
  replies: "128",
  reposts: "1299",
  likes: "24500",
  presetId: "square",
  showMetrics: true,
  showAvatar: true,
  accent: false,
};

/** CSS custom properties the exported SVG needs baked in, keyed by role. */
const TOKEN_BY_ROLE = {
  surface: "--card",
  surfaceAccent: "--primary",
  ink: "--foreground",
  inkAccent: "--primary-foreground",
  sub: "--muted-foreground",
  accent: "--primary",
  line: "--border",
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
  const [text, setText] = useState(DEFAULTS.text);
  const [displayName, setDisplayName] = useState(DEFAULTS.displayName);
  const [handle, setHandle] = useState(DEFAULTS.handle);
  const [dateISO, setDateISO] = useState(DEFAULTS.dateISO);
  const [time24, setTime24] = useState(DEFAULTS.time24);
  const [replies, setReplies] = useState(DEFAULTS.replies);
  const [reposts, setReposts] = useState(DEFAULTS.reposts);
  const [likes, setLikes] = useState(DEFAULTS.likes);
  const [presetId, setPresetId] = useState(DEFAULTS.presetId);
  const [showMetrics, setShowMetrics] = useState(DEFAULTS.showMetrics);
  const [showAvatar, setShowAvatar] = useState(DEFAULTS.showAvatar);
  const [accent, setAccent] = useState(DEFAULTS.accent);
  const [copied, setCopied] = useState(false);

  const svgRef = useRef(null);

  const card = useMemo(
    () =>
      buildQuoteCard({
        text,
        displayName,
        handle,
        dateISO,
        time24,
        replies,
        reposts,
        likes,
        presetId,
        showMetrics,
        showAvatar,
      }),
    [text, displayName, handle, dateISO, time24, replies, reposts, likes, presetId, showMetrics, showAvatar],
  );

  const error = card.error || null;
  const inkRole = accent ? "inkAccent" : "ink";
  const subRole = accent ? "inkAccent" : "sub";
  const surfaceRole = accent ? "surfaceAccent" : "surface";

  const summary = useMemo(() => {
    if (error) return "";
    return [
      "Tweet Screenshot Styler",
      `${card.displayName} ${card.handle}`,
      "",
      text.trim(),
      "",
      card.meta,
      card.metrics.length
        ? card.metrics.map((metric) => `${metric.value} ${metric.label.toLowerCase()}`).join(" · ")
        : "",
      `Card: ${card.width} × ${card.height} px · ${card.lineCount} lines at ${card.bodySize} px`,
    ]
      .filter((line) => line !== undefined)
      .join("\n");
  }, [error, card, text]);

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

  const downloadSvg = () => {
    const node = svgRef.current;
    if (!node || error) return;
    const styles = getComputedStyle(node);
    const resolved = {};
    Object.entries(TOKEN_BY_ROLE).forEach(([role, token]) => {
      resolved[role] = styles.getPropertyValue(token).trim();
    });

    const clone = node.cloneNode(true);
    clone.querySelectorAll("[data-fill]").forEach((element) => {
      const role = element.getAttribute("data-fill");
      if (resolved[role]) element.setAttribute("fill", resolved[role]);
      element.removeAttribute("style");
    });
    clone.querySelectorAll("[data-stroke]").forEach((element) => {
      const role = element.getAttribute("data-stroke");
      if (resolved[role]) element.setAttribute("stroke", resolved[role]);
      element.removeAttribute("style");
    });

    const markup = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `quote-card-${presetId}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setText(DEFAULTS.text);
    setDisplayName(DEFAULTS.displayName);
    setHandle(DEFAULTS.handle);
    setDateISO(DEFAULTS.dateISO);
    setTime24(DEFAULTS.time24);
    setReplies(DEFAULTS.replies);
    setReposts(DEFAULTS.reposts);
    setLikes(DEFAULTS.likes);
    setPresetId(DEFAULTS.presetId);
    setShowMetrics(DEFAULTS.showMetrics);
    setShowAvatar(DEFAULTS.showAvatar);
    setAccent(DEFAULTS.accent);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <MessageSquareQuote className="h-4 w-4" aria-hidden="true" />
          Quote graphics
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Tweet Screenshot Styler</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste your own post, pick a placement size, and get a clean quote card that auto-sizes the
          type to fill the space. Everything renders in your browser.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="tss-text">
              Post text
            </label>
            <textarea
              id="tss-text"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {error
                ? `Limit is ${POST_CHAR_LIMIT} characters on a free X account.`
                : `${NUM.format(card.charCount)} characters · ${NUM.format(card.charsRemaining)} left of the ${POST_CHAR_LIMIT}-character free limit`}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="tss-name">
                Display name
              </label>
              <input
                id="tss-name"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                maxLength={DISPLAY_NAME_MAX}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="tss-handle">
                Handle
              </label>
              <input
                id="tss-handle"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                value={handle}
                onChange={(event) => setHandle(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="tss-date">
                Post date
              </label>
              <input
                id="tss-date"
                className={`mt-2 ${INPUT_CLASS}`}
                type="date"
                value={dateISO}
                onChange={(event) => setDateISO(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="tss-time">
                Post time (24-hour)
              </label>
              <input
                id="tss-time"
                className={`mt-2 ${INPUT_CLASS}`}
                type="time"
                value={time24}
                onChange={(event) => setTime24(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="tss-replies">
                Replies
              </label>
              <input
                id="tss-replies"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={replies}
                onChange={(event) => setReplies(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="tss-reposts">
                Reposts
              </label>
              <input
                id="tss-reposts"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={reposts}
                onChange={(event) => setReposts(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="tss-likes">
                Likes
              </label>
              <input
                id="tss-likes"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={likes}
                onChange={(event) => setLikes(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="tss-preset">
                Export size
              </label>
              <select
                id="tss-preset"
                className={`mt-2 ${INPUT_CLASS}`}
                value={presetId}
                onChange={(event) => setPresetId(event.target.value)}
              >
                {CARD_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {[
              ["tss-avatar", "Show avatar", showAvatar, setShowAvatar],
              ["tss-metrics", "Show engagement", showMetrics, setShowMetrics],
              ["tss-accent", "Accent background", accent, setAccent],
            ].map(([id, label, value, setter]) => (
              <label
                key={id}
                htmlFor={id}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              >
                <input
                  id={id}
                  type="checkbox"
                  className="h-5 w-5 accent-[var(--primary)]"
                  checked={value}
                  onChange={(event) => setter(event.target.checked)}
                />
                {label}
              </label>
            ))}
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
              Export size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error ? "—" : `${card.width} × ${card.height}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error ? "Fix the input above to build the card." : `pixels · ${card.preset.label}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the post text and card details"
              className={GHOST_BTN}
              disabled={!summary}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={downloadSvg}
              aria-label="Download the quote card as an SVG file"
              className={GHOST_BTN}
              disabled={Boolean(error)}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              SVG
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Characters used", error ? "—" : `${NUM.format(card.charCount)} of ${POST_CHAR_LIMIT}`],
            ["Lines after wrapping", error ? "—" : NUM.format(card.lineCount)],
            ["Body type size", error ? "—" : `${NUM.format(card.bodySize)} px`],
            ["Text block height", error ? "—" : `${NUM.format(Math.round(card.blockHeight))} px of ${NUM.format(Math.round(card.availableBody))} px available`],
            ["Timestamp line", error ? "—" : card.meta],
            [
              "Engagement shown",
              error || card.metrics.length === 0
                ? "—"
                : card.metrics.map((metric) => `${metric.value} ${metric.label.toLowerCase()}`).join(" · "),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!error && card.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {card.warnings.map((warning) => (
              <li key={warning} className="rounded-md bg-[var(--muted)] px-3 py-2">
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {error ? null : (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Preview</h2>
          <div className="mt-3 overflow-x-auto">
            <svg
              ref={svgRef}
              xmlns="http://www.w3.org/2000/svg"
              viewBox={`0 0 ${card.width} ${card.height}`}
              width="100%"
              className="mx-auto block h-auto w-full max-w-[420px] rounded-lg ring-1 ring-[var(--border)]"
              role="img"
              aria-label={`Quote card for ${card.displayName} ${card.handle}: ${text.trim()}`}
            >
              <rect
                x="0"
                y="0"
                width={card.width}
                height={card.height}
                data-fill={surfaceRole}
                style={{ fill: `var(${TOKEN_BY_ROLE[surfaceRole]})` }}
              />
              <rect
                x="0"
                y="0"
                width={card.width}
                height={Math.round(card.width * 0.012)}
                data-fill="accent"
                style={{ fill: `var(${TOKEN_BY_ROLE.accent})` }}
                opacity={accent ? 0 : 1}
              />

              {card.avatarSize > 0 ? (
                <>
                  <circle
                    cx={card.padding + card.avatarSize / 2}
                    cy={card.padding + card.avatarSize / 2}
                    r={card.avatarSize / 2}
                    data-fill="accent"
                    style={{ fill: `var(${TOKEN_BY_ROLE.accent})` }}
                    opacity="0.85"
                  />
                  <text
                    x={card.padding + card.avatarSize / 2}
                    y={card.padding + card.avatarSize / 2 + card.handleSize * 0.36}
                    textAnchor="middle"
                    fontFamily="system-ui, sans-serif"
                    fontSize={card.handleSize}
                    fontWeight="700"
                    data-fill="inkAccent"
                    style={{ fill: `var(${TOKEN_BY_ROLE.inkAccent})` }}
                  >
                    {card.initials}
                  </text>
                </>
              ) : null}

              <text
                x={card.padding + (card.avatarSize ? card.avatarSize + card.padding * 0.35 : 0)}
                y={card.padding + card.nameSize}
                fontFamily="system-ui, sans-serif"
                fontSize={card.nameSize}
                fontWeight="700"
                data-fill={inkRole}
                style={{ fill: `var(${TOKEN_BY_ROLE[inkRole]})` }}
              >
                {card.displayName}
              </text>
              <text
                x={card.padding + (card.avatarSize ? card.avatarSize + card.padding * 0.35 : 0)}
                y={card.padding + card.nameSize + card.handleSize * 1.3}
                fontFamily="system-ui, sans-serif"
                fontSize={card.handleSize}
                data-fill={subRole}
                style={{ fill: `var(${TOKEN_BY_ROLE[subRole]})`, opacity: accent ? 0.8 : 1 }}
              >
                {card.handle}
              </text>

              {card.bodyLines.map((line) => (
                <text
                  key={line.key}
                  x={card.padding}
                  y={line.y}
                  fontFamily="system-ui, sans-serif"
                  fontSize={card.bodySize}
                  fontWeight="600"
                  data-fill={inkRole}
                  style={{ fill: `var(${TOKEN_BY_ROLE[inkRole]})` }}
                >
                  {line.text}
                </text>
              ))}

              <line
                x1={card.padding}
                y1={card.dividerY}
                x2={card.width - card.padding}
                y2={card.dividerY}
                strokeWidth="2"
                data-stroke={accent ? "inkAccent" : "line"}
                style={{ stroke: `var(${accent ? TOKEN_BY_ROLE.inkAccent : TOKEN_BY_ROLE.line})`, opacity: accent ? 0.4 : 1 }}
              />

              <text
                x={card.padding}
                y={card.metaBaseline}
                fontFamily="system-ui, sans-serif"
                fontSize={card.metaSize}
                data-fill={subRole}
                style={{ fill: `var(${TOKEN_BY_ROLE[subRole]})`, opacity: accent ? 0.8 : 1 }}
              >
                {card.meta}
              </text>

              {card.metrics.map((metric, index) => (
                <text
                  key={metric.id}
                  x={card.padding + index * (card.contentWidth / 3)}
                  y={card.metricsBaseline}
                  fontFamily="system-ui, sans-serif"
                  fontSize={card.metricSize}
                  data-fill={inkRole}
                  style={{ fill: `var(${TOKEN_BY_ROLE[inkRole]})` }}
                >
                  <tspan fontWeight="700">{metric.value}</tspan>
                  <tspan> {metric.label.toLowerCase()}</tspan>
                </text>
              ))}
            </svg>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Made for restyling your own posts. Reposting someone else's words as a graphic still needs
        their credit, and platform brand guidelines restrict using official logos or UI chrome in
        marketing material.
      </p>
    </main>
  );
}
