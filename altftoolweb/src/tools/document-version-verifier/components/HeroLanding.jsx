"use client";

import { motion } from "framer-motion";
import { FileCheck } from "lucide-react";

export default function HeroLanding({ onTryDemoClick }) {
  return (
    <section className="w-full py-6 sm:py-10 px-4 flex flex-col items-center justify-center text-center">
      <div className="max-w-3xl space-y-5 flex flex-col items-center text-center">
        {/* Tool Meta Title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-slate-900 dark:text-white"
        >
          Document Version Verifier
        </motion.h1>

        {/* Tool Detail Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal"
        >
          Compare document versions, detect modifications, verify authenticity, analyze metadata, and generate professional reports — all privately in your browser.
        </motion.p>

        {/* Action Button: Document Verification Demo */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center pt-3"
        >
          <button
            onClick={onTryDemoClick}
            className="inline-flex items-center gap-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <FileCheck className="h-4 w-4 text-white" />
            Try Demo
          </button>
        </motion.div>
      </div>
    </section>
  );
}