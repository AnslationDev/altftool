"use client";

import React, { forwardRef } from "react";
import { Card } from "@altftool/ui";
import { Quote } from "lucide-react";
import { BACKGROUND_THEMES, FONTS } from "../utils/quotesDb";

const QuoteDisplay = forwardRef(({ quote, themeId, fontId, fontSize = "text-2xl", textAlign = "text-center" }, ref) => {
  const selectedTheme = BACKGROUND_THEMES.find(t => t.id === themeId) || BACKGROUND_THEMES[0];
  const selectedFont = FONTS.find(f => f.id === fontId) || FONTS[0];

  return (
    <Card 
      ref={ref}
      className="relative overflow-hidden w-full max-w-3xl mx-auto rounded-2xl shadow-xl transition-all duration-300"
      style={{
        ...selectedTheme.style,
        fontFamily: selectedFont.value,
        padding: "3rem 2rem",
      }}
    >
      <div className="absolute top-4 left-4 opacity-10">
        <Quote size={80} />
      </div>
      
      <div className={`relative z-10 flex flex-col items-center justify-center min-h-[250px] ${textAlign}`}>
        <p className={`${fontSize} font-medium leading-relaxed mb-8 px-4 sm:px-8`}>
          "{quote.text}"
        </p>
        
        <div className="mt-auto pt-4 border-t border-white/20 w-3/4 mx-auto flex flex-col items-center">
          <span className="text-lg font-semibold tracking-wide">
            — {quote.author}
          </span>
          <span className="text-sm opacity-80 mt-1 uppercase tracking-wider font-sans">
            {quote.category}
          </span>
        </div>
      </div>
    </Card>
  );
});

QuoteDisplay.displayName = "QuoteDisplay";

export default QuoteDisplay;
