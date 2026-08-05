"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { DEAL_TABS } from "../data/deals";
import { getStudentFriendlyTools, getToolsByDealType } from "../data/tools";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import ToolCard from "./ToolCard";

/** Section 4 — Free Forever / Free Trial / Student Friendly tabs. */
export default function FreeSubscriptionsSection() {
  const [activeTab, setActiveTab] = useState(DEAL_TABS[0].id);
  const tools =
    activeTab === "Student Friendly" ? getStudentFriendlyTools() : getToolsByDealType(activeTab).slice(0, 9);
  const activeTabMeta = DEAL_TABS.find((tab) => tab.id === activeTab);

  return (
    <section id="deals" aria-label="Free subscriptions and coupons" className="scroll-mt-24 bg-white/70 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            eyebrow="Verified free offers"
            title="Free subscriptions & coupons"
            subtitle="Genuinely free tiers, real free trials, and student-eligible plans — tagged honestly, not padded."
          />
        </Reveal>

        <div className="mx-auto mt-8 flex max-w-xl flex-wrap justify-center gap-2">
          {DEAL_TABS.map((tab) => (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab.id ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-600"
              }`}
            >
              <tab.icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </motion.button>
          ))}
        </div>

        {activeTabMeta ? (
          <p className="mx-auto mt-4 flex max-w-lg items-center justify-center gap-1.5 text-center text-sm text-slate-500">
            <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
            {activeTabMeta.description}
          </p>
        ) : null}

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool, index) => (
            <Reveal key={`${activeTab}-${tool.name}-${tool.domain}`} delay={Math.min(index * 0.04, 0.24)}>
              <ToolCard tool={tool} showCategory />
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Pricing and eligibility can change on the provider&apos;s side — always confirm current terms on the tool&apos;s own site.
        </p>
      </div>
    </section>
  );
}
