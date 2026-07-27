"use client";

import { motion } from "framer-motion";
import { FileCheck, Hash, ShieldAlert, FileText, Layers, Image as ImageIcon, Table as TableIcon, Award, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";

function KpiCard({ title, value, subtext, icon: Icon, color, badge }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-lg backdrop-blur-md"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          {value}
        </span>
        {badge && (
          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-extrabold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {badge}
          </span>
        )}
      </div>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
        {subtext}
      </p>
    </motion.div>
  );
}

export default function DashboardHeader({ comparisonData }) {
  if (!comparisonData) return null;

  const { similarity, versionAI, security, diffSummary, docA, docB, hashesIdentical } = comparisonData;

  const simScore = similarity?.overallSimilarity ?? 0;
  const confScore = versionAI?.confidence ?? 0;
  const riskScore = security?.tamperScore ?? 0;

  return (
    <div className="space-y-6">
      {/* Recommended Version Highlight Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-200 dark:border-indigo-900/80 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-5 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                  AI Recommendation
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-400/30">
                  {confScore}% Confidence
                </span>
              </div>
              <h3 className="text-xl font-black text-white">
                Recommended Version: <span className="text-indigo-300">{versionAI?.newerDoc || docB?.name || "Version B"}</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-indigo-200">
            <span className="rounded-xl bg-slate-800/80 px-3 py-1.5 border border-slate-700">
              Status: {versionAI?.status || "Revised"}
            </span>
            <span className="rounded-xl bg-slate-800/80 px-3 py-1.5 border border-slate-700">
              Risk: {security?.riskLevel || "Low"}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <KpiCard
          title="Similarity Score"
          value={`${simScore}%`}
          subtext="Cosine & Jaccard metric"
          icon={FileCheck}
          color="bg-gradient-to-r from-indigo-500 to-blue-600"
          badge={simScore >= 95 ? "High" : simScore >= 70 ? "Moderate" : "Low"}
        />

        <KpiCard
          title="Version Confidence"
          value={`${confScore}%`}
          subtext={`Latest: ${versionAI?.newerDoc || "Doc B"}`}
          icon={Award}
          color="bg-gradient-to-r from-emerald-500 to-teal-600"
        />

        <KpiCard
          title="Hash Verification"
          value={hashesIdentical ? "Match" : "Differs"}
          subtext="SHA-256 byte check"
          icon={Hash}
          color={hashesIdentical ? "bg-emerald-600" : "bg-amber-600"}
        />

        <KpiCard
          title="Security Score"
          value={`${security?.securityScore ?? 100}/100`}
          subtext={`Tamper Risk: ${security?.riskLevel || "Low"}`}
          icon={ShieldCheck}
          color={riskScore > 30 ? "bg-red-600" : "bg-blue-600"}
        />

        <KpiCard
          title="Words Changed"
          value={`${diffSummary?.changes || 0}`}
          subtext={`+${diffSummary?.additions || 0} / -${diffSummary?.removals || 0}`}
          icon={FileText}
          color="bg-gradient-to-r from-purple-500 to-indigo-600"
        />

        <KpiCard
          title="Pages & Tables"
          value={`${docB?.metadata?.pageCount || 1} Pgs`}
          subtext={`${docB?.metadata?.tableCount || 0} Tables · ${docB?.metadata?.imageCount || 0} Imgs`}
          icon={Layers}
          color="bg-gradient-to-r from-slate-600 to-slate-800"
        />
      </div>
    </div>
  );
}
