"use client";
import { Mic, MicOff } from "lucide-react";

export default function ControlButton({ isListening, onStart, onStop }) {
  return (
    <button
      onClick={isListening ? onStop : onStart}
      className={`w-full py-4 rounded-xl font-semibold text-(--primary-foreground) transition-all duration-300 transform hover:scale-105 shadow-lg ${
        isListening
          ? "bg-red-500 hover:bg-red-600"
          : "bg-purple-500 hover:bg-purple-600"
      }`}
    >
      <div className="flex items-center justify-center gap-3">
        {isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
        {isListening ? "Stop Measuring" : "Start Measuring"}
      </div>
    </button>
  );
}
