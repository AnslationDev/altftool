"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Download, Copy, Share2, FileCode, FileSpreadsheet } from "lucide-react";

export default function ExportToolbar({
  anagrams,
  onCopyAll,
  onExportFormat,
  onShareAll,
}) {
  if (!anagrams || anagrams.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-3xl bg-card/90 backdrop-blur-xl border border-border/80 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 mt-8"
    >
      {/* Left Info */}
      <div className="flex items-center gap-3 text-center md:text-left">
        <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-500 border border-teal-500/20">
          <Download className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">
            Export & Share Results
          </h3>
          <p className="text-xs text-muted-foreground">
            Download or copy <strong className="text-foreground">{anagrams.length}</strong> generated anagrams in your preferred format.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 w-full md:w-auto">
        {/* Copy All */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onCopyAll}
          className="px-4 py-2.5 rounded-xl bg-surface-soft hover:bg-border text-foreground border border-border/80 text-xs font-semibold flex items-center gap-2 transition shadow-sm"
        >
          <Copy size={14} className="text-teal-500" />
          <span>Copy All</span>
        </motion.button>

        {/* Export TXT */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onExportFormat("txt")}
          className="px-3.5 py-2.5 rounded-xl bg-surface-soft hover:bg-teal-500/10 text-foreground hover:text-teal-600 dark:hover:text-teal-400 border border-border/80 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
        >
          <FileText size={14} className="text-teal-500" />
          <span>TXT</span>
        </motion.button>

        {/* Export CSV */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onExportFormat("csv")}
          className="px-3.5 py-2.5 rounded-xl bg-surface-soft hover:bg-indigo-500/10 text-foreground hover:text-indigo-600 dark:hover:text-indigo-400 border border-border/80 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
        >
          <FileSpreadsheet size={14} className="text-indigo-500" />
          <span>CSV</span>
        </motion.button>

        {/* Export JSON */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onExportFormat("json")}
          className="px-3.5 py-2.5 rounded-xl bg-surface-soft hover:bg-purple-500/10 text-foreground hover:text-purple-600 dark:hover:text-purple-400 border border-border/80 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
        >
          <FileCode size={14} className="text-purple-500" />
          <span>JSON</span>
        </motion.button>

        {/* Share All */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onShareAll}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-semibold text-xs flex items-center gap-2 transition shadow-md shadow-teal-500/20"
        >
          <Share2 size={14} />
          <span>Share Link</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
