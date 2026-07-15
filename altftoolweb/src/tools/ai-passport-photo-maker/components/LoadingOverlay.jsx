"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check } from "lucide-react";

const STEPS = [
  "Detecting face...",
  "Removing background...",
  "Applying template...",
];

export default function LoadingOverlay({ visible, message }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!visible) {
      setActiveStep(0);
      return;
    }
    const timers = STEPS.slice(1).map((_, idx) =>
      setTimeout(() => setActiveStep(idx + 1), (idx + 1) * 1800)
    );
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="alert"
          aria-live="polite"
        >
          <motion.div
            className="flex flex-col items-center gap-6 rounded-2xl bg-(--card) px-10 py-8 shadow-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Loader2 size={36} className="animate-spin text-(--primary)" />
            {message && (
              <p className="text-sm font-medium text-(--foreground)">{message}</p>
            )}
            <div className="flex flex-col gap-3">
              {STEPS.map((step, idx) => (
                <div key={step} className="flex items-center gap-2.5">
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      idx < activeStep
                        ? "bg-green-500 text-white"
                        : idx === activeStep
                          ? "border-2 border-(--primary)"
                          : "border-2 border-(--border)"
                    }`}
                  >
                    {idx < activeStep ? (
                      <Check size={12} />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`text-xs ${
                      idx === activeStep
                        ? "font-semibold text-(--foreground)"
                        : idx < activeStep
                          ? "text-(--muted-foreground) line-through opacity-60"
                          : "text-(--muted-foreground)"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
