"use client";

import { Hash, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

export default function HashVerificationTab({ hashesA, hashesB, hashesIdentical }) {
  if (!hashesA || !hashesB) return null;

  const algorithms = [
    { label: "MD5", key: "md5" },
    { label: "SHA-1", key: "sha1" },
    { label: "SHA-256", key: "sha256" },
    { label: "SHA-512", key: "sha512" },
    { label: "CRC32", key: "crc32" },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Hash className="h-5 w-5 text-indigo-500" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Cryptographic Hash Verification
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Byte-level checksum analysis (MD5, SHA-1, SHA-256, SHA-512, CRC32)
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-extrabold border ${
            hashesIdentical
              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
          }`}
        >
          {hashesIdentical ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Exact Byte Match (100% Integrity)
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-amber-500" /> Hashes Differ (Modified Binary Data)
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {algorithms.map((algo) => {
          const hashA = hashesA[algo.key] || "N/A";
          const hashB = hashesB[algo.key] || "N/A";
          const isMatch = hashA === hashB;

          return (
            <div
              key={algo.key}
              className={`rounded-2xl border p-4 transition-all ${
                isMatch
                  ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  {algo.label} Checksum
                </span>
                <span
                  className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    isMatch
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-600 text-white"
                  }`}
                >
                  {isMatch ? "Match" : "Mismatch"}
                </span>
              </div>

              <div className="grid gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 w-16 shrink-0">Doc A:</span>
                  <span className="text-slate-800 dark:text-slate-200 break-all select-all">{hashA}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 w-16 shrink-0">Doc B:</span>
                  <span className="text-slate-800 dark:text-slate-200 break-all select-all">{hashB}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
