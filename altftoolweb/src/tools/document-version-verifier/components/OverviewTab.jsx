"use client";

import { motion } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { FileCheck, Award, ShieldAlert, CheckCircle2, FileText, ArrowRight, Layers, Clock, Hash, FileCode, SlidersHorizontal, ShieldCheck } from "lucide-react";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"];

export default function OverviewTab({ comparisonData }) {
  if (!comparisonData) return null;

  const { similarity, versionAI, security, diffSummary, docA, docB, hashesIdentical, hashesA, hashesB, structureDelta } = comparisonData;

  const chartData = [
    { name: "Added", count: diffSummary?.additions || 0 },
    { name: "Removed", count: diffSummary?.removals || 0 },
    { name: "Changed", count: diffSummary?.changes || 0 },
  ];

  const pieData = [
    { name: "Cosine Score", value: similarity?.cosineScore || 0 },
    { name: "Jaccard Score", value: similarity?.jaccardScore || 0 },
  ];

  const metaA = docA?.metadata || {};
  const metaB = docB?.metadata || {};

  return (
    <div className="space-y-6">
      {/* Executive Summary & AI Insights */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 font-bold">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Executive Summary & Verification Findings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated document comparison insights & version analysis
              </p>
            </div>
          </div>

          <ul className="space-y-3 pt-2">
            {(versionAI?.aiInsights || []).map((insight, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="flex items-start gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 text-sm text-slate-700 dark:text-slate-200"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{insight}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Version Lineage Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-500" />
              Document Lineage Tree
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Heuristic lineage prediction score
            </p>

            <div className="space-y-3 pt-2">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Original Reference</span>
                <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {versionAI?.originalDoc || docA?.name || "Document A"}
                </p>
              </div>

              <div className="flex justify-center text-indigo-500">
                <ArrowRight className="h-5 w-5 rotate-90" />
              </div>

              <div className="rounded-2xl border border-indigo-300 dark:border-indigo-800 p-3.5 bg-indigo-50/80 dark:bg-indigo-950/50">
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Latest Revision</span>
                <p className="font-bold text-sm text-indigo-900 dark:text-indigo-200 truncate">
                  {versionAI?.newerDoc || docB?.name || "Document B"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-indigo-600 p-4 text-white text-center shadow-lg">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">Version Confidence</span>
            <div className="text-3xl font-black">{versionAI?.confidence || 0}%</div>
          </div>
        </div>
      </div>

      {/* Detailed Document Version Comparison Matrix */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 font-bold">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Detailed Version Specifications & Comparison Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                In-depth metadata comparison between Version A (Original) and Version B (Revised)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <span className={`px-3 py-1.5 rounded-full border ${hashesIdentical ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800" : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"}`}>
              {hashesIdentical ? "✓ Identical Hash" : "⚡ Revised Content Detected"}
            </span>
          </div>
        </div>

        {/* Side-by-Side Detailed Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4">Specification Metric</th>
                <th className="py-3 px-4 text-indigo-600 dark:text-indigo-400">Document A (Original)</th>
                <th className="py-3 px-4 text-emerald-600 dark:text-emerald-400">Document B (Revised)</th>
                <th className="py-3 px-4">Version Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" /> Document Name
                </td>
                <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">{docA?.name || "N/A"}</td>
                <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">{docB?.name || "N/A"}</td>
                <td className="py-3 px-4 font-bold text-slate-500">Name Refined</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-slate-400" /> File Size
                </td>
                <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">{metaA.fileSize ? `${Math.round(metaA.fileSize / 1024)} KB` : "N/A"}</td>
                <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">{metaB.fileSize ? `${Math.round(metaB.fileSize / 1024)} KB` : "N/A"}</td>
                <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                  {metaA.fileSize && metaB.fileSize ? `${metaB.fileSize > metaA.fileSize ? "+" : ""}${Math.round((metaB.fileSize - metaA.fileSize) / 1024)} KB` : "0 KB"}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-slate-400" /> Word Count
                </td>
                <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">{metaA.wordCount || 0} words</td>
                <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">{metaB.wordCount || 0} words</td>
                <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                  {metaA.wordCount && metaB.wordCount ? `${metaB.wordCount > metaA.wordCount ? "+" : ""}${metaB.wordCount - metaA.wordCount} words` : "0"}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-slate-400" /> Character Count
                </td>
                <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">{metaA.characterCount || 0} chars</td>
                <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">{metaB.characterCount || 0} chars</td>
                <td className="py-3 px-4 font-bold text-slate-600 dark:text-slate-400">
                  {metaA.characterCount && metaB.characterCount ? `${metaB.characterCount > metaA.characterCount ? "+" : ""}${metaB.characterCount - metaA.characterCount}` : "0"}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" /> Last Modified Date
                </td>
                <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                  {metaA.modifiedDate ? new Date(metaA.modifiedDate).toLocaleString() : "N/A"}
                </td>
                <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                  {metaB.modifiedDate ? new Date(metaB.modifiedDate).toLocaleString() : "N/A"}
                </td>
                <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">Updated Revision</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Hash className="h-4 w-4 text-slate-400" /> SHA-256 Fingerprint
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-slate-500 truncate max-w-[200px]" title={hashesA?.sha256}>
                  {hashesA?.sha256 || "N/A"}
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-slate-500 truncate max-w-[200px]" title={hashesB?.sha256}>
                  {hashesB?.sha256 || "N/A"}
                </td>
                <td className="py-3 px-4 font-bold">
                  {hashesIdentical ? (
                    <span className="text-emerald-600 font-bold">Match</span>
                  ) : (
                    <span className="text-amber-600 font-bold">Modified Hash</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-slate-400" /> Integrity & Tampering Risk
                </td>
                <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">Baseline Verified</td>
                <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">{security?.riskLevel || "Low Risk"}</td>
                <td className="py-3 px-4 font-bold text-emerald-600">
                  {security?.securityScore ? `Security Score: ${security.securityScore}/100` : "Passed"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4">
          <h4 className="text-sm font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Word & Content Changes Breakdown
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff" }} />
                <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4">
          <h4 className="text-sm font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Similarity Engine Metrics
          </h4>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
