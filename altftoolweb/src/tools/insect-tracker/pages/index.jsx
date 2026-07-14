"use client";

import { useEffect, useRef, useState } from "react";
import { Toaster } from "sonner";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { BarChart3, ChevronDown, Gamepad2 } from "lucide-react";
import useHydrated from "@/hooks/useHydrated";
import { useInsectGame } from "../utils/useInsectGame";
import { INSECT_TYPES, DIFFICULTIES } from "../utils/insects";
import StartScreen from "../components/StartScreen";
import Hud from "../components/Hud";
import PlayArea from "../components/PlayArea";
import Overlay from "../components/Overlay";
import Description from "../components/Description";
import { cn } from "../utils/cn";

const STATS_KEY = "it_stats";
const DEFAULT_STATS = {
  gamesPlayed: 0,
  gamesWon: 0,
  bestScore: 0,
  highestCombo: 0,
  diffCounts: {},
  insectCounts: {},
};

// Deterministic decorative particles (no Math.random at render).
const POLLEN = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${(i * 67) % 100}%`,
  top: `${(i * 41) % 100}%`,
  size: 3 + (i % 3) * 2,
  dur: 9 + (i % 5) * 2,
  delay: (i % 6) * 0.7,
  gold: i % 3 === 0,
}));

const BG_LEAVES = Array.from({ length: 7 }, (_, i) => ({
  id: i,
  left: `${(i * 137) % 96}%`,
  dur: 18 + (i % 4) * 4,
  delay: (i % 5) * 2,
  size: 12 + (i % 3) * 5,
}));

function topKey(counts) {
  let best = null;
  let n = -1;
  for (const [k, v] of Object.entries(counts || {})) {
    if (v > n) {
      n = v;
      best = k;
    }
  }
  return best;
}

function NatureBackground() {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#fde68a]/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-full bg-gradient-to-t from-[var(--primary)]/10 to-transparent" />
      </div>
    );
  }
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* sun-ray glow */}
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#fde68a]/20 blur-3xl" />
      <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-[var(--secondary)]/10 blur-3xl" />
      {/* drifting pollen / fireflies */}
      {POLLEN.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.gold ? "#facc15" : "var(--primary)",
            boxShadow: p.gold ? "0 0 8px #facc15" : "0 0 8px var(--primary)",
            opacity: 0.4,
          }}
          animate={{ y: [0, -22, 0], x: [0, 12, 0], opacity: [0.15, 0.55, 0.15] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {/* floating leaves */}
      {BG_LEAVES.map((l) => (
        <motion.span
          key={l.id}
          className="absolute -top-8 rounded-[60%_10%_60%_10%] bg-[var(--primary)]/25"
          style={{ left: l.left, width: l.size, height: l.size }}
          animate={{ y: ["-5%", "110vh"], rotate: [0, 360], x: [0, 30, -20, 0] }}
          transition={{ duration: l.dur, delay: l.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
      {/* grass at the very bottom */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--primary)]/12 to-transparent" />
    </div>
  );
}

function Mascot() {
  const reduce = useReducedMotion();
  const Butterfly = INSECT_TYPES.butterfly.Component;

  // Static emblem when the user prefers reduced motion.
  if (reduce) {
    return (
      <div
        className="mb-4 inline-block"
        style={{ filter: "drop-shadow(0 10px 18px rgba(168,85,247,0.35))" }}
      >
        <Butterfly size={72} />
      </div>
    );
  }

  // One butterfly gently flying in a looping arc over the hero.
  return (
    <motion.div
      className="mb-4 inline-block"
      style={{ filter: "drop-shadow(0 10px 18px rgba(168,85,247,0.35))" }}
      animate={{
        x: [0, 36, 8, 32, -10, 0],
        y: [0, -24, -8, -28, -4, 0],
        rotate: [-8, 8, -6, 10, -4, -8],
      }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    >
      <Butterfly size={72} />
    </motion.div>
  );
}

export default function ToolHome() {
  const game = useInsectGame();
  const hydrated = useHydrated();
  const highScore = hydrated ? game.highScore : 0;

  const [stats, setStats] = useState(DEFAULT_STATS);
  const [statsOpen, setStatsOpen] = useState(false);
  const prevStatus = useRef(game.status);
  const maxCombo = useRef(0);

  // Load persisted stats once hydrated.
  useEffect(() => {
    if (!hydrated) return;
    const load = () => {
      try {
        const raw = window.localStorage.getItem(STATS_KEY);
        if (raw) setStats({ ...DEFAULT_STATS, ...JSON.parse(raw) });
      } catch {
        setStats(DEFAULT_STATS);
      }
    };
    load();
  }, [hydrated]);

  // Track the highest combo seen during a run (ref mutation — not state).
  useEffect(() => {
    if (game.combo > maxCombo.current) maxCombo.current = game.combo;
  }, [game.combo]);

  // Record a finished game (won/lost) into localStorage stats — UI only.
  useEffect(() => {
    if (!hydrated) return;
    const prev = prevStatus.current;
    const record = () => {
      if ((game.status === "won" || game.status === "lost") && prev !== game.status && prev !== "start") {
        setStats((s) => {
          const next = {
            gamesPlayed: s.gamesPlayed + 1,
            gamesWon: s.gamesWon + (game.status === "won" ? 1 : 0),
            bestScore: Math.max(s.bestScore, game.score),
            highestCombo: Math.max(s.highestCombo, maxCombo.current),
            diffCounts: { ...s.diffCounts, [game.difficulty]: (s.diffCounts?.[game.difficulty] || 0) + 1 },
            insectCounts: game.chosenInsect
              ? { ...s.insectCounts, [game.chosenInsect]: (s.insectCounts?.[game.chosenInsect] || 0) + 1 }
              : { ...s.insectCounts },
          };
          try {
            window.localStorage.setItem(STATS_KEY, JSON.stringify(next));
          } catch {
            /* ignore */
          }
          return next;
        });
      }
      if (game.status === "playing" && prev !== "playing") {
        maxCombo.current = 0;
      }
      prevStatus.current = game.status;
    };
    record();
  }, [game.status, game.score, game.difficulty, game.chosenInsect, hydrated]);

  const favDiff = topKey(stats.diffCounts);
  const favInsect = topKey(stats.insectCounts);

  return (
    <div className="relative min-h-screen bg-[var(--background)] p-4 text-[var(--foreground)] md:p-8">
      <NatureBackground />
      <Toaster position="top-center" richColors />

      {/* Hero */}
      <div className="mb-8 pt-6 text-center">
        <Mascot />
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-1.5 text-xs font-semibold text-[var(--primary)] backdrop-blur">
          <Gamepad2 className="h-3.5 w-3.5" />
          Arcade · Catch &amp; Track
        </div>
        <h1 className="section-title tool-heading-accent">Insect Tracker</h1>
        <p className="description mt-3 text-[var(--muted-foreground)]">
          Catch butterflies, bees, ladybugs and more in this fast, fun insect-tracking arcade. Beat your high score across rising difficulty levels.
        </p>
      </div>

      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
        {game.status === "start" ? (
          <>
            <StartScreen
              difficulty={game.difficulty}
              chosenInsect={game.chosenInsect}
              highScore={highScore}
              soundOn={game.soundOn}
              musicOn={game.musicOn}
              onDifficulty={game.setDifficulty}
              onChosen={game.setChosenInsect}
              onStart={() => game.startGame(game.difficulty, game.chosenInsect)}
              onToggleSound={() => game.setSound(!game.soundOn)}
              onToggleMusic={() => game.setMusic(!game.musicOn)}
            />

            {hydrated && (
              <StatsPanel
                open={statsOpen}
                onToggle={() => setStatsOpen((v) => !v)}
                stats={stats}
                favDiff={favDiff}
                favInsect={favInsect}
              />
            )}
          </>
        ) : (
          <>
            <Hud
              level={game.level}
              maxLevel={game.maxLevel}
              score={game.score}
              timeLeft={game.timeLeft}
              lives={game.lives}
              combo={game.combo}
              highScore={highScore}
              status={game.status}
              chosenInsect={game.chosenInsect}
              soundOn={game.soundOn}
              musicOn={game.musicOn}
              onTogglePause={game.togglePause}
              onRestart={game.restart}
              onToggleSound={() => game.setSound(!game.soundOn)}
              onToggleMusic={() => game.setMusic(!game.musicOn)}
            />

            <PlayArea
              insects={game.insects}
              bursts={game.bursts}
              levelFlash={game.levelFlash}
              onCatch={game.catchInsect}
              registerNode={game.registerNode}
              reportBounds={game.reportBounds}
              removeBurst={game.removeBurst}
            />

            <Overlay
              status={game.status}
              score={game.score}
              highScore={highScore}
              level={game.level}
              maxLevel={game.maxLevel}
              onResume={game.togglePause}
              onRestart={game.restart}
              toStart={game.toStart}
            />
          </>
        )}

        <Description />
      </div>
    </div>
  );
}

function StatsPanel({ open, onToggle, stats, favDiff, favInsect }) {
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
  const diffName = favDiff && DIFFICULTIES[favDiff] ? DIFFICULTIES[favDiff].name : "—";
  const insectName = favInsect && INSECT_TYPES[favInsect] ? INSECT_TYPES[favInsect].name : "—";

  const items = [
    { label: "Games Played", value: stats.gamesPlayed },
    { label: "Games Won", value: `${stats.gamesWon} (${winRate}%)` },
    { label: "Best Score", value: stats.bestScore },
    { label: "Highest Combo", value: `x${stats.highestCombo}` },
    { label: "Favorite Difficulty", value: diffName },
    { label: "Favorite Insect", value: insectName },
  ];

  return (
    <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 shadow-[var(--anslation-ds-shadow-md)] backdrop-blur-md">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-3.5 transition hover:bg-[var(--muted)]/40"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]">
          <BarChart3 className="h-4 w-4 text-[var(--primary)]" /> Your Statistics
        </span>
        <ChevronDown className={cn("h-4 w-4 text-[var(--muted-foreground)] transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="grid grid-cols-2 gap-3 px-5 pb-5 sm:grid-cols-3">
              {items.map((it) => (
                <div key={it.label} className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-3 text-center">
                  <div className="text-lg font-extrabold text-[var(--primary)]">{it.value}</div>
                  <div className="mt-0.5 text-[11px] font-medium text-[var(--muted-foreground)]">{it.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
