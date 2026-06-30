"use client";

// ALTF Engine — live SERP / social previews (Google, Facebook, Twitter).
// Pure presentational: pass the *effective* resolved values to render.

import { useState } from "react";
import { Search, Facebook, Twitter, Image as ImageIcon } from "lucide-react";

function truncate(str, n) {
  const s = String(str || "");
  return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s;
}

function hostFromUrl(url, fallback = "altftool.com") {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return fallback;
  }
}

function breadcrumbFromUrl(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    return [hostFromUrl(url), ...parts].join(" › ");
  } catch {
    return hostFromUrl(url);
  }
}

const TABS = [
  { key: "google", label: "Google", icon: Search },
  { key: "facebook", label: "Facebook", icon: Facebook },
  { key: "twitter", label: "Twitter / X", icon: Twitter },
];

export default function SeoPreviews({
  url = "https://altftool.com/",
  title = "",
  description = "",
  image = "",
  siteName = "AltFTool",
  twitterCard = "summary_large_image",
}) {
  const [tab, setTab] = useState("google");
  const safeTitle = title || "Untitled page";
  const safeDesc = description || "No meta description set. Search engines may generate one from page content.";

  return (
    <div className="rounded-xl border border-border bg-surface-soft p-4">
      <div className="mb-4 flex items-center gap-1.5">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              tab === key ? "bg-primary text-primary-foreground" : "text-muted hover:bg-card hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === "google" && (
        <div className="rounded-lg bg-card p-4 shadow-sm">
          <div className="text-xs text-muted">{breadcrumbFromUrl(url)}</div>
          <div className="mt-1 text-[18px] leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">
            {truncate(safeTitle, 60)}
          </div>
          <div className="mt-1 text-[13px] leading-snug text-foreground/80">{truncate(safeDesc, 160)}</div>
        </div>
      )}

      {(tab === "facebook" || tab === "twitter") && (
        <div className="mx-auto max-w-[500px] overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="flex aspect-[1.91/1] items-center justify-center bg-surface-soft text-muted">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
            ) : (
              <div className="flex flex-col items-center gap-1 text-xs">
                <ImageIcon className="h-6 w-6" />
                No share image set
              </div>
            )}
          </div>
          <div className={`space-y-1 p-3 ${tab === "twitter" ? "" : "bg-surface-soft"}`}>
            <div className="text-[11px] uppercase tracking-wide text-muted">{hostFromUrl(url)}</div>
            <div className="text-sm font-semibold leading-snug text-foreground">
              {truncate(safeTitle, tab === "twitter" ? 70 : 88)}
            </div>
            <div className="text-xs leading-snug text-muted">{truncate(safeDesc, tab === "twitter" ? 125 : 80)}</div>
            {tab === "twitter" && (
              <div className="pt-1 text-[11px] text-muted">Card: {twitterCard || "summary_large_image"}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
