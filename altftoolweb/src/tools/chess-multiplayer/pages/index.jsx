// pages/index.jsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Crown, Loader2 } from "lucide-react";

import { useChessGame } from "../hooks/useChessGame";
import Board from "../components/Board";
import ChessClock from "../components/ChessClock";
import CapturedPieces from "../components/CapturedPieces";
import MoveHistory from "../components/MoveHistory";
import StatusBanner from "../components/StatusBanner";
import Controls from "../components/Controls";
import PromotionModal from "../components/PromotionModal";
import SetupScreen from "../components/SetupScreen";
import { computeCaptured } from "../utils/game-utils";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

export default function ToolHome() {
  const game = useChessGame();
  const { state } = game;
  const [orientation, setOrientation] = useState("w");
  const [loading, setLoading] = useState(true);
  const reduced = usePrefersReducedMotion();

  // Brief skeleton on first mount.
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  const captured = computeCaptured(state.history);

  const celebrate = useCallback(() => {
    if (reduced) return;
    confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
  }, [reduced]);

  // React to results / check with toasts + celebration.
  const lastResult = useRef(null);
  useEffect(() => {
    if (state.result && state.result !== lastResult.current) {
      lastResult.current = state.result;
      if (state.result === "draw") {
        toast.success(`Draw — ${state.resultReason}`);
      } else {
        celebrate();
        toast.success(
          `${state.result === "w" ? "White" : "Black"} wins — ${state.resultReason}`
        );
      }
    } else if (!state.result) {
      lastResult.current = null;
    }
  }, [state.result, state.resultReason, celebrate]);

  const lastCheck = useRef(false);
  useEffect(() => {
    if (state.status.inCheck && !lastCheck.current && !state.result) {
      toast.warning(
        `${state.chess.turn === "w" ? "White" : "Black"} is in check`
      );
    }
    lastCheck.current = state.status.inCheck;
  }, [state.status.inCheck, state.result, state.chess.turn]);

  const handleActivate = useCallback(
    (sq) => {
      try {
        game.selectSquare(sq);
      } catch (err) {
        toast.error("Invalid move");
      }
    },
    [game]
  );

  const restart = useCallback(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
    // Restart with the originally-selected time control (not whatever time
    // happened to be left on White's clock, which would silently change an
    // Unlimited game into a 5-minute blitz or a Bullet game into a near-zero
    // one).
    game.startGame(state.timeControl);
  }, [game, state.timeControl]);

  return (
    <div className="min-h-screen bg-(--background) p-4 text-(--foreground) md:p-8">
      <Toaster position="top-center" richColors />

      <div className="mb-6 pt-6 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-(--primary)/30 bg-(--primary)/10 px-4 py-1.5 text-xs font-semibold text-(--primary)">
          Game · Pass &amp; Play
        </div>
        <h1 className="section-title tool-heading-accent">Chess Multiplayer</h1>
        <p className="description mx-auto mt-3 max-w-2xl text-(--muted-foreground)">
          Play a full multiplayer chess match locally with legal-move
          validation, clocks, move history, captured pieces, draw offers and
          resign.
        </p>
      </div>

      {loading ? (
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-(--border) bg-(--card) p-10 text-(--muted-foreground)">
            <Loader2 className="animate-spin" size={20} /> Loading board&hellip;
          </div>
        </div>
      ) : state.phase === "setup" ? (
        <SetupScreen onStart={game.startGame} />
      ) : (
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left: clocks + board */}
          <div className="flex flex-col gap-4">
            <ChessClock
              color="b"
              seconds={state.clocks.b}
              active={state.chess.turn === "b" && !state.result}
              flagged={state.result === "w" && state.resultReason === "Time forfeit"}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={orientation + (state.result ? "-end" : "")}
                initial={reduced ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Board
                  chess={state.chess}
                  orientation={orientation}
                  selected={state.selected}
                  legalForSelected={state.legalForSelected}
                  lastMove={state.lastMove}
                  inCheck={state.status.inCheck}
                  onActivate={handleActivate}
                  reduced={reduced}
                />
              </motion.div>
            </AnimatePresence>

            <ChessClock
              color="w"
              seconds={state.clocks.w}
              active={state.chess.turn === "w" && !state.result}
              flagged={state.result === "b" && state.resultReason === "Time forfeit"}
            />
          </div>

          {/* Right: status, captured, history, controls */}
          <div className="flex flex-col gap-4">
            <StatusBanner
              status={state.status}
              result={state.result}
              resultReason={state.resultReason}
              turn={state.chess.turn}
            />

            <div className="rounded-xl border border-(--border) bg-(--card) p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
                Captured by Black
              </p>
              <CapturedPieces
                captured={captured.by.b}
                advantage={captured.advantage}
                leader={captured.leader}
                color="b"
              />
              <div className="my-2 h-px bg-(--border)" />
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
                Captured by White
              </p>
              <CapturedPieces
                captured={captured.by.w}
                advantage={captured.advantage}
                leader={captured.leader}
                color="w"
              />
            </div>

            <MoveHistory history={state.history} />

            <Controls
              onResign={game.resign}
              onOfferDraw={game.offerDraw}
              onAcceptDraw={game.acceptDraw}
              onDeclineDraw={game.declineDraw}
              onFlip={() => setOrientation((o) => (o === "w" ? "b" : "w"))}
              onRestart={restart}
              finished={!!state.result}
              drawOffer={state.drawOffer}
              myColor={state.chess.turn}
            />
          </div>
        </div>
      )}

      <PromotionModal
        open={!!state.pendingPromotion}
        color={state.pendingPromotion ? state.pendingPromotion.base.color : "w"}
        onPick={game.pickPromotion}
        onCancel={game.cancelPromotion}
      />

      <footer className="mt-8 text-center text-xs text-(--muted-foreground)">
        <Crown size={14} className="mx-auto mb-1 text-(--primary)" />
        ALTFTool Chess Multiplayer — local pass-and-play.
      </footer>
    </div>
  );
}
