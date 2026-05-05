"use client";
import { Mic, MicOff } from "lucide-react";

export default function ControlPanel({
  isListening,
  startListening,
  stopListening,
  permission,
}) {
  return (
    <div className="rounded-3xl p-8 border border-(--border) bg-(--card) shadow-md transition-colors">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${
          isListening ? "bg-red-600 " : "bg-(--primary)"
        }`}
      >
        <div className="flex items-center justify-center gap-3 cursor-pointer">
          {isListening ? (
            <>
              <MicOff className="w-5 h-5" />
              <span>Stop Measuring</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>Start Measuring</span>
            </>
          )}
        </div>
      </button>

      {permission === false && (
        <div className="mt-4 p-4 rounded-xl border border-red-500/30 bg-red-500/20">
          <p className="text-sm text-center text-red-600 dark:text-red-300">
            Microphone access denied. Please allow microphone permissions.
          </p>
        </div>
      )}
    </div>
  );
}
