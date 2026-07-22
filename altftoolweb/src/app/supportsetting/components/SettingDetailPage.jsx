"use client";

import { useEffect, useState } from "react";
import {
  ExternalLink,
  ChevronDown,
  Lightbulb,
  ListChecks,
  Wrench,
  CircleQuestionMark,
  Link2,
  Clock,
  AlertTriangle,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button, Badge, Alert, SectionHeader } from "@altftool/ui";
import ManagedImage from "@/components/ui/ManagedImage";
import { useToast } from "./ToastProvider";
import StepTimeline from "./StepTimeline";
import { getCategoryById } from "../data/categories";

/**
 * The rich, single-setting detail page — "the biggest change" the second
 * redesign asked for. Exactly one of these renders at a time (SettingsContent
 * swaps it in when a sidebar row is clicked); it never shares the screen
 * with any other setting's content.
 *
 * Every section below is driven entirely by fields already authored on the
 * setting object (whyItMatters / bestPractices / commonIssues / faqs /
 * tipsAndTricks / relatedSettingIds / updateFrequency / afterImageContent) —
 * nothing here is templated filler, and a section simply doesn't render if
 * the setting has no content for it.
 */
const SettingDetailPage = ({ setting, detectedPlatform, allSettings, onSelectSetting, onVisit, showImages = true }) => {
  const [isPending, setIsPending] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const notify = useToast();

  useEffect(() => {
    setOpenFaq(0);
  }, [setting.id]);

  if (!setting) return null;

  const Icon = setting.icon;
  const category = getCategoryById(setting.category);
  const actionLabel = setting.actionLabel || `Go to ${setting.title} Settings`;

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

  const relatedSettings = (setting.relatedSettingIds || [])
    .map((id) => allSettings.find((item) => item.id === id))
    .filter(Boolean);

  return (
    <article className="support-detail-page" aria-label={setting.title}>
      <header className="support-detail-hero">
        <div className="support-detail-hero-top">
          {category && (
            <span className="support-detail-category-badge">
              <category.icon className="h-3.5 w-3.5" />
              {category.label}
            </span>
          )}
          {setting.frequentlyUsed && (
            <Badge tone="neutral" className="support-detail-badge">
              <Zap className="h-3 w-3" /> Frequently used
            </Badge>
          )}
          {setting.recommended && (
            <Badge tone="info" className="support-detail-badge">
              <Sparkles className="h-3 w-3" /> Recommended
            </Badge>
          )}
        </div>

        <div className="support-detail-hero-main">
          <span className="support-detail-hero-icon" aria-hidden="true">
            <Icon className="h-7 w-7" />
          </span>
          <div>
            <h1 className="support-detail-title">{setting.title}</h1>
            <p className="support-detail-heading">{setting.heading}</p>
          </div>
        </div>

        <p className="support-detail-description">{setting.description}</p>

        <div className="support-detail-hero-actions">
          <Button variant="primary" loading={isPending} onClick={handleAction} className="support-detail-action-btn">
            {actionLabel}
            <ExternalLink className="h-4 w-4" />
          </Button>

          {setting.updateFrequency && (
            <span className="support-detail-frequency">
              <Clock className="h-3.5 w-3.5" />
              {setting.updateFrequency}
            </span>
          )}
        </div>
      </header>

      {setting.details?.length > 0 && (
        <section className="support-detail-section support-detail-quickfacts">
          <h2 className="support-detail-section-title">
            <ListChecks className="h-4 w-4" /> Quick Facts
          </h2>
          <ul className="support-detail-list">
            {setting.details.map((detail, i) => (
              <li key={i}>{detail}</li>
            ))}
          </ul>
        </section>
      )}

      {setting.important && (
        <Alert tone="warning" title="Important" icon={<AlertTriangle className="h-4 w-4" />}>
          {setting.important}
        </Alert>
      )}

      {setting.whyItMatters && (
        <section className="support-detail-section">
          <h2 className="support-detail-section-title">Why It Matters</h2>
          <p className="support-detail-prose">{setting.whyItMatters}</p>
        </section>
      )}

      {(setting.afterImageContent?.heading || setting.afterImageContent?.paragraphs?.length > 0) && (
        <section className="support-detail-section">
          <h2 className="support-detail-section-title">
            {setting.afterImageContent.heading || "How It Works"}
          </h2>

          {showImages && setting.imageUrl && (
            <div className="support-detail-image">
              <ManagedImage
                src={setting.imageUrl}
                alt={setting.imageAlt || setting.title}
                className="support-detail-image-img"
              />
              {setting.imageAlt && <p className="support-detail-image-caption">{setting.imageAlt}</p>}
            </div>
          )}

          {setting.afterImageContent.paragraphs?.map((para, i) => (
            <p key={i} className="support-detail-prose">
              {para}
            </p>
          ))}
        </section>
      )}

      <StepTimeline steps={setting.afterImageContent?.steps} />

      {setting.bestPractices?.length > 0 && (
        <section className="support-detail-section">
          <h2 className="support-detail-section-title">
            <Sparkles className="h-4 w-4" /> Best Practices
          </h2>
          <ul className="support-detail-list support-detail-list-check">
            {setting.bestPractices.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </section>
      )}

      {setting.commonIssues?.length > 0 && (
        <section className="support-detail-section">
          <h2 className="support-detail-section-title">
            <Wrench className="h-4 w-4" /> Common Issues &amp; Troubleshooting
          </h2>
          <div className="support-detail-issues">
            {setting.commonIssues.map((entry, i) => (
              <div key={i} className="support-detail-issue-card">
                <p className="support-detail-issue-title">{entry.issue}</p>
                <p className="support-detail-issue-fix">{entry.fix}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {setting.tipsAndTricks?.length > 0 && (
        <section className="support-detail-section">
          <h2 className="support-detail-section-title">
            <Lightbulb className="h-4 w-4" /> Tips &amp; Tricks
          </h2>
          <ul className="support-detail-list support-detail-list-tip">
            {setting.tipsAndTricks.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </section>
      )}

      {setting.faqs?.length > 0 && (
        <section className="support-detail-section">
          <h2 className="support-detail-section-title">
            <CircleQuestionMark className="h-4 w-4" /> Frequently Asked Questions
          </h2>
          <div className="support-accordion">
            {setting.faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="support-accordion-item">
                  <button
                    type="button"
                    className="support-accordion-trigger"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? -1 : i)}
                  >
                    <span className="support-accordion-trigger-left">{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && <div className="support-accordion-panel">{faq.a}</div>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {relatedSettings.length > 0 && (
        <section className="support-detail-section">
          <h2 className="support-detail-section-title">
            <Link2 className="h-4 w-4" /> Related Settings
          </h2>
          <div className="support-detail-related-chips">
            {relatedSettings.map((related) => {
              const RelatedIcon = related.icon;
              return (
                <button
                  key={related.id}
                  type="button"
                  className="support-detail-related-chip"
                  onClick={() => onSelectSetting?.(related.id)}
                >
                  <RelatedIcon className="h-4 w-4" />
                  {related.title}
                </button>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
};

export default SettingDetailPage;
