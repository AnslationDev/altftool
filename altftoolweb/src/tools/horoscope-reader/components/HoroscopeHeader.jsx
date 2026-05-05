"use client";
import { Sparkles } from "lucide-react";

export default function HoroscopeHeader() {
  return (
    <div className="text-center mb-8 sm:mb-12 animate-fade-in">
      <div className="flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-(--primary) mr-2" />
        <h1 className="text-3xl sm:text-5xl font-bold bg-linear-to-r from-(--primary) to-(--primary) bg-clip-text text-transparent">
          Horoscope Reader
        </h1>
        <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-(--primary) ml-2" />
      </div>
      <p className="text-(--foreground)  text-sm sm:text-lg">
        Discover what the stars have in store for you
      </p>
    </div>
  );
}
