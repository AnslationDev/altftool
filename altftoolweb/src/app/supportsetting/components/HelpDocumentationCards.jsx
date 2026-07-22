"use client";

import Link from "next/link";
import { BookOpen, GraduationCap, ShieldCheck, ArrowRight } from "lucide-react";
import { SectionHeader } from "@altftool/ui";
import { SITE_ROUTES } from "@/platform/navigation/siteRoutes";

const HELP_CARDS = [
  {
    icon: GraduationCap,
    title: "Academy",
    description: "Step-by-step guides for getting the most out of AltFTool.",
    route: SITE_ROUTES.academy,
  },
  {
    icon: BookOpen,
    title: "Blog",
    description: "Tips, updates, and deep dives from the AltFTool team.",
    route: SITE_ROUTES.blogs,
  },
  {
    icon: ShieldCheck,
    title: "Brand Ratings",
    description: "See how AltFTool and other tools stack up.",
    route: SITE_ROUTES.brandRatings,
  },
];

const HelpDocumentationCards = () => (
  <section className="support-utility-section" aria-label="Help & documentation">
    <SectionHeader
      title="Help & Documentation"
      description="More ways to learn, beyond this settings page."
    />
    <div className="support-help-grid">
      {HELP_CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <Link key={card.title} href={card.route.href} className="support-help-card">
            <span className="support-help-card-icon" aria-hidden="true">
              <Icon className="h-5 w-5" />
            </span>
            <span className="support-help-card-title">{card.title}</span>
            <span className="support-help-card-desc">{card.description}</span>
            <span className="support-help-card-arrow">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        );
      })}
    </div>
  </section>
);

export default HelpDocumentationCards;
