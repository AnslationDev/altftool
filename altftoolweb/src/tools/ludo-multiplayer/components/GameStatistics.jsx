import { motion } from "framer-motion";
import { Button } from "@altftool/ui";
import {
  Trophy, RotateCcw, Clock, Zap, TrendingUp, BarChart3, Target, Activity,
} from "lucide-react";

export default function GameStatistics({ stats, open, onReset }) {
  if (!open) return null;

  const items = [
    { label: "Games Played", value: stats.gamesPlayed, icon: BarChart3, color: "text-blue-500" },
    { label: "Wins", value: stats.wins, icon: Trophy, color: "text-green-500" },
    { label: "Losses", value: stats.losses, icon: Activity, color: "text-red-500" },
    { label: "Win %", value: stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) + "%" : "—", icon: TrendingUp, color: "text-amber-500" },
    { label: "Total Turns", value: stats.totalTurns, icon: RotateCcw, color: "text-violet-500" },
    { label: "Fastest Win", value: stats.fastestWin < Infinity ? `${stats.fastestWin} turns` : "—", icon: Zap, color: "text-cyan-500" },
    { label: "Longest Game", value: stats.longestGame > 0 ? formatDuration(stats.longestGame) : "—", icon: Clock, color: "text-orange-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-3"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3 rounded-xl bg-(--muted) border border-(--border)"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <item.icon size="14" className={item.color} />
            </div>
            <p className="text-lg font-bold text-(--foreground)">{item.value}</p>
            <p className="text-[10px] text-(--muted-foreground)">{item.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="p-3 rounded-xl bg-(--muted) border border-(--border)">
        <h4 className="text-xs font-semibold text-(--foreground) mb-2">AI Difficulty Stats</h4>
        <div className="grid grid-cols-3 gap-2">
          {["easy", "medium", "hard"].map((diff) => {
            const d = stats.aiDifficultyStats?.[diff];
            if (!d) return null;
            const total = d.wins + d.losses;
            return (
              <div key={diff} className="text-center">
                <p className="text-[10px] font-semibold uppercase text-(--muted-foreground) mb-1">{diff}</p>
                <p className="text-xs text-(--foreground)">{total} games</p>
                <p className="text-[10px] text-green-500">{d.wins}W</p>
                <p className="text-[10px] text-red-500">{d.losses}L</p>
              </div>
            );
          })}
        </div>
      </div>

      <Button variant="ghost" size="sm" onClick={onReset} className="w-full text-xs">
        Reset Statistics
      </Button>
    </motion.div>
  );
}

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}
