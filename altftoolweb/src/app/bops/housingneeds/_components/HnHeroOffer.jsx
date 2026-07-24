"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import HnEmailCapture from "./HnEmailCapture";
import { hasDismissedPage, isSubscribed, markPageDismissed } from "../_lib/leadState";

// After the hero settles, wait this long, then split it open. The delay makes
// the reveal read as a deliberate moment rather than a page-load popup.
const REVEAL_DELAY_MS = 2000;
// Hold the "check your inbox" confirmation for a beat before collapsing back.
const SUCCESS_HOLD_MS = 2200;

const HERO_PERKS = [
  "Free quotes from vetted, licensed local pros",
  "Exclusive limited-time offers + honest cost ranges",
];

/**
 * Wraps the hero's inner content and, on a visitor's first visit to a page,
 * splits the hero into two columns to reveal an email offer — then collapses
 * back to the normal single-column hero when dismissed or after a submit.
 *
 * The hero text (headline, buttons, …) is passed through as `children`, so it
 * stays server-rendered: the LCP headline and its content are always in the
 * DOM, and this island only orchestrates the reveal/collapse animation.
 *
 * Appearance rules (see _lib/leadState):
 *   - never once the visitor has subscribed anywhere;
 *   - otherwise once per page, on the first visit (tracked per pageKey).
 */
export default function HnHeroOffer({
  pageKey,
  source,
  heading,
  subtext,
  perks = HERO_PERKS,
  children,
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => {
    // Show on every visit unless the visitor has subscribed anywhere, or has
    // already dismissed / submitted the offer on this specific page. Reveal
    // does NOT mark the page — only a dismiss or submit does.
    if (isSubscribed() || hasDismissedPage(pageKey)) return undefined;

    const revealTimer = setTimeout(() => setOpen(true), REVEAL_DELAY_MS);
    return () => clearTimeout(revealTimer);
  }, [pageKey]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  function dismiss() {
    markPageDismissed(pageKey);
    setOpen(false);
  }

  function handleDone() {
    // markSubscribed() already ran inside HnEmailCapture (suppresses the offer
    // everywhere). Also mark this page dismissed as a fallback, then let the
    // success confirmation read for a moment before collapsing to the hero.
    markPageDismissed(pageKey);
    closeTimer.current = setTimeout(() => setOpen(false), SUCCESS_HOLD_MS);
  }

  return (
    <div className={`hn-hero-inner${open ? " hn-hero-inner--offer" : ""}`}>
      <div className="hn-hero-text">{children}</div>

      <aside
        className="hn-hero-offer"
        data-open={open ? "true" : "false"}
        aria-label="Free home maintenance calendar"
        inert={open ? undefined : true}
      >
        <div className="hn-hero-offer-inner">
          <button
            type="button"
            className="hn-hero-offer-close"
            onClick={dismiss}
            aria-label="Dismiss this offer"
          >
            <X size={16} strokeWidth={2.4} aria-hidden="true" />
          </button>

          <HnEmailCapture
            source={source}
            heading={heading}
            subtext={subtext}
            perks={perks}
            onDone={handleDone}
          />
        </div>
      </aside>
    </div>
  );
}
