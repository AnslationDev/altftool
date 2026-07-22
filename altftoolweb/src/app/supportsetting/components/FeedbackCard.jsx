"use client";

import Link from "next/link";
import { ThumbsUp, ArrowRight, Wrench } from "lucide-react";
import { SITE_ROUTES } from "@/platform/navigation/siteRoutes";

/**
 * Feedback on Support Settings routes to the real Contact page and the
 * real "Request a Tool" page — both already-working destinations — rather
 * than a form with no backend to actually receive it.
 */
const FeedbackCard = () => (
  <section className="support-utility-section support-feedback-card" aria-label="Feedback">
    <div className="support-feedback-icon" aria-hidden="true">
      <ThumbsUp className="h-5 w-5" />
    </div>
    <div className="support-feedback-copy">
      <h2>Have feedback on this page?</h2>
      <p>Tell us what's missing, confusing, or could be better.</p>
    </div>
    <div className="support-feedback-actions">
      <Link href={SITE_ROUTES.contact.href} className="support-utility-link">
        Send feedback
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
      <Link href={SITE_ROUTES.requestTool.href} className="support-utility-link">
        <Wrench className="h-3.5 w-3.5" />
        Request a setting
      </Link>
    </div>
  </section>
);

export default FeedbackCard;
