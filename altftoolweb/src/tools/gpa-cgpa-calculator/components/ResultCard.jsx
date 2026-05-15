import React from "react";
import { motion } from "framer-motion";
import { getPerformanceLabel } from "../utils/calculator-logic";

export default function ResultCard({ value, type, totalCredits }) {
  const perf = getPerformanceLabel(value);
  
  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-(--background) p-6 rounded-2xl border border-(--border) shadow-xl relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${perf.bg} rounded-bl-full opacity-30 -mr-16 -mt-16 transition-all duration-700`}></div>
      
      <div className="relative z-10 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xs font-black text-(--muted-foreground) uppercase tracking-[0.2em]">{type} Score</h3>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-6xl font-black ${perf.color}`}>{value}</span>
              <span className="text-xl font-bold text-(--muted-foreground)">/ 10</span>
            </div>
          </div>
          <div className={`${perf.bg} ${perf.color} px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border border-current/10`}>
            {perf.label}
          </div>
        </div>

        <div className="pt-4 border-t border-(--border) flex justify-between items-center text-sm">
          <span className="text-(--muted-foreground) font-medium">Total Credits Completed</span>
          <span className="font-bold text-(--foreground)">{totalCredits}</span>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full h-1.5 bg-(--card) rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(value / 10) * 100}%` }}
            className={`h-full ${perf.bg.replace("bg-", "bg-").replace("50", "500")}`} // Dynamic background
            style={{ backgroundColor: "currentColor" }}
          ></motion.div>
        </div>
      </div>
    </motion.div>
  );
}
