"use client";

import { ShieldCheck, ShieldAlert, Lock, AlertTriangle, Key, CheckCircle } from "lucide-react";

export default function SecurityTab({ securityData }) {
  if (!securityData) return null;

  const { tamperScore = 0, securityScore = 100, riskLevel = "Low", flags = [], checks = {} } = securityData;

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-indigo-500" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Security & Tampering Analyzer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Password protection, encryption, digital signatures, metadata manipulation, and zero-width text detection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">Security Score:</span>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{securityScore}/100</span>
        </div>
      </div>

      {/* Tampering Risk Gauge */}
      <div
        className={`rounded-2xl border p-5 space-y-3 ${
          tamperScore > 30
            ? "border-red-300 bg-red-50/70 dark:border-red-900/60 dark:bg-red-950/30"
            : "border-emerald-300 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/30"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wide text-slate-700 dark:text-slate-200">
            Tampering Risk Rating
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold text-white ${
              tamperScore > 30 ? "bg-red-600" : "bg-emerald-600"
            }`}
          >
            {riskLevel} Risk ({tamperScore}/100)
          </span>
        </div>

        {flags.length > 0 ? (
          <ul className="space-y-2 pt-1">
            {flags.map((flag, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            No security anomalies or metadata tampering flags detected.
          </p>
        )}
      </div>

      {/* Security Check Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {[
          { label: "Author Consistency", ok: !checks.authorMismatch },
          { label: "Metadata Integrity", ok: !checks.metadataTampered },
          { label: "Timestamp Sequence", ok: !checks.timestampAnomaly },
          { label: "Page Continuity", ok: !checks.missingPages },
          { label: "Embedded Objects / Scripts", ok: !checks.unexpectedObjects },
          { label: "Zero-Width Hidden Text", ok: !checks.hiddenText },
        ].map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 flex items-center justify-between"
          >
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                item.ok
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/20 text-red-600 dark:text-red-400"
              }`}
            >
              {item.ok ? "Passed" : "Flagged"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
