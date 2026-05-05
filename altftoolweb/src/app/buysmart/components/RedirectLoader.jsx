"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
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

export default function RedirectLoader({ url }) {
  const store = useMemo(() => getStoreFromUrl(url), [url]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStep((prev) => (prev < STEP_COUNT ? prev + 1 : prev));
    }, REDIRECT_DELAY_MS / STEP_COUNT);

    const redirectTimer = setTimeout(() => {
      window.location.href = url;
    }, REDIRECT_DELAY_MS);

    return () => {
      clearInterval(stepTimer);
      clearTimeout(redirectTimer);
    };
  }, [url]);

  const storeName = store
    ? store.slug.charAt(0).toUpperCase() + store.slug.slice(1)
    : "Store";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-(--background) px-4 text-center text-(--foreground)">
      <h2 className="text-2xl font-medium text-(--foreground)">
        By signing in, you could have earned
      </h2>

      <h1 className="mt-2 text-3xl font-bold text-(--primary)">
        Up to 7% CD Rewards
      </h1>

      <p className="mt-4 text-(--muted-foreground)">
        No Coupon Code Required
      </p>

      <div className="mt-6 flex items-center gap-3 rounded-[var(--anslation-ds-radius)] border border-dashed border-(--primary) bg-(--muted) px-6 py-4">
        <CheckCircle2 className="h-5 w-5 text-[var(--anslation-ds-success)]" />
        <span className="text-lg font-semibold text-(--foreground)">
          Deal Activated
        </span>
      </div>

      <p className="mt-10 text-lg text-(--muted-foreground)">
        Please wait while we are redirecting you to{" "}
        <span className="font-bold text-(--foreground)">{storeName}</span>
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
