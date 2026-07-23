"use client";

import React from "react";
import { X, Calendar, Tag, Lock, Brain, BarChart3, Hash } from "lucide-react";
import { MOODS } from "../constants/index";
import { analyzeSentiment, detectTopics, getWordFrequencies } from "../utils/textAnalyzer";

function formatDate(iso) {
  if (!iso) return "Unknown";
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function CapsuleDetail({ capsule, onClose }) {
  if (!capsule) return null;
  const mood = MOODS.find((m) => m.id === capsule.mood) || MOODS[8];
  const isLocked = capsule.isSealed && capsule.unlockDate && new Date(capsule.unlockDate) > new Date();
  const sentiment = !isLocked ? analyzeSentiment(capsule.content) : null;
  const topics = !isLocked ? detectTopics(capsule.content) : [];
  const words = !isLocked ? getWordFrequencies(capsule.content, 10) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: mood.color + "20" }}>
              {mood.emoji}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                {isLocked ? "Locked Capsule" : capsule.title || "Untitled Memory"}
              </h2>
              <p className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                <Calendar size={12} /> {formatDate(capsule.dateCreated)}
                {capsule.isSealed && <><span className="mx-1">&middot;</span><Lock size={12} className="text-amber-500" /> Sealed until {formatDate(capsule.unlockDate)}</>}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
            <p className="text-sm leading-7 text-[var(--foreground)] whitespace-pre-wrap">
              {isLocked ? "This memory capsule is sealed and cannot be viewed until the unlock date." : capsule.content}
            </p>
          </div>

          {capsule.tags && capsule.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {capsule.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground)]">
                  <Tag size={10} /> {tag}
                </span>
              ))}
            </div>
          )}

          {!isLocked && sentiment && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Brain size={16} className="text-[var(--primary)]" />
                <h3 className="text-sm font-semibold text-[var(--foreground)]">AI Sentiment Analysis</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: sentiment.score > 0 ? "#16A34A" : sentiment.score < 0 ? "#EF4444" : "#6B7280" }}>
                    {sentiment.score}
                  </div>
                  <div className="text-[10px] text-[var(--muted-foreground)]">Score</div>
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-[var(--muted-foreground)]">{sentiment.label}</span>
                    <span className="text-[var(--muted-foreground)]">{sentiment.positive}+ / {sentiment.negative}-</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.abs(sentiment.score)}%`, backgroundColor: sentiment.score > 0 ? "#16A34A" : sentiment.score < 0 ? "#EF4444" : "#6B7280" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isLocked && topics.length > 0 && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="mb-3 flex items-center gap-2">
                <BarChart3 size={16} className="text-[var(--primary)]" />
                <h3 className="text-sm font-semibold text-[var(--foreground)]">Detected Topics</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <span key={topic.name} className="inline-flex items-center gap-1 rounded-full bg-[var(--primary)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--primary)]">
                    {topic.name} <span className="rounded-full bg-[var(--primary)]/20 px-1.5 text-[10px]">{topic.score}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {!isLocked && words.length > 0 && (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Hash size={16} className="text-[var(--primary)]" />
                <h3 className="text-sm font-semibold text-[var(--foreground)]">Top Words</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {words.map((w) => (
                  <span key={w.word} className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground)]" style={{ fontSize: `${Math.min(14, 10 + w.count)}px` }}>
                    {w.word} <span className="text-[var(--muted-foreground)]">({w.count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-center">
              <div className="text-lg font-bold text-[var(--foreground)]">{capsule.wordCount || 0}</div>
              <div className="text-xs text-[var(--muted-foreground)]">Words</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-center">
              <div className="text-lg font-bold text-[var(--foreground)]">{capsule.category}</div>
              <div className="text-xs text-[var(--muted-foreground)]">Category</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
