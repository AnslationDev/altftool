"use client";

import { motion } from "framer-motion";
import { Sparkles, Stars } from "lucide-react";

export default function FortuneCard({ result }) {
  if (!result) return null;

  const { fortune, horoscope, luckyNumbers } = result;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5 p-6 shadow-md space-y-5 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

      <div className="relative flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-500/10">
          <Sparkles size={20} className="text-amber-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Today&apos;s Fortune
          </h3>
          <p className="text-[10px] text-muted-foreground">
            Mystical reading for you
          </p>
        </div>
      </div>

      <div className="relative space-y-4">
        <div className="rounded-xl bg-background/50 border border-amber-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Stars size={14} className="text-amber-500" />
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Fortune Quote
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed italic">
            &ldquo;{fortune}&rdquo;
          </p>
        </div>

        <div className="rounded-xl bg-background/50 border border-purple-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-purple-500" />
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
              Lucky Numbers
            </span>
          </div>
          <div className="flex gap-2">
            {luckyNumbers.map((num, i) => (
              <span
                key={i}
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm font-black text-amber-600"
              >
                {num}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-background/50 border border-primary/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Stars size={14} className="text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Horoscope
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {horoscope}
          </p>
        </div>
      </div>

      <div className="relative flex justify-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.span
            key={i}
            className="text-amber-400 text-lg"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            ✦
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
