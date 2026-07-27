"use client";

import { SlidersHorizontal, AlertTriangle } from "lucide-react";

export default function MetadataTab({ docA, docB, searchQuery = "" }) {
  if (!docA || !docB) return null;

  const metaA = docA.metadata || {};
  const metaB = docB.metadata || {};

  const fields = [
    { label: "Filename", key: "filename" },
    { label: "File Extension", key: "extension" },
    { label: "File Size", key: "fileSize", format: (v) => `${Math.round((v || 0) / 1024)} KB` },
    { label: "Created Date", key: "createdDate", format: (v) => v ? new Date(v).toLocaleString() : "N/A" },
    { label: "Modified Date", key: "modifiedDate", format: (v) => v ? new Date(v).toLocaleString() : "N/A" },
    { label: "Author", key: "author" },
    { label: "Creator / App", key: "creator" },
    { label: "Producer", key: "producer" },
    { label: "PDF Version", key: "pdfVersion" },
    { label: "Word Count", key: "wordCount" },
    { label: "Character Count", key: "characterCount" },
    { label: "Page Count", key: "pageCount" },
    { label: "Paragraph Count", key: "paragraphCount" },
    { label: "Image Count", key: "imageCount" },
    { label: "Table Count", key: "tableCount" },
  ];

  const filteredFields = fields.filter((f) => {
    if (!searchQuery || !searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const valA = String(metaA[f.key] ?? "").toLowerCase();
    const valB = String(metaB[f.key] ?? "").toLowerCase();
    const label = f.label.toLowerCase();
    return label.includes(q) || valA.includes(q) || valB.includes(q);
  });

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <SlidersHorizontal className="h-5 w-5 text-indigo-500" />
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Document Metadata Comparison
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Side-by-side inspection of internal properties ({filteredFields.length} fields matching)
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <th className="p-3 font-extrabold uppercase text-xs text-slate-500">Property Field</th>
              <th className="p-3 font-extrabold uppercase text-xs text-indigo-600 dark:text-indigo-400">
                Document A (Original)
              </th>
              <th className="p-3 font-extrabold uppercase text-xs text-emerald-600 dark:text-emerald-400">
                Document B (Updated)
              </th>
              <th className="p-3 font-extrabold uppercase text-xs text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredFields.map((f) => {
              const valA = f.format ? f.format(metaA[f.key]) : String(metaA[f.key] ?? "N/A");
              const valB = f.format ? f.format(metaB[f.key]) : String(metaB[f.key] ?? "N/A");
              const isDifferent = valA !== valB;

              return (
                <tr
                  key={f.key}
                  className={`transition-colors ${
                    isDifferent ? "bg-amber-50/50 dark:bg-amber-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">{f.label}</td>
                  <td className="p-3 font-mono text-xs text-slate-700 dark:text-slate-300 break-all">{valA}</td>
                  <td className="p-3 font-mono text-xs text-slate-700 dark:text-slate-300 break-all">{valB}</td>
                  <td className="p-3">
                    {isDifferent ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="h-3 w-3" /> Modified
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-500">
                        Identical
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
