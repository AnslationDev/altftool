"use client";

import { useState } from "react";
import Link from "next/link";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { SITE_ROUTES } from "@/platform/navigation/siteRoutes";

/**
 * Per-page feedback. Kept honest about what actually happens: there's no
 * backend collecting these votes today, so a "No" answer doesn't claim
 * it's been "sent to our team" — it offers the real Contact page instead,
 * same as FeedbackCard does elsewhere on this module.
 */
const WasThisHelpful = () => {
  const [answer, setAnswer] = useState(null);

  return (
    <section className="support-detail-section support-was-helpful" aria-label="Was this page helpful?">
      {answer === null ? (
        <>
          <p className="support-was-helpful-question">Was this helpful?</p>
          <div className="support-was-helpful-actions">
            <button type="button" className="support-was-helpful-btn" onClick={() => setAnswer("yes")}>
              <ThumbsUp className="h-4 w-4" /> Yes
            </button>
            <button type="button" className="support-was-helpful-btn" onClick={() => setAnswer("no")}>
              <ThumbsDown className="h-4 w-4" /> No
            </button>
          </div>
        </>
      ) : answer === "yes" ? (
        <p className="support-was-helpful-response">Glad it helped — thanks for letting us know.</p>
      ) : (
        <p className="support-was-helpful-response">
          Sorry about that. <Link href={SITE_ROUTES.contact.href}>Tell us what was missing</Link> so we can improve it.
        </p>
      )}
    </section>
  );
};

export default WasThisHelpful;
