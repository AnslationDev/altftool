import React from "react";
import { Brain, Smile, Hash, Lock, Star, BarChart3, Download, Search } from "lucide-react";

const features = [
  { icon: <Brain size={20} />, title: "AI Sentiment Analysis", desc: "Automatic mood scoring for every memory" },
  { icon: <Smile size={20} />, title: "Mood Tracking", desc: "10 mood types with intensity levels" },
  { icon: <Hash size={20} />, title: "Word Insights", desc: "Top word frequency analysis" },
  { icon: <Lock size={20} />, title: "Time Capsules", desc: "Seal memories until a future date" },
  { icon: <Star size={20} />, title: "Favorites & Pins", desc: "Organize your most precious memories" },
  { icon: <BarChart3 size={20} />, title: "Topic Detection", desc: "Auto-detect topics from your text" },
  { icon: <Download size={20} />, title: "Export & Backup", desc: "JSON and CSV export options" },
  { icon: <Search size={20} />, title: "Search & Filter", desc: "Find memories by keyword or category" },
];

export default function Features() {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
      <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Features</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
            <div className="text-[var(--primary)]">{f.icon}</div>
            <div>
              <h3 className="text-xs font-semibold text-[var(--foreground)]">{f.title}</h3>
              <p className="mt-0.5 text-[10px] text-[var(--muted-foreground)]">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
