"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Cake, Check, Copy, Download, RotateCcw } from "lucide-react";

import { MAX_MESSAGE_LENGTH, SIZES, THEMES, buildInvitation } from "../lib";

const DEFAULTS = {
  name: "Aarav",
  age: "7",
  date: "2026-03-14",
  time: "4:00 PM - 7:00 PM",
  venue: "Sunshine Play Cafe",
  address: "12 MG Road, Bengaluru",
  rsvpName: "Priya",
  rsvpContact: "+91 98765 43210",
  rsvpBy: "2026-03-08",
  message: "Wear something yellow and bring your dancing shoes!",
  themeId: THEMES[0].id,
  sizeId: SIZES[1].id,
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

const FONT_STACK = "ui-sans-serif, system-ui, 'Segoe UI', Roboto, Arial, sans-serif";
const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);
  const svgRef = useRef(null);
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const card = useMemo(
    () =>
      buildInvitation({
        name: form.name,
        age: form.age,
        date: form.date,
        time: form.time,
        venue: form.venue,
        address: form.address,
        rsvpName: form.rsvpName,
        rsvpContact: form.rsvpContact,
        rsvpBy: form.rsvpBy,
        message: form.message,
        themeId: form.themeId,
        sizeId: form.sizeId,
      }),
    [form],
  );

  const failed = Boolean(card.error);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const copyDetails = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(card.plainText);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
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
    link.download = `birthday-invitation-${form.sizeId}.svg`;
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
        link.download = `birthday-invitation-${form.sizeId}.png`;
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
          <Cake className="h-4 w-4" aria-hidden="true" />
          Party invites
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Birthday Invitation Maker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Fill in the party details, pick a theme and download a print-ready A5 invitation or a
          square/story image for WhatsApp and Instagram. Everything renders in your browser.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Party details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="inv-name">
              Birthday person
            </label>
            <input id="inv-name" className={`mt-2 ${INPUT_CLASS}`} value={form.name} onChange={set("name")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inv-age">
              Age (optional)
            </label>
            <input
              id="inv-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              step="1"
              value={form.age}
              onChange={set("age")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inv-date">
              Party date
            </label>
            <input
              id="inv-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.date}
              onChange={set("date")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inv-time">
              Time
            </label>
            <input id="inv-time" className={`mt-2 ${INPUT_CLASS}`} value={form.time} onChange={set("time")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inv-venue">
              Venue
            </label>
            <input id="inv-venue" className={`mt-2 ${INPUT_CLASS}`} value={form.venue} onChange={set("venue")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inv-address">
              Address (optional)
            </label>
            <input
              id="inv-address"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.address}
              onChange={set("address")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inv-rsvp-name">
              RSVP contact name (optional)
            </label>
            <input
              id="inv-rsvp-name"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.rsvpName}
              onChange={set("rsvpName")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inv-rsvp-contact">
              RSVP phone or email (optional)
            </label>
            <input
              id="inv-rsvp-contact"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.rsvpContact}
              onChange={set("rsvpContact")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inv-rsvp-by">
              RSVP by (optional)
            </label>
            <input
              id="inv-rsvp-by"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.rsvpBy}
              onChange={set("rsvpBy")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="inv-theme">
              Theme
            </label>
            <select id="inv-theme" className={`mt-2 ${INPUT_CLASS}`} value={form.themeId} onChange={set("themeId")}>
              {THEMES.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="inv-size">
              Size
            </label>
            <select id="inv-size" className={`mt-2 ${INPUT_CLASS}`} value={form.sizeId} onChange={set("sizeId")}>
              {SIZES.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="inv-message">
              Closing message (optional, max {MAX_MESSAGE_LENGTH} characters)
            </label>
            <textarea
              id="inv-message"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={form.message}
              onChange={set("message")}
            />
          </div>
        </div>
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
              Invitation preview
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
              {failed ? DASH : card.dateLong}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? DASH : `${card.themeLabel} · ${card.sizeLabel} · ${card.width}×${card.height}px`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyDetails}
              disabled={failed}
              aria-label="Copy invitation details as text"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy text"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset invitation details" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {failed ? (
          <p className="mt-5 text-sm text-[var(--muted-foreground)]">
            Fix the highlighted detail to render the invitation.
          </p>
        ) : (
          <>
            <div className="mt-5 overflow-x-auto">
              <div className="mx-auto w-full max-w-[420px]">
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${card.width} ${card.height}`}
                  className="h-auto w-full rounded-lg ring-1 ring-[var(--border)]"
                  role="img"
                  aria-label={`Birthday invitation for ${form.name} on ${card.dateLong}`}
                >
                  <rect x="0" y="0" width={card.width} height={card.height} fill={card.colors.bg} />
                  {card.confetti.map((dot) =>
                    dot.round ? (
                      <circle key={dot.id} cx={dot.x} cy={dot.y} r={dot.size / 2} fill={dot.fill} opacity="0.85" />
                    ) : (
                      <rect
                        key={dot.id}
                        x={dot.x}
                        y={dot.y}
                        width={dot.size}
                        height={dot.size * 0.55}
                        rx={dot.size * 0.2}
                        fill={dot.fill}
                        opacity="0.85"
                        transform={`rotate(${dot.rotate} ${dot.x} ${dot.y})`}
                      />
                    ),
                  )}
                  <rect
                    x={card.panel.x}
                    y={card.panel.y}
                    width={card.panel.width}
                    height={card.panel.height}
                    rx={card.panel.radius}
                    fill={card.colors.panel}
                  />
                  {card.blocks.map((block) => {
                    if (block.kind === "rule") {
                      return (
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
                      );
                    }
                    if (block.kind === "badge") {
                      return (
                        <g key={block.id}>
                          <rect
                            x={block.rectX}
                            y={block.rectY}
                            width={block.rectWidth}
                            height={block.rectHeight}
                            rx={block.radius}
                            fill={block.fill}
                          />
                          <text
                            x={block.x}
                            y={block.y}
                            fill={block.textFill}
                            fontFamily={FONT_STACK}
                            fontSize={block.size}
                            fontWeight="700"
                            textAnchor="middle"
                            dominantBaseline="hanging"
                          >
                            {block.text}
                          </text>
                        </g>
                      );
                    }
                    return (
                      <text
                        key={block.id}
                        x={block.x}
                        y={block.y}
                        fill={block.fill}
                        fontFamily={FONT_STACK}
                        fontSize={block.size}
                        fontWeight={block.weight}
                        fontStyle={block.italic ? "italic" : "normal"}
                        letterSpacing={block.letterSpacing}
                        textAnchor="middle"
                        dominantBaseline="hanging"
                      >
                        {block.upper ? block.text.toUpperCase() : block.text}
                      </text>
                    );
                  })}
                </svg>
              </div>
            </div>

            {card.warning && (
              <p
                role="alert"
                className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {card.warning}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={downloadPng} aria-label="Download invitation as PNG" className={PRIMARY_BTN}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Download PNG
              </button>
              <button type="button" onClick={downloadSvg} aria-label="Download invitation as SVG" className={GHOST_BTN}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Download SVG
              </button>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Date", card.dateLong],
                ["Time", form.time],
                ["Venue", form.venue],
                ["Canvas", `${card.width} × ${card.height} px`],
                ["Theme", card.themeLabel],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The A5 size exports at 1748 × 2480 px, which is 300 dpi for A5 print. Downloaded SVG text
        uses your system font stack — export PNG if you need the layout to look identical everywhere.
      </p>
    </main>
  );
}
