"use client";

import React from "react";
import { Label, Select } from "@altftool/ui";
import { BACKGROUND_THEMES, FONTS } from "../utils/quotesDb";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";

export default function CustomizationPanel({
  themeId,
  setThemeId,
  fontId,
  setFontId,
  fontSize,
  setFontSize,
  textAlign,
  setTextAlign
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-card border border-border p-5 rounded-xl shadow-sm mt-6">
      
      {/* Background Theme */}
      <div className="flex flex-col gap-2">
        <Label>Background</Label>
        <Select value={themeId} onChange={(e) => setThemeId(e.target.value)}>
          {BACKGROUND_THEMES.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </Select>
      </div>

      {/* Font Family */}
      <div className="flex flex-col gap-2">
        <Label>Font Family</Label>
        <Select value={fontId} onChange={(e) => setFontId(e.target.value)}>
          {FONTS.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </Select>
      </div>

      {/* Font Size */}
      <div className="flex flex-col gap-2">
        <Label>Font Size</Label>
        <Select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
          <option value="text-xl">Small</option>
          <option value="text-2xl">Medium</option>
          <option value="text-3xl">Large</option>
          <option value="text-4xl">Extra Large</option>
        </Select>
      </div>

      {/* Text Alignment */}
      <div className="flex flex-col gap-2">
        <Label>Alignment</Label>
        <div className="flex bg-muted rounded-md border border-border p-1 overflow-hidden h-10 w-full max-w-[180px]">
          <button 
            className={`flex-1 flex justify-center items-center rounded-sm transition-colors ${textAlign === "text-left" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setTextAlign("text-left")}
            aria-label="Align Left"
          >
            <AlignLeft size={16} />
          </button>
          <button 
            className={`flex-1 flex justify-center items-center rounded-sm transition-colors ${textAlign === "text-center" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setTextAlign("text-center")}
            aria-label="Align Center"
          >
            <AlignCenter size={16} />
          </button>
          <button 
            className={`flex-1 flex justify-center items-center rounded-sm transition-colors ${textAlign === "text-right" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setTextAlign("text-right")}
            aria-label="Align Right"
          >
            <AlignRight size={16} />
          </button>
        </div>
      </div>

    </div>
  );
}
