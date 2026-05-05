"use client";
import { zodiacSigns } from "../constants/data";

export default function ZodiacGrid({ onSelect }) {
  return (
    <div className="animate-slide-up">
      <h2 className="text-center text-xl font-semibold sm:text-2xl text-(--foreground) mb-6">
        Select Your Zodiac Sign
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {zodiacSigns.map((sign, idx) => (
          <button
            key={sign.name}
            onClick={() => onSelect(sign)}
            className={`${sign.bgColor} p-4 sm:p-6 rounded-2xl shadow-lg transition-all transform hover:scale-105 hover:shadow-2xl border-2 border-transparent cursor-pointer hover:border-(--primary)`}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="mb-2 text-4xl sm:text-5xl">{sign.icon}</div>

            <div
              className={`bg-clip-text text-transparent mb-1 text-2xl sm:text-3xl font-bold ${sign.color}`}
            >
              {sign.symbol}
            </div>

            <div className="text-sm sm:text-base font-semibold text-(--muted-foreground)">
              {sign.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
