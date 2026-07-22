"use client";

import { Download, Printer, FileText, Share2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function ExportPanel({ timetable, subjects }) {
  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const data = {
      timetable,
      subjects,
      exportedAt: new Date().toISOString(),
      version: "1.0.0"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `study-plan-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-(--card) rounded-2xl border border-(--border) p-6 shadow-sm">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Download className="w-5 h-5 text-indigo-500" />
        Export & Share
      </h3>
      <div className="grid grid-cols-1 gap-3">
        <ExportButton
          icon={<Printer className="w-4 h-4" />}
          label="Print Timetable"
          desc="Optimized for A4 paper"
          onClick={handlePrint}
        />
        <ExportButton
          icon={<FileText className="w-4 h-4" />}
          label="Export as JSON"
          desc="Backup your study data"
          onClick={handleExportJSON}
        />
      </div>

      <div className="mt-6 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">Privacy Guarantee</p>
          <p className="text-xs text-(--muted-foreground)">
            Your data is stored locally on your device. We never upload your study schedule or personal goals to any server.
          </p>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function ExportButton({ icon, label, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-xl bg-(--background) border border-(--border) hover:border-(--primary) hover:bg-(--card-hover-bg) transition-all text-left group w-full"
    >
      <div className="p-2.5 rounded-lg bg-(--primary)/10 text-(--primary) group-hover:bg-(--primary) group-hover:text-white transition-colors shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-bold text-xs truncate">{label}</div>
        <div className="text-[10px] text-(--muted-foreground) truncate">{desc}</div>
      </div>
    </button>
  );
}
