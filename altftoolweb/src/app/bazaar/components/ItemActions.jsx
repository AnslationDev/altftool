"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Flag, Heart, MessageCircle, Phone, ShieldAlert } from "lucide-react";

import { getMarket } from "../data/market";
import { useBazaarStore, useHydrated } from "../hooks/useBazaarStore";
import { useLocale } from "../i18n/useLocale";
import MakeOfferDialog from "./MakeOfferDialog";
import ShareSheet from "./ShareSheet";

/**
 * Mock contact number for a seller.
 *
 * Derived from the seller id, never from Math.random(): a random number would
 * differ between the prerendered HTML and the hydrated page, and would also
 * change every time the visitor re-opened the ad. Real numbers are the one
 * thing a classifieds user checks twice.
 */
function maskedPhone(sellerId) {
  const seed = String(sellerId || "seller");
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 1000003;
  }
  const prefixes = ["98", "99", "97", "96", "94", "90", "88", "81", "73", "70"];
  const prefix = prefixes[hash % prefixes.length];
  const tail = String(hash % 1000).padStart(3, "0");
  // The dialling prefix comes from the market config; the two-digit mobile
  // prefixes above are default-market content (Indian mobile ranges) in the
  // same way the seller name pools are.
  return `${getMarket().phonePrefix} ${prefix}••• ••${tail}`;
}

/**
 * The contact rail: chat, reveal phone, save, share.
 *
 * Everything here is client-side and demo-only — there is no messaging
 * backend, so "Chat" is a link to the mock inbox and the number is generated,
 * not stored.
 *
 * Sharing used to be a single button that called navigator.share and fell back
 * to the clipboard, seeded from `window.location.href`. It is now <ShareSheet>,
 * which leads with WhatsApp and shares the canonical URL — see that file for
 * why both of those changes matter more here than on any other page type.
 */
export default function ItemActions({ listing, seller }) {
  const { t } = useLocale();
  const hydrated = useHydrated();
  const savedIds = useBazaarStore((s) => s.savedIds);
  const toggleSaved = useBazaarStore((s) => s.toggleSaved);

  const [phoneShown, setPhoneShown] = useState(false);

  // Until the store has read localStorage the saved set is unknown; render
  // the neutral state so the first client render matches the server HTML.
  const saved = hydrated && savedIds.includes(listing.id);

  return (
    <div className="flex flex-col gap-2">
      <Link href={`/bazaar/chat?ad=${encodeURIComponent(listing.slug)}`} className="bzr-btn bzr-btn-block">
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        {t("item.chat")}
      </Link>

      {/* Sits directly under Chat because a first message on a classifieds ad
          usually *is* an offer. Renders nothing for jobs, free giveaways and
          ₹0 ads, where offering is not a coherent action — MakeOfferDialog
          decides that itself, so there is no condition to keep in sync here. */}
      <MakeOfferDialog listing={listing} />

      {phoneShown ? (
        <div
          className="rounded-[var(--anslation-ds-radius-sm,0.5rem)] border border-(--border) bg-(--muted)/40 px-3 py-2.5"
          role="status"
          aria-live="polite"
        >
          <p className="flex items-center gap-2 text-lg font-bold tracking-wide text-(--foreground)">
            <Phone className="h-4 w-4 shrink-0 text-(--muted-foreground)" aria-hidden="true" />
            {maskedPhone(seller?.id)}
          </p>
          <p className="mt-1.5 text-xs text-(--muted-foreground)">{t("item.phoneDemo")}</p>
        </div>
      ) : (
        <button
          type="button"
          className="bzr-btn bzr-btn-secondary bzr-btn-block"
          onClick={() => setPhoneShown(true)}
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          {t("item.showPhone")}
        </button>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className="bzr-btn bzr-btn-secondary"
          aria-pressed={saved}
          onClick={() => toggleSaved(listing.id)}
        >
          <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} aria-hidden="true" />
          {saved ? t("card.saved") : t("card.save")}
        </button>

        <ShareSheet
          path={`/bazaar/item/${listing.slug}`}
          title={listing.title}
          subtitle={`${listing.priceLabel} · ${listing.locality}, ${listing.cityName}`}
        />
      </div>
    </div>
  );
}

/**
 * "Report this ad" — a two-step confirm plus an inline acknowledgement.
 *
 * Lives in this client module rather than in SafetyTips so that SafetyTips
 * itself stays a server component and its copy ships in the prerendered HTML.
 */
export function ReportAdButton({ title }) {
  const [stage, setStage] = useState("idle");

  if (stage === "sent") {
    return (
      <p
        role="status"
        aria-live="polite"
        className="flex items-start gap-2 rounded-[var(--anslation-ds-radius-xs,0.375rem)] border border-(--border) bg-(--muted)/40 px-3 py-2.5 text-sm text-(--foreground)"
      >
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-(--primary)" aria-hidden="true" />
        <span>
          Report received. Our team reviews flagged ads within 24 hours — no further action is
          needed from you.
        </span>
      </p>
    );
  }

  if (stage === "confirm") {
    return (
      <div className="rounded-[var(--anslation-ds-radius-xs,0.375rem)] border border-(--border) bg-(--card) px-3 py-3">
        <p className="flex items-start gap-2 text-sm text-(--foreground)">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-(--muted-foreground)" aria-hidden="true" />
          <span>
            Report <strong className="font-semibold">{title}</strong> as misleading, a scam, or a
            prohibited item?
          </span>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="bzr-btn" onClick={() => setStage("sent")}>
            Yes, report it
          </button>
          <button
            type="button"
            className="bzr-btn bzr-btn-secondary"
            onClick={() => setStage("idle")}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="bzr-btn bzr-btn-secondary"
      onClick={() => setStage("confirm")}
    >
      <Flag className="h-4 w-4" aria-hidden="true" />
      Report this ad
    </button>
  );
}
