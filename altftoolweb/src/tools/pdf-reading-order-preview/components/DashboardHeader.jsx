"use client";

import { motion } from "framer-motion";
import { FileCheck, ShieldAlert, FileText, Layers, ListOrdered, Award, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";

function KpiCard({ title, value, subtext, icon: Icon, color, badge }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-lg backdrop-blur-md"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
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

export default function DashboardHeader({ pdfResult }) {
  if (!pdfResult) return null;

  const { fileName, pageCount, summary } = pdfResult;
  const scoreData = summary?.scoreData || { score: 100, rating: "Excellent" };
  const allIssues = summary?.allIssues || [];

  const score = scoreData.score;
  const rating = scoreData.rating;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Recommended Version / WCAG Status Highlight Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-200 dark:border-indigo-900/80 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-5 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                  WCAG 1.3.2 Audit Status
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-400/30">
                  {score}/100 Rating
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Document: <span className="text-indigo-300">{fileName}</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-indigo-200">
            <span className="rounded-xl bg-slate-800/80 px-3 py-1.5 border border-slate-700">
              Pages: {pageCount}
            </span>
            <span className="rounded-xl bg-slate-800/80 px-3 py-1.5 border border-slate-700">
              Compliance: {rating}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <KpiCard
          title="Accessibility Score"
          value={`${score}/100`}
          subtext="WCAG & PDF/UA composite"
          icon={FileCheck}
          color="bg-gradient-to-r from-indigo-500 to-blue-600"
          badge={rating}
        />

        <KpiCard
          title="Reading Blocks"
          value={summary.itemCount}
          subtext="Extracted text payload"
          icon={ListOrdered}
          color="bg-gradient-to-r from-blue-500 to-teal-500"
          badge="Parsed"
        />

        <KpiCard
          title="Detected Defects"
          value={allIssues.length}
          subtext="Accessibility warnings"
          icon={ShieldAlert}
          color={allIssues.length > 0 ? "bg-gradient-to-r from-rose-500 to-amber-500" : "bg-gradient-to-r from-emerald-500 to-teal-500"}
          badge={allIssues.length === 0 ? "Clean" : `${allIssues.length} Issues`}
        />

        <KpiCard
          title="Document Pages"
          value={pageCount}
          subtext="Total page count"
          icon={FileText}
          color="bg-gradient-to-r from-purple-500 to-indigo-500"
          badge="Complete"
        />

        <KpiCard
          title="Heading Score"
          value={`${scoreData.breakdown?.headings ?? 100}%`}
          subtext="Hierarchy validation"
          icon={Layers}
          color="bg-gradient-to-r from-teal-500 to-emerald-500"
          badge="H1-H3"
        />

        <KpiCard
          title="Logical Flow"
          value={`${scoreData.breakdown?.logicalFlow ?? 100}%`}
          subtext="Sequence continuity"
          icon={ShieldCheck}
          color="bg-gradient-to-r from-amber-500 to-orange-500"
          badge="Flow"
        />
      </div>
    </div>
  );
}
