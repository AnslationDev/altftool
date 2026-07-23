"use client";

import { cartoonStyles } from "../constants/styles";
import {
  Paintbrush, Sparkles, BookOpen, PenTool, Pencil,
  Palette, Film, Box, Minus, Stars, Layers
} from "lucide-react";

const iconMap = {
  Paintbrush,
  Sparkles,
  BookOpen,
  PenTool,
  Pencil,
  Palette,
  Film,
  Box,
  Minus,
  Stars,
  Layers,
};

export default function StyleSelector({ selectedStyle, onSelect }) {
  return (
    <div className="bg-(--card) border border-(--border) rounded-xl p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <h3 className="text-lg font-semibold text-(--foreground) mb-4">Cartoon Style</h3>
      <div className="tool-card-grid">
        {cartoonStyles.map((style) => {
          const Icon = iconMap[style.icon] || Paintbrush;
          const isSelected = selectedStyle === style.id;

          return (
            <button
              key={style.id}
              onClick={() => onSelect(style.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                isSelected
                  ? "border-(--primary) bg-(--primary-soft, var(--muted))"
                  : "border-(--border) bg-(--background) hover:border-(--primary)"
              }`}
              aria-label={`Select ${style.name} style`}
              aria-pressed={isSelected}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? "bg-(--primary) text-white" : "bg-(--muted) text-(--primary)"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-(--foreground)">{style.name}</div>
                <div className="text-xs text-(--muted-foreground) truncate">{style.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
