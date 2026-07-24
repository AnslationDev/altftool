"use client";

import { useState } from "react";
import { AlertTriangle, ExternalLink, X } from "lucide-react";

/**
 * The "wrong platform" experience — a single, compact inline warning line
 * (not a native alert, not a card stacked with buttons) shown below the
 * breadcrumb whenever the guide currently open doesn't match the device
 * the visitor is actually using. There's no "Switch to X" action here —
 * switching platforms already lives one click away in the platform
 * switcher itself, so this stays purely informational. The official docs
 * link, when there is one, is woven inline into the sentence rather than
 * given its own button, since it's supplementary context, not the primary
 * action. Dismissing it is remembered for the rest of this page view only
 * — it reappears on another mismatched page, which is the honest behavior
 * (it's not nagging, it's per-page context).
 */
const CompatibilityBanner = ({ targetLabel, currentLabel, officialDocsUrl, officialDocsLabel }) => {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="support-compat-banner" role="status">
      <AlertTriangle className="support-compat-banner-icon h-4 w-4" aria-hidden="true" />
      <p className="support-compat-banner-text">
        This guide is designed for <strong>{targetLabel}</strong> — you&rsquo;re currently using {currentLabel}, so
        some steps or links here may not apply to your device.
        {officialDocsUrl && (
          <a
            href={officialDocsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="support-compat-banner-link"
          >
            {officialDocsLabel || `${targetLabel} documentation`}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </p>
      <button
        type="button"
        className="support-compat-banner-close"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss compatibility notice"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default CompatibilityBanner;
