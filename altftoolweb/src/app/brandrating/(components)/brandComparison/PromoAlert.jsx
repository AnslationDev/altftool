"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Star, StarHalf, BadgeCheck } from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";
import { getRatingLabel, formatRating, clampRating } from "../../utils/rating";

const SHOW_DELAY_MS = 6000;

// In-memory fallback so the popup never repeats within one SPA session,
// even where sessionStorage is unavailable or ephemeral.
const seenThisSession = new Set();

function getExternalLink(brand) {
    const rawLink =
        brand?.brandLink || brand?.weblink || brand?.url || brand?.link || "";
    const link = typeof rawLink === "string" ? rawLink.trim() : "";

    if (!link || link.toLowerCase() === "null" || link.toLowerCase() === "undefined") {
        return "";
    }

    return link.startsWith("http") ? link : `https://${link}`;
}

function Stars({ rating }) {
    const safe = clampRating(rating);
    const full = Math.floor(safe);
    const half = safe % 1 >= 0.5;

    return (
        <div className="flex text-yellow-400">
            {[...Array(full)].map((_, i) => (
                <Star key={`f-${i}`} className="w-4 h-4 fill-yellow-400" />
            ))}
            {half && <StarHalf className="w-4 h-4 fill-yellow-400" />}
            {[...Array(5 - full - (half ? 1 : 0))].map((_, i) => (
                <Star key={`e-${i}`} className="w-4 h-4 text-gray-300" />
            ))}
        </div>
    );
}

/**
 * Saatva-style promo modal for the current category's #1 brand.
 * Shows once per session per subcategory, after a delay or on exit intent.
 * Offer copy comes from the admin `offer` field when present.
 */
export default function PromoAlert({ brand, subName, storageKey }) {
    const [open, setOpen] = useState(false);
    const shownRef = useRef(false);
    const seenKey = `br-promo-seen:${storageKey || subName || "category"}`;

    const trigger = useCallback(() => {
        if (shownRef.current || seenThisSession.has(seenKey)) return;

        try {
            if (sessionStorage.getItem(seenKey)) return;
            sessionStorage.setItem(seenKey, "1");
        } catch {
            /* private mode — fall back to the in-memory guard */
        }

        seenThisSession.add(seenKey);
        shownRef.current = true;
        setOpen(true);
    }, [seenKey]);

    const close = useCallback(() => setOpen(false), []);

    // Timed trigger + desktop exit intent.
    useEffect(() => {
        if (!brand?.name) return;

        // Test/preview switch: ?promo=1 forces the popup right away.
        try {
            if (new URLSearchParams(window.location.search).get("promo") === "1") {
                seenThisSession.delete(seenKey);
                sessionStorage.removeItem(seenKey);
                const forced = setTimeout(trigger, 300);
                return () => clearTimeout(forced);
            }
        } catch {
            /* ignore */
        }

        const timer = setTimeout(trigger, SHOW_DELAY_MS);
        const onMouseOut = (event) => {
            if (!event.relatedTarget && event.clientY <= 0) trigger();
        };

        document.addEventListener("mouseout", onMouseOut);
        return () => {
            clearTimeout(timer);
            document.removeEventListener("mouseout", onMouseOut);
        };
    }, [brand?.name, seenKey, trigger]);

    // Escape to close + lock body scroll while open.
    useEffect(() => {
        if (!open) return;

        const onKey = (event) => {
            if (event.key === "Escape") close();
        };

        document.addEventListener("keydown", onKey);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = previousOverflow;
        };
    }, [open, close]);

    if (!open || !brand?.name) return null;

    const rating = clampRating(brand.rating);
    const externalLink = getExternalLink(brand);
    const image = brand.images?.[0] || brand.logo || "/image-fallback.svg";
    // Honest ribbon: only the actual #1 gets the "#1 Overall" claim.
    const rank = Number(brand.rank ?? brand.ranking) || 0;
    const ribbon =
        rank === 1
            ? `#1 Overall ${subName}`
            : rank > 1
                ? `#${rank} in ${subName}`
                : `Top Rated ${subName}`;
    const hasOffer = typeof brand.offer === "string" && brand.offer.trim().length > 0;
    const offerText = hasOffer
        ? brand.offer.trim()
        : `Rated ${formatRating(rating)}/5 · ${getRatingLabel(rating)} — compare it before you decide.`;

    return createPortal(
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label={`${brand.name} featured pick`}
        >
            {/* backdrop */}
            <button
                type="button"
                aria-label="Close offer"
                onClick={close}
                className="absolute inset-0 bg-black/60 br-promo-fade cursor-default"
            />

            {/* panel */}
            <div className="relative w-full max-w-[860px] overflow-hidden rounded-2xl bg-white shadow-2xl br-promo-pop grid sm:grid-cols-2">
                <button
                    type="button"
                    aria-label="Close"
                    onClick={close}
                    className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition hover:bg-black/5"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* LEFT — image with ribbon */}
                <div className="relative h-44 sm:h-auto sm:min-h-[420px]">
                    <ManagedImage
                        src={image}
                        alt={brand.name}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute left-0 top-0 bg-red-600 px-5 py-2.5 sm:px-6 sm:py-3">
                        <p className="text-lg sm:text-2xl font-extrabold leading-tight text-white">
                            {ribbon}
                        </p>
                    </div>
                </div>

                {/* RIGHT — offer */}
                <div className="flex flex-col items-center justify-center gap-4 px-6 py-8 sm:gap-5 sm:px-10 sm:py-12 text-center">
                    {brand.logo ? (
                        <ManagedImage
                            src={brand.logo}
                            alt={`${brand.name} logo`}
                            className="h-10 sm:h-14 w-auto max-w-[220px] object-contain"
                        />
                    ) : (
                        <p className="text-2xl sm:text-4xl font-bold text-gray-900">
                            {brand.name}
                        </p>
                    )}

                    <div className="flex items-center justify-center gap-2">
                        <Stars rating={rating} />
                        <span className="text-sm font-semibold text-gray-900">
                            {formatRating(rating)}/5
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-700">
                            <BadgeCheck className="h-3.5 w-3.5" />
                            {getRatingLabel(rating)}
                        </span>
                    </div>

                    <p className="text-2xl sm:text-3xl font-serif font-medium text-gray-900">
                        Featured Pick
                    </p>

                    <p className="max-w-xs text-base sm:text-lg font-semibold leading-snug text-gray-800">
                        {offerText}
                    </p>

                    {externalLink ? (
                        <a
                            href={externalLink}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            onClick={close}
                            className="mt-1 w-full max-w-[300px] rounded-lg bg-red-600 px-6 py-3.5 text-base sm:text-lg font-bold text-white transition hover:bg-red-700"
                        >
                            {hasOffer ? "Get Offer" : "View Site"}
                        </a>
                    ) : (
                        <button
                            type="button"
                            onClick={close}
                            className="mt-1 w-full max-w-[300px] rounded-lg bg-red-600 px-6 py-3.5 text-base sm:text-lg font-bold text-white transition hover:bg-red-700"
                        >
                            See Top Picks
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={close}
                        className="text-sm text-gray-500 underline-offset-2 transition hover:text-gray-700 hover:underline"
                    >
                        No thanks, keep browsing
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
