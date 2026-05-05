"use client";

import { useEffect, useMemo, useState } from "react";
import stores from "../data/categories.json";

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
      setStep((prev) => (prev < 5 ? prev + 1 : prev));
    }, 500);

    const redirectTimer = setTimeout(() => {
      window.location.href = url;
    }, 3000);

    return () => {
      clearInterval(stepTimer);
      clearTimeout(redirectTimer);
    };
  }, [url]);

  const storeName = store
    ? store.slug.charAt(0).toUpperCase() + store.slug.slice(1)
    : "Store";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-4">

      <h2 className="text-2xl font-medium text-gray-900">
        By signing in, you could have earned
      </h2>

      <h1 className="text-3xl font-bold text-[#3b82f6] mt-2">
        Upto 7% CD Rewards
      </h1>

      <p className="text-gray-500 mt-4">
        No Coupon Code Required
      </p>

      <div className="mt-6 px-6 py-4 border border-dashed border-[#3b82f6] rounded-lg bg-blue-50 flex items-center gap-3">
        <span className="text-green-600 text-xl">✔</span>
        <span className="text-lg font-semibold text-gray-900">
          Deal Activated
        </span>
      </div>

      <p className="mt-10 text-lg text-gray-800">
        Please wait while we are redirecting you to{" "}
        <span className="font-bold">{storeName}</span>
      </p>

      {/* STEP LOADER */}
      <div className="mt-6 flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`w-6 h-2 rounded-full transition-all duration-300 ${
              step >= i ? "bg-blue-400 scale-x-100" : "bg-gray-200 scale-x-75"
            }`}
          />
        ))}
      </div>

      {/* Inline CSS (same file) */}
      <style jsx>{`
        span {
          transform-origin: left;
        }
      `}</style>

    </div>
  );
}
