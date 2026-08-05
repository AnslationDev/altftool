"use client";

/**
 * "Make an offer" — the half of an Indian classifieds transaction that OLX
 * leaves entirely inside a chat thread.
 *
 * Nobody pays the asking price. The first message on a real ad is a number, and
 * a buyer's actual question before sending it is "what number is not insulting?"
 * This dialog answers that with the three things it can honestly know: the
 * asking price, what similar ads in the same city ask, and whether the seller
 * has said the price is firm.
 *
 * ── DESIGN RULES ─────────────────────────────────────────────────────────────
 *
 * 1. Guardrails inform, they never block. A lowball offer is a legitimate thing
 *    to send — plenty get accepted by a seller who is moving house on Sunday.
 *    So the "sellers rarely accept this" warning appears next to a Send button
 *    that still works. The only thing that blocks submission is an amount that
 *    is not a number.
 * 2. A non-negotiable listing says so plainly, up front, before the amount is
 *    typed. Quietly accepting an offer on a firm-price ad would be the UI
 *    lying by omission about how it will land.
 * 3. The market comparison reuses PriceInsight's honesty rules exactly: no
 *    insight for jobs (a salary is not a price) or free giveaways (everything
 *    is ₹0), a national fallback that says it is a fallback, and a thin-sample
 *    caveat. Those constants are re-declared below rather than imported —
 *    PriceInsight.jsx belongs to another surface and exporting its internals to
 *    keep one number in sync in two places is a worse trade than a comment.
 * 4. Nothing is sent. Not on submit, not later. The success state leads with
 *    that, because a buyer who believes a seller has seen their ₹40,000 will
 *    sit and wait for a reply that cannot come.
 *
 * Portalled to <body> under a `.bazaar-page` root, like ReportAdDialog:
 * `position: fixed` is only reliable outside a transformed ancestor, and every
 * `--bzr-*` token is declared on that class.
 */

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Check, HandCoins, Info, Lock, Trash2, X } from "lucide-react";

import { formatPrice, getPriceStats } from "../data/listings";
import { getMarket } from "../data/market";
import { roundPrice } from "../data/random";
import { useBazaarStore, useHydrated } from "../hooks/useBazaarStore";
import { useLocale } from "../i18n/useLocale";

/** Same exclusions as PriceInsight: a percentile means nothing in these. */
const NO_INSIGHT_CATEGORIES = new Set(["jobs", "free-giveaway"]);

/** Categories where an offer is not a coherent action at all. */
const NO_OFFER_CATEGORIES = new Set(["jobs", "free-giveaway"]);

/** Below this sample a median is an anecdote wearing a lab coat. (PriceInsight) */
const MIN_SAMPLE = 5;

/** Below this, show the number but tell the reader to distrust it. (PriceInsight) */
const THIN_SAMPLE = 20;

/** The prefilled anchor: a shade under asking, which is where haggling starts. */
const ANCHOR_PCT = 90;

/** Quick picks, as a percentage of the asking price. */
const QUICK_PCTS = [95, 90, 85, 80];

/** Under this share of asking, say out loud that it rarely works. */
const LOWBALL_PCT = 60;

const NOTE_MAX = 200;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Can this listing be offered on at all?
 *
 * Exported so a caller can reason about the CTA without rendering it, though
 * the component also guards itself — see the early return below.
 */
export function canMakeOffer(listing) {
  return Boolean(listing) && listing.price > 0 && !NO_OFFER_CATEGORIES.has(listing.categorySlug);
}

/** `roundPrice` keeps offers looking like offers — ₹40,500, never ₹40,499. */
function pctOfAsking(asking, pct) {
  return Math.max(1, roundPrice(Math.round((asking * pct) / 100)));
}

export default function MakeOfferDialog({ listing }) {
  // Controls and short status lines resolve through the catalogue; the long
  // negotiation-guidance paragraphs (firm price, lowball, market context,
  // success explanation) deliberately stay English — nuanced money advice is
  // exactly where a half-good translation would mislead. Listed as a boundary.
  const { t } = useLocale();
  const hydrated = useHydrated();
  const offers = useBazaarStore((s) => s.offers);
  const addOffer = useBazaarStore((s) => s.addOffer);
  const removeOffer = useBazaarStore((s) => s.removeOffer);

  const asking = listing?.price || 0;
  const anchor = asking > 0 ? pctOfAsking(asking, ANCHOR_PCT) : 0;

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [nudge, setNudge] = useState(false);

  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const amountRef = useRef(null);
  const wasOpen = useRef(false);

  const headingId = useId();
  const descriptionId = useId();
  const amountId = useId();
  const noteId = useId();
  const previewId = useId();
  const counterId = useId();
  const hintId = useId();

  // Until localStorage has been read, "have I already offered?" is unknown, so
  // render the neutral trigger. Reading it during render would make the first
  // client render disagree with the prerendered HTML.
  const existing = hydrated ? offers.find((o) => o.listingId === listing?.id) || null : null;

  /* ---------------- Market context ---------------- */

  const insight = useMemo(() => {
    if (!listing || NO_INSIGHT_CATEGORIES.has(listing.categorySlug) || !(listing.price > 0)) {
      return null;
    }
    const cityStats = getPriceStats(listing.categorySlug, listing.citySlug);
    const usingCity = Boolean(cityStats && cityStats.count >= MIN_SAMPLE);
    const stats = usingCity ? cityStats : getPriceStats(listing.categorySlug);
    if (!stats || stats.count < MIN_SAMPLE) return null;
    return { ...stats, usingCity, cityCount: cityStats?.count || 0 };
  }, [listing]);

  /* ---------------- Dialog plumbing ---------------- */

  function openDialog() {
    // Re-opening starts from the current offer if there is one, so "change my
    // offer" begins at the number the visitor already chose rather than
    // silently resetting them to the anchor.
    setAmount(String(existing?.amount ?? anchor));
    setNote(existing?.note || "");
    setSubmitted(false);
    setNudge(false);
    setOpen(true);
  }

  function closeDialog() {
    setOpen(false);
  }

  /* Focus restoration happens in an effect rather than inside closeDialog,
     because submitting swaps the trigger button for the "You offered ₹X" panel
     with its own button. Focusing `triggerRef.current` synchronously would
     focus the node React is about to unmount; after commit the ref holds the
     replacement. */
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return;
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      triggerRef.current?.focus();
    }
  }, [open]);

  /* Body scroll lock, released on unmount so every close path restores once.
     The gutter pad goes on the side the scrollbar actually occupies: right in
     LTR, left in RTL documents — physical on purpose, side picked per
     direction. */
  useEffect(() => {
    if (!open) return undefined;

    const { body } = document;
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
  }, [open]);

  /* The amount is the decision this dialog exists to take, so it gets focus. */
  useEffect(() => {
    if (open && !submitted) amountRef.current?.focus();
  }, [open, submitted]);

  /* Escape + focus trap. */
  useEffect(() => {
    if (!open) return undefined;

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const root = panelRef.current;
      if (!root) return;

      // tabIndex >= 0 keeps anything the browser skips out of the boundary
      // calculation — otherwise "last" can be a stop Tab never reaches and
      // focus escapes the dialog.
      const nodes = Array.from(root.querySelectorAll(FOCUSABLE)).filter(
        (node) =>
          node.tabIndex >= 0 && (node.offsetParent !== null || node === document.activeElement),
      );
      if (nodes.length === 0) {
        event.preventDefault();
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

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

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  /* ---------------- Offering makes no sense here ---------------- */

  // After the hooks, never before: bailing earlier would change the hook order
  // between listings and React would throw.
  if (!canMakeOffer(listing)) return null;

  /* ---------------- Amount analysis ---------------- */

  const parsed = Number(amount);
  const valid = amount !== "" && Number.isFinite(parsed) && parsed > 0;
  const rounded = valid ? Math.round(parsed) : 0;
  const sharePct = valid && asking > 0 ? Math.round((rounded / asking) * 100) : 0;
  const lowball = valid && sharePct < LOWBALL_PCT;
  const aboveAsking = valid && rounded > asking;

  const quickPicks = [];
  for (const pct of QUICK_PCTS) {
    const value = pctOfAsking(asking, pct);
    // Cheap categories round to the same rupee figure at 95% and 90%; a second
    // button with an identical amount is noise.
    if (value >= asking || quickPicks.some((p) => p.value === value)) continue;
    quickPicks.push({ pct, value });
  }

  const medianDeltaPct =
    insight && insight.median > 0 && valid
      ? Math.round(((rounded - insight.median) / insight.median) * 100)
      : 0;

  function handleSubmit(event) {
    event.preventDefault();
    if (!valid) {
      // The button stays reachable (aria-disabled, not disabled) so pressing it
      // explains itself instead of doing nothing.
      setNudge(true);
      amountRef.current?.focus();
      return;
    }
    addOffer({
      listingId: listing.id,
      listingSlug: listing.slug,
      listingTitle: listing.title,
      askingPrice: asking,
      amount: rounded,
      note,
    });
    setSubmitted(true);
  }

  /* ---------------- Trigger ---------------- */

  const trigger = existing ? (
    <div className="rounded-lg border border-(--border) bg-(--muted)/40 px-3 py-2.5">
      <p className="flex items-center gap-2 text-sm font-bold text-(--foreground)">
        <HandCoins className="h-4 w-4 shrink-0 text-(--muted-foreground)" aria-hidden="true" />
        {t("offer.youOffered", { amount: formatPrice(existing.amount) })}
      </p>
      <p className="mt-1 text-xs text-(--muted-foreground)">
        {existing.askingPrice > 0 && existing.amount !== existing.askingPrice
          ? `${Math.round((existing.amount / existing.askingPrice) * 100)}% of the ${formatPrice(existing.askingPrice)} asking price. `
          : ""}
        Saved in this browser only — the seller has not seen it.
      </p>
      {existing.note ? (
        <p className="mt-1 break-words text-xs italic text-(--muted-foreground)">
          “{existing.note}”
        </p>
      ) : null}
      <div className="mt-2.5 flex flex-wrap gap-2">
        <button
          ref={triggerRef}
          type="button"
          className="bzr-chip"
          aria-haspopup="dialog"
          onClick={openDialog}
        >
          {t("offer.change")}
        </button>
        <button type="button" className="bzr-chip" onClick={() => removeOffer(existing.id)}>
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          {t("offer.withdraw")}
        </button>
      </div>
    </div>
  ) : (
    <button
      ref={triggerRef}
      type="button"
      className="bzr-btn bzr-btn-secondary bzr-btn-block"
      aria-haspopup="dialog"
      onClick={openDialog}
    >
      <HandCoins className="h-4 w-4" aria-hidden="true" />
      {t("offer.make")}
    </button>
  );

  if (!open || typeof document === "undefined") return trigger;

  /* ---------------- Dialog ---------------- */

  return (
    <>
      {trigger}
      {createPortal(
        <div
          className="bazaar-page fixed inset-0 z-[120] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            aria-describedby={descriptionId}
            className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[var(--anslation-ds-radius-lg,0.75rem)] border border-(--border) bg-(--background) shadow-xl sm:rounded-[var(--anslation-ds-radius-lg,0.75rem)]"
          >
            {/* ---------------- Header ---------------- */}
            <div className="flex shrink-0 items-start gap-3 border-b border-(--border) px-4 py-3">
              <div className="min-w-0 flex-1">
                <h2 id={headingId} className="text-base font-semibold text-(--foreground)">
                  {t("offer.make")}
                </h2>
                <p className="mt-0.5 truncate text-xs text-(--muted-foreground)">
                  {listing.title} · asking {formatPrice(asking)}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                aria-label={t("offer.close")}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-(--border) text-(--foreground) motion-safe:transition hover:bg-(--muted)/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {submitted ? (
              /* ---------------- Success ---------------- */
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                <div
                  role="status"
                  className="flex items-start gap-2.5 rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--border) bg-(--muted)/40 px-3 py-3"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-(--primary)" aria-hidden="true" />
                  <div className="min-w-0 text-sm text-(--foreground)">
                    <p className="font-semibold">
                      Offer of {formatPrice(rounded)} saved
                      {sharePct ? ` — ${sharePct}% of the asking price` : ""}.
                    </p>
                    {note.trim() ? (
                      <p className="mt-1 break-words text-(--muted-foreground)">“{note.trim()}”</p>
                    ) : null}
                    <p className="mt-2 text-(--muted-foreground)">
                      <strong className="font-semibold text-(--foreground)">
                        Nothing was sent to the seller.
                      </strong>{" "}
                      AltF Bazaar is a prototype with no backend, so this offer is stored in this
                      browser and nowhere else. On the live product it would arrive in the seller&apos;s
                      inbox, they could accept, decline or counter it, and the ad would show that it
                      has an offer pending.
                    </p>
                    <p className="mt-2 text-(--muted-foreground)">
                      It will still be here when you come back to this ad — the detail page reads it
                      back so you do not offer twice.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className="bzr-btn bzr-btn-secondary"
                    onClick={() => setSubmitted(false)}
                  >
                    {t("offer.changeIt")}
                  </button>
                  <button type="button" className="bzr-btn" onClick={closeDialog}>
                    {t("common.done")}
                  </button>
                </div>
              </div>
            ) : (
              /* ---------------- Form ---------------- */
              /* noValidate on purpose: native constraint validation would
                 refuse to submit and show a browser tooltip, which is a block,
                 not information. All validation here is ours. */
              <form noValidate onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                  <p
                    id={descriptionId}
                    className="mb-3 flex items-start gap-2 rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--border) bg-(--muted)/40 px-3 py-2.5 text-xs text-(--muted-foreground)"
                  >
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {/* Three catalogue parts so the bolded phrase can sit where
                        each language's word order puts it. */}
                    <span>
                      {t("offer.demo.pre")}
                      <strong className="font-semibold">{t("offer.demo.strong")}</strong>
                      {t("offer.demo.post")}
                    </span>
                  </p>

                  {/* Rule 2: a firm price is stated before the amount is typed. */}
                  {listing.negotiable ? null : (
                    <p className="mb-3 flex items-start gap-2 rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--bzr-urgent)/40 bg-(--bzr-urgent)/8 px-3 py-2.5 text-xs text-(--foreground)">
                      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>
                        <strong className="font-semibold">
                          This seller has marked the price as firm.
                        </strong>{" "}
                        They have said {formatPrice(asking)} is not negotiable, so an offer below it
                        will probably be declined. You can still send one — sellers do change their
                        minds — but go in expecting a no.
                      </span>
                    </p>
                  )}

                  {/* ---------------- Amount ---------------- */}
                  <label
                    htmlFor={amountId}
                    className="block text-xs font-bold uppercase tracking-wide text-(--muted-foreground)"
                  >
                    {t("offer.yourOffer")}
                  </label>
                  <div className="mt-1 flex items-center gap-2 rounded-lg border border-(--border) bg-(--card) px-3 py-2 focus-within:border-(--primary) focus-within:ring-2 focus-within:ring-(--primary)">
                    <span className="shrink-0 text-sm font-bold text-(--muted-foreground)" aria-hidden="true">
                      {getMarket().currencySymbol}
                    </span>
                    <input
                      ref={amountRef}
                      id={amountId}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      step={1}
                      value={amount}
                      aria-describedby={`${previewId} ${hintId}`}
                      aria-invalid={nudge && !valid ? "true" : undefined}
                      onChange={(event) => {
                        setAmount(event.target.value);
                        setNudge(false);
                      }}
                      className="w-full min-w-0 bg-transparent text-base font-bold tabular-nums text-(--foreground) outline-none"
                    />
                  </div>

                  {/* Live formatted preview — an Indian-grouped figure is far
                      easier to sanity-check than "40500" in a number field. */}
                  <p id={previewId} role="status" className="mt-1.5 text-sm text-(--muted-foreground)">
                    {valid ? (
                      <>
                        <strong className="font-bold text-(--foreground)">
                          {formatPrice(rounded)}
                        </strong>{" "}
                        · {sharePct}% of the {formatPrice(asking)} asking price
                        {rounded < asking ? ` · ${formatPrice(asking - rounded)} less` : ""}
                      </>
                    ) : (
                      t("offer.previewEmpty")
                    )}
                  </p>

                  {/* ---------------- Quick picks ---------------- */}
                  {quickPicks.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">
                        {t("offer.quickPicks")}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {quickPicks.map((pick) => (
                          <button
                            key={pick.pct}
                            type="button"
                            className={`bzr-chip${rounded === pick.value ? " is-active" : ""}`}
                            aria-pressed={rounded === pick.value}
                            onClick={() => {
                              setAmount(String(pick.value));
                              setNudge(false);
                            }}
                          >
                            {formatPrice(pick.value)}
                            <span className="opacity-70">· {pick.pct}%</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* ---------------- Guardrails (rule 1: inform, never block) ---------------- */}
                  {lowball ? (
                    <p
                      role="status"
                      className="mt-3 flex items-start gap-2 rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--bzr-featured)/40 bg-(--bzr-featured)/8 px-3 py-2.5 text-xs text-(--foreground)"
                    >
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>
                        That is {sharePct}% of the asking price.{" "}
                        <strong className="font-semibold">Sellers rarely accept this</strong> — most
                        stop replying rather than counter. You can send it anyway, and if the ad has
                        been up a while it sometimes lands, but a first offer around{" "}
                        {formatPrice(pctOfAsking(asking, 85))} keeps the conversation alive.
                      </span>
                    </p>
                  ) : null}

                  {aboveAsking ? (
                    <p
                      role="status"
                      className="mt-3 flex items-start gap-2 rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--border) bg-(--muted)/40 px-3 py-2.5 text-xs text-(--foreground)"
                    >
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>
                        This is above the {formatPrice(asking)} the seller is asking. You do not
                        need to offer more than that unless you are competing with another buyer.
                      </span>
                    </p>
                  ) : null}

                  {/* ---------------- Market context (rule 3) ---------------- */}
                  {insight && valid ? (
                    <div className="mt-3 rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--border) px-3 py-2.5">
                      <p className="text-xs text-(--foreground)">
                        {medianDeltaPct === 0 ? (
                          <>
                            Your offer is right at the median asking price for{" "}
                            {listing.categoryName.toLowerCase()}{" "}
                            {insight.usingCity
                              ? `in ${listing.cityName}`
                              : `across ${getMarket().countryName}`}{" "}
                            ({formatPrice(insight.median)}).
                          </>
                        ) : (
                          <>
                            Your offer is{" "}
                            <strong className="font-semibold">
                              {Math.abs(medianDeltaPct)}% {medianDeltaPct < 0 ? "below" : "above"}
                            </strong>{" "}
                            the {formatPrice(insight.median)} median asking price for{" "}
                            {listing.categoryName.toLowerCase()}{" "}
                            {insight.usingCity
                              ? `in ${listing.cityName}`
                              : `across ${getMarket().countryName}`}
                            .
                          </>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-(--muted-foreground)">
                        From {insight.count.toLocaleString("en-IN")} ad
                        {insight.count === 1 ? "" : "s"}. These are{" "}
                        <strong className="font-semibold text-(--foreground)">asking prices</strong>,
                        not what anyone paid, and nothing is adjusted for condition, age or model.
                        {!insight.usingCity
                          ? ` Too few such ads in ${listing.cityName} to compare locally, so this is the national pool — local prices differ.`
                          : ""}
                        {insight.usingCity && insight.count < THIN_SAMPLE
                          ? ` ${insight.count} ads is a thin sample — treat it as a hint, not a market rate.`
                          : ""}
                      </p>
                    </div>
                  ) : null}

                  {/* ---------------- Note ---------------- */}
                  <div className="mt-4">
                    <label
                      htmlFor={noteId}
                      className="block text-xs font-bold uppercase tracking-wide text-(--muted-foreground)"
                    >
                      {t("offer.messageOptional")}
                    </label>
                    <textarea
                      id={noteId}
                      rows={3}
                      value={note}
                      maxLength={NOTE_MAX}
                      aria-describedby={counterId}
                      placeholder={t("offer.notePlaceholder")}
                      onChange={(event) => setNote(event.target.value.slice(0, NOTE_MAX))}
                      className="mt-1 w-full resize-y rounded-lg border border-(--border) bg-(--card) px-3 py-2 text-sm text-(--foreground) outline-none focus-visible:border-(--primary) focus-visible:ring-2 focus-visible:ring-(--primary)"
                    />
                    <p
                      id={counterId}
                      className={`mt-1 text-end text-xs tabular-nums ${
                        note.length >= NOTE_MAX
                          ? "font-semibold text-(--foreground)"
                          : "text-(--muted-foreground)"
                      }`}
                    >
                      {t("common.charCounter", { count: note.length, max: NOTE_MAX })}
                      {note.length >= NOTE_MAX ? t("common.limitReached") : ""}
                    </p>
                  </div>
                </div>

                {/* ---------------- Footer ---------------- */}
                <div className="shrink-0 border-t border-(--border) px-4 py-3">
                  <p id={hintId} className="mb-2 text-xs text-(--muted-foreground)">
                    {valid
                      ? t("offer.offering", { amount: formatPrice(rounded) })
                      : t("offer.enterAmount", { symbol: getMarket().currencySymbol })}
                  </p>

                  {nudge && !valid ? (
                    <p role="alert" className="mb-2 text-xs font-semibold text-(--bzr-urgent)">
                      {t("offer.invalid")}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap justify-end gap-2">
                    <button type="button" className="bzr-btn bzr-btn-secondary" onClick={closeDialog}>
                      {t("common.cancel")}
                    </button>
                    <button
                      type="submit"
                      className={`bzr-btn ${valid ? "" : "cursor-not-allowed opacity-55"}`}
                      aria-disabled={valid ? undefined : "true"}
                      aria-describedby={hintId}
                    >
                      {t("offer.send")}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
