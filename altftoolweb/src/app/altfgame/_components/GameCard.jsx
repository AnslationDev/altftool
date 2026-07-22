"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import GameThumb from "./GameThumb";
import StarRating from "./StarRating";
import { formatPlays } from "@/app/altfgame/_data/games";

// Game card: thumbnail, title, rating, category tag, and a hover Play action.
export default function GameCard({ game, className = "" }) {
  return (
    <Link href={`/altfgame/${game.slug}`} className={`group block ${className}`}>
      <motion.article
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 350, damping: 22 }}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-200 group-hover:border-primary/60 group-hover:shadow-xl group-hover:shadow-primary/10"
      >
        <div className="relative aspect-square w-full">
          <GameThumb game={game} rounded="rounded-none" className="h-full w-full" />

          {game.isNew ? (
            <span className="absolute left-2 top-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
              New
            </span>
          ) : game.trending ? (
            <span className="absolute left-2 top-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
              🔥 Hot
            </span>
          ) : null}

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 transition duration-200 group-hover:opacity-100">
            <span className="flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1.5 text-xs font-semibold text-white shadow">
              <Play className="h-3 w-3 fill-white" strokeWidth={0} />
              Play
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <h3 className="truncate text-sm font-semibold text-foreground">{game.title}</h3>
          <div className="mt-auto flex items-center justify-between gap-2 text-xs text-foreground/60">
            <StarRating value={game.rating} className="shrink-0" />
            <span className="min-w-0 truncate rounded-full bg-muted px-2 py-0.5 font-medium text-foreground">
              {game.category}
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
