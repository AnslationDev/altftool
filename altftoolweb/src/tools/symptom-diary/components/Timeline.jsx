import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2, Edit2, Calendar, Clock, AlertCircle,
  ChevronRight, Tag, Zap, Moon, Smile, ExternalLink
} from "lucide-react";

export default function Timeline({ logs, onDelete }) {
  if (logs.length === 0) return (
    <div className="bg-(--background) p-10 rounded-2xl border border-(--border) text-center text-(--muted-foreground)">
      No symptom logs found. Start by adding one above.
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-(--border) pb-6">
        <h2 className="text-2xl font-black text-(--foreground) uppercase tracking-tighter flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <Calendar size={24} className="text-blue-600" />
          </div>
          Symptom History
        </h2>
        <span className="text-xs font-black text-(--muted-foreground) uppercase tracking-widest bg-(--card) px-6 py-2 rounded-full border border-(--border) shadow-sm">
          {logs.length} Logged Entries
        </span>
      </div>

      <div className="space-y-6 overflow-y-auto max-h-[800px] pr-2 no-scrollbar">
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-(--card) p-8 rounded-3xl border border-(--border) shadow-xl hover:shadow-2xl transition-all group overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md shadow-blue-500/20">
                      {log.category}
                    </span>
                    <span className="text-xs font-black text-(--muted-foreground) flex items-center gap-2 uppercase tracking-widest">
                      <Calendar size={14} className="text-blue-500" /> {log.date}
                    </span>
                    <span className="text-xs font-black text-(--muted-foreground) flex items-center gap-2 uppercase tracking-widest">
                      <Clock size={14} className="text-blue-500" /> {log.time}
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <h3 className="text-2xl font-black text-(--foreground) tracking-tighter uppercase">{log.symptom}</h3>
                    <div className="flex items-center gap-3 bg-(--background) px-4 py-2 rounded-2xl border border-(--border)">
                      <div className="h-2 w-32 bg-(--muted) rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-1000"
                          style={{ width: `${log.severity * 10}%` }}
                        />
                      </div>
                      <span className="text-sm font-black text-(--foreground)">{log.severity}/10</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {log.trigger !== "None" && (
                      <div className="flex items-center gap-2 text-xs font-black text-(--muted-foreground) uppercase tracking-widest bg-(--background) p-3 rounded-xl border border-(--border)">
                        <Zap size={14} className="text-orange-500" /> {log.trigger}
                      </div>
                    )}
                    {log.duration && (
                      <div className="flex items-center gap-2 text-xs font-black text-(--muted-foreground) uppercase tracking-widest bg-(--background) p-3 rounded-xl border border-(--border)">
                        <Clock size={14} className="text-blue-500" /> {log.duration}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs font-black text-(--muted-foreground) uppercase tracking-widest bg-(--background) p-3 rounded-xl border border-(--border)">
                      <Smile size={14} className="text-yellow-500" /> {log.mood}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-black text-(--muted-foreground) uppercase tracking-widest bg-(--background) p-3 rounded-xl border border-(--border) whitespace-nowrap overflow-hidden text-ellipsis">
                      <Tag size={14} className="text-indigo-500" /> {log.medication || "No Meds"}
                    </div>
                  </div>

                  {log.notes && (
                    <div className="relative mt-4">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-full" />
                      <p className="text-sm text-(--muted-foreground) leading-relaxed pl-6 italic font-medium">
                        "{log.notes}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col gap-3 no-print border-t md:border-t-0 md:border-l border-(--border) pt-6 md:pt-0 md:pl-8">
                  <button
                    onClick={() => onDelete(log.id)}
                    className="p-4 text-(--muted-foreground) hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all shadow-sm border border-transparent hover:border-red-100"
                    title="Delete Entry"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
