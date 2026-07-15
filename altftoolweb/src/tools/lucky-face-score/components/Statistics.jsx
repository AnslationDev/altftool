"use client";

import { motion } from "framer-motion";
import { BarChart3, Trophy, TrendingUp, Award, Sparkles } from "lucide-react";
import { getScoreColor, getScoreBarColor } from "../utils/helpers";

export default function Statistics({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-3">
        <div className="inline-flex p-3 rounded-full bg-muted/50">
          <BarChart3 size={24} className="text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground">
          No statistics yet
        </p>
        <p className="text-xs text-muted-foreground">
          Complete readings to see your statistics dashboard.
        </p>
      </div>
    );
  }

  const totalReadings = history.length;
  const averageScore = Math.round(
    history.reduce((a, b) => a + b.score, 0) / totalReadings
  );
  const highestScore = Math.max(...history.map((h) => h.score));
  const lowestScore = Math.min(...history.map((h) => h.score));

  const earnedBadges = [
    ...new Set(history.map((h) => h.badge?.label).filter(Boolean)),
  ];

  const distribution = [0, 0, 0, 0, 0];
  const labels = ["0-20", "21-40", "41-60", "61-80", "81-100"];
  history.forEach((h) => {
    if (h.score <= 20) distribution[0]++;
    else if (h.score <= 40) distribution[1]++;
    else if (h.score <= 60) distribution[2]++;
    else if (h.score <= 80) distribution[3]++;
    else distribution[4]++;
  });

  const maxDistCount = Math.max(...distribution, 1);

  const badgeEmojis = {
    "Needs a Four-Leaf Clover": "🍀",
    "Beginner's Luck": "✨",
    "Lucky Star": "⭐",
    "Fortune's Favorite": "💫",
    "Grand Luck Master": "👑",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-2">
        <BarChart3 size={18} className="text-primary" />
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Statistics Dashboard
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center space-y-1">
          <Trophy size={20} className="mx-auto text-amber-500" />
          <span className="block text-2xl font-black text-foreground">{totalReadings}</span>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Readings
          </span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center space-y-1">
          <TrendingUp size={20} className="mx-auto text-primary" />
          <span className={`block text-2xl font-black ${getScoreColor(averageScore)}`}>
            {averageScore}
          </span>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Average
          </span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center space-y-1">
          <Award size={20} className="mx-auto text-amber-500" />
          <span className="block text-2xl font-black text-amber-500">{highestScore}</span>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Highest
          </span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center space-y-1">
          <Sparkles size={20} className="mx-auto text-purple-500" />
          <span className="block text-2xl font-black text-foreground">{earnedBadges.length}</span>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Badges
          </span>
        </div>
      </div>

      {earnedBadges.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider">
            Earned Badges
          </h4>
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-600"
              >
                {badgeEmojis[badge] || "⭐"} {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider">
          Score Distribution
        </h4>
        <div className="space-y-2">
          {distribution.map((count, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-[10px] font-medium">
                <span className="text-foreground">{labels[i]}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-muted/30 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${getScoreBarColor(i * 25 + 10)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / maxDistCount) * 100}%` }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
