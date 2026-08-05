"use client";

import React from "react";
import { ClipboardCheck, FileText, ListChecks, Search } from "lucide-react";

const FEATURES = [
  {
    title: "Approved-listing directory",
    description: "Public results are limited to listing records that have reached the admin-approved state.",
    icon: Search,
  },
  {
    title: "Publisher-provided details",
    description: "Prices, editorial information, turnaround estimates, and metrics come from the submitted listing; some fields may be unavailable.",
    icon: FileText,
  },
  {
    title: "Type-specific availability",
    description: "A placement type can be requested only when the listing includes an explicit price for that type, including an explicit zero price.",
    icon: ClipboardCheck,
  },
  {
    title: "Recorded request status",
    description: "Buyers, publishers, and admins can follow the statuses recorded for a placement request and its submitted evidence.",
    icon: ListChecks,
  },
];

export default function FeatureHighlights() {
  return (
    <section className="altf-card space-y-6 border border-border p-6 sm:p-8" aria-labelledby="feature-highlights-heading">
      <div className="mx-auto max-w-2xl space-y-2 text-center">
        <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          CURRENT CAPABILITIES
        </span>
        <h2 id="feature-highlights-heading" className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          A transparent listing and request record
        </h2>
        <p className="text-sm text-muted">
          ALTFTool shows what has been submitted and reviewed without inventing unavailable prices or performance metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {FEATURES.map(({ title, description, icon: Icon }) => (
          <article key={title} className="rounded-lg border border-border bg-surface-soft p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-base font-bold text-foreground">{title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted">{description}</p>
          </article>
        ))}
      </div>

      <p className="rounded-lg border border-border bg-surface p-4 text-xs leading-relaxed text-muted">
        Placement requests are workflow records, not payment receipts. Publication, link attributes, search performance, and indexing remain outside ALTFTool&apos;s guarantee.
      </p>
    </section>
  );
}
