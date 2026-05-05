"use client";
import { Calendar } from "lucide-react";
import LuckyDetails from "./LuckyDetails";
import HoroscopeCategories from "./HoroscopeCategories";

export default function HoroscopeContent({ sign, horoscope, timeframeLabel }) {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Main Horoscope Card */}
      <div className="bg-(--card) text-(--card-foreground) rounded-2xl p-4 sm:p-8 shadow-xl border border-(--border) transition-colors">
        <div className="mb-4 flex items-center">
          <Calendar className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-(--foreground)" />

          <h3 className="text-lg font-bold sm:text-2xl text-(--foreground)">
            {timeframeLabel} Horoscope
          </h3>
        </div>

        <p className="mb-6 text-sm leading-relaxed sm:text-lg text-(--muted-foreground)">
          {horoscope.horoscope_data}
        </p>

        <LuckyDetails sign={sign} horoscope={horoscope} />
      </div>

      {/* Category Summary Section */}
      <HoroscopeCategories horoscope={horoscope} />
    </div>
  );
}
