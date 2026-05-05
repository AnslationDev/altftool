"use client";
import { timeframes } from "../constants/data";

export default function TimeframeButtons({
  selectedSign,
  timeframe,
  onSelect,
}) {
  return (
    <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 justify-center">
      {timeframes.map((tf) => (
        <button
          key={tf.value}
          onClick={() => onSelect(tf.value)}
          className={`flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition cursor-pointer transform hover:scale-105 ${
            timeframe === tf.value
              ? `bg-linear-to-r ${selectedSign.color} text-white shadow-lg`
              : "bg-white text-gray-700 shadow hover:shadow-md"
          }`}
        >
          <span className="mr-2 text-lg sm:text-xl">{tf.icon}</span>
          <span className="text-sm sm:text-base">{tf.label}</span>
        </button>
      ))}
    </div>
  );
}
