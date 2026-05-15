import React from 'react';
import { History, Trash2, RotateCcw, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HistoryPanel = ({ history, onClear, onDelete, onReuse }) => {
  if (!history || history.length === 0) {
    return (
      <div className="bg-(--card) border border-(--border) rounded-[2rem] p-12 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-(--primary)/10 rounded-full flex items-center justify-center mb-6 border border-(--primary)/20 animate-pulse-soft">
          <History size={40} className="text-(--primary)" />
        </div>
        <h4 className="text-xl font-black text-(--foreground) mb-2">No History Yet</h4>
        <p className="text-sm text-(--secondary-foreground) max-w-[240px] leading-relaxed">Your generated citations will be stored here for quick access and reuse.</p>
      </div>
    );
  }

  return (
    <div className="bg-(--card) border border-(--border) rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <History size={20} className="text-(--primary)" />
          <h3 className="text-lg font-bold text-(--foreground)">History</h3>
        </div>
        <button
          onClick={onClear}
          className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar max-h-[500px]">
        <AnimatePresence initial={false}>
          {history.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="group p-5 bg-(--background)/50 border border-(--border) rounded-2xl hover:border-(--primary)/30 transition-all hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 overflow-hidden">
                  <span className="text-[10px] font-black uppercase text-(--primary) mb-2 block tracking-widest">
                    {item.style} • {item.sourceType}
                  </span>
                  <p className="text-base text-(--foreground) italic line-clamp-3 mb-4 leading-relaxed">
                    {item.citation}
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => onReuse(item)}
                      className="flex items-center gap-2 text-xs font-black text-(--primary) hover:underline uppercase tracking-tighter"
                    >
                      <RotateCcw size={14} /> Reuse
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.citation);
                      }}
                      className="flex items-center gap-2 text-xs font-black text-green-600 hover:underline uppercase tracking-tighter"
                    >
                      <Copy size={14} /> Copy
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HistoryPanel;
