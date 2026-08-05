"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  ClipboardCheck,
  FileText,
  Globe,
  Info,
  Layers,
  Link2,
  ListChecks,
  Search,
  ShieldCheck,
} from "lucide-react";

const WORKFLOW_STEPS = {
  buyer: [
    {
      title: "Browse reviewed listings",
      description:
        "Compare listings that publishers submitted and admins approved for display. Prices and any available metrics come from the listing record.",
      icon: Search,
    },
    {
      title: "Prepare a placement request",
      description:
        "Choose an available placement type and provide the target URL, anchor text, and content details the publisher needs to assess the request.",
      icon: FileText,
    },
    {
      title: "Follow the recorded status",
      description:
        "The request can move through publisher and admin review. A status update records workflow progress; it is not a payment confirmation.",
      icon: ListChecks,
    },
  ],
  publisher: [
    {
      title: "Submit listing details",
      description:
        "Provide the domain, editorial details, and an explicit price for each placement type you offer. Unavailable placement types remain unavailable.",
      icon: Globe,
    },
    {
      title: "Wait for admin review",
      description:
        "An admin reviews the submitted listing before it appears publicly. Approval reflects that workflow review, not a guarantee of every submitted metric.",
      icon: ShieldCheck,
    },
    {
      title: "Review each request",
      description:
        "Accept or reject a placement request according to your editorial requirements, then provide a live URL if you publish it.",
      icon: Link2,
    },
  ],
  admin: [
    {
      title: "Moderate listing submissions",
      description:
        "Review publisher-submitted domains, prices, metrics, and editorial details before approving or rejecting a listing.",
      icon: ClipboardCheck,
    },
    {
      title: "Review request activity",
      description:
        "Use recorded request details and status changes to support marketplace moderation without treating the record as a financial transaction.",
      icon: Layers,
    },
    {
      title: "Record delivery evidence",
      description:
        "Review a publisher-submitted live URL and related evidence. ALTFTool does not guarantee publication, link attributes, or search indexing.",
      icon: Link2,
    },
  ],
};

const ROLE_TABS = [
  { id: "buyer", label: "Buyers", icon: Search },
  { id: "publisher", label: "Publishers", icon: Globe },
  { id: "admin", label: "Admins", icon: ShieldCheck },
];

const RECORDED_DETAILS = [
  {
    title: "Listing review state",
    description: "Submitted and approved states make the moderation path visible.",
    icon: ClipboardCheck,
  },
  {
    title: "Type-specific prices",
    description: "Guest-post and link-insertion prices are shown only when the publisher provided them.",
    icon: FileText,
  },
  {
    title: "Placement request history",
    description: "Requests and subsequent status changes stay associated with the selected listing.",
    icon: ListChecks,
  },
];

export default function PlatformArchitectureShowcase({ onExploreMarketplace, onListWebsite }) {
  const [activeTab, setActiveTab] = useState("buyer");

  return (
    <section className="space-y-12 py-6" aria-labelledby="platform-workflow-heading">
      <div className="altf-card border border-border p-6 sm:p-10">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <Layers className="h-4 w-4" aria-hidden="true" />
            CURRENT MARKETPLACE WORKFLOW
          </span>
          <h2 id="platform-workflow-heading" className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            A review and request workflow for publisher listings
          </h2>
          <p className="text-sm leading-relaxed text-muted sm:text-base">
            ALTFTool lets publishers submit listing details, lets admins review those submissions, and lets buyers send placement requests against approved listings. Listing prices and metrics are publisher-submitted, and metrics may be unavailable.
          </p>
          <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-soft p-4 text-sm text-muted">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <p>
              A placement request is not a purchase or payment confirmation. ALTFTool does not currently collect or hold payment, and it does not guarantee that a request will be published or indexed by a search engine.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <h3 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">How each role participates</h3>
          <p className="text-sm text-muted">Choose a role to see the actions currently represented in the marketplace.</p>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex flex-wrap justify-center gap-1 rounded-lg border border-border bg-surface p-1" role="tablist" aria-label="Marketplace roles">
            {ROLE_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeTab === id}
                onClick={() => setActiveTab(id)}
                className={`flex min-h-10 items-center gap-2 rounded-md px-4 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  activeTab === id ? "bg-primary text-primary-foreground" : "text-muted hover:bg-surface-soft hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {WORKFLOW_STEPS[activeTab].map((item, index) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="altf-card border border-border p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-primary">0{index + 1}</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
                <h4 className="text-base font-bold text-foreground">{item.title}</h4>
                <p className="mt-2 text-xs leading-relaxed text-muted">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        <div className="mx-auto max-w-2xl space-y-2 text-center">
          <h3 className="text-2xl font-black tracking-tight text-foreground">What ALTFTool records</h3>
          <p className="text-sm text-muted">The interface presents submitted information and workflow state without filling missing data with estimates.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {RECORDED_DETAILS.map(({ title, description, icon: Icon }) => (
            <article key={title} className="altf-card border border-border p-5">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <h4 className="mt-4 text-base font-bold text-foreground">{title}</h4>
              <p className="mt-2 text-xs leading-relaxed text-muted">{description}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="altf-card flex flex-col items-start justify-between gap-5 border border-border bg-surface-soft p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="max-w-2xl">
          <h3 className="text-xl font-black text-foreground">Review the available records</h3>
          <p className="mt-2 text-sm text-muted">Browse approved listings or submit a website for admin review.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onExploreMarketplace} className="altf-btn-primary px-5 py-3 text-xs font-bold">
            Explore listings
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={onListWebsite} className="altf-btn-secondary px-5 py-3 text-xs font-bold">
            <Globe className="h-4 w-4" aria-hidden="true" />
            Submit a website
          </button>
        </div>
      </div>
    </section>
  );
}
