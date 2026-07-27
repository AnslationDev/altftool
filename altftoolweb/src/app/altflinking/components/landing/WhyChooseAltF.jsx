/**
 * Why Choose ALTFTool Section
 * Location: src/app/altflinking/components/landing/WhyChooseAltF.jsx
 */

"use client";

import React from "react";
import { ShieldCheck, Lock, Zap, FileText, Layers, CheckCircle2, Trophy, Clock } from "lucide-react";

export default function WhyChooseAltF() {
  const pillars = [
    {
      title: "Automated DNS Ownership Verification",
      desc: "No middlemen or unauthorized brokers. Every domain is verified via automated DNS TXT record lookup.",
      icon: ShieldCheck,
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    },
    {
      title: "100% Escrow Fund Protection",
      desc: "Your funds remain locked in platform escrow until the live backlink passes dofollow & indexation checks.",
      icon: Lock,
      color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10",
    },
    {
      title: "Continuous 24/7 Link Health Crawler",
      desc: "Our automated bots inspect target anchors, 200 OK headers, rel attributes, and index status indefinitely.",
      icon: Zap,
      color: "text-amber-400 border-amber-500/20 bg-amber-500/10",
    },
    {
      title: "Enterprise Agency Bulk Workflows",
      desc: "Group link orders into organized campaigns, allocate budget limits, and export CSV/PDF client reports.",
      icon: Layers,
      color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
    },
  ];

  return (
    <div className="altf-card p-8 sm:p-12 space-y-10 border-slate-200">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="rounded-full bg-indigo-500/10 px-3.5 py-1 text-xs font-bold text-indigo-400 border border-indigo-500/30">
          ENTERPRISE STANDARDS
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Why SEO Agencies & Brands Choose ALTFTool</h2>
        <p className="text-xs sm:text-sm text-slate-500">Eliminating backlink fraud, low-quality PBNs, and unfulfilled guest post broker orders.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pillars.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3">
              <div className={`inline-flex p-3 rounded-xl border ${p.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">{p.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
