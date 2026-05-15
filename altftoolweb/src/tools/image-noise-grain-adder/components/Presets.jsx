"use client";

import React from "react";
import { motion } from "framer-motion";
import { PRESETS } from "../utils/filters";
import { Check } from "lucide-react";

export default function Presets({ activePreset, onSelect }) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2 scroll-smooth">
        {PRESETS.map((preset) => (
          <motion.button
            key={preset.id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(preset)}
            className={`flex-shrink-0 w-32 group relative`}
          >
            <div className={`
              w-full aspect-square rounded-2xl mb-2 overflow-hidden border-2 transition-all duration-500
              ${activePreset === preset.id ? 'border-blue-500 scale-[0.98]' : 'border-(--border) group-hover:border-blue-500/40 group-hover:scale-[1.02]'}
            `}>
              {/* Thumbnail Effect Preview */}
              <div className={`
                w-full h-full flex flex-col items-center justify-center p-3 text-center transition-all duration-500
                ${preset.id === 'none' ? 'bg-(--background)' : 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-md'}
              `}>
                <div className={`
                  text-[10px] font-black uppercase tracking-[0.2em] leading-tight mb-1
                  ${activePreset === preset.id ? 'text-blue-500' : 'text-(--muted-foreground) group-hover:text-blue-400'}
                `}>
                  {preset.name.split(' ')[0]}
                </div>
                <div className="text-[8px] font-bold text-(--muted-foreground)/40 uppercase tracking-widest">
                  {preset.name.split(' ')[1] || 'Filter'}
                </div>
                
                {activePreset === preset.id && (
                  <div className="absolute inset-0 bg-blue-500/5 flex items-center justify-center pointer-events-none">
                    <div className="bg-blue-500 text-white p-1.5 rounded-full shadow-lg">
                      <Check size={14} strokeWidth={4} />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <span className={`
              text-[10px] font-black uppercase tracking-widest transition-colors
              ${activePreset === preset.id ? 'text-blue-500' : 'text-(--muted-foreground)/60 group-hover:text-(--foreground)'}
            `}>
              {preset.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
