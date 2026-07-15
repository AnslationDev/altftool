"use client";

import { motion } from "framer-motion";
import { Trash2, Heart, Clock, Sparkles, BarChart3, Star } from "lucide-react";
import { formatTimestamp } from "../utils/helpers";

function Dashboard({ history, favorites }) {
  const avgScore =
    history.length > 0
      ? Math.round(history.reduce((a, r) => a + r.score, 0) / history.length)
      : 0;

  const allTags = history.flatMap((r) => r.styleTags || []);
  const tagCounts = {};
  allTags.forEach((t) => {
    tagCounts[t] = (tagCounts[t] || 0) + 1;
  });
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-card border border-border rounded-2xl p-4 text-center space-y-1">
        <BarChart3 className="mx-auto text-pink-400" size={20} />
        <p className="text-2xl font-black text-foreground">{history.length}</p>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Total Scans
        </p>
      </div>
      <div className="bg-card border border-border rounded-2xl p-4 text-center space-y-1">
        <Star className="mx-auto text-purple-400" size={20} />
        <p className="text-2xl font-black text-foreground">{avgScore}</p>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Avg Score
        </p>
      </div>
      <div className="bg-card border border-border rounded-2xl p-4 text-center space-y-1">
        <Heart className="mx-auto text-pink-400" size={20} />
        <p className="text-2xl font-black text-foreground">{favorites.length}</p>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Favorites
        </p>
      </div>
      <div className="bg-card border border-border rounded-2xl p-4 text-center space-y-1">
        <Sparkles className="mx-auto text-blue-400" size={20} />
        <p className="text-xs font-bold text-foreground leading-tight">
          {topTags.length > 0 ? topTags.join(", ") : "—"}
        </p>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Top Tags
        </p>
      </div>
    </div>
  );
}

export default function HistoryPanel({
  history = [],
  favorites = [],
  onSelect,
  onDelete,
  onToggleFavorite,
}) {
  if (!history.length) {
    return (
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-3">
          <div className="p-4 rounded-full bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 inline-flex">
            <Clock className="text-muted-foreground" size={32} />
          </div>
          <p className="font-semibold text-foreground">No history yet</p>
          <p className="text-sm text-muted-foreground">
            Upload a photo and analyze it to see your beauty score history!
          </p>
        </div>
      </div>
    );
  }

  const displayed = history.slice(0, 20);

  return (
    <div className="space-y-6">
      <Dashboard history={history} favorites={favorites} />

      <div className="grid gap-3">
        {displayed.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 group hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => onSelect?.(item)}
              className="flex-1 flex items-center gap-4 min-w-0 text-left"
            >
              {item.imageData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageData}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="text-pink-400" size={18} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-foreground">{item.score}</span>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 px-2 py-0.5 rounded-full">
                    {item.moodBadge}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {item.styleTags?.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] text-muted-foreground bg-muted/20 px-1.5 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {formatTimestamp(item.timestamp)}
                </p>
              </div>
            </button>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => onToggleFavorite?.(item.id)}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  favorites.includes(item.id)
                    ? "text-pink-500"
                    : "text-muted-foreground hover:text-pink-400 opacity-0 group-hover:opacity-100"
                }`}
                title={favorites.includes(item.id) ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart
                  size={15}
                  className={favorites.includes(item.id) ? "fill-pink-500" : ""}
                />
              </button>
              <button
                onClick={() => onDelete?.(item.id)}
                className="p-2 rounded-xl text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                title="Delete"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
