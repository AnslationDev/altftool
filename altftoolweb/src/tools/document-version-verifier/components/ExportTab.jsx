"use client";

import { Download, FileText, Code, FileCode, Printer } from "lucide-react";
import { exportToPdf, exportToJson, exportToCsv, exportToTxt, exportToHtml } from "../lib/reportExporter.js";

export default function ExportTab({ comparisonData }) {
  if (!comparisonData) return null;

  const handleExportPdf = () => exportToPdf(comparisonData, "document-version-audit-report.pdf");
  const handleExportJson = () => exportToJson(comparisonData, "document-version-audit-report.json");
  const handleExportCsv = () => exportToCsv(comparisonData, "document-version-diff.csv");
  const handleExportTxt = () => exportToTxt(comparisonData, "document-version-summary.txt");
  const handleExportHtml = () => exportToHtml(comparisonData, "document-version-report.html");
  const handlePrint = () => window.print();

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Download className="h-5 w-5 text-indigo-500" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Report Generator & Exporter
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Download executive audit reports in PDF, CSV, JSON, TXT, or HTML formats
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200"
        >
          <Printer className="h-4 w-4" /> Print Report
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* PDF Download */}
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm mb-1">
              <FileText className="h-4 w-4" /> Professional PDF Audit Report
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Complete document comparison report with executive summary, metadata matrix, security risk scores, and AI recommendations.
            </p>
          </div>
          <button
            onClick={handleExportPdf}
            className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" /> Export PDF
          </button>
        </div>

        {/* JSON Export */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-extrabold text-sm mb-1">
              <Code className="h-4 w-4" /> Structured JSON Audit Log
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Machine-readable audit payload containing similarity scores, line deltas, cryptographic hashes, and security flags.
            </p>
          </div>
          <button
            onClick={handleExportJson}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" /> Export JSON
          </button>
        </div>

        {/* CSV Diff Export */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm mb-1">
              <FileCode className="h-4 w-4" /> Line-by-Line CSV Diff
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tabular spreadsheet of all added, deleted, and modified line entries with original and updated text fields.
            </p>
          </div>
          <button
            onClick={handleExportCsv}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {/* TXT Plain Summary */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-extrabold text-sm mb-1">
              <FileText className="h-4 w-4" /> Plain Text Summary
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Lightweight plain text audit overview suitable for emails, compliance logs, and terminal logs.
            </p>
          </div>
          <button
            onClick={handleExportTxt}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" /> Export TXT
          </button>
        </div>

        {/* HTML Report */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-extrabold text-sm mb-1">
              <FileCode className="h-4 w-4" /> Standalone HTML Document
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Self-contained interactive HTML document with styled summary tables and difference highlights.
            </p>
          </div>
          <button
            onClick={handleExportHtml}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" /> Export HTML
          </button>
        </div>
      </div>
    </div>
  );
}
