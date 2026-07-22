"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ADSENSE_CLIENT } from "./adsenseConfig";
import { useProductionSite } from "./useProductionSite";

const AD_UNITS = {
  autorelaxed: {
    slot: "1597413422",
    format: "autorelaxed",
    minHeight: "min-h-[160px] sm:min-h-[200px]",
  },
  inArticle: {
    slot: "7358281650",
    format: "fluid",
    layout: "in-article",
    minHeight: "min-h-[160px] sm:min-h-[220px]",
    textAlign: "center",
  },
  native: {
    slot: "1666971273",
    format: "fluid",
    layoutKey: "-6t+ed+2i-1n-4w",
    minHeight: "min-h-[140px] sm:min-h-[180px]",
  },
  display: {
    slot: "4240449715",
    format: "auto",
    fullWidthResponsive: true,
    minHeight: "min-h-[120px] sm:min-h-[160px]",
  },
};

const BLOG_INDEX_PREFIXES = [
  "/blogs/author",
  "/blogs/category",
  "/blogs/tag",
  "/blogs/topics",
  "/blogs/view-all",
];

const NATIVE_FEED_PREFIXES = [
  "/tools",
  "/extensions",
  "/brandrating",
  "/buysmart",
  "/exclusivedeals",
  "/academy",
];

const AD_FREE_PREFIXES = ["/fullscrn"];

function isArticleRoute(pathname) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 2 && ["top9", "top11"].includes(segments[0])) {
    return true;
  }

  if (segments.length === 2 && segments[0] === "blogs") {
    return !BLOG_INDEX_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
  }

  if (segments.length === 2 && segments[0] === "news") {
    return !["api", "headlines", "local", "newsletter", "topics", "trending"].includes(
      segments[1],
    );
  }

  return false;
}

function resolveAdUnit(pathname) {
  if (isArticleRoute(pathname)) return AD_UNITS.inArticle;

  if (
    pathname === "/blogs" ||
    BLOG_INDEX_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    return AD_UNITS.autorelaxed;
  }

  if (
    pathname === "/news" ||
    pathname.startsWith("/news/") ||
    NATIVE_FEED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    return AD_UNITS.native;
  }

  return AD_UNITS.display;
}

export default function GoogleAdUnit({ enabled = false }) {
  const pathname = usePathname() || "/";
  const isProductionSite = useProductionSite(enabled);
  const adUnit = resolveAdUnit(pathname);
  const isAdFreeRoute = AD_FREE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isProductionSite || isAdFreeRoute) return null;

  return (
    <GoogleAdPlacement
      key={`${pathname}:${adUnit.slot}`}
      adUnit={adUnit}
    />
  );
}

function GoogleAdPlacement({ adUnit }) {
  const adRef = useRef(null);
  const [fillStatus, setFillStatus] = useState("pending");
  const isUnfilled =
    fillStatus === "unfilled" || fillStatus === "unfill-optimized";

  useEffect(() => {
    if (!adRef.current) return undefined;

    const node = adRef.current;
    let disposed = false;

    const statusObserver = new MutationObserver(() => {
      const status = node.getAttribute("data-ad-status");
      if (
        status === "filled" ||
        status === "unfilled" ||
        status === "unfill-optimized"
      ) {
        setFillStatus(status);
      }
    });

    statusObserver.observe(node, {
      attributes: true,
      attributeFilter: ["data-ad-status"],
    });

    const requestAd = () => {
      if (
        disposed ||
        node.dataset.altfAdRequested === "true" ||
        node.getAttribute("data-adsbygoogle-status")
      ) {
        return;
      }

      node.dataset.altfAdRequested = "true";

      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      } catch {
        setFillStatus("unfilled");
      }
    };

    if (!("IntersectionObserver" in window)) {
      requestAd();
      return () => {
        disposed = true;
        statusObserver.disconnect();
      };
    }

    const viewportObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        requestAd();
        viewportObserver.disconnect();
      },
      { rootMargin: "600px 0px" },
    );

    viewportObserver.observe(node);

    return () => {
      disposed = true;
      viewportObserver.disconnect();
      statusObserver.disconnect();
    };
  }, [adUnit.slot]);

  return (
    <aside
      aria-label="Advertisement"
      className={
        isUnfilled
          ? "hidden"
          : "mx-auto w-full max-w-6xl px-4 py-4 sm:px-6"
      }
      data-adsense-slot={adUnit.slot}
    >
      <div
        className={`w-full overflow-hidden border-y border-border bg-surface-soft py-2 ${adUnit.minHeight}`}
      >
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "block", textAlign: adUnit.textAlign }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={adUnit.slot}
          data-ad-format={adUnit.format}
          data-ad-layout={adUnit.layout}
          data-ad-layout-key={adUnit.layoutKey}
          data-full-width-responsive={
            adUnit.fullWidthResponsive ? "true" : undefined
          }
        />
      </div>
    </aside>
  );
}
