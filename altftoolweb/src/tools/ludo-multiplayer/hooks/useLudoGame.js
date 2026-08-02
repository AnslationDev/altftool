"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { createGame, rollDice, getValidMoves, applyMove, checkForExtraTurn, checkThreeConsecutiveSixes } from "../engine/gameEngine";
import { evaluateMoves, getAIDelay } from "../ai/aiEngine";
import { loadStats, saveStats, loadSettings, saveSettings } from "../utils/storage";
import { DIFFICULTY } from "../engine/constants";

export function useLudoGame() {
  const [game, setGame] = useState(() => createGame(2));
  const [mode, setMode] = useState("ai");
  const [difficulty, setDifficulty] = useState(DIFFICULTY.MEDIUM);
  const [playerCount, setPlayerCount] = useState(2);
  const [isRolling, setIsRolling] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [stats, setStats] = useState(loadStats);
  const [settings, setSettings] = useState(loadSettings);
  const [thinkingAI, setThinkingAI] = useState(false);
  const [diceRolling, setDiceRolling] = useState(false);
  const aiTimerRef = useRef(null);
  const turnTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
      if (turnTimerRef.current) clearTimeout(turnTimerRef.current);
    };
  }, []);

  const newGame = useCallback(() => {
    const g = createGame(playerCount);
    g.started = true;
    setGame(g);
    setShowWinner(false);
    setThinkingAI(false);
    setDiceRolling(false);
  }, [playerCount]);

  const toggleMode = useCallback((m) => {
    setMode(m);
    const count = m === "ai" ? 2 : playerCount;
    setPlayerCount(count);
    const g = createGame(count);
    g.started = true;
    if (m === "ai") g.players[1].isAI = true;
    setGame(g);
    setShowWinner(false);
  }, [playerCount]);

  const changePlayerCount = useCallback((n) => {
    setPlayerCount(n);
    if (mode === "pvp") {
      const g = createGame(n);
      g.started = true;
      setGame(g);
      setShowWinner(false);
    }
  }, [mode]);

  const updateSettings = useCallback((key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  }, []);

  const recordWin = useCallback((winnerId, diff, turns) => {
    setStats((prev) => {
      const next = { ...prev };
      next.gamesPlayed++;
      const elapsed = Date.now() - game.startedAt;
      next.longestGame = Math.max(next.longestGame, elapsed);
      if (turns < next.fastestWin) next.fastestWin = turns;
      next.totalTurns += game.turnCount;

      if (winnerId === 0) {
        next.wins++;
        if (diff && next.aiDifficultyStats[diff]) {
          next.aiDifficultyStats[diff].wins++;
        }
      } else {
        next.losses++;
        if (diff && next.aiDifficultyStats[diff]) {
          next.aiDifficultyStats[diff].losses++;
        }
      }
      saveStats(next);
      return next;
    });
  }, [game.startedAt, game.turnCount]);

  const handleRoll = useCallback(() => {
    if (game.gameOver || game.phase !== "roll" || !game.canRoll || isRolling || thinkingAI) return;
    setDiceRolling(true);
    setIsRolling(true);

    setTimeout(() => {
      const value = rollDice();
      const player = game.players[game.currentPlayer];
      const updatedGame = { ...game, diceValue: value };

      if (value === 6) {
        player.consecutiveSixes++;
        if (checkThreeConsecutiveSixes(player)) {
          player.consecutiveSixes = 0;
          setGame((prev) => ({
            ...prev,
            diceValue: value,
            diceRolled: true,
            phase: "roll",
            canRoll: true,
            currentPlayer: (prev.currentPlayer + 1) % prev.players.length,
          }));
          setDiceRolling(false);
          setIsRolling(false);
          return;
        }
      } else {
        player.consecutiveSixes = 0;
      }

      const moves = getValidMoves(updatedGame, updatedGame.currentPlayer);

      setGame((prev) => ({
        ...prev,
        diceValue: value,
        diceRolled: true,
        validMoves: moves,
        phase: moves.length > 0 ? "move" : "roll",
        canRoll: moves.length === 0,
        turnCount: prev.turnCount + 1,
      }));
      setDiceRolling(false);
      setIsRolling(false);
    }, 800);
  }, [game, isRolling, thinkingAI]);

  const handleMove = useCallback((move) => {
    const g = { ...game };
    applyMove(g, game.currentPlayer, move);

    if (g.gameOver) {
      setGame(g);
      setShowWinner(true);
      recordWin(g.winner, difficulty, g.turnCount);
      return;
    }

    const extraTurn = move.action === "kill" || checkForExtraTurn(g.diceValue);
    g.currentPlayer = extraTurn ? g.currentPlayer : (g.currentPlayer + 1) % g.players.length;
    g.phase = "roll";
    g.diceRolled = false;
    g.canRoll = true;
    g.validMoves = [];

    setGame(g);

    if (g.players[g.currentPlayer].isAI) {
      triggerAIMove(g);
    }
  }, [game, difficulty, recordWin]);

  const triggerAIMove = useCallback((g) => {
    setThinkingAI(true);
    const delay = getAIDelay(difficulty);

    aiTimerRef.current = setTimeout(() => {
      const aiPlayer = g.players[g.currentPlayer];
      if (!aiPlayer.isAI) { setThinkingAI(false); return; }

      const diceVal = rollDice();
      g.diceValue = diceVal;

      if (diceVal === 6) {
        aiPlayer.consecutiveSixes++;
        if (checkThreeConsecutiveSixes(aiPlayer)) {
          aiPlayer.consecutiveSixes = 0;
          g.currentPlayer = (g.currentPlayer + 1) % g.players.length;
          g.phase = "roll";
          g.canRoll = true;
          g.validMoves = [];
          setGame({ ...g });
          setThinkingAI(false);
          return;
        }
      } else {
        aiPlayer.consecutiveSixes = 0;
      }

      const move = evaluateMoves(g, g.currentPlayer, difficulty);
      if (!move) {
        g.currentPlayer = (g.currentPlayer + 1) % g.players.length;
        g.phase = "roll";
        g.canRoll = true;
        setGame({ ...g });
        setThinkingAI(false);
        return;
      }
      applyMove(g, g.currentPlayer, move);
      if (g.gameOver) {
        setGame(g);
        setShowWinner(true);
        recordWin(g.winner, difficulty, g.turnCount);
        setThinkingAI(false);
        return;
      }
      const extraTurn = move.action === "kill" || checkForExtraTurn(diceVal);
      g.currentPlayer = extraTurn ? g.currentPlayer : (g.currentPlayer + 1) % g.players.length;
      g.phase = "roll";
      g.canRoll = true;
      g.validMoves = [];
      g.turnCount++;
      setGame({ ...g });
      setThinkingAI(false);
    }, delay);
  }, [difficulty, recordWin]);

  useEffect(() => {
    if (game.started && game.players[game.currentPlayer]?.isAI && game.phase === "roll" && !game.gameOver) {
      triggerAIMove(game);
    }
  }, [game.currentPlayer, game.started, game.phase, game.gameOver]);

  return {
    game,
    mode,
    difficulty,
    playerCount,
    isRolling,
    showSettings,
    showStats,
    showWinner,
    stats,
    settings,
    thinkingAI,
    diceRolling,
    setDifficulty,
    setShowSettings,
    setShowStats,
    setShowWinner,
    newGame,
    toggleMode,
    changePlayerCount,
    handleRoll,
    handleMove,
    updateSettings,
    resetStats: () => { const d = loadStats(); saveStats(d); setStats(d); },
  };
}
