"use client";

import React, { useMemo } from "react";
import { Brain, TrendingUp, TrendingDown } from "lucide-react";
import { MOODS } from "../constants/index";
import { analyzeSentiment, getWordFrequencies } from "../utils/textAnalyzer";

export default function MoodAnalysis({ capsules }) {
  const analysis = useMemo(() => {
    if (!capsules || capsules.length === 0) return null;
    const moodCount = {};
    let totalSentiment = 0;
    let sentimentCount = 0;
    const allContent = [];

    for (const c of capsules) {
      moodCount[c.mood] = (moodCount[c.mood] || 0) + 1;
      if (c.content) {
        const s = analyzeSentiment(c.content);
        totalSentiment += s.score;
        sentimentCount++;
        allContent.push(c.content);
      }
    }

    const avgSentiment = sentimentCount > 0 ? Math.round(totalSentiment / sentimentCount) : 0;
    const combinedText = allContent.join(" ");
    const topWords = getWordFrequencies(combinedText, 15);

    const moodDistribution = Object.entries(moodCount)
      .sort((a, b) => b[1] - a[1])
      .map(([moodId, count]) => {
        const mood = MOODS.find((m) => m.id === moodId) || { emoji: "\u{1F610}", label: moodId, color: "#6B7280" };
        return { ...mood, count, percentage: Math.round((count / capsules.length) * 100) };
      });

    return { avgSentiment, moodDistribution, topWords, totalCapsules: capsules.length };
  }, [capsules]);

  if (!analysis) return null;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="mb-3 flex items-center gap-2">
          <Brain size={16} className="text-[var(--primary)]" />
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Overall Mood Summary</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: analysis.avgSentiment > 0 ? "#16A34A" : analysis.avgSentiment < 0 ? "#EF4444" : "#6B7280" }}>
              {analysis.avgSentiment}
            </div>
            <div className="text-xs text-[var(--muted-foreground)]">Avg Sentiment</div>
          </div>
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span className="flex items-center gap-1"><TrendingDown size={12} /> Negative</span>
              <span className="flex items-center gap-1">Positive <TrendingUp size={12} /></span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-full bg-[var(--muted)]">
              <div className="absolute left-1/2 top-0 h-full w-0.5 bg-[var(--border)]" />
              <div className="absolute top-0 h-full rounded-full transition-all" style={{
                left: analysis.avgSentiment >= 0 ? "50%" : `${50 + analysis.avgSentiment / 2}%`,
                width: `${Math.abs(analysis.avgSentiment) / 2}%`,
                backgroundColor: analysis.avgSentiment > 0 ? "#16A34A" : "#EF4444",
              }} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
        <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">Mood Distribution</h3>
        <div className="space-y-2">
          {analysis.moodDistribution.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <span className="w-8 text-center text-lg">{m.emoji}</span>
              <span className="w-16 text-xs font-semibold text-[var(--foreground)]">{m.label}</span>
              <div className="flex-1 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                <div className="h-full rounded-full" style={{ width: `${m.percentage}%`, backgroundColor: m.color }} />
              </div>
              <span className="w-12 text-right text-xs font-semibold text-[var(--muted-foreground)]">{m.count}</span>
            </div>
          ))}
        </div>
      </div>

      {analysis.topWords.length > 0 && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">Most Used Words Across All Memories</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.topWords.map((w) => (
              <span key={w.word} className="inline-flex items-center gap-1 rounded-full bg-[var(--primary)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--primary)]" style={{ fontSize: `${Math.min(14, 10 + w.count * 0.5)}px` }}>
                {w.word} <span className="text-[var(--primary)]/60">({w.count})</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
