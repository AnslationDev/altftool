"use client";

import { motion } from "framer-motion";
import { Sparkles, Heart, Star, Sun, Award } from "lucide-react";

const icons = [Sparkles, Heart, Star, Sun, Award];

const closingMessages = [
  "Remember, true beauty shines from within! ✨",
  "You are a masterpiece, inside and out! 💖",
  "Keep being your amazing self! 🌟",
  "Your uniqueness is your superpower! 🦋",
  "Shine bright, beautiful soul! 💫",
];

export default function ComplimentCard({ compliments = [] }) {
  if (!compliments.length) return null;

  const closing = closingMessages[Math.floor(Math.random() * closingMessages.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-blue-500/5 border border-pink-300/20 rounded-3xl p-6 sm:p-8 space-y-5"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-pink-400/20 to-purple-400/20">
          <Sparkles className="text-pink-400" size={20} />
        </div>
        <h3 className="font-bold text-lg text-foreground">Beautiful Compliments</h3>
      </div>

      <div className="space-y-3">
        {compliments.map((compliment, i) => {
          const Icon = icons[i % icons.length];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.15 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-card/60 border border-border/60"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-pink-400/20 to-purple-400/20 flex-shrink-0 mt-0.5">
                <Icon className="text-pink-400" size={14} />
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {compliment}
              </p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center pt-2"
      >
        <p className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400">
          {closing}
        </p>
      </motion.div>
    </motion.div>
  );
}
