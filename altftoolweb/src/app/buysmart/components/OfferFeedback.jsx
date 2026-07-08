"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { CheckCircle2, Loader2, ThumbsDown, ThumbsUp } from "lucide-react";
import { getBuySmartBrandSlug, normalizeBuySmartCategory } from "@altftool/core/buysmart";
import { recordBuySmartVote } from "@/app/buysmart/service.js/firebaseBuySmartTracking";

const subscribeToHydration = () => () => {};
const getHydratedSnapshot = () => true;
const getServerSnapshot = () => false;

function useHydrated() {
  return useSyncExternalStore(subscribeToHydration, getHydratedSnapshot, getServerSnapshot);
}

export default function OfferFeedback({ offer }) {
  const isHydrated = useHydrated();
  const normalizedOffer = useMemo(() => normalizeBuySmartCategory(offer), [offer]);
  const storageKey = `buysmart-vote:${getBuySmartBrandSlug(normalizedOffer)}`;
  const [selectedVote, setSelectedVote] = useState("");
  const [savingVote, setSavingVote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined" || selectedVote) return;
    setSelectedVote(window.localStorage.getItem(storageKey) || "");
  }, [isHydrated, selectedVote, storageKey]);

  async function handleVote(vote) {
    if (!isHydrated || savingVote || selectedVote) return;

    setSavingVote(vote);
    setError("");

    try {
      await recordBuySmartVote(normalizedOffer, vote === "worked");
      window.localStorage.setItem(storageKey, vote);
      setSelectedVote(vote);
    } catch {
      setError("Could not save feedback right now.");
    } finally {
      setSavingVote("");
    }
  }

  return (
    <div className="rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-(--muted-foreground)">
            Shopper feedback
          </p>
          <h2 className="mt-1 text-lg font-bold">Did this deal work?</h2>
        </div>
        {selectedVote ? (
          <CheckCircle2 className="h-5 w-5 text-(--primary)" />
        ) : null}
      </div>

      <p className="mt-3 text-sm leading-6 text-(--muted-foreground)">
        Your feedback helps keep BuySmart offers clean, current, and easier to trust.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          disabled={!isHydrated || Boolean(savingVote) || Boolean(selectedVote)}
          onClick={() => handleVote("worked")}
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] border px-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-70 ${
            selectedVote === "worked"
              ? "border-(--primary) bg-(--muted) text-(--primary)"
              : "border-(--border) bg-(--background) text-(--foreground) hover:border-(--primary)"
          }`}
        >
          {savingVote === "worked" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
          Worked
        </button>
        <button
          type="button"
          disabled={!isHydrated || Boolean(savingVote) || Boolean(selectedVote)}
          onClick={() => handleVote("failed")}
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] border px-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-70 ${
            selectedVote === "failed"
              ? "border-(--secondary) bg-(--muted) text-(--primary)"
              : "border-(--border) bg-(--background) text-(--foreground) hover:border-(--primary)"
          }`}
        >
          {savingVote === "failed" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsDown className="h-4 w-4" />}
          Did not work
        </button>
      </div>

      {selectedVote ? (
        <p className="mt-3 rounded-[var(--anslation-ds-radius)] bg-(--muted) px-3 py-2 text-xs font-semibold text-(--muted-foreground)">
          Thanks. We saved your feedback for this store.
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 rounded-[var(--anslation-ds-radius)] border border-[var(--anslation-ds-danger)] bg-(--card) px-3 py-2 text-xs font-semibold text-[var(--anslation-ds-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
