"use client";

import Link from "next/link";
import { HelpCircle, ArrowRight } from "lucide-react";
import { SectionHeader } from "@altftool/ui";
import { SITE_ROUTES } from "@/platform/navigation/siteRoutes";

const COMMON_QUESTIONS = [
  "Why isn't a setting doing anything when I click it?",
  "Do these settings change my device, or just show me how?",
  "Why do I only see settings for one operating system?",
  "Where do I report a bug or request a new tool?",
];

/**
 * Short-circuits to the site's real FAQ page (SITE_ROUTES.faq) rather than
 * inventing a separate FAQ system for this one page.
 */
const FaqShortcuts = () => (
  <section className="support-utility-section" aria-label="Frequently asked questions">
    <SectionHeader
      title="FAQ Shortcuts"
      description="Common questions about Support Settings."
      actions={
        <Link href={SITE_ROUTES.faq.href} className="support-utility-link">
          View full FAQ
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    />
    <ul className="support-faq-list">
      {COMMON_QUESTIONS.map((question, i) => (
        <li key={i} className="support-faq-item">
          <HelpCircle className="h-4 w-4" />
          <Link href={SITE_ROUTES.faq.href}>{question}</Link>
        </li>
      ))}
    </ul>
  </section>
);

export default FaqShortcuts;
