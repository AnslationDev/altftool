"use client";

import { useState } from "react";
import { Sparkles, ExternalLink, X } from "lucide-react";

/**
 * The "different platform" experience — reframed from the old red warning
 * line into a premium, positive "Platform Optimized" note. Same single
 * compact inline row below the breadcrumb, same per-page dismiss behavior,
 * but the message is now about what the page DOES for the visitor (Smart
 * Guided Navigation adapts the steps) rather than what might go wrong.
 * No danger tone, no alert icon — brand-tinted glass, a sparkle glyph,
 * and language that always stays on the "Adaptive Experience" side:
 * never "not supported" / "may not apply". The official docs link, when
 * there is one, stays woven inline as supplementary context.
 */
const CompatibilityBanner = ({ targetLabel, currentLabel, officialDocsUrl, officialDocsLabel }) => {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="support-compat-banner" role="note">
      <Sparkles className="support-compat-banner-icon h-4 w-4" aria-hidden="true" />
      <p className="support-compat-banner-text">
        <strong>Platform Optimized</strong> — this guide is tuned for <strong>{targetLabel}</strong>, and
        you&rsquo;re browsing from {currentLabel}. Smart Guided Navigation keeps every step easy to follow
        from any device.
        {officialDocsUrl && (
          <a
            href={officialDocsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="support-compat-banner-link"
          >
            {officialDocsLabel || `${targetLabel} resources`}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </p>
      <button
        type="button"
        className="support-compat-banner-close"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default CompatibilityBanner;
