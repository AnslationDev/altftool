"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import { useEngagement } from "../providers/EngagementProvider";
import { useToolLaunch } from "../providers/ToolLaunchProvider";
import RatingStars from "./RatingStars";
import ToolLogo from "./ToolLogo";

const ROWS = [
  { key: "categoryLabel", label: "Category" },
  { key: "pricing", label: "Pricing" },
  { key: "dealType", label: "Offer" },
  { key: "rating", label: "Rating" },
];

export default function CompareModal({ open, onClose }) {
  const { compareList } = useEngagement();
  const { launchTool } = useToolLaunch();

  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Compare AI tools"
            onClick={(event) => event.stopPropagation()}
            className="aib-card max-h-[85vh] w-full max-w-3xl overflow-auto rounded-3xl bg-white p-6 sm:p-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900">Compare tools</h2>
              <motion.button
                type="button"
                onClick={onClose}
                aria-label="Close comparison"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </motion.button>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                <thead>
                  <tr>
                    <th className="w-32 pb-4" />
                    {compareList.map((tool) => (
                      <th key={`${tool.name}-${tool.domain}`} className="px-3 pb-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <ToolLogo name={tool.name} domain={tool.domain} hue={tool.hue} size={44} />
                          <span className="font-bold text-slate-900">{tool.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => (
                    <tr key={row.key} className="border-t border-slate-100">
                      <td className="py-3 pr-3 text-xs font-bold uppercase tracking-wide text-slate-400">{row.label}</td>
                      {compareList.map((tool) => (
                        <td key={`${tool.name}-${tool.domain}-${row.key}`} className="px-3 py-3 text-center text-slate-700">
                          {row.key === "rating" ? (
                            <div className="flex justify-center">
                              <RatingStars rating={tool.rating} />
                            </div>
                          ) : (
                            tool[row.key] || "—"
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="border-t border-slate-100">
                    <td className="py-4 pr-3" />
                    {compareList.map((tool) => (
                      <td key={`${tool.name}-${tool.domain}-open`} className="px-3 py-4 text-center">
                        <motion.a
                          href={tool.url}
                          onClick={(event) => {
                            event.preventDefault();
                            launchTool(tool);
                          }}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 px-3.5 py-2 text-xs font-semibold text-white"
                        >
                          Open <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </motion.a>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
