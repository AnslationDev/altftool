"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Play, RotateCcw, Trophy, ArrowRight, X } from "lucide-react";
import { Button } from "@/shared/ui/Button";

function Modal({ children, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center shadow-[var(--anslation-ds-shadow-lg)]"
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

export default function Overlay({
  status,
  level,
  score,
  mode,
  hasNextLevel,
  onResume,
  onRestart,
  onNext,
}) {
  const show = status === "paused" || status === "won" || status === "lost";

  return (
    <AnimatePresence>
      {show && (
        <Modal
          onClose={
            status === "paused"
              ? onResume
              : () => {} /* win/lose modals require a button choice */
          }
        >
          {status === "paused" && (
            <>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--muted)]">
                <Play className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">Paused</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">Take a breath — your game is safe.</p>
              <div className="mt-5 flex flex-col gap-2">
                <Button variant="primary" onClick={onResume}>
                  <Play className="h-4 w-4" /> Resume
                </Button>
                <Button variant="outline" onClick={onRestart}>
                  <RotateCcw className="h-4 w-4" /> Restart Level
                </Button>
              </div>
            </>
          )}

          {status === "won" && (
            <>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--anslation-ds-success-soft)]">
                <Trophy className="h-6 w-6 text-[var(--anslation-ds-success)]" />
              </div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                {hasNextLevel ? "Level Complete!" : "You Win! 🎉"}
              </h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Score: <span className="font-semibold text-[var(--foreground)]">{score}</span>
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <Button variant="primary" onClick={onNext}>
                  {hasNextLevel ? (
                    <>
                      Next Level <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Play Again <RotateCcw className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={onRestart}>
                  Replay Level
                </Button>
              </div>
            </>
          )}

          {status === "lost" && (
            <>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--anslation-ds-danger-soft)]">
                <X className="h-6 w-6 text-[var(--anslation-ds-danger)]" />
              </div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">Out of {mode === "timed" ? "time" : "moves"}</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                You reached <span className="font-semibold text-[var(--foreground)]">{score}</span> / {level.target}.
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <Button variant="primary" onClick={onRestart}>
                  <RotateCcw className="h-4 w-4" /> Try Again
                </Button>
              </div>
            </>
          )}
        </Modal>
      )}
    </AnimatePresence>
  );
}
