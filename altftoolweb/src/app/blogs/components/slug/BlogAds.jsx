"use client";

import { useAds } from "@/ads/AdsProvider"; // adjust path if needed
import ManagedImage from "@/components/ui/ManagedImage";

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

  return (
    <aside className="hidden 2xl:sticky 2xl:top-24 2xl:block">
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
