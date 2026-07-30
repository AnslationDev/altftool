"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { Button, Badge } from "@altftool/ui";
import ManagedImage from "@/components/ui/ManagedImage";
import { useToast } from "./ToastProvider";

/**
 * The reusable card for a single Support Setting. Every OS setting on this
 * page uses the same "action" control (open the real OS settings pane on
 * Windows via ms-settings:, or the verified official support guide for
 * macOS/Android/iOS) — a website cannot flip a real OS toggle, so this is
 * the one honest control shape. Steps/details still expand in place.
 */
const SettingCard = ({
  setting,
  detectedPlatform,
  autoExpand = false,
  compact = false,
  showImages = true,
  onVisit,
}) => {
  const [expanded, setExpanded] = useState(autoExpand);
  const [isPending, setIsPending] = useState(false);
  const notify = useToast();
  const Icon = setting.icon;

  const handleAction = () => {
    const url = setting.redirectUrl;
    if (!url) return;

    setIsPending(true);
    window.setTimeout(() => setIsPending(false), 450);
    onVisit?.(setting.id);

    const isMsSettings = url.startsWith("ms-settings:");

    if (isMsSettings) {
      if (detectedPlatform === "windows") {
        window.location.assign(url);
      } else {
        notify(
          "ms-settings: links only work on an actual Windows device — you're currently previewing this platform.",
          { tone: "warning", title: "Preview mode" },
        );
      }
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const actionLabel = setting.actionLabel || `Go to ${setting.title} Settings`;
  const hasExpandable = Boolean(setting.details?.length || setting.afterImageContent);

  return (
    <div
      id={`setting-${setting.id}`}
      className={`support-card ${compact ? "support-card-compact" : ""} ${
        setting.frequentlyUsed ? "support-card-frequent" : ""
      }`}
    >
      <div className="support-card-top">
        <span className="support-card-icon" aria-hidden="true">
          <Icon className="h-5 w-5" />
        </span>

        <div className="support-card-heading">
          <h3 className="support-card-title">{setting.title}</h3>
          {setting.recommended && (
            <Badge tone="info" className="support-card-badge">
              Recommended
            </Badge>
          )}
        </div>
      </div>

      <p className="support-card-description">{setting.description}</p>

      <div className="support-card-actions">
        <Button
          variant="primary"
          size="sm"
          loading={isPending}
          onClick={handleAction}
          className="support-card-action-btn"
        >
          {actionLabel}
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>

        {hasExpandable && (
          <button
            type="button"
            className="support-card-expand-toggle"
            aria-expanded={expanded}
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? "Hide details" : "Show details"}
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </button>
        )}
      </div>

      {expanded && (
        <div className="support-card-details">
          {setting.important && (
            <p className="support-card-important">{setting.important}</p>
          )}

          {setting.details?.length > 0 && (
            <ul className="support-card-detail-list">
              {setting.details.map((detail, i) => (
                <li key={i}>{detail}</li>
              ))}
            </ul>
          )}

          {/* Only entries with a verified in-house screenshot set imageUrl —
              most Windows entries and all macOS/Android/iOS entries
              intentionally have no imageUrl, so nothing renders here for
              them regardless of this toggle. */}
          {showImages && setting.imageUrl && (
            <div className="support-card-image">
              <ManagedImage
                src={setting.imageUrl}
                alt={setting.imageAlt || setting.title}
                className="support-card-image-img"
              />
              {setting.imageAlt && (
                <p className="support-card-image-caption">{setting.imageAlt}</p>
              )}
            </div>
          )}

          {setting.afterImageContent?.paragraphs?.length > 0 && (
            <div className="support-card-after-paragraphs">
              {setting.afterImageContent.heading && (
                <p className="support-card-steps-label">{setting.afterImageContent.heading}</p>
              )}
              {setting.afterImageContent.paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}

          {setting.afterImageContent?.steps?.length > 0 && (
            <>
              <p className="support-card-steps-label">Steps</p>
              <ol className="support-card-steps">
                {setting.afterImageContent.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SettingCard;
