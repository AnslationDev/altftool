"use client";
import React from "react";
import { Plus } from "lucide-react";

export default function HeroSection({ onCreateClick }) {
  return (
    <section
      id="home"
      className="max-w-6xl mx-auto px-4 py-12 md:py-20 text-center"
    >
      {/* Badge */}
      <div
        className="
          inline-flex items-center gap-2 
          px-4 py-1 rounded-full 
          bg-(--primary)/10 border border-(--primary) 
          mb-4
        "
      >
        <span className="text-xs font-semibold text-(--primary)">
          🚀 Free & Easy to Use
        </span>
      </div>

      {/* Title */}
      <h1
        className="
          heading
          mb-3 
          text-(--primary)
        "
      >
        Build Surveys in Minutes
      </h1>

      {/* Subtitle */}
      <p
        className="
          text-lg sm:text-xl text-(--muted-foreground) 
          max-w-2xl mx-auto leading-relaxed mb-8
        "
      >
        Create surveys, collect responses, and analyze results. Perfect for
        product teams, educators, and businesses.
      </p>

      {/* CTA Button */}
      <button
        onClick={onCreateClick}
        className="
          inline-flex items-center gap-2 
          bg-(--primary) text-(--primary-foreground)
          px-6 py-3 rounded-xl text-lg font-semibold
          shadow-md hover:shadow-lg transition 
          active:scale-95 cursor-pointer
        "
      >
        <Plus size={20} />
        Create New Survey
      </button>

      {/* Feature Chips */}
      <div
        className="
          flex flex-wrap justify-center gap-3 mt-8
        "
      >
        <span
          className="
            px-4 py-1.5 border border-(--border) rounded-full 
            text-sm text-(--foreground) bg-(--card)
          "
        >
          📝 5 Question Types
        </span>

        <span
          className="
            px-4 py-1.5 border border-(--border) rounded-full 
            text-sm text-(--foreground) bg-(--card)
          "
        >
          📊 Analytics
        </span>

        
      </div>
    </section>
  );
}
