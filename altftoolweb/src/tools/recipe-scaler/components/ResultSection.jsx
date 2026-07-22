"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ChefHat } from "lucide-react";

export default function ResultSection({ ingredients, scalingFactor, targetServings, originalServings }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = ingredients.join("\n");
    navigator.clipboard.writeText(`Scaled Recipe for ${targetServings} servings:\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {ingredients.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.35 }}
          className="space-y-4"
        >
          {/* Scaling Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Original", value: originalServings, desc: "servings", color: "text-(--foreground)" },
              { label: "Factor",   value: `${scalingFactor.toFixed(2)}×`, desc: "scale", color: "text-(--primary)" },
              { label: "Target",   value: targetServings, desc: "servings", color: "text-(--foreground)" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="p-4 rounded-2xl bg-(--card) border border-(--border) text-center shadow-sm hover:border-(--primary)/30 transition-all"
              >
                <p className="text-[9px] font-black text-(--muted-foreground) uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h3>
                <p className="text-xs text-(--muted-foreground) mt-0.5">{stat.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Ingredient List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-(--primary)" />
                <h2 className="text-xl font-black text-(--foreground)">Scaled Ingredients</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-(--primary)/10 text-(--primary) text-xs font-black">
                  {ingredients.length} items
                </span>
                <button
                  onClick={handleCopy}
                  className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy All"}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {ingredients.map((ing, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="group flex items-center gap-3 p-4 rounded-2xl bg-(--card) border border-(--border) hover:border-(--primary)/20 transition-all shadow-sm hover:shadow-lg"
                >
                  <span className="w-7 h-7 shrink-0 rounded-xl flex items-center justify-center bg-(--background) text-(--primary) text-[10px] font-black border border-(--border) group-hover:bg-(--primary) group-hover:text-white group-hover:border-(--primary) transition-all">
                    {idx + 1}
                  </span>
                  <span className="flex-1 text-sm font-bold text-(--foreground) leading-relaxed">{ing}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
