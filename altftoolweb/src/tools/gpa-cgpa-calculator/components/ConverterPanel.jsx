import React from "react";
import { motion } from "framer-motion";

export default function ConverterPanel({ cgpa, percentage }) {
  return (
    <div className="bg-(--background) p-6 rounded-2xl border border-(--border) space-y-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/><path d="M2 12h20"/><path d="m5 7-3 5 3 5"/><path d="m19 7 3 5-3 5"/>
          </svg>
        </div>
        <h3 className="text-lg font-bold">Percentage Converter</h3>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-12 py-4">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="80"
              fill="none"
              stroke="var(--card)"
              strokeWidth="10"
            />
            <motion.circle
              cx="88"
              cy="88"
              r="80"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray="502.4"
              initial={{ strokeDashoffset: 502.4 }}
              animate={{ strokeDashoffset: 502.4 - (502.4 * percentage) / 100 }}
              className="text-purple-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black">{percentage}%</span>
          </div>
        </div>

        <div className="flex-1 space-y-2 text-center md:text-left">
          <div className="text-sm font-bold text-(--muted-foreground)">Formula applied:</div>
          <div className="text-xs font-mono bg-(--card) p-2 rounded-lg border border-(--border) inline-block">
            (CGPA - 0.75) × 10
          </div>
          <p className="text-xs text-(--muted-foreground) leading-relaxed italic">
            Standard conversion used by most universities to calculate equivalent aggregate percentage.
          </p>
        </div>
      </div>
    </div>
  );
}
