"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Maximize2, Minimize2, Share2, Check, Keyboard, Info } from "lucide-react";
import StarRating from "./StarRating";
import GameThumb from "./GameThumb";
import { useAutoFitGame } from "@/app/altfgame/_lib/useAutoFitGame";

// Native game host. Any engine wrapped in a React component can render here —
// plain canvas/DOM games today; a Phaser or Unity WebGL wrapper would mount the
// same way (see README: "Adding a new game"). No iframes, ever.
export default function GamePlayer({ game, children }) {
  const cardRef = useRef(null);
  const [isFullscreen, setFullscreen] = useState(false);
  const [shared, setShared] = useState(false);
  // Auto-fit: scales the game down (CSS zoom) only if its native layout is
  // bigger than the available area, and boosts frame height for height-bound
  // games (carrom, minesweeper) — see src/lib/useAutoFitGame.js for details.
  const { hostRef, fitRef, zoom, boostPx } = useAutoFitGame();

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const handleFullscreen = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      const p = document.exitFullscreen?.();
      if (p?.catch) p.catch(() => {});
    } else {
      const p = el.requestFullscreen?.();
      if (p?.catch) p.catch(() => {});
    }
  }, []);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${game.title} - AltF Games`, text: game.description, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 1800);
      }
    } catch {
      /* user dismissed the share sheet */
    }
  }, [game]);

  return (
    <div>
      {/* Title + toolbar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <GameThumb game={game} className="hidden h-12 w-12 shrink-0 sm:flex" rounded="rounded-xl" />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight sm:text-3xl">{game.title}</h1>
            <div className="mt-1 flex items-center gap-3 text-sm text-foreground/60">
              <StarRating value={game.rating} />
              <span className="rounded-full bg-card px-2.5 py-0.5">{game.category}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ToolButton onClick={handleShare} label={shared ? "Copied!" : "Share"}>
            {shared ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
          </ToolButton>
          <ToolButton onClick={handleFullscreen} label={isFullscreen ? "Exit" : "Fullscreen"}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </ToolButton>
        </div>
      </div>

      {/* Game card */}
      <div
        ref={cardRef}
        className="game-card relative flex w-full items-start justify-center overflow-auto rounded-2xl border border-border bg-card p-2 sm:p-4"
      >
        {/* game-host has a definite height — set INLINE so it can never be lost
            to a stale stylesheet. Games using h-full / absolute inset-0 always
            get real dimensions, and flex-stretch fills even height:auto games. */}
        <div
          ref={hostRef}
          className="game-host relative flex w-full min-w-0 justify-center"
          style={
            isFullscreen
              ? { height: "100%", minHeight: "100%", maxWidth: "none" }
              : {
                  height: boostPx ? `${boostPx}px` : "min(72vh, 700px)",
                  minHeight: "min(480px, 85vh)",
                  maxWidth: "64rem",
                }
          }
        >
          <div
            ref={fitRef}
            className="flex h-full w-full min-w-0 justify-center"
            style={zoom !== 1 ? { zoom } : undefined}
          >
            {children}
          </div>
        </div>
      </div>

      {/* About + controls */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground/60">
            <Info className="h-4 w-4 text-primary" /> About this game
          </h2>
          <p className="mt-2 text-foreground/90">{game.description}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground/60">
            <Keyboard className="h-4 w-4 text-primary" /> How to play
          </h2>
          <p className="mt-2 text-foreground/90">{game.controls}</p>
        </div>
      </div>
    </div>
  );
}

function ToolButton({ onClick, active, label, children }) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      type="button"
      onClick={onClick}
      title={label}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-secondary/60 bg-secondary/10 text-foreground"
          : "border-border bg-card text-foreground/60 hover:text-foreground"
      }`}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  );
}
