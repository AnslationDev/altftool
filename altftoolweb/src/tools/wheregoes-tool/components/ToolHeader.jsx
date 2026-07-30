"use client";

import { useState } from "react";
import { Check, Copy, HelpCircle, Link2, Share2, X } from "lucide-react";
import { CARD, FOCUS_RING } from "./ui.jsx";

const HOW_TO_STEPS = [
  "Paste any URL into the input box (shortened links, marketing links, anything).",
  "Press “Trace Redirects” — the tracer follows every HTTP hop server-side.",
  "Review the redirect flow, status codes, response times, and headers.",
  "Export the chain as JSON/CSV or copy it to share with your team.",
];

const actionButton = `inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border border-(--border) bg-(--card) px-3.5 text-sm font-semibold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary-hover) dark:hover:text-(--primary) ${FOCUS_RING}`;

export default function ToolHeader() {
  const [showHelp, setShowHelp] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  async function handleCopyLink() {
    const ok = await copyText(window.location.href.split("?")[0]);
    setCopied(ok);
    window.setTimeout(() => setCopied(false), 1400);
  }

  async function handleShare() {
    const url = window.location.href.split("?")[0];
    if (navigator.share) {
      try {
        await navigator.share({
          title: "URL Redirect Checker",
          text: "Check where a URL redirects — every hop, status code, response time, and headers.",
          url,
        });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }
    const ok = await copyText(url);
    setShared(ok);
    window.setTimeout(() => setShared(false), 1400);
  }

  return (
    <header className="flex flex-wrap items-center gap-4">
      <span
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] text-white shadow-[0_8px_20px_color-mix(in_srgb,var(--primary)_30%,transparent)]"
        style={{ background: "var(--anslation-ds-cta-gradient)" }}
      >
        <Link2 size={26} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold tracking-tight text-(--foreground) sm:text-[28px]">
          URL Redirect Checker
        </h1>
        <p className="mt-0.5 text-sm text-(--muted-foreground)">
          Check where a URL redirects — every hop, status code, response time, and headers.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setShowHelp(true)} className={actionButton}>
          <HelpCircle size={15} aria-hidden="true" />
          How to use
        </button>
        <button type="button" onClick={handleShare} className={actionButton}>
          {shared ? <Check size={15} aria-hidden="true" /> : <Share2 size={15} aria-hidden="true" />}
          {shared ? "Copied" : "Share"}
        </button>
        <button type="button" onClick={handleCopyLink} className={actionButton}>
          {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
          {copied ? "Copied" : "Copy Link"}
        </button>
      </div>

      {showHelp && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="How to use the URL redirect checker"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setShowHelp(false)}
            className="absolute inset-0 cursor-default"
            style={{ backgroundColor: "color-mix(in srgb, var(--foreground) 45%, transparent)" }}
          />
          <div className={`${CARD} relative w-full max-w-md rounded-[16px] p-5 shadow-[var(--anslation-ds-shadow-lg)]`}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-(--foreground)">How to use</h2>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                aria-label="Close"
                className={`flex h-8 w-8 items-center justify-center rounded-[8px] text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground) ${FOCUS_RING}`}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
            <ol className="space-y-3">
              {HOW_TO_STEPS.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm leading-6 text-(--muted-foreground)">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--primary) text-xs font-bold text-(--primary-foreground)">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </header>
  );
}
