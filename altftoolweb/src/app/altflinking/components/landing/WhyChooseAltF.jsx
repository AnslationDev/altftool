"use client";

import React from "react";
import { ClipboardCheck, Eye, FileCheck2, Tags } from "lucide-react";

const PILLARS = [
  {
    title: "Submitted data stays explicit",
    description: "Missing metrics remain unavailable, and a missing price is not converted into a free offer.",
    icon: Eye,
  },
  {
    title: "Prices match placement types",
    description: "Publishers submit guest-post and link-insertion prices separately so buyers can request only an offered type.",
    icon: Tags,
  },
  {
    title: "Listings pass through review",
    description: "An admin decision controls whether a submitted listing appears in the public directory.",
    icon: ClipboardCheck,
  },
  {
    title: "Requests retain their context",
    description: "The selected listing, requested placement type, quoted listing price, and later status are recorded together.",
    icon: FileCheck2,
  },
];

export default function WhyChooseAltF() {
  return (
    <section className="altf-card space-y-8 border border-border p-6 sm:p-10" aria-labelledby="why-altf-heading">
      <div className="mx-auto max-w-2xl space-y-3 text-center">
        <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          WORKFLOW PRINCIPLES
        </span>
        <h2 id="why-altf-heading" className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          Clear records instead of implied guarantees
        </h2>
        <p className="text-sm text-muted">
          The marketplace separates publisher-submitted information, admin review, and placement-request status so each can be interpreted correctly.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PILLARS.map(({ title, description, icon: Icon }) => (
          <article key={title} className="rounded-lg border border-border bg-surface-soft p-5">
            <span className="inline-flex rounded-lg bg-primary/10 p-3 text-primary">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-base font-bold text-foreground">{title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
