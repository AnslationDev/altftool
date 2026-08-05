"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import ManagedImage from "@/components/ui/ManagedImage";

/**
 * Fullscreen photo viewer for the ad detail page.
 *
 * WHY A PORTAL. The viewer is `position: fixed`, and a fixed element is
 * clipped/re-anchored by any ancestor that creates a containing block
 * (transform, filter, will-change). `.bzr-gallery` sets `overflow: hidden`
 * and the page shell is free to grow a transform later, so the viewer is
 * portalled to <body> instead of trusting the ancestor chain. The portal root
 * carries `className="bazaar-page"` because every `--bzr-*` token is declared
 * on that class — outside it, `bzr-btn` and friends would render unstyled.
 *
 * Photos go through ManagedImage, not next/image: the corpus points at
 * picsum, which is not in next.config.mjs's remotePatterns.
 */

/* Anything that can hold focus inside the dialog. `:not([disabled])` keeps a
   disabled control from becoming the trap's first or last stop. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Minimum horizontal travel before a touch counts as a swipe, in px. */
const SWIPE_THRESHOLD = 45;

export default function GalleryLightbox({
  images = [],
  title = "",
  index = 0,
  onIndexChange,
  onClose,
}) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const stripRef = useRef(null);
  const thumbRefs = useRef([]);
  const touchStart = useRef(null);
  // Set when an arrow/Home/End press arrived while focus sat in the thumb
  // strip, so the roving tabindex can follow the selection after the render.
  const followFocus = useRef(false);
  const headingId = useId();

  const count = images.length;
  const safeIndex = count > 0 ? Math.min(Math.max(index, 0), count - 1) : 0;
  const current = images[safeIndex];

  const go = useCallback(
    (next) => {
      if (count === 0) return;
      onIndexChange?.((next + count) % count);
    },
    [count, onIndexChange],
  );

  /* --------------------------------------------------------------
   * Body scroll lock
   *
   * One effect with a cleanup, rather than an unlock call in each of the
   * three close paths (button, backdrop, Escape). Unmount is the single
   * event all three share, so the page can never be left frozen.
   * ------------------------------------------------------------ */
  useEffect(() => {
    const { body } = document;
    // Compensate for the scrollbar we are about to remove, or the page
    // visibly jumps sideways as the viewer opens. The pad goes on the side
    // the scrollbar occupies: right in LTR, left in RTL documents — physical
    // on purpose, side picked per direction.
    const side =
      getComputedStyle(document.documentElement).direction === "rtl"
        ? "paddingLeft"
        : "paddingRight";
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style[side];
    const gutter = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (gutter > 0) body.style[side] = `${gutter}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style[side] = previousPadding;
    };
  }, []);

  /* Open with focus on Close: it is the escape hatch, and it puts the
     keyboard user at the top of the trap rather than mid-strip. */
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  /* Roving tabindex: when the selection was changed from inside the strip,
     focus has to move with it or the user is left holding a tabindex="-1"
     thumb that no longer matches what is on screen. */
  useEffect(() => {
    if (!followFocus.current) return;
    followFocus.current = false;
    thumbRefs.current[safeIndex]?.focus();
  }, [safeIndex]);

  /* --------------------------------------------------------------
   * Keyboard: navigation, Escape, and the focus trap
   * ------------------------------------------------------------ */
  useEffect(() => {
    function trapTab(event) {
      const root = panelRef.current;
      if (!root) return;

      // `tabIndex >= 0` matters here: the thumb strip is a roving-tabindex
      // widget, so three of its four buttons are tabindex="-1" and are NOT in
      // the browser's tab order. Including them would put the trap's "last"
      // stop somewhere Tab never reaches, and focus would escape the dialog.
      const nodes = Array.from(root.querySelectorAll(FOCUSABLE)).filter(
        (node) =>
          node.tabIndex >= 0 &&
          (node.offsetParent !== null || node === document.activeElement),
      );
      if (nodes.length === 0) {
        event.preventDefault();
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      // Focus escaped the dialog (browser chrome, an extension) — pull it back.
      if (!root.contains(active)) {
        event.preventDefault();
        first.focus();
        return;
      }
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function onKeyDown(event) {
      const navKeys = ["ArrowRight", "ArrowLeft", "Home", "End"];
      if (navKeys.includes(event.key)) {
        followFocus.current = Boolean(
          stripRef.current && stripRef.current.contains(document.activeElement),
        );
      }

      switch (event.key) {
        case "Escape":
          event.preventDefault();
          onClose?.();
          break;
        case "ArrowRight":
          event.preventDefault();
          go(safeIndex + 1);
          break;
        case "ArrowLeft":
          event.preventDefault();
          go(safeIndex - 1);
          break;
        case "Home":
          event.preventDefault();
          go(0);
          break;
        case "End":
          event.preventDefault();
          go(count - 1);
          break;
        case "Tab":
          trapTab(event);
          break;
        default:
          break;
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [count, go, onClose, safeIndex]);

  /* --------------------------------------------------------------
   * Touch: plain swipe handlers, no carousel dependency
   * ------------------------------------------------------------ */
  function handleTouchStart(event) {
    const touch = event.changedTouches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;

    // Ignore anything short, and anything more vertical than horizontal —
    // that is a scroll gesture, not a swipe.
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    go(dx < 0 ? safeIndex + 1 : safeIndex - 1);
  }

  if (typeof document === "undefined" || count === 0) return null;

  return createPortal(
    <div
      className="bazaar-page fixed inset-0 z-[120] flex flex-col bg-black/92 backdrop-blur-sm"
      // The backdrop closes, but only when the click landed on the backdrop
      // itself — a click that started inside the image must not dismiss.
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="flex min-h-0 flex-1 flex-col"
      >
        {/* ---------------- Header ---------------- */}
        <div className="flex shrink-0 items-center gap-3 px-3 py-2.5 sm:px-4">
          <p id={headingId} className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
            {title}
          </p>
          <span
            className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold tabular-nums text-white"
            aria-hidden="true"
          >
            {safeIndex + 1} / {count}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={() => onClose?.()}
            aria-label="Close photo viewer"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 text-white motion-safe:transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* ---------------- Stage ---------------- */}
        <div
          className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-14"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <ManagedImage
            key={current.src}
            src={current.src}
            alt={current.alt || `${title} — photo ${safeIndex + 1} of ${count}`}
            className="max-h-full max-w-full object-contain"
            loading="eager"
          />

          {/* DELIBERATELY PHYSICAL, same rule as ItemGallery: prev/next are
              bound to swipe physics (dx < 0 is "next" above) and the physical
              ArrowLeft/ArrowRight keys, so the buttons stay at physical left/
              right with unflipped chevrons — one consistent system. */}
          {count > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go(safeIndex - 1)}
                aria-label="Previous photo"
                className="absolute left-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white motion-safe:transition hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-3"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go(safeIndex + 1)}
                aria-label="Next photo"
                className="absolute right-1 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white motion-safe:transition hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-3"
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </button>
            </>
          ) : null}
        </div>

        {/* The counter above is aria-hidden decoration; this is the bit a
            screen reader actually hears when the photo changes. */}
        <p className="sr-only" role="status" aria-live="polite">
          Photo {safeIndex + 1} of {count}
        </p>

        {/* ---------------- Thumbnail strip ----------------
            Roving tabindex, same contract as the inline strip: the whole
            strip is one tab stop, and the arrow keys (handled globally
            above) move the selection. */}
        {count > 1 ? (
          <div
            ref={stripRef}
            className="flex shrink-0 gap-1.5 overflow-x-auto px-3 py-3 sm:justify-center sm:px-4"
            role="group"
            aria-label={`Photos of ${title}`}
          >
            {images.map((image, i) => (
              <button
                key={image.src}
                type="button"
                ref={(node) => {
                  thumbRefs.current[i] = node;
                }}
                onClick={() => onIndexChange?.(i)}
                aria-current={i === safeIndex ? "true" : undefined}
                aria-label={`Show photo ${i + 1} of ${count}`}
                tabIndex={i === safeIndex ? 0 : -1}
                className={`h-12 w-16 shrink-0 overflow-hidden rounded-md border-2 motion-safe:transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  i === safeIndex ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <ManagedImage
                  src={image.src}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        ) : null}

        <p className="shrink-0 px-3 pb-3 text-center text-[0.7rem] text-white/60 sm:px-4">
          Use the arrow keys to move between photos, or press Escape to close.
        </p>
      </div>
    </div>,
    document.body,
  );
}
