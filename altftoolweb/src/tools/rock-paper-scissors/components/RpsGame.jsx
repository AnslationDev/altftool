"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hand, FileText, Scissors, ArrowLeft, RotateCcw, Trophy, Flame, Volume2, VolumeX } from "lucide-react";
import confetti from "canvas-confetti";

import { RPS_CHOICES, RPS_META, randomChoice, judgeRps } from "../utils/game";
import { playSound, resumeAudio } from "../utils/sound";
import { loadValue, saveValue } from "../utils/storage";
import StatsPanel from "./StatsPanel";

const LS_STATS = "rps.stats";
const LS_SOUND = "rps.sound";

const ICONS = {
  rock: <Hand size={40} />,
  paper: <FileText size={40} />,
  scissors: <Scissors size={40} />,
};

const EMPTY_STATS = {
  wins: 0,
  losses: 0,
  draws: 0,
  streak: 0,
  longest: 0,
  best: 0,
};

function fireConfetti() {
  const colors = ["#14b8a6", "#22d3ee", "#facc15", "#f472b6", "#a78bfa"];
  confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors });
  setTimeout(
    () => confetti({ particleCount: 80, spread: 120, origin: { y: 0.4 }, colors }),
    180
  );
}

export default function RpsGame({ onBack }) {
  const [hydrated, setHydrated] = useState(false);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [soundOn, setSoundOn] = useState(true);

  const [phase, setPhase] = useState("idle"); // idle | countdown | thinking | result
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [outcome, setOutcome] = useState(null);

  const cleanupRef = useRef(null);

  useEffect(() => {
    const mark = () => setHydrated(true);
    mark();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const load = () => {
      try {
        const s = loadValue(LS_STATS, null);
        if (s) setStats({ ...EMPTY_STATS, ...s });
        const snd = loadValue(LS_SOUND, null);
        if (snd !== null) setSoundOn(!!snd);
      } catch {
        /* ignore */
      }
    };
    load();
  }, [hydrated]);

  const persistStats = (next) => {
    try {
      saveValue(LS_STATS, next);
    } catch {
      /* ignore */
    }
  };

  const sfx = (kind) => {
    if (soundOn) playSound(kind);
  };
  const sfxRef = useRef(sfx);
  useEffect(() => {
    sfxRef.current = sfx;
  });

  // Countdown 3..2..1 then move to "thinking".
  useEffect(() => {
    if (phase !== "countdown") return;
    const start = () => {
      let n = 3;
      setCountdown(n);
      const id = setInterval(() => {
        n -= 1;
        if (n <= 0) {
          clearInterval(id);
          setCountdown(0);
          setPhase("thinking");
        } else {
          setCountdown(n);
        }
      }, 650);
      cleanupRef.current = () => clearInterval(id);
    };
    start();
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [phase]);

  // Thinking wobble then reveal + score.
  useEffect(() => {
    if (phase !== "thinking") return;
    const reveal = () => {
      setTimeout(() => {
        setPhase("result");
        const result = judgeRps(playerChoice, computerChoice);
        setOutcome(result);
        setStats((prev) => {
          const next = { ...prev };
          if (result === "win") {
            next.wins += 1;
            next.streak += 1;
            next.longest = Math.max(next.longest, next.streak);
            next.best = Math.max(next.best, next.wins);
          } else if (result === "loss") {
            next.losses += 1;
            next.streak = 0;
          } else {
            next.draws += 1;
            next.streak = 0;
          }
          persistStats(next);
          return next;
        });
        if (result === "win") {
          sfxRef.current("win");
          fireConfetti();
        } else if (result === "loss") {
          sfxRef.current("lose");
        } else {
          sfxRef.current("draw");
        }
      }, 650);
    };
    reveal();
    return () => {};
  }, [phase, playerChoice, computerChoice]);

  const handleChoice = (choice) => {
    if (phase !== "idle") return;
    resumeAudio();
    sfx("select");
    const cpu = randomChoice(RPS_CHOICES);
    setPlayerChoice(choice);
    setComputerChoice(cpu);
    setOutcome(null);
    setPhase("countdown");
  };

  const restart = () => {
    setPhase("idle");
    setPlayerChoice(null);
    setComputerChoice(null);
    setOutcome(null);
  };

  const resetStats = () => {
    const next = { ...EMPTY_STATS };
    setStats(next);
    persistStats(next);
    sfx("click");
  };

  const toggleSound = () => {
    setSoundOn((prev) => {
      const next = !prev;
      try {
        saveValue(LS_SOUND, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const total = stats.wins + stats.losses + stats.draws;
  const winRate = total ? Math.round((stats.wins / total) * 100) : 0;

  const statsRow = [
    { label: "Wins", value: stats.wins, accent: true },
    { label: "Losses", value: stats.losses },
    { label: "Draws", value: stats.draws },
    { label: "Win rate", value: `${winRate}%` },
    { label: "Streak", value: stats.streak },
    { label: "Best streak", value: stats.longest },
    { label: "Max wins", value: stats.best },
  ];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Header onBack={onBack} soundOn={soundOn} onToggleSound={toggleSound} />

      <StatsPanel stats={statsRow} />

      <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-sm">
        <Arena
          phase={phase}
          playerChoice={playerChoice}
          computerChoice={computerChoice}
          countdown={countdown}
          outcome={outcome}
        />
      </div>

      {/* Choice buttons */}
      <div className="grid grid-cols-3 gap-3">
        {RPS_CHOICES.map((c) => {
          const active = playerChoice === c && phase !== "idle";
          return (
            <button
              key={c}
              type="button"
              onClick={() => handleChoice(c)}
              disabled={phase !== "idle"}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-5 transition active:scale-95 disabled:opacity-50 ${
                active
                  ? "border-(--primary) bg-(--primary)/10 text-(--primary) shadow-sm"
                  : "border-(--border) text-(--foreground) hover:bg-(--muted)"
              }`}
            >
              <span className="text-(--primary)">{ICONS[c]}</span>
              <span className="text-sm font-semibold">{RPS_META[c].label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={restart}
          disabled={phase === "idle"}
          className="inline-flex items-center gap-2 rounded-xl border border-(--border) px-4 py-2.5 text-sm font-semibold text-(--foreground) transition hover:bg-(--muted) active:scale-95 disabled:opacity-50"
        >
          <RotateCcw size={16} /> Play again
        </button>
        <button
          type="button"
          onClick={resetStats}
          className="inline-flex items-center gap-2 rounded-xl border border-(--border) px-4 py-2.5 text-sm font-semibold text-(--foreground) transition hover:bg-(--muted) active:scale-95"
        >
          Reset stats
        </button>
      </div>
    </div>
  );
}

function Header({ onBack, soundOn, onToggleSound }) {
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-xl border border-(--border) px-3 py-2 text-sm font-semibold text-(--muted-foreground) transition hover:bg-(--muted) active:scale-95"
      >
        <ArrowLeft size={16} /> Menu
      </button>
      <div className="flex items-center gap-2 text-sm font-semibold text-(--primary)">
        <Trophy size={18} /> <Flame size={16} className="text-(--muted-foreground)" />
      </div>
      <button
        type="button"
        onClick={onToggleSound}
        aria-label={soundOn ? "Mute sound" : "Unmute sound"}
        className="inline-flex items-center justify-center rounded-xl border border-(--border) p-2 text-(--muted-foreground) transition hover:bg-(--muted) active:scale-95"
      >
        {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>
    </div>
  );
}

function Arena({ phase, playerChoice, computerChoice, countdown, outcome }) {
  return (
    <div className="flex flex-col items-center gap-5">
      <AnimatePresence mode="wait">
        {phase === "countdown" && (
          <motion.div
            key="count"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex h-32 items-center justify-center"
          >
            <span className="text-7xl font-black text-(--primary)">{countdown}</span>
          </motion.div>
        )}

        {phase === "thinking" && (
          <motion.div
            key="think"
            className="flex h-32 items-center gap-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Wobble>
              <Placeholder icon={playerChoice ? ICONS[playerChoice] : <Hand size={40} />} />
            </Wobble>
            <span className="text-xl font-bold text-(--muted-foreground)">VS</span>
            <Wobble delay={0.15}>
              <Placeholder icon={<span className="text-3xl">❓</span>} />
            </Wobble>
          </motion.div>
        )}

        {phase === "result" && (
          <motion.div
            key="result"
            className="flex h-32 items-center gap-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Slot choice={playerChoice} win={outcome === "win"} lose={outcome === "loss"} label="You" />
            <span className="text-xl font-bold text-(--muted-foreground)">VS</span>
            <Slot choice={computerChoice} win={outcome === "loss"} lose={outcome === "win"} label="CPU" />
          </motion.div>
        )}

        {phase === "idle" && (
          <motion.div
            key="idle"
            className="flex h-32 flex-col items-center justify-center gap-2 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Hand size={40} className="text-(--primary)" />
            <p className="text-sm font-medium text-(--muted-foreground)">
              Pick Rock, Paper, or Scissors to begin.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "result" && outcome && (
        <div
          className={`rounded-full px-5 py-2 text-sm font-bold ${
            outcome === "win"
              ? "bg-(--primary)/10 text-(--primary)"
              : outcome === "loss"
              ? "bg-(--muted) text-(--muted-foreground)"
              : "bg-(--muted) text-(--muted-foreground)"
          }`}
        >
          {outcome === "win" ? "You win!" : outcome === "loss" ? "Computer wins" : "Draw"}
        </div>
      )}
    </div>
  );
}

function Wobble({ children, delay = 0 }) {
  return (
    <motion.div
      animate={{ rotate: [-8, 8, -8] }}
      transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {children}
    </motion.div>
  );
}

function Placeholder({ icon }) {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-(--border) bg-(--muted) text-(--foreground)">
      {icon}
    </div>
  );
}

function Slot({ choice, win, lose, label }) {
  const ring = win
    ? "border-(--primary) bg-(--primary)/10 ring-2 ring-(--primary)"
    : lose
    ? "border-(--border) opacity-60"
    : "border-(--border)";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`flex h-20 w-20 items-center justify-center rounded-2xl text-(--primary) transition ${ring}`}>
        {choice ? ICONS[choice] : null}
      </div>
      <span className="text-xs font-semibold text-(--muted-foreground)">{label}</span>
    </div>
  );
}
