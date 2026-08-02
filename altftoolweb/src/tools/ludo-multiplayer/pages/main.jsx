"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@altftool/ui";
import { useLudoGame } from "../hooks/useLudoGame";
import GameBackground from "../components/GameBackground";
import GameHeader from "../components/GameHeader";
import GameBoard from "../components/GameBoard";
import ControlPanel from "../components/ControlPanel";
import PlayerPanel from "../components/PlayerPanel";
import MoveHistory from "../components/MoveHistory";
import WinnerModal from "../components/WinnerModal";
import GameStatistics from "../components/GameStatistics";
import SettingsModal from "../components/SettingsModal";
import { sfx } from "../utils/sound";

const SPEED_DURATION = { slow: 0.9, normal: 0.5, fast: 0.25 };

export default function LudoMain() {
  const ludo = useLudoGame();
  const { game, mode, difficulty, settings, thinkingAI, diceRolling, playerCount } = ludo;
  const [boardReady, setBoardReady] = useState(false);

  useEffect(() => {
    sfx.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const prevRolling = useRef(false);
  useEffect(() => {
    if (diceRolling && !prevRolling.current) sfx.roll();
    prevRolling.current = diceRolling;
  }, [diceRolling]);

  const prevMoves = useRef(0);
  useEffect(() => {
    const len = game.moves.length;
    if (len > prevMoves.current) {
      const last = game.moves[len - 1];
      if (last.action === "kill") sfx.kill();
      else sfx.move();
    }
    prevMoves.current = len;
  }, [game.moves.length]);

  useEffect(() => {
    if (ludo.showWinner) sfx.win();
  }, [ludo.showWinner]);

  const handleTokenClick = useCallback(
    (playerId, tokenIdx) => {
      const move = game.validMoves.find((m) => m.tokenIndex === tokenIdx);
      if (move) {
        sfx.click();
        ludo.handleMove(move);
      }
    },
    [game.validMoves, ludo]
  );

  const currentName = game.players[game.currentPlayer]?.name || "Current player";
  let status = "Select a token to move";
  let statusTone = "primary";
  if (game.gameOver) {
    status = "Game Over!";
    statusTone = "primary";
  } else if (thinkingAI) {
    status = "AI is thinking…";
    statusTone = "muted";
  } else if (game.phase === "roll") {
    status = `${currentName}'s turn — Roll the dice!`;
    statusTone = "accent";
  }

  const moveDuration = SPEED_DURATION[settings.animationSpeed] || 0.5;

  return (
    <div className="min-h-screen bg-(--background)">
      <GameBackground variant={settings.backgroundTheme || "classic"} />

      <div className="relative max-w-6xl mx-auto px-4 py-6 space-y-6">
        <GameHeader
          mode={mode}
          onToggleMode={ludo.toggleMode}
          onOpenSettings={() => ludo.setShowSettings(true)}
          onOpenStats={() => ludo.setShowStats(true)}
          playerCount={playerCount}
          onPlayerCountChange={ludo.changePlayerCount}
        />

        <div className="space-y-5">
          {/* Main Board - Large and Centered (80-85% of game area) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onAnimationComplete={setBoardReady}
            className="flex justify-center"
          >
            <Card className="p-3 sm:p-4 w-full max-w-[95vw]">
              <GameBoard
                game={game}
                onTokenClick={handleTokenClick}
                moveDuration={moveDuration}
                boardTheme={settings.boardTheme}
                boardReady={boardReady}
              />
            </Card>
          </motion.div>

          {/* Player Cards Below Board - Compact Horizontal Layout */}
          <Card className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-(--foreground) uppercase tracking-wider">
                Players
              </h3>
              <span className="text-[10px] text-(--muted-foreground)">
                {game.players.length} in game
              </span>
            </div>
            <PlayerPanel
              players={game.players}
              currentPlayer={game.currentPlayer}
              thinkingAI={thinkingAI}
              game={game}
            />
          </Card>

          {/* Dice, Turn Status, Move History, Controls - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-4 lg:col-span-2">
              <ControlPanel
                value={game.diceValue}
                rolling={diceRolling}
                onRoll={ludo.handleRoll}
                disabled={
                  game.gameOver || game.phase !== "roll" || !game.canRoll || thinkingAI || diceRolling
                }
                diceTheme={settings.diceTheme}
                status={status}
                statusTone={statusTone}
                turnCount={game.turnCount}
                mode={mode}
                difficulty={difficulty}
                onNewGame={ludo.newGame}
                soundEnabled={settings.soundEnabled}
                onToggleSound={() => ludo.updateSettings("soundEnabled", !settings.soundEnabled)}
                game={game}
              />
            </Card>

            <Card className="p-4">
              <h3 className="text-xs font-bold text-(--foreground) uppercase tracking-wider mb-3">
                Move History
              </h3>
              <MoveHistory moves={game.moves} players={game.players} />
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-(--foreground) mb-3">How to Play</h2>
            <ul className="space-y-1.5 text-sm text-(--muted-foreground) list-disc list-inside">
              <li>Roll a 6 to bring a token out of the yard to its start.</li>
              <li>Move tokens clockwise — rolling a 6 grants an extra turn.</li>
              <li>Land on an opponent&apos;s token to send it back home.</li>
              <li>Three sixes in a row forfeits your turn.</li>
              <li>First to bring all 4 tokens home wins!</li>
            </ul>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-(--muted-foreground)">
              <span>🎲 Tap the dice to roll</span>
              <span>⚡ Capture for a bonus turn</span>
              <span>✨ Tap a glowing token to move</span>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-(--foreground) mb-4">FAQ</h2>
            <div className="space-y-3">
              {[
                {
                  q: "How does AI difficulty work?",
                  a: "Easy plays random moves. Medium blends strategy with chance. Hard evaluates captures, safety, and progress optimally.",
                },
                {
                  q: "How many players can join?",
                  a: "Local mode supports 2–4 players. AI mode is a 1v1 duel against the computer.",
                },
                {
                  q: "Are my stats saved?",
                  a: "Yes — all statistics and settings are stored locally in your browser.",
                },
              ].map((faq) => (
                <div key={faq.q}>
                  <h3 className="text-sm font-semibold text-(--foreground)">{faq.q}</h3>
                  <p className="text-sm text-(--muted-foreground)">{faq.a}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <WinnerModal
        open={ludo.showWinner}
        winner={game.winner}
        players={game.players}
        onNewGame={ludo.newGame}
        onClose={() => ludo.setShowWinner(false)}
      />

      <GameStatistics
        stats={ludo.stats}
        open={ludo.showStats}
        onClose={() => ludo.setShowStats(false)}
        onReset={ludo.resetStats}
      />

      <SettingsModal
        open={ludo.showSettings}
        onClose={() => ludo.setShowSettings(false)}
        settings={settings}
        onUpdate={ludo.updateSettings}
        mode={mode}
        difficulty={difficulty}
        onDifficultyChange={ludo.setDifficulty}
        onModeChange={ludo.toggleMode}
      />
    </div>
  );
}