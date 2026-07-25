"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@altftool/ui";
import { RotateCcw, Volume2, VolumeX, Dice6 } from "lucide-react";
import Dice from "./Dice";
import { PLAYERS } from "../engine/constants";

const PLAYER_COLORS = PLAYERS.map((p) => p.color);
const PLAYER_NAMES = PLAYERS.map((p) => p.name);

export default function ControlPanel({
  value,
  rolling,
  onRoll,
  disabled,
  diceTheme,
  status,
  statusTone = "muted",
  turnCount,
  mode,
  difficulty,
  onNewGame,
  soundEnabled,
  onToggleSound,
  game,
}) {
  const toneClass = {
    muted: "text-(--muted-foreground)",
    primary: "text-(--primary) font-bold",
    accent: "text-(--secondary) font-semibold",
  }[statusTone];

  const currentPlayer = game?.players?.[game?.currentPlayer ?? 0];
  const currentPlayerColor = currentPlayer?.color || PLAYER_COLORS[game?.currentPlayer ?? 0] || PLAYER_COLORS[0];
  const currentPlayerName = currentPlayer?.name || PLAYER_NAMES[game?.currentPlayer ?? 0] || "Player";

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 p-2">
      {/* Turn Indicator */}
      <div className="w-full sm:w-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-(--card) border border-(--border)"
          style={{ borderLeft: `4px solid ${currentPlayerColor}` }}
        >
          <motion.div
            animate={{ scale: game?.phase === "roll" ? [1, 1.15, 1] : 1 }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ color: currentPlayerColor }}
          >
            <Dice6 size="18" />
          </motion.div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-(--muted-foreground) tracking-wide uppercase">
              Current Turn
            </p>
            <motion.p
              key={currentPlayerName}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-sm truncate"
              style={{ color: currentPlayerColor }}
            >
              🎲 {currentPlayerName}
            </motion.p>
          </div>
          {game?.diceRolled && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2 py-0.5 rounded-full text-xs font-bold bg-(--muted)"
              style={{ color: currentPlayerColor }}
            >
              Rolled: {game.diceValue}
            </motion.span>
          )}
        </motion.div>
      </div>

      {/* Dice */}
      <div className="relative flex-shrink-0">
        <Dice
          value={value}
          rolling={rolling}
          onRoll={onRoll}
          disabled={disabled}
          theme={diceTheme}
        />
        {!disabled && !rolling && (
          <motion.div
            className="pointer-events-none absolute -inset-2 rounded-3xl motion-reduce:hidden"
            animate={{ boxShadow: ["0 0 0px var(--primary)", "0 0 24px var(--primary)", "0 0 0px var(--primary)"] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
        )}
      </div>

      {/* Status Message */}
      <div className="flex-1 text-center sm:text-left min-w-0">
        <AnimatePresence mode="wait">
          <motion.p
            key={status}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className={`text-sm sm:text-base ${toneClass}`}
          >
            {status}
          </motion.p>
        </AnimatePresence>
        <p className="text-xs text-(--muted-foreground) mt-1">
          Turn {turnCount} · {mode === "ai" ? `${difficulty} AI` : "Local Multiplayer"}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onToggleSound}
          aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
          aria-pressed={soundEnabled}
          className="p-2.5 min-w-11 min-h-11 inline-flex items-center justify-center rounded-xl bg-(--card) border border-(--border) text-(--muted-foreground) hover:text-(--foreground) hover:border-(--border-strong) transition active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
          title={soundEnabled ? "Mute sounds" : "Enable sounds"}
        >
          {soundEnabled ? <Volume2 size="18" /> : <VolumeX size="18" />}
        </button>
        <Button variant="secondary" onClick={onNewGame}>
          <RotateCcw size="15" /> New Game
        </Button>
      </div>
    </div>
  );
}