"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Scale, X } from "lucide-react";
import { useEngagement } from "../providers/EngagementProvider";
import CompareModal from "./CompareModal";
import ToolLogo from "./ToolLogo";

/** Floating tray shown once at least one tool is queued for comparison. */
export default function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useEngagement();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {compareList.length > 0 ? (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-2xl shadow-slate-900/15 sm:inset-x-auto sm:right-6 sm:left-auto"
          >
            <div className="flex -space-x-2">
              {compareList.map((tool) => (
                <span key={`${tool.name}-${tool.domain}`} className="relative rounded-full ring-2 ring-white">
                  <ToolLogo name={tool.name} domain={tool.domain} hue={tool.hue} size={32} />
                  <motion.button
                    type="button"
                    onClick={() => removeFromCompare(tool)}
                    aria-label={`Remove ${tool.name} from comparison`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.85 }}
                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-white"
                  >
                    <X className="h-2.5 w-2.5" aria-hidden="true" />
                  </motion.button>
                </span>
              ))}
            </div>
            <span className="flex-1 text-sm font-semibold text-slate-700">
              {compareList.length} tool{compareList.length === 1 ? "" : "s"} selected
            </span>
            <motion.button
              type="button"
              onClick={() => setModalOpen(true)}
              disabled={compareList.length < 2}
              whileHover={compareList.length < 2 ? undefined : { scale: 1.05 }}
              whileTap={compareList.length < 2 ? undefined : { scale: 0.95 }}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 px-4 py-2 text-sm font-semibold text-white disabled:pointer-events-none disabled:opacity-40"
            >
              <Scale className="h-4 w-4" aria-hidden="true" />
              Compare
            </motion.button>
            <motion.button
              type="button"
              onClick={clearCompare}
              aria-label="Clear comparison"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="shrink-0 rounded-xl p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </motion.button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <CompareModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
