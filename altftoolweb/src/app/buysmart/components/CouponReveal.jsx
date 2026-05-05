"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Check, Copy, ExternalLink, ShieldCheck, TicketPercent, X } from "lucide-react";
import {
  getPrimarySavingsText,
  normalizeBuySmartCategory,
} from "@altftool/core/buysmart";
import { recordBuySmartEvent } from "@/app/buysmart/service.js/firebaseBuySmartTracking";

const subscribeToHydration = () => () => {};
const getHydratedSnapshot = () => true;
const getServerSnapshot = () => false;

function useHydrated() {
  return useSyncExternalStore(subscribeToHydration, getHydratedSnapshot, getServerSnapshot);
}

export default function CouponReveal({ offer }) {
  const normalizedOffer = useMemo(() => normalizeBuySmartCategory(offer), [offer]);
  const isHydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const revealValue = normalizedOffer.code || getPrimarySavingsText(normalizedOffer);
  const hasCode = Boolean(normalizedOffer.code);
  const hasStoreLink = Boolean(normalizedOffer.link && normalizedOffer.link !== "#");

  function handleReveal() {
    if (!isHydrated) return;

    setOpen(true);
    void recordBuySmartEvent(normalizedOffer, "reveal");
  }

  async function handleCopy() {
    if (!hasCode || !navigator.clipboard) return;

    try {
      await navigator.clipboard.writeText(normalizedOffer.code);
      setCopied(true);
      recordBuySmartEvent(normalizedOffer, "copy");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function handleOutbound() {
    recordBuySmartEvent(normalizedOffer, "outbound");
  }

  return (
    <>
      <button
        type="button"
        data-testid="buysmart-reveal-button"
        onClick={handleReveal}
        disabled={!isHydrated}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] bg-(--primary) px-4 text-sm font-semibold text-(--primary-foreground) shadow-[var(--anslation-ds-shadow-sm)] transition hover:bg-(--primary-hover) focus:outline-none focus:ring-2 focus:ring-(--primary) disabled:cursor-not-allowed disabled:opacity-70"
      >
        <TicketPercent className="h-4 w-4" />
        {!isHydrated ? "Preparing deal" : hasCode ? "Reveal code" : "View deal"}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="buysmart-reveal-title"
          data-testid="buysmart-reveal-modal"
        >
          <div className="w-full max-w-md overflow-hidden rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) text-(--foreground) shadow-[var(--anslation-ds-shadow-lg)]">
            <div className="flex items-start justify-between gap-4 border-b border-(--border) px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase text-(--muted-foreground)">
                  {hasCode ? "Coupon ready" : "Deal ready"}
                </p>
                <h2 id="buysmart-reveal-title" className="mt-1 text-lg font-bold">
                  {normalizedOffer.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close reveal dialog"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) text-(--muted-foreground) transition hover:text-(--foreground)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="rounded-[var(--anslation-ds-radius)] border border-dashed border-(--primary) bg-(--muted) p-4">
                <p className="text-xs font-semibold uppercase text-(--muted-foreground)">
                  {hasCode ? "Use this code" : "Current saving"}
                </p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="min-w-0 flex-1 truncate text-2xl font-bold tracking-normal text-(--foreground)">
                    {revealValue}
                  </p>
                  {hasCode ? (
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex h-9 items-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-3 text-xs font-semibold text-(--foreground) transition hover:border-(--primary)"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-2 text-sm text-(--muted-foreground)">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-(--primary)" />
                  <span>
                    {normalizedOffer.verified
                      ? "Checked by AltFTool before publishing."
                      : "Verification is pending, please confirm on merchant site."}
                  </span>
                </div>
                {normalizedOffer.terms ? <p>{normalizedOffer.terms}</p> : null}
              </div>

              {hasStoreLink ? (
                <a
                  href={normalizedOffer.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleOutbound}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-4 text-sm font-semibold text-(--foreground) transition hover:border-(--primary)"
                >
                  Open store
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex h-11 w-full items-center justify-center rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-4 text-sm font-semibold text-(--muted-foreground)"
                >
                  Store link unavailable
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
