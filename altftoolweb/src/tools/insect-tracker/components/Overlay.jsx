"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Play, RotateCcw, Trophy, Bug, X, Coins, Sparkles, Share2, Pause } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/Button";

function Modal({ children, onClose, allowClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={allowClose ? onClose : undefined}
    >
      <motion.div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 p-6 text-center shadow-[var(--anslation-ds-shadow-lg)] backdrop-blur-xl"
        initial={{ scale: 0.85, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 12 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function BigIcon({ children, className }) {
  return (
    <motion.div
      className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full ${className}`}
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.05 }}
    >
      {children}
    </motion.div>
  );
}

function Reward({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex flex-1 flex-col items-center rounded-xl border border-[var(--border)] bg-[var(--card)] py-2.5">
      <Icon className={`h-4 w-4 ${accent}`} />
      <span className={`mt-1 text-lg font-extrabold ${accent}`}>{value}</span>
      <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]">{label}</span>
    </div>
  );
}

function shareScore(score) {
  const text = `I scored ${score} in Insect Tracker!`;
  const done = () => toast.success("Score copied to clipboard!");
  const fail = () => toast.error("Couldn't copy score.");
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(fail);
  } else {
    fail();
  }
}

export default function Overlay({ status, score, highScore, level, maxLevel, onResume, onRestart, toStart }) {
  const show = status === "paused" || status === "won" || status === "lost";
  const isNewBest = score >= highScore && score > 0;
  const coins = Math.floor(score / 10);
  const xp = Math.floor(score / 4);

  return (
    <AnimatePresence>
      {show && (
        <Modal
          allowClose={status === "paused"}
          onClose={status === "paused" ? onResume : () => {}}
        >
          {status === "paused" && (
            <>
              <BigIcon className="bg-[var(--muted)]">
                <Pause className="h-7 w-7 text-[var(--primary)]" />
              </BigIcon>
              <h2 className="text-xl font-bold text-[var(--foreground)]">Paused</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">Your bugs are waiting. Take your time.</p>
              <div className="mt-5 flex flex-col gap-2">
                <Button variant="primary" onClick={onResume} className="cursor-pointer active:scale-95">
                  <Play className="h-4 w-4" /> Resume
                </Button>
                <Button variant="outline" onClick={onRestart} className="cursor-pointer active:scale-95">
                  <RotateCcw className="h-4 w-4" /> Restart
                </Button>
                <Button variant="ghost" onClick={toStart} className="cursor-pointer active:scale-95">
                  Quit to menu
                </Button>
              </div>
            </>
          )}

          {status === "won" && (
            <>
              <BigIcon className="bg-[var(--anslation-ds-success-soft)]">
                <Trophy className="h-7 w-7 text-[var(--anslation-ds-success)]" />
              </BigIcon>
              <h2 className="text-xl font-bold text-[var(--foreground)]">You Win! 🎉</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">You reached max level {maxLevel}.</p>
              <ScoreBlock score={score} highScore={highScore} isNewBest={isNewBest} />
              <RewardRow coins={coins} xp={xp} />
              <WinLostButtons score={score} onRestart={onRestart} toStart={toStart} restartLabel="Play Again" />
            </>
          )}

          {status === "lost" && (
            <>
              <BigIcon className="bg-[var(--anslation-ds-danger-soft)]">
                <X className="h-7 w-7 text-[var(--anslation-ds-danger)]" />
              </BigIcon>
              <h2 className="text-xl font-bold text-[var(--foreground)]">Game Over</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                The bugs got away this time. You reached level {level}.
              </p>
              <ScoreBlock score={score} highScore={highScore} isNewBest={isNewBest} />
              <RewardRow coins={coins} xp={xp} />
              <WinLostButtons score={score} onRestart={onRestart} toStart={toStart} restartLabel="Try Again" />
            </>
          )}
        </Modal>
      )}
    </AnimatePresence>
  );
}

function RewardRow({ coins, xp }) {
  return (
    <div className="mt-3 flex gap-2">
      <Reward icon={Coins} label="Coins" value={coins} accent="text-[#f59e0b]" />
      <Reward icon={Sparkles} label="XP" value={xp} accent="text-[var(--secondary)]" />
    </div>
  );
}

function WinLostButtons({ score, onRestart, toStart, restartLabel }) {
  return (
    <div className="mt-5 flex flex-col gap-2">
      <Button variant="primary" onClick={onRestart} className="cursor-pointer active:scale-95">
        <RotateCcw className="h-4 w-4" /> {restartLabel}
      </Button>
      <Button variant="outline" onClick={() => shareScore(score)} className="cursor-pointer active:scale-95">
        <Share2 className="h-4 w-4" /> Share Score
      </Button>
      <Button variant="ghost" onClick={toStart} className="cursor-pointer active:scale-95">
        Back to menu
      </Button>
    </div>
  );
}

function ScoreBlock({ score, highScore, isNewBest }) {
  return (
    <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4">
      <div className="flex items-center justify-center gap-2 text-3xl font-extrabold text-[var(--foreground)]">
        <Bug className="h-6 w-6 text-[var(--primary)]" /> {score}
      </div>
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
        High score: <span className="font-semibold text-[var(--foreground)]">{highScore}</span>
        {isNewBest && <span className="ml-2 font-semibold text-[var(--anslation-ds-success)]">New best! 🏆</span>}
      </p>
    </div>
  );
}
