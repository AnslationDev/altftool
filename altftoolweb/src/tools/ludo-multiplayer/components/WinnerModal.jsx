import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@altftool/ui";
import { Trophy, RotateCcw, Home } from "lucide-react";
import dynamic from "next/dynamic";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

export default function WinnerModal({ open, winner, players, onNewGame, onClose }) {
  if (!open || winner === null) return null;
  const player = players?.[winner];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Confetti
          width={typeof window !== "undefined" ? window.innerWidth : 800}
          height={typeof window !== "undefined" ? window.innerHeight : 600}
          recycle={false}
          numberOfPieces={200}
          colors={["#14B8A6", "#22D3EE", "#8B5CF6", "#F59E0B", "#EF4444", "#3B82F6"]}
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 40 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative z-10 w-full max-w-sm"
        >
          <div className="bg-(--card) border border-(--border) rounded-3xl shadow-2xl p-7 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.15 }}
              className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${player?.color}, ${player?.color}99)` }}
            >
              <Trophy className="text-white" size="40" />
            </motion.div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--muted-foreground) mb-1">
              🏆 Winner
            </p>
            <h2 className="text-3xl font-extrabold text-(--foreground) mb-1.5">{player?.name}</h2>
            <p className="text-sm text-(--muted-foreground) mb-5">
              {player?.isAI ? "The AI claims the crown!" : "Congratulations on the victory!"}
            </p>
            <div className="flex gap-2.5 justify-center">
              <Button variant="primary" onClick={onNewGame} className="flex-1">
                <RotateCcw size="16" /> New Game
              </Button>
              <Button variant="secondary" onClick={onClose} className="flex-1">
                <Home size="16" /> Close
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
