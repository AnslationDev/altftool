"use client";

import { useState } from "react";
import { ArrowUp, Share2, Check, Sparkles } from "lucide-react";
import Image from "next/image";

export default function FinalCTASection({ extension }) {
  const [copied, setCopied] = useState(false);

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

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="relative p-8 md:p-12 lg:p-16 rounded-3xl bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-[var(--muted)] border border-[var(--border)] shadow-xl overflow-hidden text-center space-y-6">
      {/* Background Decorative Blob */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-[var(--primary)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ready to Transform Your Workflow?</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
          Get Started with {extension?.name || "This Extension"} Today
        </h2>

        <p className="text-sm md:text-base text-[var(--muted-foreground)] leading-relaxed">
          Optimize your digital workspace with AltFTool browser extensions. Free forever, no registration required.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          {extension?.chromeUrl ? (
            <a
              href={extension.chromeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-[var(--primary-foreground)] bg-[var(--primary)] rounded-xl shadow-lg shadow-[var(--primary)]/25 hover:brightness-110 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/40"
            >
              <Image
                src="/assets/Chrome_icon.svg.webp"
                alt="Google Chrome"
                width={20}
                height={20}
                className="mr-2.5"
              />
              <span>Install Extension</span>
            </a>
          ) : (
            <button
              type="button"
              disabled
              aria-label="Install link not available for this extension"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-[var(--muted-foreground)] bg-[var(--muted)] border border-[var(--border)] rounded-xl cursor-not-allowed opacity-80"
            >
              <Image
                src="/assets/Chrome_icon.svg.webp"
                alt=""
                width={20}
                height={20}
                className="mr-2.5 opacity-60"
              />
              <span>Install Link Not Available</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleScrollToTop}
            className="inline-flex items-center justify-center cursor-pointer px-6 py-4 text-base font-semibold text-[var(--foreground)] bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xs hover:bg-[var(--muted)] hover:border-[var(--primary)]/30 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
          >
            <ArrowUp className="w-5 h-5 mr-2.5 text-[var(--muted-foreground)]" />
            <span>Back to Top</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center cursor-pointer justify-center px-6 py-4 text-base font-semibold text-[var(--foreground)] bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xs hover:bg-[var(--muted)] hover:border-[var(--primary)]/30 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 mr-2 text-emerald-500" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5 mr-2 text-[var(--muted-foreground)] " />
                <span>Share Extension</span>
              </>
            )}
          </button>
        </div>

        <div className="pt-4 flex items-center justify-center gap-6 text-xs text-[var(--muted-foreground)]">
          <span>Manifest V3 Ready</span>
          <span>•</span>
          <span>No Ads</span>
        </div>
      </div>
    </section>
  );
}
