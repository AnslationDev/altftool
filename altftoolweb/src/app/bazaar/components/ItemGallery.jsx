"use client";

import { useCallback, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff, Maximize2 } from "lucide-react";

import ManagedImage from "@/components/ui/ManagedImage";

import GalleryLightbox from "./GalleryLightbox";

/**
 * Detail-page photo gallery.
 *
 * The thumbnail strip is a real tablist-style roving-tabindex widget: one tab
 * stop for the whole strip, arrows/Home/End move the selection AND the focus.
 * That is the pattern keyboard users expect from a picture carousel, and it
 * keeps the strip from swallowing 7 tab presses on the way to "Chat".
 *
 * The main image is also the trigger for a fullscreen viewer
 * (`GalleryLightbox`). Condition is the thing a classifieds buyer is actually
 * trying to read out of a photo, and a 4:3 box in a column cannot show it.
 * The active index is owned here, so opening the viewer starts on the photo
 * you were looking at and closing it leaves you there.
 *
 * Photos go through ManagedImage, not next/image — the corpus points at
 * picsum, which is not in next.config.mjs's remotePatterns.
 */
export default function ItemGallery({ images = [], title = "" }) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const thumbRefs = useRef([]);
  const triggerRef = useRef(null);

  const count = images.length;
  const safeActive = count > 0 ? Math.min(active, count - 1) : 0;
  const current = images[safeActive];

  const select = useCallback((index, moveFocus) => {
    setActive(index);
    if (moveFocus) thumbRefs.current[index]?.focus();
  }, []);

  const step = useCallback(
    (delta) => {
      if (count === 0) return;
      select((safeActive + delta + count) % count, false);
    },
    [count, safeActive, select],
  );

  /**
   * Close the viewer and hand focus back to the control that opened it.
   *
   * The state update is queued, so the `focus()` below runs while the trigger
   * is still mounted; React unmounts the portal afterwards. Every close path
   * (button, backdrop, Escape) funnels through here, so none of them can drop
   * the keyboard user at the top of the document.
   */
  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    triggerRef.current?.focus();
  }, []);

  function handleKeyDown(event) {
    if (count === 0) return;
    let next = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (safeActive + 1) % count;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (safeActive - 1 + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;

    if (next !== null) {
      event.preventDefault();
      select(next, true);
    }
  }

  if (count === 0) {
    return (
      <div className="bzr-gallery">
        <div className="bzr-gallery-main grid place-items-center text-(--muted-foreground)">
          <ImageOff className="h-8 w-8 opacity-50" aria-hidden="true" />
          <p className="mt-2 text-sm">No photos on this ad</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bzr-gallery">
      <div className="bzr-gallery-main relative">
        {/* The image is wrapped in the trigger rather than the trigger being
            overlaid on it, so `.bzr-gallery-main img` still matches. The
            prev/next controls stay siblings — nesting them inside this
            button would be invalid HTML and unreachable by keyboard. */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-haspopup="dialog"
          aria-label={`View photo ${safeActive + 1} of ${count} full screen`}
          className="block h-full w-full cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-(--primary)"
        >
          <ManagedImage
            key={current.src}
            src={current.src}
            alt={current.alt || `${title} — photo ${safeActive + 1}`}
            width={800}
            height={600}
            loading="eager"
            fetchPriority="high"
          />
        </button>

        <span
          className="pointer-events-none absolute bottom-2 end-2 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold text-white"
          aria-hidden="true"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          Tap to enlarge
        </span>

        {/* DELIBERATELY PHYSICAL (left-2 / right-2, unflipped chevrons): the
            gallery's prev/next are content-order controls tied to swipe
            physics — in the lightbox a leftward swipe and the ArrowRight key
            both mean "next" regardless of interface direction. Button
            position, glyph, key binding and gesture stay one physical system;
            mirroring only some of them would make them disagree. The text
            chrome around them (counter, tap-to-enlarge) is interface, not
            navigation, and does mirror. */}
        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-(--border) bg-(--background)/85 text-(--foreground) backdrop-blur transition hover:bg-(--background)"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-(--border) bg-(--background)/85 text-(--foreground) backdrop-blur transition hover:bg-(--background)"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        ) : null}

        <span className="pointer-events-none absolute end-2 top-2 z-10 rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold text-white">
          {safeActive + 1} / {count}
        </span>
      </div>

      {/* Announce photo changes for screen-reader users driving the strip. */}
      <p className="sr-only" role="status" aria-live="polite">
        Photo {safeActive + 1} of {count}
      </p>

      <div
        className="bzr-gallery-thumbs"
        role="group"
        aria-label={`Photos of ${title}`}
        onKeyDown={handleKeyDown}
      >
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            ref={(node) => {
              thumbRefs.current[index] = node;
            }}
            className="bzr-thumb"
            aria-current={index === safeActive ? "true" : undefined}
            aria-label={`Show photo ${index + 1} of ${count}`}
            tabIndex={index === safeActive ? 0 : -1}
            onClick={() => select(index, false)}
          >
            <ManagedImage
              src={image.src}
              alt=""
              width={128}
              height={96}
              loading={index < 4 ? "eager" : "lazy"}
            />
          </button>
        ))}
      </div>

      {lightboxOpen ? (
        <GalleryLightbox
          images={images}
          title={title}
          index={safeActive}
          onIndexChange={(next) => setActive(next)}
          onClose={closeLightbox}
        />
      ) : null}
    </div>
  );
}
