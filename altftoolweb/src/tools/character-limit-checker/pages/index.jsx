"use client";

import { useCallback, useMemo, useState } from "react";
import { Copy, Ruler, Scissors } from "lucide-react";

const PRESETS = [
  { id: "x-post", group: "Social", label: "X (Twitter) post", limit: 280, note: "Links always count as 23 characters" },
  { id: "x-bio", group: "Social", label: "X (Twitter) bio", limit: 160 },
  { id: "ig-caption", group: "Social", label: "Instagram caption", limit: 2200 },
  { id: "ig-bio", group: "Social", label: "Instagram bio", limit: 150 },
  { id: "li-post", group: "Social", label: "LinkedIn post", limit: 3000, note: "Truncated with 'see more' after ~210 characters" },
  { id: "li-headline", group: "Social", label: "LinkedIn headline", limit: 220 },
  { id: "li-about", group: "Social", label: "LinkedIn About", limit: 2600 },
  { id: "fb-post", group: "Social", label: "Facebook post", limit: 63206 },
  { id: "threads", group: "Social", label: "Threads post", limit: 500 },
  { id: "bluesky", group: "Social", label: "Bluesky post", limit: 300 },
  { id: "tiktok", group: "Social", label: "TikTok caption", limit: 2200 },
  { id: "pinterest", group: "Social", label: "Pinterest description", limit: 500 },
  { id: "reddit-title", group: "Social", label: "Reddit post title", limit: 300 },
  { id: "discord", group: "Social", label: "Discord message", limit: 2000 },
  { id: "yt-title", group: "Video", label: "YouTube title", limit: 100, note: "Search results cut off near 70 characters" },
  { id: "yt-desc", group: "Video", label: "YouTube description", limit: 5000 },
  { id: "seo-title", group: "SEO & Ads", label: "SEO title tag", limit: 60, note: "Google truncates on pixel width near 580px" },
  { id: "seo-meta", group: "SEO & Ads", label: "Meta description", limit: 160 },
  { id: "ads-headline", group: "SEO & Ads", label: "Google Ads headline", limit: 30 },
  { id: "ads-desc", group: "SEO & Ads", label: "Google Ads description", limit: 90 },
  { id: "email-subject", group: "Messaging", label: "Email subject line", limit: 60, note: "Mobile inboxes show about 35 characters" },
  { id: "sms", group: "Messaging", label: "SMS (1 segment)", limit: 160, sms: true },
  { id: "whatsapp", group: "Messaging", label: "WhatsApp message", limit: 65536 },
];

const GROUPS = ["Social", "Video", "SEO & Ads", "Messaging"];

// Characters encodable in the GSM 03.38 7-bit alphabet.
const GSM_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM_EXTENDED = "^{}\\[~]|€";

const nf = new Intl.NumberFormat("en-IN");
const URL_PATTERN = /https?:\/\/\S+|www\.\S+/gi;

function countGraphemes(text) {
  if (!text) return 0;
  try {
    if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
      const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
      return [...segmenter.segment(text)].length;
    }
  } catch {
    /* fall through to code-point counting */
  }
  return Array.from(text).length;
}

/** GSM-7 vs UCS-2 segmentation, exactly as carriers bill it. */
function smsSegments(text) {
  let units = 0;
  let gsm = true;
  for (const char of Array.from(text)) {
    if (GSM_BASIC.includes(char)) {
      units += 1;
    } else if (GSM_EXTENDED.includes(char)) {
      units += 2;
    } else {
      gsm = false;
      break;
    }
  }

  if (!gsm) {
    const ucsUnits = text.length; // UTF-16 code units
    const perSegment = ucsUnits <= 70 ? 70 : 67;
    return {
      encoding: "UCS-2",
      units: ucsUnits,
      segments: ucsUnits === 0 ? 0 : Math.ceil(ucsUnits / perSegment),
      perSegment,
    };
  }

  const perSegment = units <= 160 ? 160 : 153;
  return {
    encoding: "GSM-7",
    units,
    segments: units === 0 ? 0 : Math.ceil(units / perSegment),
    perSegment,
  };
}

export default function ToolHome() {
  const [text, setText] = useState(
    "Shipping something small today beats planning something big forever. Here is what we learned building in public for 30 days."
  );
  const [presetId, setPresetId] = useState("x-post");
  const [customLimit, setCustomLimit] = useState("");
  const [countLinksAs23, setCountLinksAs23] = useState(true);
  const [copied, setCopied] = useState(false);

  const preset = PRESETS.find((item) => item.id === presetId) || PRESETS[0];

  const customValue = customLimit.trim() === "" ? null : Number(customLimit);
  const customInvalid =
    customValue !== null && (!Number.isFinite(customValue) || customValue < 1 || customValue > 1000000);
  const limit = customValue !== null && !customInvalid ? Math.floor(customValue) : preset.limit;
  const limitLabel = customValue !== null && !customInvalid ? "Custom limit" : preset.label;

  const applyLinkWeighting = countLinksAs23 && presetId.startsWith("x-");

  const counts = useMemo(() => {
    const weighted = applyLinkWeighting
      ? text.replace(URL_PATTERN, "x".repeat(23))
      : text;

    const characters = weighted.length;
    const rawCharacters = text.length;
    const noSpaces = text.replace(/\s/g, "").length;
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    const lines = text === "" ? 0 : text.split(/\n/).length;
    const links = (text.match(URL_PATTERN) || []).length;

    return {
      characters,
      rawCharacters,
      noSpaces,
      words,
      lines,
      links,
      graphemes: countGraphemes(text),
      sms: smsSegments(text),
    };
  }, [applyLinkWeighting, text]);

  const remaining = limit - counts.characters;
  const over = remaining < 0;
  const percent = limit > 0 ? Math.min(100, (counts.characters / limit) * 100) : 0;
  const nearLimit = !over && percent >= 90;

  const trimmed = useMemo(() => text.slice(0, Math.max(0, limit)), [limit, text]);

  const copyText = useCallback(
    async (value) => {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      } catch {
        setCopied(false);
      }
    },
    []
  );

  const reset = () => {
    setText("");
    setCustomLimit("");
    setPresetId("x-post");
    setCountLinksAs23(true);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Ruler className="h-4 w-4" aria-hidden="true" />
            Text & Writing
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Character Limit Checker</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            Paste a post, title or meta description and see exactly how many characters you have
            left for 23 real platform limits — plus SMS segment billing and emoji-safe counts.
          </p>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label htmlFor="clc-text" className="text-sm font-semibold">
                Your text
              </label>
              <span className={`text-sm font-semibold ${over ? "text-[var(--danger)]" : "text-[var(--muted-foreground)]"}`}>
                {nf.format(counts.characters)} / {nf.format(limit)}
              </span>
            </div>
            <textarea
              id="clc-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={9}
              placeholder="Type or paste your post here…"
              className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            />

            <div
              className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`${Math.round(percent)} percent of the ${limitLabel} limit used`}
            >
              <div
                className="h-full rounded-full transition-[width] motion-reduce:transition-none"
                style={{
                  width: `${percent}%`,
                  backgroundColor: over
                    ? "var(--danger)"
                    : nearLimit
                      ? "var(--warning)"
                      : "var(--primary)",
                }}
              />
            </div>

            {over && (
              <p
                role="alert"
                className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
              >
                {nf.format(Math.abs(remaining))} characters over the {limitLabel} limit. Trim{" "}
                {nf.format(Math.abs(remaining))} more to fit.
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => copyText(text)}
                aria-label="Copy your text to the clipboard"
                className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
                {copied ? "Copied!" : "Copy text"}
              </button>
              <button
                type="button"
                onClick={() => setText(trimmed)}
                disabled={!over}
                aria-label={`Trim the text to the ${limitLabel} limit`}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Scissors className="h-4 w-4" aria-hidden="true" />
                Trim to limit
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset the tool"
                className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                Reset
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                ["Characters", nf.format(counts.rawCharacters)],
                ["Without spaces", nf.format(counts.noSpaces)],
                ["Words", nf.format(counts.words)],
                ["Lines", nf.format(counts.lines)],
                ["Visible characters", nf.format(counts.graphemes)],
                ["Links found", nf.format(counts.links)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                  <p className="text-xs font-medium text-[var(--muted-foreground)]">{label}</p>
                  <p className="mt-1 text-lg font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              “Visible characters” counts emoji and accented letters as one, while most platforms
              bill the raw character count shown above.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                {limitLabel}
              </p>
              <p
                className={`mt-1 text-4xl font-semibold ${over ? "text-[var(--danger)]" : "text-[var(--primary)]"}`}
              >
                {over ? "-" : ""}
                {nf.format(Math.abs(remaining))}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {over ? "characters over limit" : "characters remaining"}
              </p>
              {preset.note && customValue === null ? (
                <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                  {preset.note}
                </p>
              ) : null}
              {preset.sms && customValue === null ? (
                <div className="mt-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm">
                  <p className="font-semibold">
                    {nf.format(counts.sms.segments)} SMS segment
                    {counts.sms.segments === 1 ? "" : "s"}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {counts.sms.encoding} encoding · {nf.format(counts.sms.units)} billable units ·{" "}
                    {nf.format(counts.sms.perSegment)} per segment
                  </p>
                </div>
              ) : null}
            </div>

            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <label htmlFor="clc-preset" className="text-sm font-semibold">
                Platform limit
              </label>
              <select
                id="clc-preset"
                value={presetId}
                onChange={(event) => setPresetId(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              >
                {GROUPS.map((group) => (
                  <optgroup key={group} label={group}>
                    {PRESETS.filter((item) => item.group === group).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label} ({nf.format(item.limit)})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>

              <label htmlFor="clc-custom" className="mt-4 block text-sm font-semibold">
                Custom limit (optional)
              </label>
              <input
                id="clc-custom"
                type="number"
                inputMode="numeric"
                min="1"
                max="1000000"
                value={customLimit}
                onChange={(event) => setCustomLimit(event.target.value)}
                placeholder="e.g. 500"
                className="mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              />
              {customInvalid && (
                <p
                  role="alert"
                  className="mt-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
                >
                  Enter a whole number between 1 and 1,000,000. Falling back to the {preset.label} limit.
                </p>
              )}

              {presetId.startsWith("x-") && (
                <label className="mt-4 flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={countLinksAs23}
                    onChange={(event) => setCountLinksAs23(event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                  />
                  <span>
                    Count every link as 23 characters
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      Matches how X shortens URLs with t.co.
                    </span>
                  </span>
                </label>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
