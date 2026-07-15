"use client";

import { Sparkles, RefreshCw } from "lucide-react";
import DestinationCard from "./DestinationCard";

export default function ResultsGrid({
  results,
  saved,
  onSave,
  onReset,
  onRegenerate,
}) {
  if (!results || results.length === 0) return null;

  const topResult = results[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-(--primary)/10 text-(--primary) text-sm font-medium mb-2">
          <Sparkles className="w-4 h-4" />
          Your Perfect Match
        </div>
        <p className="text-sm text-(--muted-foreground)">
          Based on your preferences, here's your dream vacation destination
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <DestinationCard
          destination={topResult}
          rank={0}
          onSave={onSave}
          isSaved={saved.includes(topResult.name)}
        />
      </div>

      {results.length > 1 && (
        <div className="pt-4">
          <p className="text-sm font-semibold text-(--muted-foreground) mb-3 text-center">
            More Destinations You'll Love
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.slice(1, 7).map((dest, i) => (
              <DestinationCard
                key={dest.name}
                destination={dest}
                rank={i + 1}
                onSave={onSave}
                isSaved={saved.includes(dest.name)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center gap-3 pt-2">
        <button
          onClick={onReset}
          className="px-5 py-2.5 rounded-xl border border-(--border) text-sm font-medium hover:bg-(--page) transition"
        >
          Try Different Preferences
        </button>
        <button
          onClick={onRegenerate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-(--primary) text-white font-semibold text-sm hover:opacity-90 transition shadow-md"
        >
          <RefreshCw className="w-4 h-4" />
          Shuffle Results
        </button>
      </div>
    </div>
  );
}
