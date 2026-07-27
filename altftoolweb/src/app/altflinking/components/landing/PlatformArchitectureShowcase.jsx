/**
 * Full Product & Feature Architecture Showcase Component
 * Location: src/app/altflinking/components/landing/PlatformArchitectureShowcase.jsx
 */

"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Search,
  CheckCircle2,
  Globe,
  UserCheck,
  Zap,
  Layers,
  ArrowRight,
  Sparkles,
  BarChart3,
  Check,
  TrendingUp,
  FileCheck2,
  DollarSign,
  AlertTriangle,
  FileCode2,
} from "lucide-react";

export default function PlatformArchitectureShowcase({ onExploreMarketplace, onListWebsite }) {
  const [activeTab, setActiveTab] = useState("buyer");

  const workflowSteps = {
    buyer: [
      {
        step: "01",
        title: "Search & Filter Inventory",
        desc: "Filter 1,400+ verified websites by Domain Rating (DR 40-90+), Ahrefs organic traffic, niche, country, and turnaround time.",
        icon: Search,
        highlight: "Real Ahrefs/Semrush Data",
      },
      {
        step: "02",
        title: "Configure Request & Target URL",
        desc: "Choose between Guest Post or Link Insertion. Provide target landing URL, preferred anchor text, and optional article draft.",
        icon: FileCode2,
        highlight: "Free & Escrow Placement",
      },
      {
        step: "03",
        title: "100% Escrow Protection Vault",
        desc: "Your funds are safely held in escrow. Payment is only released to the publisher AFTER the live link is verified.",
        icon: Lock,
        highlight: "Zero Risk Escrow Guarantee",
      },
      {
        step: "04",
        title: "Automated Live Link Index Verification",
        desc: "Our automated crawler bot checks dofollow status, HTTP 200 header, target URL match, and Google indexation 24/7.",
        icon: CheckCircle2,
        highlight: "Continuous Link Monitoring",
      },
    ],
    publisher: [
      {
        step: "01",
        title: "Submit Domain & Details",
        desc: "List your blog or publication with pricing for Guest Posts & Link Insertions, editorial guidelines, and turnaround times.",
        icon: Globe,
        highlight: "Simple 2-Min Submission",
      },
      {
        step: "02",
        title: "DNS Ownership & Admin Verification",
        desc: "Verify domain ownership via automated DNS TXT record or meta tag lookup. All sites pass through Admin Review before going live.",
        icon: ShieldCheck,
        highlight: "Admin Quality Moderation",
      },
      {
        step: "03",
        title: "Receive & Accept Buyer Orders",
        desc: "Get notified when buyers submit requests matching your website guidelines. Accept or reject requests with one click.",
        icon: FileCheck2,
        highlight: "Complete Editorial Control",
      },
      {
        step: "04",
        title: "Publish & Receive Payout",
        desc: "Publish the content on your website and submit the live URL. Once verified, funds transfer instantly to your wallet.",
        icon: DollarSign,
        highlight: "0% Commission Penalty",
      },
    ],
    admin: [
      {
        step: "01",
        title: "Domain Quality Control",
        desc: "Review incoming website submissions for spam score, PBN indicators, organic traffic authenticity, and DNS ownership.",
        icon: UserCheck,
        highlight: "Single Source of Truth",
      },
      {
        step: "02",
        title: "Order Fulfillment Moderation",
        desc: "Approve buyer orders, inspect article drafts, monitor turnaround SLAs, and oversee live link delivery.",
        icon: Layers,
        highlight: "Order SLA Tracking",
      },
      {
        step: "03",
        title: "Escrow & Dispute Arbitrage",
        desc: "Fairly resolve disputes between buyers and publishers regarding link removal, non-indexing, or guideline violations.",
        icon: AlertTriangle,
        highlight: "Neutral Escrow Arbitrage",
      },
      {
        step: "04",
        title: "Platform Revenue & Analytics",
        desc: "Monitor marketplace transaction volume, active escrow balances, dofollow indexation rates, and publisher payouts.",
        icon: BarChart3,
        highlight: "Real-time Metrics Console",
      },
    ],
  };

  const featureDeepDive = [
    {
      title: "100% Escrow Fund Security",
      badge: "Financial Protection",
      desc: "Buyer funds are locked in platform escrow and never transferred to publishers until the live link passes automated dofollow + Google indexation checks.",
      icon: Lock,
      color: "from-indigo-500/20 to-blue-500/10 border-indigo-500/30 text-indigo-400",
    },
    {
      title: "DNS Ownership Verification",
      badge: "Anti-Fraud Engine",
      desc: "Eliminating middlemen and impersonators. Every publisher proves website ownership via automated DNS TXT record verification before listing.",
      icon: ShieldCheck,
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
    },
    {
      title: "Admin Quality Review Gate",
      badge: "Single Source of Truth",
      desc: "Every website submission and guest post request undergoes manual Admin Review to filter out PBNs, spam domains, and inappropriate content.",
      icon: UserCheck,
      color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400",
    },
    {
      title: "24/7 Automated Link Crawler",
      badge: "Continuous Monitoring",
      desc: "Our indexing bots continuously scan live backlink URLs indefinitely to ensure links remain dofollow, non-deleted, and indexed on Google.",
      icon: Zap,
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
    },
    {
      title: "Enterprise Agency Campaigns",
      badge: "Scale & Bulk",
      desc: "Organize link building across multiple client campaigns, allocate target budgets, track cumulative DR gains, and export CSV reports.",
      icon: Layers,
      color: "from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400",
    },
    {
      title: "Instant Publisher Payouts",
      badge: "Publisher Friendly",
      desc: "Publishers earn 100% of their listed price with zero hidden commission penalties and instant withdrawal access to their digital wallet.",
      icon: DollarSign,
      color: "from-teal-500/20 to-emerald-500/10 border-teal-500/30 text-teal-400",
    },
  ];

  return (
    <div className="space-y-16 py-6">

      {/* SECTION 1: WHAT IS THIS PLATFORM (OVERVIEW HEADER) */}
      <div className="altf-card p-8 sm:p-12 relative overflow-hidden border-slate-200">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

        <div className="max-w-3xl space-y-4 relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-bold text-indigo-300">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>EXPLAINED: WHAT WE ARE BUILDING</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            The Industry Standard Marketplace for <br />
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              High-Authority Backlinks &amp; Guest Posts
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            <strong>ALTFTool Backlink Marketplace</strong> connects <strong>SEO Agencies &amp; Buyers</strong> directly with <strong>DNS-Verified Website Publishers</strong>. We eliminate middleman brokers, fake metric scams, unindexed links, and lost payments through automated escrow protection and 24/7 link crawlers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">For Buyers &amp; Agencies</h4>
                <p className="text-[11px] text-slate-500">Buy dofollow guest posts with 100% escrow money-back safety.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">For Website Publishers</h4>
                <p className="text-[11px] text-slate-500">Monetize your high-DR blog directly with instant wallet payouts.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Admin Quality Gate</h4>
                <p className="text-[11px] text-slate-500">Every domain &amp; request verified before publishing publicly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: WORKFLOW STEP-BY-STEP (INTERACTIVE TABBED VIEW) */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-bold text-cyan-400 border border-cyan-500/30">
            END-TO-END WORKFLOW
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">How the Marketplace Operates</h3>
          <p className="text-xs sm:text-sm text-slate-500">Select your role to explore the step-by-step workflow from submission to payout.</p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 rounded-2xl bg-white border border-slate-200 gap-1">
            {[
              { id: "buyer", label: "For Buyers / Agencies", icon: Search },
              { id: "publisher", label: "For Website Publishers", icon: Globe },
              { id: "admin", label: "Admin Quality Control", icon: ShieldCheck },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`py-2.5 px-4 sm:px-6 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeTab === id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-slate-500 hover:text-indigo-600"
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Workflow Step Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowSteps[activeTab].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="altf-card p-6 space-y-4 relative border-slate-200 hover:border-indigo-500/40 transition group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black font-mono text-indigo-400/40 group-hover:text-indigo-400 transition">
                    {item.step}
                  </span>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-indigo-400">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-300 font-mono">
                    {item.highlight}
                  </span>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: CORE PLATFORM FEATURES DEEP-DIVE */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
            PLATFORM ARCHITECTURE
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Built for Transparency, Security &amp; Speed
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Every feature is engineered to protect buyers, empower publishers, and maintain platform quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureDeepDive.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="altf-card p-6 space-y-4 border-slate-200 hover:border-slate-200 transition"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br border ${f.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider bg-white px-2.5 py-1 rounded-full border border-slate-200">
                    {f.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base font-bold text-white">{f.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: CALL TO ACTION BANNER */}
      <div className="altf-card p-8 sm:p-12 text-center bg-gradient-to-r from-indigo-50 via-white to-cyan-950/60 border-indigo-500/30 space-y-6">
        <div className="max-w-2xl mx-auto space-y-3">
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Ready to Scale Your Authority Backlinks?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Join 1,400+ verified websites and top SEO agencies building real search engine authority.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onExploreMarketplace}
            className="altf-btn-primary py-3 px-6 text-xs sm:text-sm font-extrabold rounded-xl shadow-xl shadow-indigo-600/30"
          >
            <Search className="h-4 w-4" />
            <span>Explore 1,400+ Verified Websites</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={onListWebsite}
            className="altf-btn-secondary py-3 px-6 text-xs sm:text-sm font-bold rounded-xl"
          >
            <Globe className="h-4 w-4 text-indigo-400" />
            <span>Submit Your Website for Review</span>
          </button>
        </div>
      </div>

    </div>
  );
}
