"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  Copy,
  Eraser,
  Link2,
  MoveRight,
  Palette,
  RotateCcw,
  Terminal,
  TriangleAlert,
  Wand2,
} from "lucide-react";

import {
  CURSOR_REFERENCE,
  ERASE_REFERENCE,
  ESCAPE_FORMS,
  OSC_REFERENCE,
  REFERENCE_REVIEWED,
  SGR_REFERENCE,
  SUPPORT_LABELS,
  SUPPORT_NOTES,
  buildSgrSequence,
  colorNameLabel,
  decodeAnsiLog,
  formatSequenceReport,
} from "../lib";

/* ------------------------------------------------------------------ */
/* Colour token map                                                    */
/* ------------------------------------------------------------------ */

/*
 * The eight ANSI colour names are mapped onto this page's own semantic design
 * tokens. No terminal palette value is reproduced — a terminal's idea of
 * "red" is its own setting, not something the standard fixes — so the preview
 * is a legibility aid and the sequence table underneath is the exact record.
 * Bright variants take the token at full strength; the base eight take it at
 * reduced strength, which is the only distinction that survives in both light
 * and dark themes without inventing a colour.
 */
const FG_TOKEN = {
  black: "var(--muted-foreground)",
  red: "var(--danger)",
  green: "var(--success)",
  yellow: "var(--warning)",
  blue: "var(--info)",
  magenta: "var(--accent)",
  cyan: "var(--primary)",
  white: "var(--foreground)",
  brightBlack: "var(--muted-foreground)",
  brightRed: "var(--danger)",
  brightGreen: "var(--success)",
  brightYellow: "var(--warning)",
  brightBlue: "var(--info)",
  brightMagenta: "var(--accent)",
  brightCyan: "var(--primary)",
  brightWhite: "var(--foreground)",
  reverse: "var(--card)",
};

const BG_TOKEN = {
  black: "var(--muted)",
  red: "var(--danger-soft)",
  green: "var(--success-soft)",
  yellow: "var(--warning-soft)",
  blue: "var(--info-soft)",
  magenta: "var(--accent-soft)",
  cyan: "var(--primary-soft)",
  white: "var(--muted)",
  brightBlack: "var(--muted)",
  brightRed: "var(--danger-soft)",
  brightGreen: "var(--success-soft)",
  brightYellow: "var(--warning-soft)",
  brightBlue: "var(--info-soft)",
  brightMagenta: "var(--accent-soft)",
  brightCyan: "var(--primary-soft)",
  brightWhite: "var(--muted)",
  reverse: "var(--foreground)",
};

/** Strength lookup, not a calculation: [bright][dim] -> percentage of token kept. */
const STRENGTH = {
  bright: { on: 62, off: 100 },
  base: { on: 46, off: 78 },
};

function tint(token, percent) {
  if (percent >= 100) return token;
  return `color-mix(in srgb, ${token} ${percent}%, transparent)`;
}

function segmentStyle(seg) {
  const isBright = typeof seg.fg === "string" && seg.fg.startsWith("bright");
  const strength = STRENGTH[isBright ? "bright" : "base"][seg.dim ? "on" : "off"];
  const fgToken = seg.fg === null ? "var(--foreground)" : FG_TOKEN[seg.fg];
  const style = {};
  if (fgToken) style.color = tint(fgToken, strength);
  if (seg.bg !== null && BG_TOKEN[seg.bg]) style.backgroundColor = BG_TOKEN[seg.bg];
  return style;
}

function segmentClass(seg) {
  const parts = ["whitespace-pre"];
  if (seg.bold) parts.push("font-bold");
  if (seg.italic) parts.push("italic");
  if (seg.blink) parts.push("animate-pulse motion-reduce:animate-none");
  if (seg.conceal) parts.push("opacity-0");
  if (seg.underline && seg.strike) parts.push("[text-decoration-line:underline_line-through]");
  else if (seg.underline) parts.push("underline");
  else if (seg.strike) parts.push("line-through");
  return parts.join(" ");
}

function segmentTitle(seg) {
  const bits = [];
  if (seg.fg !== null) bits.push(`foreground ${seg.fg === "reverse" ? "reversed" : colorNameLabel(seg.fg)}`);
  if (seg.bg !== null) bits.push(`background ${seg.bg === "reverse" ? "reversed" : colorNameLabel(seg.bg)}`);
  if (seg.bold) bits.push("bold");
  if (seg.dim) bits.push("faint");
  if (seg.italic) bits.push("italic");
  if (seg.underline) bits.push("underline");
  if (seg.blink) bits.push("blink");
  if (seg.reverse) bits.push("reverse video");
  if (seg.conceal) bits.push("concealed");
  if (seg.strike) bits.push("crossed out");
  if (seg.link) bits.push(`link ${seg.link}`);
  return bits.length ? bits.join(", ") : "no attributes";
}

/* ------------------------------------------------------------------ */
/* Shared class strings                                                */
/* ------------------------------------------------------------------ */

const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const HINT = "mt-1 text-xs text-[var(--muted-foreground)]";
const FIELD =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const TH = "whitespace-nowrap px-3 py-2 text-left text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase";
const TD = "px-3 py-3 align-top text-sm text-[var(--foreground)]";
const SECTION_TITLE = "flex items-center gap-2 text-base font-bold text-[var(--foreground)]";

const SUPPORT_BADGE = {
  universal: "bg-[var(--success-soft)] text-[var(--success)]",
  wide: "bg-[var(--info-soft)] text-[var(--info)]",
  modern: "bg-[var(--primary-soft)] text-[var(--primary)]",
  patchy: "bg-[var(--warning-soft)] text-[var(--warning)]",
  specific: "bg-[var(--accent-soft)] text-[var(--accent)]",
};

const DASH = "—";
const numberFmt = new Intl.NumberFormat("en-US");

/* ------------------------------------------------------------------ */
/* Sample log                                                          */
/* ------------------------------------------------------------------ */

const E = "\u001B";
const BELL = "\u0007";

const SAMPLE_LOG = [
  `${E}[1m${E}[36m> npm run build${E}[0m`,
  `${E}[2m  resolving 412 modules...${E}[0m`,
  `[  0%] bundling\r${E}[K[ 47%] bundling\r${E}[K[100%] bundled`,
  `${E}[32m/${E}[0m 3 chunks written in ${E}[1m8.4s${E}[0m`,
  `${E}[33mwarn${E}[0m  ${E}[33mdeprecated api "renderToString"${E}[0m`,
  `${E}[41m${E}[97m FAIL ${E}[0m ${E}[31msrc/auth/session.test.ts${E}[0m`,
  `  ${E}[31mx${E}[0m refuses an expired token`,
  `    ${E}[90mat session.test.ts:88:12${E}[0m`,
  `${E}[38;5;208mnotice:${E}[0m 2 advisories (${E}[38;2;220;38;38m1 high${E}[0m)`,
  `${E}[7m SUMMARY ${E}[27m 1 failed, 84 passed`,
  `${E}[4m${E}[38;5;39mreport${E}[0m -> ${E}]8;;https://ci.example.com/job/8412${E}\\open in browser${E}]8;;${E}\\`,
  `${E}]0;build 8412 failed${BELL}${E}[?25h`,
].join("\n");

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                         */
/* ------------------------------------------------------------------ */

function SupportBadge({ level }) {
  return (
    <span
      className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${
        SUPPORT_BADGE[level] || SUPPORT_BADGE.wide
      }`}
    >
      {SUPPORT_LABELS[level] || level}
    </span>
  );
}

function CopyButton({ id, text, label, className, copiedKey, onCopy }) {
  const isCopied = copiedKey === id;
  return (
    <button
      type="button"
      onClick={() => onCopy(id, text)}
      className={className || GHOST_BTN}
      aria-label={isCopied ? `${label} copied to clipboard` : label}
    >
      {isCopied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      {isCopied ? "Copied!" : label}
    </button>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-[var(--muted-foreground)] uppercase">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

function ReferenceTable({ rows, firstHeading }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[44rem] border-collapse">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th scope="col" className={TH}>
              {firstHeading}
            </th>
            <th scope="col" className={TH}>
              Name
            </th>
            <th scope="col" className={TH}>
              What it does
            </th>
            <th scope="col" className={TH}>
              Support
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.code} className="border-b border-[var(--border)] last:border-0">
              <td className={`${TD} font-mono text-xs whitespace-nowrap`}>{row.code}</td>
              <td className={`${TD} font-medium whitespace-nowrap`}>{row.name}</td>
              <td className={TD}>{row.meaning}</td>
              <td className={TD}>
                <SupportBadge level={row.support} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const COLOR_MODE_OPTIONS = [
  { value: "none", label: "Leave at terminal default" },
  { value: "basic", label: "Basic 8 (30-37 / 40-47)" },
  { value: "bright", label: "Bright 8 (90-97 / 100-107)" },
  { value: "palette", label: "256-colour palette (38;5;n)" },
  { value: "rgb", label: "24-bit truecolour (38;2;r;g;b)" },
];

const BASIC_OPTIONS = [
  "0 black",
  "1 red",
  "2 green",
  "3 yellow",
  "4 blue",
  "5 magenta",
  "6 cyan",
  "7 white",
];

const ATTRIBUTES = [
  ["bold", "Bold (1)"],
  ["dim", "Faint (2)"],
  ["italic", "Italic (3)"],
  ["underline", "Underline (4)"],
  ["blink", "Blink (5)"],
  ["reverse", "Reverse (7)"],
  ["conceal", "Conceal (8)"],
  ["strike", "Crossed out (9)"],
];

const DEFAULT_BUILDER = {
  bold: true,
  dim: false,
  italic: false,
  underline: false,
  blink: false,
  reverse: false,
  conceal: false,
  strike: false,
  fgMode: "basic",
  fgIndex: "1",
  fgPalette: "208",
  fgR: "220",
  fgG: "38",
  fgB: "38",
  bgMode: "none",
  bgIndex: "0",
  bgPalette: "236",
  bgR: "30",
  bgG: "30",
  bgB: "30",
  sample: "Build failed",
};

export default function AnsiEscapeReferencePage() {
  const [logInput, setLogInput] = useState(SAMPLE_LOG);
  const [builder, setBuilder] = useState(DEFAULT_BUILDER);
  const [copiedKey, setCopiedKey] = useState("");

  useEffect(() => {
    if (!copiedKey) return undefined;
    const timer = setTimeout(() => setCopiedKey(""), 1600);
    return () => clearTimeout(timer);
  }, [copiedKey]);

  const copy = useCallback(async (key, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
    } catch {
      setCopiedKey("");
    }
  }, []);

  const decoded = useMemo(() => decodeAnsiLog(logInput), [logInput]);
  const decodeError = decoded.error || "";

  const report = useMemo(() => formatSequenceReport(decoded), [decoded]);

  const built = useMemo(
    () =>
      buildSgrSequence({
        bold: builder.bold,
        dim: builder.dim,
        italic: builder.italic,
        underline: builder.underline,
        blink: builder.blink,
        reverse: builder.reverse,
        conceal: builder.conceal,
        strike: builder.strike,
        fgMode: builder.fgMode,
        fgIndex: builder.fgIndex,
        fgPalette: builder.fgPalette,
        fgR: builder.fgR,
        fgG: builder.fgG,
        fgB: builder.fgB,
        bgMode: builder.bgMode,
        bgIndex: builder.bgIndex,
        bgPalette: builder.bgPalette,
        bgR: builder.bgR,
        bgG: builder.bgG,
        bgB: builder.bgB,
        sample: builder.sample,
      }),
    [builder],
  );
  const buildError = built.error || "";

  const setField = useCallback((key, value) => {
    setBuilder((prev) => ({ ...prev, [key]: value }));
  }, []);

  const stats = decodeError ? null : decoded.stats;

  const colorFields = (role) => {
    const mode = builder[`${role}Mode`];
    const prefix = role === "fg" ? "Foreground" : "Background";
    return (
      <div className="space-y-3">
        <div>
          <label className={LABEL} htmlFor={`${role}-mode`}>
            {prefix} colour
          </label>
          <select
            id={`${role}-mode`}
            className={`${FIELD} mt-1`}
            value={mode}
            onChange={(event) => setField(`${role}Mode`, event.target.value)}
          >
            {COLOR_MODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {(mode === "basic" || mode === "bright") && (
          <div>
            <label className={LABEL} htmlFor={`${role}-index`}>
              {prefix} colour name
            </label>
            <select
              id={`${role}-index`}
              className={`${FIELD} mt-1`}
              value={builder[`${role}Index`]}
              onChange={(event) => setField(`${role}Index`, event.target.value)}
            >
              {BASIC_OPTIONS.map((option, index) => (
                <option key={option} value={String(index)}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {mode === "palette" && (
          <div>
            <label className={LABEL} htmlFor={`${role}-palette`}>
              {prefix} palette entry (0-255)
            </label>
            <input
              id={`${role}-palette`}
              type="number"
              min="0"
              max="255"
              step="1"
              inputMode="numeric"
              className={`${FIELD} mt-1`}
              value={builder[`${role}Palette`]}
              onChange={(event) => setField(`${role}Palette`, event.target.value)}
            />
            <p className={HINT}>16-231 is the 6x6x6 cube (16 + 36r + 6g + b); 232-255 is the grey ramp.</p>
          </div>
        )}

        {mode === "rgb" && (
          <div className="grid gap-3 sm:grid-cols-3">
            {["R", "G", "B"].map((channel) => (
              <div key={channel}>
                <label className={LABEL} htmlFor={`${role}-${channel}`}>
                  {prefix} {channel} (0-255)
                </label>
                <input
                  id={`${role}-${channel}`}
                  type="number"
                  min="0"
                  max="255"
                  step="1"
                  inputMode="numeric"
                  className={`${FIELD} mt-1`}
                  value={builder[`${role}${channel}`]}
                  onChange={(event) => setField(`${role}${channel}`, event.target.value)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6">
      <header className="space-y-2">
        <h1 className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)] sm:text-2xl">
          <Terminal className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          ANSI Escape Code Reference &amp; Log Decoder
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Paste terminal output that lost its colours and picked up <code className="font-mono">ESC[0;32m</code> instead.
          The decoder renders it, names every escape sequence in it, and hands back a stripped plain-text copy. Parsing
          follows ECMA-48 (ISO/IEC 6429), 5th edition, checked {REFERENCE_REVIEWED}. Nothing is uploaded.
        </p>
      </header>

      {/* ---------------- Decoder ---------------- */}
      <section className={CARD} aria-labelledby="decoder-heading">
        <h2 id="decoder-heading" className={SECTION_TITLE}>
          <Eraser className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
          Decode a log
        </h2>

        <div className="mt-4">
          <label className={LABEL} htmlFor="log-input">
            Raw terminal output
          </label>
          <textarea
            id="log-input"
            rows={9}
            spellCheck={false}
            className={`${TEXTAREA} mt-1`}
            value={logInput}
            onChange={(event) => setLogInput(event.target.value)}
          />
          <p className={HINT}>
            Real 0x1B bytes work, and so do the textual spellings a copy-paste leaves behind:{" "}
            <code className="font-mono">ESC[</code>, <code className="font-mono">^[[</code>,{" "}
            <code className="font-mono">\x1b[</code>, <code className="font-mono">\033[</code> and{" "}
            <code className="font-mono">{"\\u001b["}</code>.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <CopyButton
            id="stripped"
            className={PRIMARY_BTN}
            label="Copy stripped text"
            text={decodeError ? "" : decoded.strippedText}
            copiedKey={copiedKey}
            onCopy={copy}
          />
          <CopyButton id="report" label="Copy breakdown" text={report} copiedKey={copiedKey} onCopy={copy} />
          <button
            type="button"
            onClick={() => setLogInput(SAMPLE_LOG)}
            className={GHOST_BTN}
            aria-label="Reset the decoder to the sample log"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
          <button
            type="button"
            onClick={() => setLogInput("")}
            className={GHOST_BTN}
            aria-label="Clear the decoder input"
          >
            Clear
          </button>
        </div>

        {decodeError ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
            {decodeError}
          </p>
        ) : null}

        <div className="mt-4 rounded-xl bg-[var(--background)] p-5 ring-1 ring-[var(--border)]">
          <p className="text-xs font-medium tracking-wide text-[var(--muted-foreground)] uppercase">
            Escape sequences found
          </p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-[var(--foreground)]">
            {stats ? numberFmt.format(stats.totalSequences) : DASH}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Distinct" value={stats ? numberFmt.format(stats.uniqueSequences) : DASH} />
            <Stat label="Colour / SGR" value={stats ? numberFmt.format(stats.sgrCount) : DASH} />
            <Stat label="Cursor moves" value={stats ? numberFmt.format(stats.cursorCount) : DASH} />
            <Stat label="Erase" value={stats ? numberFmt.format(stats.eraseCount) : DASH} />
            <Stat label="OSC" value={stats ? numberFmt.format(stats.oscCount) : DASH} />
            <Stat label="Other" value={stats ? numberFmt.format(stats.otherCount) : DASH} />
            <Stat
              label="Chars that were codes"
              value={stats ? `${numberFmt.format(stats.charactersRemoved)} of ${numberFmt.format(stats.originalLength)}` : DASH}
            />
            <Stat label="Lines rendered" value={stats ? numberFmt.format(stats.renderedLines) : DASH} />
          </dl>
          {stats && stats.normalisedCount > 0 ? (
            <p className={HINT}>
              {numberFmt.format(stats.normalisedCount)} textual ESC spelling
              {stats.normalisedCount === 1 ? " was" : "s were"} rewritten to the real 0x1B byte before parsing.
            </p>
          ) : null}
          {stats && stats.totalSequences === 0 ? (
            <p className={HINT}>
              No escape sequences in this text. If the log looks plain, it may already have been stripped, or the program
              that wrote it checked whether stdout was a TTY and skipped colour.
            </p>
          ) : null}
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Rendered as the terminal would draw it</h3>
          <p className={HINT}>
            Carriage returns, backspaces, 8-column tab stops, the cursor moves and the erase functions are all applied,
            so a progress bar collapses to its last frame. ANSI colours are mapped onto this page&apos;s theme tokens, not
            to your terminal&apos;s palette &mdash; hover any span for its exact attributes, and read the table below for the
            exact parameters.
          </p>
          <div className="mt-2 max-h-96 overflow-auto rounded-lg bg-[var(--background)] p-4 ring-1 ring-[var(--border)]">
            {decodeError ? (
              <p className="font-mono text-xs text-[var(--muted-foreground)]">{DASH}</p>
            ) : (
              <pre className="w-max min-w-full font-mono text-xs leading-5">
                {decoded.lines.map((segments, lineIndex) => (
                  <div key={`line-${lineIndex}`} className="min-h-5">
                    {segments.length === 0
                      ? " "
                      : segments.map((seg, segIndex) => (
                          <span
                            key={`seg-${lineIndex}-${segIndex}`}
                            className={segmentClass(seg)}
                            style={segmentStyle(seg)}
                            title={segmentTitle(seg)}
                          >
                            {seg.text}
                          </span>
                        ))}
                  </div>
                ))}
              </pre>
            )}
          </div>
          {!decodeError && (decoded.truncatedRows || decoded.truncatedCols) ? (
            <p className="mt-2 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-xs text-[var(--warning)]">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              The render was capped
              {decoded.truncatedRows ? " at 2,000 rows" : ""}
              {decoded.truncatedRows && decoded.truncatedCols ? " and" : ""}
              {decoded.truncatedCols ? " at 1,000 columns" : ""}. The sequence counts above still cover the whole paste.
            </p>
          ) : null}
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Every sequence found</h3>
          {decodeError || decoded.sequences.length === 0 ? (
            <p className={HINT}>{DASH}</p>
          ) : (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[46rem] border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th scope="col" className={TH}>
                      Sequence
                    </th>
                    <th scope="col" className={TH}>
                      Times
                    </th>
                    <th scope="col" className={TH}>
                      Name
                    </th>
                    <th scope="col" className={TH}>
                      Meaning
                    </th>
                    <th scope="col" className={TH}>
                      Support
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {decoded.sequences.map((seq) => (
                    <tr key={seq.raw} className="border-b border-[var(--border)] last:border-0">
                      <td className={`${TD} font-mono text-xs`}>
                        <div className="whitespace-nowrap">{seq.display}</div>
                        <div className="whitespace-nowrap text-[var(--muted-foreground)]">{seq.escaped}</div>
                      </td>
                      <td className={`${TD} tabular-nums`}>{numberFmt.format(seq.count)}</td>
                      <td className={`${TD} font-medium`}>{seq.name}</td>
                      <td className={TD}>{seq.meaning}</td>
                      <td className={TD}>
                        <SupportBadge level={seq.support} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Stripped plain text</h3>
          <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-[var(--background)] p-4 font-mono text-xs leading-5 whitespace-pre text-[var(--foreground)] ring-1 ring-[var(--border)]">
            {decodeError ? DASH : decoded.strippedText || DASH}
          </pre>
        </div>
      </section>

      {/* ---------------- Builder ---------------- */}
      <section className={CARD} aria-labelledby="builder-heading">
        <h2 id="builder-heading" className={SECTION_TITLE}>
          <Wand2 className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
          Build a sequence
        </h2>
        <p className={HINT}>
          Attribute parameters are emitted in ascending numeric order, then foreground, then background. ECMA-48 applies
          SGR parameters left to right, so any order works &mdash; ascending is just what a reader expects.
        </p>

        <fieldset className="mt-4">
          <legend className={LABEL}>Attributes</legend>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {ATTRIBUTES.map(([key, label]) => (
              <label
                key={key}
                htmlFor={`attr-${key}`}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]"
              >
                <input
                  id={`attr-${key}`}
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={builder[key]}
                  onChange={(event) => setField(key, event.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {colorFields("fg")}
          {colorFields("bg")}
        </div>

        <div className="mt-4">
          <label className={LABEL} htmlFor="sample-text">
            Sample text for the snippets
          </label>
          <input
            id="sample-text"
            type="text"
            className={`${FIELD} mt-1`}
            value={builder.sample}
            onChange={(event) => setField("sample", event.target.value)}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setBuilder(DEFAULT_BUILDER)}
            className={GHOST_BTN}
            aria-label="Reset the builder to its default attributes"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset builder
          </button>
        </div>

        {buildError ? (
          <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
            {buildError}
          </p>
        ) : null}

        <div className="mt-4 rounded-xl bg-[var(--background)] p-5 ring-1 ring-[var(--border)]">
          <p className="text-xs font-medium tracking-wide text-[var(--muted-foreground)] uppercase">SGR parameters</p>
          <p className="mt-1 font-mono text-3xl font-bold break-all text-[var(--foreground)]">
            {buildError ? DASH : built.paramText}
          </p>
          <div className="mt-4">
            <p className="text-xs font-medium tracking-wide text-[var(--muted-foreground)] uppercase">Preview</p>
            <p className="mt-1 font-mono text-sm">
              {buildError ? (
                <span className="text-[var(--muted-foreground)]">{DASH}</span>
              ) : (
                <span
                  className={segmentClass({ ...built.preview, text: built.sample })}
                  style={segmentStyle(built.preview)}
                >
                  {built.sample}
                </span>
              )}
            </p>
          </div>
          <dl className="mt-4 space-y-1">
            {buildError ? (
              <Stat label="Parameters" value={DASH} />
            ) : (
              built.notes.map((note) => (
                <div key={note} className="flex gap-2 text-sm text-[var(--foreground)]">
                  <MoveRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--muted-foreground)]" aria-hidden="true" />
                  <span className="font-mono text-xs">{note}</span>
                </div>
              ))
            )}
          </dl>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">The same sequence, four spellings of ESC</h3>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[42rem] border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th scope="col" className={TH}>
                    Escape
                  </th>
                  <th scope="col" className={TH}>
                    Sequence + reset
                  </th>
                  <th scope="col" className={TH}>
                    Accepted by
                  </th>
                  <th scope="col" className={TH}>
                    <span className="sr-only">Copy</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {(buildError ? ESCAPE_FORMS.map((f) => ({ ...f, sequence: DASH, reset: "" })) : built.forms).map(
                  (form) => (
                    <tr key={form.id} className="border-b border-[var(--border)] last:border-0">
                      <td className={`${TD} font-mono text-xs whitespace-nowrap`}>{form.literal}</td>
                      <td className={`${TD} font-mono text-xs break-all`}>
                        {form.sequence}
                        {form.reset ? <span className="text-[var(--muted-foreground)]">{form.reset}</span> : null}
                      </td>
                      <td className={`${TD} text-xs`}>{form.note}</td>
                      <td className={TD}>
                        {buildError ? (
                          <span className="text-[var(--muted-foreground)]">{DASH}</span>
                        ) : (
                          <CopyButton
                            id={`form-${form.id}`}
                            label="Copy"
                            text={`${form.sequence}${form.reset}`}
                            copiedKey={copiedKey}
                            onCopy={copy}
                          />
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(buildError ? [] : built.snippets).map((snippet) => (
            <div key={snippet.id} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-[var(--foreground)]">{snippet.label}</h4>
                <CopyButton
                  id={`snippet-${snippet.id}`}
                  label="Copy"
                  text={snippet.code}
                  copiedKey={copiedKey}
                  onCopy={copy}
                />
              </div>
              <pre className="mt-2 overflow-x-auto font-mono text-xs whitespace-pre text-[var(--foreground)]">
                {snippet.code}
              </pre>
              <p className={HINT}>{snippet.note}</p>
            </div>
          ))}
          {buildError ? <p className="text-sm text-[var(--muted-foreground)]">{DASH}</p> : null}
        </div>
      </section>

      {/* ---------------- Reference ---------------- */}
      <section className={CARD} aria-labelledby="reference-heading">
        <h2 id="reference-heading" className={SECTION_TITLE}>
          <BookOpen className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
          Reference
        </h2>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {Object.keys(SUPPORT_LABELS).map((level) => (
            <div key={level} className="flex items-start gap-2">
              <SupportBadge level={level} />
              <span className="text-xs text-[var(--muted-foreground)]">{SUPPORT_NOTES[level]}</span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <Palette className="h-4 w-4 text-[var(--muted-foreground)]" aria-hidden="true" />
            SGR &mdash; colour and text attributes (CSI &hellip; m)
          </h3>
          <ReferenceTable rows={SGR_REFERENCE} firstHeading="Parameter" />
        </div>

        <div className="mt-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <MoveRight className="h-4 w-4 text-[var(--muted-foreground)]" aria-hidden="true" />
            Cursor movement and saved state
          </h3>
          <ReferenceTable rows={CURSOR_REFERENCE} firstHeading="Sequence" />
        </div>

        <div className="mt-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <Eraser className="h-4 w-4 text-[var(--muted-foreground)]" aria-hidden="true" />
            Erase &mdash; ED and EL
          </h3>
          <ReferenceTable rows={ERASE_REFERENCE} firstHeading="Sequence" />
        </div>

        <div className="mt-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <Link2 className="h-4 w-4 text-[var(--muted-foreground)]" aria-hidden="true" />
            OSC &mdash; window title, hyperlinks and clipboard
          </h3>
          <ReferenceTable rows={OSC_REFERENCE} firstHeading="Sequence" />
          <p className={HINT}>
            Every OSC sequence ends with either BEL (0x07) or ST (ESC \). BEL is the older xterm spelling and what most
            shell prompts emit; ST is what the standard prefers and what OSC 8 hyperlink examples usually show.
          </p>
        </div>
      </section>
    </div>
  );
}
