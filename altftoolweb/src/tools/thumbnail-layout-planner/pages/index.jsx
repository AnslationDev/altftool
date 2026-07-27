"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Copy, LayoutTemplate, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  ELEMENT_TYPES,
  MAX_TEXT_WORDS,
  MIN_TEXT_HEIGHT_PERCENT,
  SAFE_MARGIN_PERCENT,
  THUMBNAIL_HEIGHT,
  THUMBNAIL_WIDTH,
  DURATION_BADGE,
  buildBrief,
  planThumbnail,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_ELEMENTS = [
  { id: "e1", label: "Presenter cut-out", type: "face", x: 52, y: 8, w: 40, h: 82 },
  { id: "e2", label: "Headline", type: "text", x: 8, y: 22, w: 40, h: 28 },
  { id: "e3", label: "Channel logo", type: "logo", x: 8, y: 74, w: 14, h: 16 },
];

const DEFAULTS = {
  videoTitle: "I rebuilt my studio for under 500 dollars",
  headline: "500 DOLLAR STUDIO",
  branding: "Teal accent bar bottom-left. Channel logo always bottom-left, never bottom-right.",
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const numberFmt = new Intl.NumberFormat("en-US");

export default function ToolHome() {
  const [videoTitle, setVideoTitle] = useState(DEFAULTS.videoTitle);
  const [headline, setHeadline] = useState(DEFAULTS.headline);
  const [branding, setBranding] = useState(DEFAULTS.branding);
  const [elements, setElements] = useState(DEFAULT_ELEMENTS);
  const [selectedId, setSelectedId] = useState(DEFAULT_ELEMENTS[0].id);
  const [nextId, setNextId] = useState(4);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef(null);
  const dragRef = useRef(null);

  const plan = useMemo(() => planThumbnail({ elements, headline }), [elements, headline]);
  const error = plan.error ?? null;

  const updateElement = (id, patch) => {
    setElements((previous) =>
      previous.map((element) => (element.id === id ? { ...element, ...patch } : element))
    );
  };

  const handlePointerDown = (event, element) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const pointerX = ((event.clientX - rect.left) / rect.width) * 100;
    const pointerY = ((event.clientY - rect.top) / rect.height) * 100;
    dragRef.current = {
      id: element.id,
      dx: pointerX - element.x,
      dy: pointerY - element.y,
      rect,
    };
    setSelectedId(element.id);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    const { rect, id, dx, dy } = drag;
    const pointerX = ((event.clientX - rect.left) / rect.width) * 100;
    const pointerY = ((event.clientY - rect.top) / rect.height) * 100;
    setElements((previous) =>
      previous.map((element) => {
        if (element.id !== id) return element;
        return {
          ...element,
          x: Number(clamp(pointerX - dx, 0, 100 - element.w).toFixed(1)),
          y: Number(clamp(pointerY - dy, 0, 100 - element.h).toFixed(1)),
        };
      })
    );
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const nudge = (id, axis, delta) => {
    setElements((previous) =>
      previous.map((element) => {
        if (element.id !== id) return element;
        const limit = axis === "x" ? 100 - element.w : 100 - element.h;
        return { ...element, [axis]: Number(clamp(element[axis] + delta, 0, limit).toFixed(1)) };
      })
    );
  };

  const addElement = () => {
    const id = `e${nextId}`;
    setElements((previous) => [
      ...previous,
      { id, label: `Element ${previous.length + 1}`, type: "shape", x: 30, y: 30, w: 25, h: 25 },
    ]);
    setSelectedId(id);
    setNextId((value) => value + 1);
  };

  const removeElement = (id) => {
    setElements((previous) => previous.filter((element) => element.id !== id));
  };

  const brief = useMemo(
    () => (error ? { error } : buildBrief({ videoTitle, headline, branding, plan })),
    [error, videoTitle, headline, branding, plan]
  );

  const handleCopy = async () => {
    if (brief.error) return;
    try {
      await navigator.clipboard.writeText(brief.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setVideoTitle(DEFAULTS.videoTitle);
    setHeadline(DEFAULTS.headline);
    setBranding(DEFAULTS.branding);
    setElements(DEFAULT_ELEMENTS);
    setSelectedId(DEFAULT_ELEMENTS[0].id);
    setNextId(4);
    setCopied(false);
  };

  const dash = "—";
  const selected = elements.find((element) => element.id === selectedId) || null;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6 flex items-start gap-3">
        <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
          <LayoutTemplate className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)] sm:text-2xl">
            Thumbnail Layout Planner
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Block out a {THUMBNAIL_WIDTH}×{THUMBNAIL_HEIGHT} thumbnail, drag the pieces, and
            check them against the safe margin, the duration badge and 168 px legibility.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="video-title">
            Video title
          </label>
          <input
            id="video-title"
            className={`${INPUT_CLASS} mt-1.5`}
            value={videoTitle}
            onChange={(event) => setVideoTitle(event.target.value)}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="headline">
            Thumbnail headline ({MAX_TEXT_WORDS} words max)
          </label>
          <input
            id="headline"
            className={`${INPUT_CLASS} mt-1.5`}
            value={headline}
            onChange={(event) => setHeadline(event.target.value)}
          />
        </div>
      </div>

      <div
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className="relative mt-5 w-full touch-none overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)]"
        style={{ aspectRatio: "16 / 9" }}
        aria-label="Thumbnail preview canvas"
      >
        <div
          className="pointer-events-none absolute rounded-sm border border-dashed border-[var(--muted-foreground)]/50"
          style={{
            left: `${SAFE_MARGIN_PERCENT}%`,
            top: `${SAFE_MARGIN_PERCENT}%`,
            right: `${SAFE_MARGIN_PERCENT}%`,
            bottom: `${SAFE_MARGIN_PERCENT}%`,
          }}
        />
        <div
          className="pointer-events-none absolute rounded-sm bg-[var(--danger)]/20 ring-1 ring-[var(--danger)]/40"
          style={{
            left: `${DURATION_BADGE.x}%`,
            top: `${DURATION_BADGE.y}%`,
            width: `${DURATION_BADGE.w}%`,
            height: `${DURATION_BADGE.h}%`,
          }}
        />
        {elements.map((element) => {
          const item = error ? null : plan.items.find((entry) => entry.id === element.id);
          const flagged = item ? item.issues.length > 0 : false;
          return (
            <button
              key={element.id}
              type="button"
              onPointerDown={(event) => handlePointerDown(event, element)}
              onKeyDown={(event) => {
                const step = event.shiftKey ? 5 : 1;
                if (event.key === "ArrowLeft") { event.preventDefault(); nudge(element.id, "x", -step); }
                if (event.key === "ArrowRight") { event.preventDefault(); nudge(element.id, "x", step); }
                if (event.key === "ArrowUp") { event.preventDefault(); nudge(element.id, "y", -step); }
                if (event.key === "ArrowDown") { event.preventDefault(); nudge(element.id, "y", step); }
              }}
              aria-label={`${element.label}, drag or use arrow keys to move`}
              className={`absolute flex cursor-grab items-center justify-center rounded-md px-1 text-center text-[10px] font-semibold leading-tight ring-2 focus-visible:outline-none focus-visible:ring-[3px] sm:text-xs ${
                flagged
                  ? "bg-[var(--danger-soft)] text-[var(--danger)] ring-[var(--danger)]"
                  : "bg-[var(--primary)]/20 text-[var(--foreground)] ring-[var(--primary)]"
              } ${selectedId === element.id ? "z-10" : ""}`}
              style={{
                left: `${element.x}%`,
                top: `${element.y}%`,
                width: `${element.w}%`,
                height: `${element.h}%`,
              }}
            >
              {element.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-[var(--muted-foreground)]">
        Dashed frame = {SAFE_MARGIN_PERCENT}% safe margin. Shaded corner = the duration badge.
        Drag a block, or focus it and use the arrow keys.
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Elements</h2>
        <button type="button" className={GHOST_BTN} onClick={addElement} aria-label="Add an element">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add element
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {elements.map((element) => (
          <div
            key={element.id}
            className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor={`label-${element.id}`}>
                  Label
                </label>
                <input
                  id={`label-${element.id}`}
                  className={`${INPUT_CLASS} mt-1.5`}
                  value={element.label}
                  onChange={(event) => updateElement(element.id, { label: event.target.value })}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`type-${element.id}`}>
                  Type
                </label>
                <select
                  id={`type-${element.id}`}
                  className={`${INPUT_CLASS} mt-1.5`}
                  value={element.type}
                  onChange={(event) => updateElement(element.id, { type: event.target.value })}
                >
                  {ELEMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["x", "X %"],
                ["y", "Y %"],
                ["w", "Width %"],
                ["h", "Height %"],
              ].map(([key, text]) => (
                <div key={key}>
                  <label className={LABEL_CLASS} htmlFor={`${key}-${element.id}`}>
                    {text}
                  </label>
                  <input
                    id={`${key}-${element.id}`}
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    className={`${INPUT_CLASS} mt-1.5`}
                    value={element[key]}
                    onChange={(event) =>
                      updateElement(element.id, { [key]: Number(event.target.value) })
                    }
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-[var(--muted-foreground)]">
                {error
                  ? dash
                  : (() => {
                      const item = plan.items.find((entry) => entry.id === element.id);
                      if (!item) return dash;
                      return `${item.px.w}×${item.px.h} px · ${item.rendered.suggestedPx} px tall at 168 px`;
                    })()}
              </p>
              <button
                type="button"
                className={GHOST_BTN}
                onClick={() => removeElement(element.id)}
                aria-label={`Remove ${element.label}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <label className={LABEL_CLASS} htmlFor="branding">
          Branding notes
        </label>
        <textarea
          id="branding"
          rows={3}
          className={`${TEXTAREA_CLASS} mt-1.5`}
          value={branding}
          onChange={(event) => setBranding(event.target.value)}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <section className="mt-5 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          Layout score
        </p>
        <p className="mt-1 text-4xl font-bold text-[var(--foreground)]">
          {error ? dash : `${plan.score}/100`}
        </p>
        <p className="mt-1 text-sm font-semibold text-[var(--muted-foreground)]">
          {error ? dash : plan.verdict}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4 text-sm">
          <div>
            <dt className="text-[var(--muted-foreground)]">Frame coverage</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : `${plan.coverage}%`}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Headline words</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : numberFmt.format(plan.headlineWords)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Elements</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : numberFmt.format(plan.items.length)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted-foreground)]">Issues flagged</dt>
            <dd className="font-semibold text-[var(--foreground)]">
              {error ? dash : numberFmt.format(plan.warnings.length)}
            </dd>
          </div>
        </dl>

        {!error && plan.warnings.length > 0 ? (
          <ul className="mt-4 space-y-1.5 border-t border-[var(--border)] pt-4 text-sm text-[var(--danger)]">
            {plan.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
        {!error && plan.warnings.length === 0 ? (
          <p className="mt-4 border-t border-[var(--border)] pt-4 text-sm text-[var(--success)]">
            Everything clears the safe margin, the duration badge and the{" "}
            {MIN_TEXT_HEIGHT_PERCENT}% minimum text height.
          </p>
        ) : null}
      </section>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className={PRIMARY_BTN}
          onClick={handleCopy}
          aria-label="Copy the creative brief to clipboard"
          disabled={Boolean(brief.error)}
        >
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied!" : "Copy brief"}
        </button>
        <button type="button" className={GHOST_BTN} onClick={handleReset} aria-label="Reset the layout">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      {selected ? (
        <p className="mt-4 text-xs text-[var(--muted-foreground)]">
          Selected: {selected.label}
        </p>
      ) : null}
    </div>
  );
}
