"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Copy, Download, RotateCcw, Sparkles } from "lucide-react";

import { FESTIVALS, LANGUAGES, MAX_NOTE_LENGTH, SIZES, buildGreetingCard } from "../lib";

const DEFAULTS = {
  festivalId: "diwali",
  languageId: "hi",
  recipient: "Sharma Family",
  sender: "Nikhil & Priya",
  note: "May the year ahead bring you light, health and good company.",
  sizeId: SIZES[0].id,
  showEnglish: true,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-[88px] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const FONT_STACK =
  "ui-sans-serif, system-ui, 'Noto Sans', 'Noto Sans Devanagari', 'Noto Sans Tamil', 'Segoe UI', Arial, sans-serif";
const DASH = "—";

function Shape({ shape }) {
  if (shape.type === "circle") {
    return <circle cx={shape.cx} cy={shape.cy} r={shape.r} fill={shape.fill} opacity={shape.opacity ?? 1} />;
  }
  if (shape.type === "ellipse") {
    return (
      <ellipse cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} fill={shape.fill} opacity={shape.opacity ?? 1} />
    );
  }
  if (shape.type === "polygon") {
    return <polygon points={shape.points} fill={shape.fill} opacity={shape.opacity ?? 1} />;
  }
  if (shape.type === "line") {
    return (
      <line
        x1={shape.x1}
        y1={shape.y1}
        x2={shape.x2}
        y2={shape.y2}
        stroke={shape.stroke}
        strokeWidth={shape.strokeWidth}
        strokeLinecap="round"
        opacity={shape.opacity ?? 1}
      />
    );
  }
  return null;
}

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);
  const svgRef = useRef(null);

  const card = useMemo(
    () =>
      buildGreetingCard({
        festivalId: form.festivalId,
        languageId: form.languageId,
        recipient: form.recipient,
        sender: form.sender,
        note: form.note,
        sizeId: form.sizeId,
        showEnglish: form.showEnglish,
      }),
    [form],
  );

  const failed = Boolean(card.error);

  const set = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const copyText = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(card.plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const serialiseSvg = () => {
    const node = svgRef.current;
    if (!node) return "";
    const clone = node.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.removeAttribute("class");
    clone.setAttribute("width", String(card.width));
    clone.setAttribute("height", String(card.height));
    return new XMLSerializer().serializeToString(clone);
  };

  const downloadSvg = () => {
    const markup = serialiseSvg();
    if (!markup) return;
    const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${form.festivalId}-greeting-${form.sizeId}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = () => {
    const markup = serialiseSvg();
    if (!markup) return;
    const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = card.width;
      canvas.height = card.height;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, card.width, card.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const pngUrl = URL.createObjectURL(pngBlob);
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `${form.festivalId}-greeting-${form.sizeId}.png`;
        link.click();
        URL.revokeObjectURL(pngUrl);
      }, "image/png");
    };
    image.onerror = () => URL.revokeObjectURL(url);
    image.src = url;
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Festival greetings
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Indian Festival Greeting Card Maker
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a festival, write the wish in the language your family reads, and download a card with
          the matching motif — diyas for Diwali, a pookalam for Onam, kites for Sankranti.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Card details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fest-festival">
              Festival
            </label>
            <select
              id="fest-festival"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.festivalId}
              onChange={set("festivalId")}
            >
              {FESTIVALS.map((festival) => (
                <option key={festival.id} value={festival.id}>
                  {festival.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fest-language">
              Greeting language
            </label>
            <select
              id="fest-language"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.languageId}
              onChange={set("languageId")}
            >
              {LANGUAGES.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.label} · {language.native}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fest-recipient">
              Recipient (optional)
            </label>
            <input
              id="fest-recipient"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.recipient}
              onChange={set("recipient")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fest-sender">
              From (optional)
            </label>
            <input id="fest-sender" className={`mt-2 ${INPUT_CLASS}`} value={form.sender} onChange={set("sender")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fest-size">
              Size
            </label>
            <select id="fest-size" className={`mt-2 ${INPUT_CLASS}`} value={form.sizeId} onChange={set("sizeId")}>
              {SIZES.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fest-note">
              Personal line (optional, max {MAX_NOTE_LENGTH} characters)
            </label>
            <textarea id="fest-note" className={`mt-2 ${TEXTAREA_CLASS}`} value={form.note} onChange={set("note")} />
          </div>
          <div className="sm:col-span-2">
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold" htmlFor="fest-english">
              <input
                id="fest-english"
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={form.showEnglish}
                onChange={set("showEnglish")}
              />
              Add the English line under a non-English greeting
            </label>
          </div>
        </div>

        {!failed && (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            {card.festivalLabel} falls on {card.festivalWhen}. Available in:{" "}
            {card.availableLanguages.map((language) => language.label).join(", ")}.
          </p>
        )}
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {card.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Greeting
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
              {failed ? DASH : card.greetingText}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? DASH : `${card.languageLabel} · ${card.festivalLabel} · ${card.sizeLabel}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyText}
              disabled={failed}
              aria-label="Copy greeting text"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy text"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset card details" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {failed ? (
          <p className="mt-5 text-sm text-[var(--muted-foreground)]">Fix the highlighted field to render the card.</p>
        ) : (
          <>
            <div className="mt-5 overflow-x-auto">
              <div className="mx-auto w-full max-w-[420px]">
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${card.width} ${card.height}`}
                  className="h-auto w-full rounded-lg ring-1 ring-[var(--border)]"
                  role="img"
                  aria-label={`${card.festivalLabel} greeting card: ${card.greetingText}`}
                >
                  <rect x="0" y="0" width={card.width} height={card.height} fill={card.colors.bg} />
                  {card.motif.map((shape) => (
                    <Shape key={shape.id} shape={shape} />
                  ))}
                  <rect
                    x={card.panel.x}
                    y={card.panel.y}
                    width={card.panel.width}
                    height={card.panel.height}
                    rx={card.panel.radius}
                    fill={card.colors.panel}
                    opacity="0.94"
                  />
                  {card.blocks.map((block) =>
                    block.kind === "rule" ? (
                      <line
                        key={block.id}
                        x1={block.x1}
                        x2={block.x2}
                        y1={block.y}
                        y2={block.y}
                        stroke={block.stroke}
                        strokeWidth={block.strokeWidth}
                        strokeLinecap="round"
                      />
                    ) : (
                      <text
                        key={block.id}
                        x={block.x}
                        y={block.y}
                        fill={block.fill}
                        fontFamily={FONT_STACK}
                        fontSize={block.size}
                        fontWeight={block.weight}
                        letterSpacing={block.letterSpacing}
                        textAnchor="middle"
                        dominantBaseline="hanging"
                      >
                        {block.text}
                      </text>
                    ),
                  )}
                </svg>
              </div>
            </div>

            {card.warning && (
              <p className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
                {card.warning}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={downloadPng} aria-label="Download card as PNG" className={PRIMARY_BTN}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Download PNG
              </button>
              <button type="button" onClick={downloadSvg} aria-label="Download card as SVG" className={GHOST_BTN}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Download SVG
              </button>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Greeting", card.greetingText],
                ["English", card.englishText],
                ["Language", `${card.languageLabel} (${card.languageNative})`],
                ["Motif", card.motifName],
                ["When it falls", card.festivalWhen],
                ["Canvas", `${card.width} × ${card.height} px`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Greetings are the everyday phrases used for each festival, not literal translations of each
        other. Indic text in the SVG export renders with the fonts installed on the opening device —
        download the PNG when you want the script to look the same everywhere.
      </p>
    </main>
  );
}
