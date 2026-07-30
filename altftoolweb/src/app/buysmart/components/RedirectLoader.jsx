"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { isExternalMerchantUrl, normalizeMerchantUrl } from "@altftool/core/buysmart";
import stores from "../data/categories.json";

const REDIRECT_DELAY_MS = 1400;
const STEP_COUNT = 5;

function getStoreFromUrl(url) {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    return (
      stores.find((store) =>
        hostname.includes(store.name.replace("www.", ""))
      ) || null
    );
  } catch {
    return null;
  }
}

// This page relays whatever `url` a visitor arrives with straight to
// window.location.href, so it must never accept an arbitrary destination
// (that would be an open redirect anyone could use for phishing behind a
// trusted altftool.com link). Only redirect to a domain that matches one of
// our known BuySmart merchants (the same `stores` list this component
// already uses to display the destination's name) — everything else,
// including our own domain, is rejected.
function getSafeRedirectUrl(url) {
  const normalized = normalizeMerchantUrl(url);
  if (!isExternalMerchantUrl(normalized)) return null;
  return getStoreFromUrl(normalized) ? normalized : null;
}

export default function RedirectLoader({ url }) {
  const safeUrl = useMemo(() => getSafeRedirectUrl(url), [url]);
  const store = useMemo(() => (safeUrl ? getStoreFromUrl(safeUrl) : null), [safeUrl]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!safeUrl) return undefined;

    const stepTimer = setInterval(() => {
      setStep((prev) => (prev < STEP_COUNT ? prev + 1 : prev));
    }, REDIRECT_DELAY_MS / STEP_COUNT);

    const redirectTimer = setTimeout(() => {
      window.location.href = safeUrl;
    }, REDIRECT_DELAY_MS);

    return () => {
      clearInterval(stepTimer);
      clearTimeout(redirectTimer);
    };
  }, [safeUrl]);

  if (!safeUrl) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-(--background) px-4 text-center text-(--foreground)">
        <ShieldAlert className="h-10 w-10 text-(--destructive)" />
        <h1 className="mt-4 text-2xl font-bold text-(--foreground)">
          This redirect link isn&apos;t valid
        </h1>
        <p className="mt-4 max-w-md text-(--muted-foreground)">
          We couldn&apos;t verify the destination for this deal, so the redirect was stopped for your safety.
        </p>
      </div>
    );
  }

  const storeName = store
    ? store.slug.charAt(0).toUpperCase() + store.slug.slice(1)
    : "Store";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-(--background) px-4 text-center text-(--foreground)">
      <Loader2 className="h-10 w-10 animate-spin text-(--primary)" aria-hidden="true" />

      <h1 className="mt-4 text-3xl font-bold text-(--foreground)">
        Redirecting you to {storeName}
      </h1>

      <p className="mt-4 text-lg text-(--muted-foreground)">
        Please wait — this should only take a moment.
      </p>

      <div className="mt-6 flex gap-2">
        {Array.from({ length: STEP_COUNT }, (_, index) => index + 1).map((i) => (
          <span
            key={i}
            className={`h-2 w-6 origin-left rounded-full transition-all duration-200 ${
              step >= i ? "scale-x-100 bg-(--primary)" : "scale-x-75 bg-(--muted)"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
