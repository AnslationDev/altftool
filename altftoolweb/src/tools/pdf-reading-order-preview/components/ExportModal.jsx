"use client";

import { Download, FileCode, FileSpreadsheet, FileText, Printer, X, Check } from "lucide-react";
import { useState } from "react";

export default function ExportModal({ isOpen, onClose, pdfResult }) {
  const [downloadedFormat, setDownloadedFormat] = useState("");

  if (!isOpen || !pdfResult) return null;

  const summary = pdfResult.summary;
  const scoreData = summary?.scoreData || { score: 92, rating: "Excellent" };
  const allIssues = summary?.allIssues || [];

  const handleDownloadJson = () => {
    const data = JSON.stringify(pdfResult, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pdfResult.fileName.replace(/\.pdf$/i, "")}-reading-order-audit.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadedFormat("json");
  };

  const handleDownloadCsv = () => {
    let csv = "Page,Sequence,TagType,Text,X,Y,Width,Height,Issues\n";
    pdfResult.pages.forEach((p) => {
      p.estimate.estimatedItems.forEach((item, idx) => {
        const itemIssues = (p.estimate.accessibilityIssues || []).filter((i) => i.blockId === item.id);
        const issueCodes = itemIssues.map((i) => i.code).join("; ");
        const textClean = `"${(item.text || "").replace(/"/g, '""')}"`;
        csv += `${p.pageNumber},${idx + 1},${item.tagType},${textClean},${item.x?.toFixed(1) || ""},${item.y?.toFixed(1) || ""},${item.width?.toFixed(1) || ""},${item.height?.toFixed(1) || ""},"${issueCodes}"\n`;
      });
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pdfResult.fileName.replace(/\.pdf$/i, "")}-reading-order.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadedFormat("csv");
  };

  const handleDownloadHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PDF Reading-Order & Accessibility Audit Report - ${pdfResult.fileName}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 40px; color: #1e293b; background: #f8fafc; }
    .card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 24px; border: 1px solid #e2e8f0; }
    h1 { color: #0f172a; margin-top: 0; }
    .score-badge { display: inline-block; padding: 6px 16px; font-size: 20px; font-weight: bold; border-radius: 20px; color: white; background: #10b981; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    th { background: #f1f5f9; font-weight: bold; color: #334155; }
    .issue-high { color: #ef4444; font-weight: bold; }
    .issue-med { color: #f59e0b; font-weight: bold; }
  </style>
</head>
<body>
  <div class="card">
    <h1>PDF Reading-Order & Accessibility Audit Report</h1>
    <p><strong>File Name:</strong> ${pdfResult.fileName}</p>
    <p><strong>Page Count:</strong> ${pdfResult.pageCount}</p>
    <p><strong>Overall Accessibility Score:</strong> <span class="score-badge">${scoreData.score}/100 (${scoreData.rating})</span></p>
    <p><strong>Total Reading Blocks Extracted:</strong> ${summary.itemCount}</p>
    <p><strong>Total Issues Detected:</strong> ${allIssues.length}</p>
  </div>

  <div class="card">
    <h2>Detected Accessibility Issues Log</h2>
    <table>
      <thead>
        <tr><th>#</th><th>Code</th><th>Severity</th><th>Title / Message</th><th>Remediation Suggestion</th></tr>
      </thead>
      <tbody>
        ${allIssues
          .map(
            (iss, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td><code>${iss.code}</code></td>
            <td class="${iss.severity === "high" ? "issue-high" : "issue-med"}">${iss.severity.toUpperCase()}</td>
            <td><strong>${iss.title}:</strong> ${iss.message}</td>
            <td>${iss.suggestion}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pdfResult.fileName.replace(/\.pdf$/i, "")}-audit-report.html`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadedFormat("html");
  };

  const handleCapturePng = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) {
      alert("Canvas not available for PNG capture.");
      return;
    }
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${pdfResult.fileName.replace(/\.pdf$/i, "")}-page-preview.png`;
      a.click();
      setDownloadedFormat("png");
    } catch {
      alert("Unable to export canvas as PNG screenshot.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Download className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Export Audit Report
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Download structured accessibility metrics, reading sequence tables, PNG screenshots, or print a formatted audit report.
        </p>

        {/* Audit Score Summary Card */}
        <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">ACCESSIBILITY SCORE</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{scoreData.score} / 100</div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{scoreData.rating} Rating</span>
          </div>
          <div className="text-right text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <div><strong>Pages:</strong> {pdfResult.pageCount}</div>
            <div><strong>Blocks:</strong> {summary.itemCount}</div>
            <div><strong>Defects:</strong> {allIssues.length}</div>
          </div>
        </div>

        {/* Download Buttons Options */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleDownloadHtml}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition">
                <FileCode className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-200">HTML Audit Report</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Standalone HTML report file with issue log</div>
              </div>
            </div>
            {downloadedFormat === "html" && <Check className="h-4 w-4 text-emerald-500" />}
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-200">CSV Data Table</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Raw coordinates & reading blocks spreadsheet</div>
              </div>
            </div>
            {downloadedFormat === "csv" && <Check className="h-4 w-4 text-emerald-500" />}
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-200">JSON Audit Data</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Complete structured metadata & geometry payload</div>
              </div>
            </div>
            {downloadedFormat === "json" && <Check className="h-4 w-4 text-emerald-500" />}
          </button>

          <button
            type="button"
            onClick={handleCapturePng}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-200">PNG Page Screenshot</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Export high-DPI image of current page render</div>
              </div>
            </div>
            {downloadedFormat === "png" && <Check className="h-4 w-4 text-emerald-500" />}
          </button>

          <button
            type="button"
            onClick={handlePrintPdf}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition group"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition">
                <Printer className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-200">Print / Save as PDF</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Opens browser print dialog for PDF saving</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
