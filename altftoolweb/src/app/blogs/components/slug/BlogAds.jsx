"use client";

import { useAds } from "@/ads/AdsProvider"; // adjust path if needed
import ManagedImage from "@/components/ui/ManagedImage";
import { isFeatureEnabled } from "@/lib/featureFlags";
import { useEffect, useRef, useState } from "react";

/**
 * BlogAds — right-sidebar ad strip for blog detail pages.
 *
 * Ad selection priority (highest → lowest):
 *   1. Targeted ads   — ad.target === slug (this post specifically)
 *   2. Category ads   — ad.target is null AND ad.categories includes blog.category
 *   3. Global ads     — ad.target is null AND ad.categories is empty/absent
 *   4. Placeholder    — no ads at all
 */
export default function BlogAds({ slug, category }) {
  const allAds = useAds({ placement: "blog_detail" });
  const adRef = useRef(null);
  const adViewportFixEnabled = isFeatureEnabled("ad_fix_viewport");
  const [debugAds, setDebugAds] = useState(false);

  // 1 — ads explicitly targeted at this slug
 const targeted = [], byCat = [], byAll = [], global = [];

for (const ad of allAds) {
  if (ad.target === slug) {
    targeted.push(ad);
  } else if (!ad.target) {
    const cats = Array.isArray(ad.categories) ? ad.categories : [];
    if (cats.includes("All"))         byAll.push(ad);
    else if (cats.includes(category)) byCat.push(ad);
    else if (cats.length === 0)       global.push(ad);
  }
}

// Fill ads step-by-step (max 2)
let ads = [];

// 1. targeted
ads.push(...targeted);

// 2. category
if (ads.length < 2) {
  ads.push(...byCat);
}

// 3. "All"
if (ads.length < 2) {
  ads.push(...byAll);
}

// 4. global
if (ads.length < 2) {
  ads.push(...global);
}

// limit to 2
ads = ads.slice(0, 4);


  const useFallback = ads.length === 0;

  useEffect(() => {
    if (!adViewportFixEnabled) return;
    setDebugAds(new URLSearchParams(window.location.search).get("debug_ads") === "1");
  }, [adViewportFixEnabled]);

  useEffect(() => {
    if (!adViewportFixEnabled || !adRef.current) return;

    const node = adRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        window.dispatchEvent(new CustomEvent("ad_impression", {
          detail: {
            placement: "blog_detail",
            slotId: `blog_detail:${slug || "global"}`,
            visible: true,
          },
        }));
        observer.disconnect();
      },
      { threshold: 0.5 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [adViewportFixEnabled, slug]);

  return (
    <aside
      ref={adRef}
      data-ad-slot={`blog_detail:${slug || "global"}`}
      data-ad-visible="true"
      className={adViewportFixEnabled ? "block w-full max-w-sm mx-auto lg:max-w-none lg:sticky lg:top-24" : "block w-full max-w-sm mx-auto 2xl:max-w-none 2xl:sticky 2xl:top-24"}
    >
      {debugAds && (
        <div className="mb-2 rounded-[8px] border border-cyan-300 bg-cyan-50 px-3 py-2 text-[11px] font-bold text-cyan-800">
          blog_detail:{slug || "global"} · {useFallback ? "fallback" : `${ads.length} loaded`} · visible
        </div>
      )}
      {useFallback ? (
        <div
          className="overflow-hidden rounded-[var(--anslation-ds-radius)] border shadow-[var(--anslation-ds-shadow-sm)]"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <ManagedImage
            src="/banners/vertical.jpg"
            alt="Advertisement"
            className="w-full h-auto object-contain"
          />
        </div>
      ) : (
        ads.map((ad) => (
          <div key={ad.id} className="mb-4 last:mb-0">
            <AdBanner ad={ad} />
          </div>
        ))
      )}
    </aside>
  );
}

/* ── Single ad banner card ── */
function AdBanner({ ad }) {
  const { bannerUrl, redirect } = ad.content ?? {};
  if (!bannerUrl) return null;

  const inner = (
    <div
      className="
        rounded-[var(--anslation-ds-radius)] border bg-(--card)
        backdrop-blur-sm
        shadow-[var(--anslation-ds-shadow-sm)]
        hover:shadow-[var(--anslation-ds-shadow-md)]
        transition-all duration-300
        overflow-hidden group
      "
      style={{ borderColor: "var(--border)" }}
    >
      {/* Image */}
      <div className="relative">
        <ManagedImage
          src={bannerUrl}
          alt={ad.title ?? "Advertisement"}
          className="w-full h-auto object-contain"
        />

        {/* Sponsored badge */}
        <span
          className="
            absolute top-2 left-2
            text-[10px] px-2 py-[2px]
            rounded-full font-semibold
            bg-black/70 text-white
            backdrop-blur-sm
          "
        >
          Ad
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 bg-(--background)">
        <span
          className="text-xs font-medium text-(--foreground)"
        >
          Sponsored
        </span>

        {redirect && (
          <span
            className="
              text-xs font-semibold text-[var(--primary)] opacity-70 transition group-hover:opacity-100
            "
          >
            Visit
          </span>
        )}
      </div>
    </div>
  );

  return redirect ? (
    <a href={redirect} target="_blank" rel="noopener noreferrer sponsored">
      {inner}
    </a>
  ) : inner;
}
