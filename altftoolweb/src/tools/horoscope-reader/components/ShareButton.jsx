"use client";
import { Share2 } from "lucide-react";

export default function ShareButton({ color, onClick }) {
  return (
    <div className="text-center mt-10">
      <button
        onClick={onClick}
        className={`inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-linear-to-r ${color} text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer`}
      >
        <Share2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
        Share Your Horoscope
      </button>
    </div>
  );
}
