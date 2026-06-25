"use client";

import React from "react";
import "../style/SurveySection.css";

export default function SurveySection({ onOpenSupport }) {
  return (
    <section className="windowswap-survey w-full bg-windowswap-terracotta py-16 px-6 flex flex-col items-center text-center">

      {/* Hand-drawn inline SVG illustration */}
      <div className="windowswap-survey-illustration mb-6">
        <svg className="w-24 h-24 text-windowswap-cream" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Coffee Cup */}
          <path d="M22 62H42C44.5 62 46.5 60 46.5 57.5V45H17.5V57.5C17.5 60 19.5 62 22 62Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M46.5 49H51.5C53.5 49 55.5 51 55.5 53C55.5 55 53.5 57 51.5 57H46.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M24 45V41C24 40 25 39 26 39C27 39 28 40 28 41V45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M35 45V41C35 40 36 39 37 39C38 39 39 40 39 41V45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {/* Feedback Tablet */}
          <path d="M44 32H78V82H44V32Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M50 42H72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M50 52H72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M50 62H64" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          {/* Bubbling Heart Spark */}
          <path d="M84 45C86 43 89 43 91 45C93 47 93 50 91 52L84 59L77 52C75 50 75 47 77 45C79 43 82 43 84 45Z" fill="currentColor" className="text-windowswap-teal opacity-80" />
        </svg>
      </div>

      <h2 className="windowswap-survey-title font-serif text-xl md:text-2xl font-light tracking-wide text-white max-w-md mb-6 leading-snug">
        Help us make WindowSwap better
      </h2>

      <button
        onClick={onOpenSupport}
        className="windowswap-survey-cta bg-windowswap-teal hover:bg-[#0c282e] text-white px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-md font-semibold tracking-wide text-xs cursor-pointer"
      >
        take our survey
      </button>

    </section>
  );
}
