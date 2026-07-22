'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Target, Timer, RefreshCw, Trophy } from 'lucide-react';
import { useGameSounds } from "@/app/altfgame/_lib/sounds";

const GAME_DURATION = 30; // seconds
const TARGET_SIZE = 60; // px
const MIN_TARGET_SIZE = 40; // px, maybe shrink slightly as game progresses? sticking to fixed for fairness first.

export default function AimTrainerGame() {
  const [gameState, setGameState] = useState('start'); // start, playing, ended
  const [score, setScore] = useState(0);
  useGameSounds({ started: gameState === 'playing', won: gameState === 'ended', score, sounds: { point: 'hit' } });
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [target, setTarget] = useState(null); // { x, y, id, spawnTime }
  const [stats, setStats] = useState({ clicks: 0, hits: 0, reactionTimes: [] });

  const containerRef = useRef(null);
  const timerRef = useRef(null);

  // Sound effects (placeholder - prompt said NO sound, so skipping)

  const spawnTarget = useCallback(() => {
    if (!containerRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();
    const padding = TARGET_SIZE; // Ensure target stays fully inside

    const x = Math.random() * (width - padding * 2) + padding;
    const y = Math.random() * (height - padding * 2) + padding;

    setTarget({
      x,
      y,
      id: Math.random(),
      spawnTime: Date.now()
    });
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setStats({ clicks: 0, hits: 0, reactionTimes: [] });
    spawnTarget();
  };

  const endGame = useCallback(() => {
    setGameState('ended');
    setTarget(null);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, endGame]);

  const handleBackgroundClick = () => {
    if (gameState !== 'playing') return;
    setStats(prev => ({ ...prev, clicks: prev.clicks + 1 }));
  };

  const handleTargetClick = (e) => {
    e.stopPropagation(); // Prevent background click
    if (gameState !== 'playing') return;

    const now = Date.now();
    const reactionTime = now - target.spawnTime;

    setScore(s => s + 1);
    setStats(prev => ({
      clicks: prev.clicks + 1,
      hits: prev.hits + 1,
      reactionTimes: [...prev.reactionTimes, reactionTime]
    }));

    spawnTarget();
  };

  const getAccuracy = () => {
    if (stats.clicks === 0) return 0;
    return Math.round((stats.hits / stats.clicks) * 100);
  };

  const getAvgReactionTime = () => {
    if (stats.reactionTimes.length === 0) return 0;
    const sum = stats.reactionTimes.reduce((a, b) => a + b, 0);
    return Math.round(sum / stats.reactionTimes.length);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 text-white font-sans overflow-hidden select-none">
      {/* Header / HUD */}
      <div className="h-16 flex items-center justify-between px-8 border-b border-slate-800 bg-slate-900/50 z-10">
        <div className="flex items-center gap-2">
          <Target className="text-cyan-400" size={24} />
          <h1 className="font-bold text-lg tracking-wider">AIM TRAINER PRO</h1>
        </div>

        {gameState === 'playing' && (
          <div className="flex items-center gap-8 font-mono text-xl">
            <div className="flex items-center gap-2 text-slate-400">
              <Timer size={20} />
              <span className={timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-white"}>
                {timeLeft}s
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Trophy size={20} />
              <span className="text-cyan-400">{score}</span>
            </div>
          </div>
        )}
      </div>

      {/* Game Area */}
      <div
        ref={containerRef}
        className="flex-1 relative cursor-crosshair active:cursor-crosshair touch-none"
        onClick={handleBackgroundClick}
      >
        {gameState === 'start' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-20">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <h2 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                READY TO AIM?
              </h2>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Hit as many targets as you can in {GAME_DURATION} seconds. <br/>
                Speed matters. Accuracy matters.
              </p>

              <button
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="group relative px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-xl rounded-full transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)]"
              >
                START TRAINING
                <span className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:scale-105 transition-transform" />
              </button>
            </motion.div>
          </div>
        )}

        {gameState === 'ended' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-md z-20">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 text-center min-w-[320px]"
            >
              <h3 className="text-2xl font-bold text-slate-200 mb-6">SESSION COMPLETE</h3>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-900/50 p-4 rounded-xl">
                  <div className="text-slate-400 text-sm mb-1">Score</div>
                  <div className="text-3xl font-black text-cyan-400">{score}</div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl">
                  <div className="text-slate-400 text-sm mb-1">Accuracy</div>
                  <div className={`text-3xl font-black ${getAccuracy() > 90 ? 'text-green-400' : 'text-orange-400'}`}>
                    {getAccuracy()}%
                  </div>
                </div>
                <div className="col-span-2 bg-slate-900/50 p-4 rounded-xl">
                  <div className="text-slate-400 text-sm mb-1">Avg Reaction Time</div>
                  <div className="text-3xl font-black text-purple-400">{getAvgReactionTime()} ms</div>
                </div>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                <RefreshCw size={20} />
                TRY AGAIN
              </button>
            </motion.div>
          </div>
        )}

        {gameState === 'playing' && target && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 touch-manipulation"
            style={{
              left: target.x,
              top: target.y,
              width: TARGET_SIZE,
              height: TARGET_SIZE
            }}
            onMouseDown={handleTargetClick} // Use onMouseDown for faster reaction than onClick
          >
             <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="w-full h-full rounded-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)] cursor-pointer relative group"
             >
                {/* Inner bullseye detail */}
                <div className="absolute inset-0 m-auto w-2/3 h-2/3 rounded-full bg-slate-900/20" />
                <div className="absolute inset-0 m-auto w-1/3 h-1/3 rounded-full bg-white/40" />
             </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
