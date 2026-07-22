import React from "react";
import { motion } from "framer-motion";
import { Zap, RotateCcw, FileText, Download } from "lucide-react";

export default function Header({ onReset, onExportPDF, onExportCSV }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-4 mb-12"
    >
      <div className="flex justify-center">
        <div className="p-4 rounded-3xl bg-(--primary)/10 text-(--primary) shadow-xl shadow-blue-500/10">
          <Zap className="w-10 h-10" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="heading text-gradient-hero">
          Appliance Power Usage Estimator
        </h1>
        <p className="description max-w-2xl mx-auto">
          Calculate your home's electricity consumption, estimate monthly bills, and discover energy-saving opportunities with our precision estimator.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <button
          onClick={onReset}
          className="btn-secondary flex items-center gap-2 px-6 py-3 rounded-2xl hover:text-red-500 hover:border-red-500/30 transition-all duration-300"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset All</span>
        </button>

        <button
          onClick={onExportPDF}
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/20"
        >
          <FileText className="w-4 h-4" />
          <span>Export PDF</span>
        </button>

        <button
          onClick={onExportCSV}
          className="btn-secondary flex items-center gap-2 px-6 py-3 rounded-2xl"
        >
          <Download className="w-4 h-4" />
          <span>Download CSV</span>
        </button>
      </div>
    </motion.header>
  );
}
