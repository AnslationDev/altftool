"use client";

import { useState } from "react";
import { Chrome, BookOpen, Star, Download, Tag, Layers, Share2, Check, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { getIcon } from "./IconMap";

function formatRenderableValue(val, fallback = "") {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
    return String(val);
  }
  if (typeof val === "object" && typeof val.seconds === "number") {
    try {
      return new Date(val.seconds * 1000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export default function ExtensionHero({ extension }) {
  const [copied, setCopied] = useState(false);
  const IconComponent = getIcon(extension?.icon);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: extension?.name || "AltFTool Extension",
          text: extension?.description || "Check out this extension on AltFTool",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled share
    }
  };

  const handleScrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const categoryText = formatRenderableValue(extension?.category);
  const ratingText = formatRenderableValue(extension?.rating, "5.0");
  const versionText = formatRenderableValue(extension?.version);
  const downloadsText = formatRenderableValue(extension?.downloads, "10k+");

  return (
    <section aria-label="Extension Hero" className="relative pt-6 pb-12 md:pt-10 md:pb-16 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none -z-10 opacity-30 dark:opacity-20 blur-[120px] bg-gradient-to-r from-[var(--primary)] via-indigo-500 to-sky-400" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12">
        <div className="relative group shrink-0 mx-auto lg:mx-0">
          <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-3xl bg-gradient-to-b from-[var(--card)] to-[var(--muted)] p-1 ring-1 ring-[var(--border)] shadow-xl shadow-[var(--primary)]/5 transition-all duration-300 group-hover:scale-[1.02] group-hover:ring-[var(--primary)]/40 flex items-center justify-center">
            <div className="w-full h-full rounded-[22px] bg-[var(--card)]/90 backdrop-blur-sm flex items-center justify-center border border-[var(--border)]/50">
              <IconComponent
                strokeWidth={1.5}
                className="w-20 h-20 md:w-24 md:h-24 text-[var(--primary)] transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          </div>
          <div className="absolute -bottom-3 -right-2 bg-[var(--card)] border border-[var(--border)] rounded-full px-3 py-1 text-xs font-semibold text-[var(--foreground)] shadow-md flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Verified</span>
          </div>
        </div>

        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
            {categoryText ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                <Tag className="w-3 h-3" />
                {categoryText}
              </span>
            ) : null}

            <div className="inline-flex items-center gap-1 bg-[var(--card)] border border-[var(--border)] px-3 py-1 rounded-full text-xs font-medium text-[var(--foreground)] shadow-xs">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" aria-hidden="true" />
              {/*
                ratingText is the extension's own value from the catalog and
                stays. The "(4.9/5 overall)" that sat beside it was hardcoded on
                every extension page — an invented site-wide average printed next
                to a real per-extension number, which made the real one look
                invented too.
              */}
              <span className="font-semibold">{ratingText}</span>
            </div>

            {versionText ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)] font-mono">
                <Layers className="w-3 h-3" />
                {versionText}
              </span>
            ) : null}

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
              <Download className="w-3 h-3 text-[var(--primary)]" />
              {downloadsText} active users
            </span>
          </div>

          <div>
            {/* H2, not H1: the route's H1 is server-rendered in page.jsx so it
                exists before this client component's Firestore read resolves.
                Two H1s would otherwise appear on the page after hydration. */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--foreground)] leading-[1.15]">
              {formatRenderableValue(extension?.name, "Extension")}
            </h2>
            <p className="mt-4 text-lg md:text-xl text-[var(--muted-foreground)] leading-relaxed max-w-3xl font-normal mx-auto lg:mx-0">
              {formatRenderableValue(extension?.description)}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
            {extension?.chromeUrl && typeof extension.chromeUrl === "string" ? (
              <a
                href={extension.chromeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center px-7 py-3.5 text-sm md:text-base font-bold text-[var(--primary-foreground)] bg-[var(--primary)] rounded-xl shadow-lg shadow-[var(--primary)]/25 hover:brightness-110 hover:shadow-[var(--primary)]/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/40"
              >
                <Image
                  src="/assets/Chrome_icon.svg.webp"
                  alt="Google Chrome"
                  width={20}
                  height={20}
                  className="mr-2.5 group-hover:rotate-12 transition-transform duration-300"
                />
                <span>Add to Chrome</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => handleScrollToSection("features")}
                className="group inline-flex items-center justify-center px-7 py-3.5 text-sm md:text-base font-bold text-[var(--primary-foreground)] bg-[var(--primary)] rounded-xl shadow-lg shadow-[var(--primary)]/25 hover:brightness-110 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/40"
              >
                <Image
                  src="/assets/Chrome_icon.svg.webp"
                  alt="Google Chrome"
                  width={20}
                  height={20}
                  className="mr-2.5"
                />
                <span>Get Extension</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleScrollToSection("how-it-works")}
              className="inline-flex items-center justify-center px-5 py-3.5 text-sm md:text-base font-semibold text-[var(--foreground)] bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xs hover:bg-[var(--muted)] hover:border-[var(--primary)]/30 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              <BookOpen className="w-4 h-4 mr-2 text-[var(--muted-foreground)]" />
              <span>How It Works</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              title="Share Extension"
              aria-label="Share extension link"
              className="inline-flex items-center justify-center p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {copied ? (
                <Check className="w-5 h-5 text-emerald-500" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
