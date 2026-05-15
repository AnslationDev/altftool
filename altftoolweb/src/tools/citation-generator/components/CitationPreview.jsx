import React, { useState } from 'react';
import { Copy, Download, Check, FileText, File as FileIcon, FileType } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { exportToTxt, exportToPdf, exportToDocx } from '../utils/export-utils';

const CitationPreview = ({ citation, style }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-(--card) border border-(--border) rounded-2xl p-6 shadow-sm overflow-hidden relative group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-(--primary) uppercase tracking-widest">{style} Preview</h3>
        <button
          onClick={handleCopy}
          className="p-2 hover:bg-(--primary)/10 rounded-lg transition-colors text-(--primary)"
          title="Copy Citation"
        >
          {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
        </button>
      </div>

      <div className="min-h-[100px] flex items-center justify-center p-6 bg-(--background)/50 backdrop-blur-xl rounded-2xl border border-dashed border-(--border)">
        <p className="text-xl text-(--foreground) font-medium leading-relaxed italic text-center break-words max-w-full">
          {citation || "Enter source details to see the preview..."}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => exportToTxt(citation)}
          disabled={!citation}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText size={16} /> TXT
        </button>
        <button
          onClick={() => exportToPdf(citation)}
          disabled={!citation}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileType size={16} /> PDF
        </button>
        <button
          onClick={() => exportToDocx(citation)}
          disabled={!citation}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileIcon size={16} /> DOCX
        </button>
      </div>

      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-green-500 text-white rounded-full text-xs font-bold shadow-lg pointer-events-none"
          >
            Copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CitationPreview;
