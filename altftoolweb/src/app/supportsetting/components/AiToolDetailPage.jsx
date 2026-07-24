"use client";

import { useState } from "react";
import { ExternalLink, Download, ChevronDown, Sparkles, Rocket, Wand2, Wrench, CircleQuestionMark, ListChecks, Lightbulb, Link2, DollarSign, BookOpen, PlayCircle, Check } from "lucide-react";
import { Button } from "@altftool/ui";
import WasThisHelpful from "./WasThisHelpful";

/**
 * Dedicated detail page for an AI tool entry (data/aiTools.js). Distinct
 * from SettingDetailPage because AI tools have a different action shape —
 * an official-website link and, where one genuinely exists, a separate
 * download/get-started link — rather than a single OS-setting redirect.
 * Every URL on these entries was verified live before being authored in.
 */
const AiToolDetailPage = ({ tool, allTools, onSelectTool }) => {
  const [openFaq, setOpenFaq] = useState(0);
  if (!tool) return null;
  const Icon = tool.icon;

  const others = (allTools || []).filter((item) => item.id !== tool.id);
  const sameCategory = others.filter((item) => item.category === tool.category);
  const relatedTools = (sameCategory.length > 0 ? sameCategory : others).slice(0, 3);

  return (
    <article className="support-detail-page support-aitool-page" aria-label={tool.name}>
      <header className="support-detail-hero support-aitool-hero">
        <div className="support-detail-hero-top">
          <span className="support-detail-category-badge">
            <Sparkles className="h-3.5 w-3.5" />
            AI Tool
          </span>
          {tool.categoryLabel && (
            <span className="support-detail-category-badge support-aitool-category-badge">
              {tool.categoryLabel}
            </span>
          )}
        </div>

        <div className="support-detail-hero-main">
          <span className="support-detail-hero-icon" aria-hidden="true">
            <Icon className="h-7 w-7" />
          </span>
          <div>
            <h1 className="support-detail-title">{tool.name}</h1>
            <p className="support-detail-heading">{tool.tagline}</p>
          </div>
        </div>

        <p className="support-detail-description">{tool.overview?.whatIsIt}</p>

        <div className="support-detail-hero-actions">
          <a href={tool.officialUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="primary" className="support-detail-action-btn">
              Visit Official Website
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
          {tool.downloadUrl && (
            <a href={tool.downloadUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" className="support-detail-action-btn">
                {tool.downloadLabel || "Download"}
                <Download className="h-4 w-4" />
              </Button>
            </a>
          )}
        </div>
      </header>

      {tool.overview?.problems?.length > 0 && (
        <section className="support-detail-section">
          <h2 className="support-detail-section-title">
            <ListChecks className="h-4 w-4" /> What Problems It Solves
          </h2>
          <ul className="support-detail-list">
            {tool.overview.problems.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </section>
      )}

      {tool.overview?.mainFeatures?.length > 0 && (
        <section className="support-detail-section">
          <h2 className="support-detail-section-title">
            <Sparkles className="h-4 w-4" /> Main Features
          </h2>
          <ul className="support-detail-list support-detail-list-check">
            {tool.overview.mainFeatures.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </section>
      )}

      {(tool.setupGuide?.accountSteps?.length > 0 || tool.setupGuide?.installSteps?.length > 0 || tool.setupGuide?.loginSteps?.length > 0) && (
        <section className="support-detail-section">
          <h2 className="support-detail-section-title">
            <Rocket className="h-4 w-4" /> Setup Guide
          </h2>
          {tool.setupGuide.accountSteps?.length > 0 && (
            <>
              <p className="support-card-steps-label">Create an Account</p>
              <ol className="support-card-steps">
                {tool.setupGuide.accountSteps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </>
          )}
          {tool.setupGuide.installSteps?.length > 0 && (
            <>
              <p className="support-card-steps-label">Install (if applicable)</p>
              <ol className="support-card-steps">
                {tool.setupGuide.installSteps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </>
          )}
          {tool.setupGuide.loginSteps?.length > 0 && (
            <>
              <p className="support-card-steps-label">Log In</p>
              <ol className="support-card-steps">
                {tool.setupGuide.loginSteps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </>
          )}
          {tool.setupGuide.initialConfig?.length > 0 && (
            <>
              <p className="support-card-steps-label">Initial Configuration</p>
              <ul className="support-detail-list">
                {tool.setupGuide.initialConfig.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </>
          )}
        </section>
      )}

      {tool.pricing && (
        <section className="support-detail-section">
          <h2 className="support-detail-section-title">
            <DollarSign className="h-4 w-4" /> Pricing &amp; Free vs. Paid
          </h2>
          {tool.pricing.summary && <p className="support-detail-prose">{tool.pricing.summary}</p>}
          <div className="support-pricing-grid">
            {tool.pricing.free?.length > 0 && (
              <div className="support-pricing-col">
                <p className="support-card-steps-label">Free Tier Includes</p>
                <ul className="support-detail-list support-detail-list-check">
                  {tool.pricing.free.map((item, i) => (
                    <li key={i}>
                      <Check className="h-3.5 w-3.5 support-pricing-check" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {tool.pricing.paid?.length > 0 && (
              <div className="support-pricing-col">
                <p className="support-card-steps-label">Paid Plans Add</p>
                <ul className="support-detail-list support-detail-list-check">
                  {tool.pricing.paid.map((item, i) => (
                    <li key={i}>
                      <Check className="h-3.5 w-3.5 support-pricing-check" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {tool.pricing.pricingUrl && (
            <a href={tool.pricing.pricingUrl} target="_blank" rel="noopener noreferrer" className="support-utility-link">
              See current pricing on the official site
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </section>
      )}

      {tool.usage && (
        <section className="support-detail-section">
          <h2 className="support-detail-section-title">
            <Wand2 className="h-4 w-4" /> How to Use It
          </h2>
          {tool.usage.howToUse && <p className="support-detail-prose">{tool.usage.howToUse}</p>}
          {tool.usage.bestPrompts?.length > 0 && (
            <>
              <p className="support-card-steps-label">Best Prompts to Try</p>
              <ul className="support-detail-list">
                {tool.usage.bestPrompts.map((p, i) => <li key={i}>&ldquo;{p}&rdquo;</li>)}
              </ul>
            </>
          )}
          {tool.usage.commonUseCases?.length > 0 && (
            <>
              <p className="support-card-steps-label">Common Use Cases</p>
              <ul className="support-detail-list">
                {tool.usage.commonUseCases.map((u, i) => <li key={i}>{u}</li>)}
              </ul>
            </>
          )}
        </section>
      )}

      {tool.bestPractices?.length > 0 && (
        <section className="support-detail-section">
          <h2 className="support-detail-section-title">
            <Sparkles className="h-4 w-4" /> Best Practices
          </h2>
          <ul className="support-detail-list support-detail-list-check">
            {tool.bestPractices.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </section>
      )}

      {tool.troubleshooting?.length > 0 && (
        <section className="support-detail-section">
          <h2 className="support-detail-section-title">
            <Wrench className="h-4 w-4" /> Troubleshooting
          </h2>
          <div className="support-detail-issues">
            {tool.troubleshooting.map((t, i) => (
              <div key={i} className="support-detail-issue-card">
                <p className="support-detail-issue-title">{t.issue}</p>
                <p className="support-detail-issue-fix">{t.fix}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {tool.helpfulTips?.length > 0 && (
        <section className="support-detail-section">
          <h2 className="support-detail-section-title">
            <Lightbulb className="h-4 w-4" /> Helpful Tips
          </h2>
          <ul className="support-detail-list support-detail-list-tip">
            {tool.helpfulTips.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </section>
      )}

      {tool.faqs?.length > 0 && (
        <section className="support-detail-section">
          <h2 className="support-detail-section-title">
            <CircleQuestionMark className="h-4 w-4" /> Frequently Asked Questions
          </h2>
          <div className="support-accordion">
            {tool.faqs.map((faq, i) => {
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

      {(tool.docsUrl || tool.videosUrl) && (
        <section className="support-detail-section">
          <h2 className="support-detail-section-title">
            <BookOpen className="h-4 w-4" /> Official Documentation &amp; Videos
          </h2>
          <div className="support-detail-related-chips">
            {tool.docsUrl && (
              <a href={tool.docsUrl} target="_blank" rel="noopener noreferrer" className="support-detail-related-chip">
                <BookOpen className="h-4 w-4" /> Official Documentation
              </a>
            )}
            {tool.videosUrl && (
              <a href={tool.videosUrl} target="_blank" rel="noopener noreferrer" className="support-detail-related-chip">
                <PlayCircle className="h-4 w-4" /> Video Tutorials
              </a>
            )}
          </div>
        </section>
      )}

      {relatedTools.length > 0 && (
        <section className="support-detail-section">
          <h2 className="support-detail-section-title">
            <Link2 className="h-4 w-4" /> Related AI Tools
          </h2>
          <div className="support-detail-related-chips">
            {relatedTools.map((related) => {
              const RelatedIcon = related.icon;
              return (
                <button
                  key={related.id}
                  type="button"
                  className="support-detail-related-chip"
                  onClick={() => onSelectTool?.(related.id)}
                >
                  <RelatedIcon className="h-4 w-4" />
                  {related.name}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <WasThisHelpful />
    </article>
  );
};

export default AiToolDetailPage;
