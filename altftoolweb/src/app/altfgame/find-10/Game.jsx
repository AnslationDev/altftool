"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useGameSounds } from "@/app/altfgame/_lib/sounds";

const GRID_SIZE = 8;
const GAME_TIME = 60;
const WIN_SCORE = 220;

const generateGrid = () =>
  Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => Math.floor(Math.random() * 9) + 1),
  );

function multiplierValue(combo) {
  if (combo >= 10) return 5;
  if (combo >= 5) return 3;
  if (combo >= 3) return 2;
  return 1;
}

function rankFor(score) {
  if (score >= WIN_SCORE) return "Number King";
  if (score >= 160) return "Pro Solver";
  if (score >= 90) return "Sharp Mind";
  return "Rookie Run";
}

function Loader({ onDone }) {
  const [count, setCount] = useState(1);

  useEffect(() => {
    if (count >= 10) {
      const done = window.setTimeout(onDone, 300);
      return () => window.clearTimeout(done);
    }

    const tick = window.setTimeout(() => {
      setCount((value) => value + 1);
    }, 110);

    return () => window.clearTimeout(tick);
  }, [count, onDone]);

  return (
    <main className="relative grid h-full w-full overflow-hidden rounded-xl bg-[#070812] px-4 py-6 font-sans text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(34,211,238,0.26),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(244,63,94,0.24),transparent_28%),linear-gradient(135deg,#070812,#12162a_52%,#070812)]" />
      <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="relative z-10 mx-auto grid w-full max-w-5xl content-center gap-8 text-center">
        <div className="mx-auto grid h-[min(40vw,220px)] w-[min(40vw,220px)] place-items-center rounded-full border border-white/10 bg-black/30 shadow-[0_35px_120px_rgba(0,0,0,0.55)] backdrop-blur">
          <div className="grid h-[82%] w-[82%] animate-spin place-items-center rounded-full bg-[repeating-conic-gradient(from_0deg,#22d3ee_0deg,#22d3ee_10deg,#111827_10deg,#111827_20deg,#fb7185_20deg,#fb7185_30deg,#111827_30deg,#111827_40deg)] [animation-duration:5200ms]">
            <div className="grid h-[58%] w-[58%] place-items-center rounded-full bg-[#070812]">
              <span className="text-[clamp(2.6rem,9vw,5rem)] font-black leading-none text-white">
                {count}
              </span>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-cyan-200">
            Target lock loading
          </p>
          <h1 className="m-0 text-[clamp(1.6rem,4.5vw,2.8rem)] font-black leading-none tracking-normal">
            Find 10 Arena
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm font-bold leading-6 text-white/60">
            Counting to 10. Pair the numbers fast, chain combos, and beat the target score.
          </p>
        </div>

        <div className="mx-auto w-full max-w-xl rounded-full border border-white/10 bg-white/10 p-1">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-cyan-300 via-white to-rose-400 transition-all duration-300"
            style={{ width: `${count * 10}%` }}
          />
        </div>
      </section>
    </main>
  );
}

const Find = () => {
  const [loading, setLoading] = useState(true);
  const [grid, setGrid] = useState(generateGrid());
  const [selected, setSelected] = useState([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timer, setTimer] = useState(GAME_TIME);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("Select two numbers that add up to 10.");
  const [lastGain, setLastGain] = useState(0);

  // Site-standard sound effects: start cue, selection tick, score blip, win/lose jingles
  useGameSounds({
    started: !loading,
    won: result === "win",
    lost: result === "lose",
    score,
    tick: selected.length,
  });

  const multiplier = useMemo(() => multiplierValue(combo), [combo]);
  const progress = Math.min(100, Math.round((score / WIN_SCORE) * 100));
  const selectedTotal = selected.reduce((sum, item) => sum + item.value, 0);

  useEffect(() => {
    if (loading || gameOver || result) return undefined;

    const interval = window.setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setResult("lose");
          setGameOver(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [gameOver, loading, result]);

  useEffect(() => {
    if (score > best) {
      setBest(score);
    }

    if (score >= WIN_SCORE && !result) {
      setResult("win");
      setGameOver(true);
      setMessage("Target crushed. Winner result unlocked.");
    }
  }, [best, result, score]);

  const handleSelect = (row, col, value) => {
    if (gameOver || result) return;

    const exists = selected.find((item) => item.row === row && item.col === col);

    if (exists) {
      setSelected(selected.filter((item) => !(item.row === row && item.col === col)));
      setMessage("Selection removed. Build a sum of 10.");
      return;
    }

    if (selected.length >= 2) return;

    const updated = [...selected, { row, col, value }];
    setSelected(updated);
    setMessage(updated.length === 1 ? `${value} selected. Pick its partner.` : "Checking pair...");

    if (updated.length === 2) {
      const total = updated[0].value + updated[1].value;

      if (total === 10) {
        window.setTimeout(() => {
          const newGrid = grid.map((line) => [...line]);
          const nextCombo = combo + 1;
          const gain = 10 * multiplierValue(nextCombo);

          updated.forEach((cell) => {
            newGrid[cell.row][cell.col] = Math.floor(Math.random() * 9) + 1;
          });

          setGrid(newGrid);
          setScore((prev) => prev + gain);
          setCombo(nextCombo);
          setLastGain(gain);
          setMessage(`Perfect 10. +${gain} points. Combo x${multiplierValue(nextCombo)}.`);
          setSelected([]);
        }, 180);
      } else {
        window.setTimeout(() => {
          setCombo(0);
          setLastGain(0);
          setSelected([]);
          setMessage(`${total} is not 10. Combo reset.`);
        }, 360);
      }
    }
  };

  const restartGame = () => {
    setGrid(generateGrid());
    setSelected([]);
    setScore(0);
    setCombo(0);
    setTimer(GAME_TIME);
    setGameOver(false);
    setResult(null);
    setMessage("Select two numbers that add up to 10.");
    setLastGain(0);
  };

  if (loading) {
    return <Loader onDone={() => setLoading(false)} />;
  }

  return (
    <main className="relative h-full w-full overflow-y-auto rounded-xl bg-[#070914] p-3 font-sans text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_12%,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_84%_18%,rgba(244,63,94,0.22),transparent_28%),linear-gradient(135deg,#070914,#11182c_52%,#0a0714)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:44px_44px]" />

      <section className="mx-auto grid h-full max-w-7xl grid-cols-[300px_minmax(0,1fr)] gap-3 max-lg:grid-cols-1">
        <aside className="grid min-h-0 grid-rows-[auto_auto_1fr_auto] gap-3 rounded-lg border border-white/10 bg-white/[0.07] p-4 shadow-[0_22px_80px_rgba(0,0,0,0.30)] backdrop-blur-xl max-lg:grid-rows-none max-lg:grid-cols-[1fr_auto] max-md:grid-cols-1">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-cyan-300 text-2xl font-black text-slate-950 shadow-[0_14px_45px_rgba(34,211,238,0.24)]">
              10
            </div>
            <div className="min-w-0">
              <h1 className="m-0 text-2xl font-black leading-none">Find 10</h1>
              <p className="m-0 mt-1 text-xs font-bold uppercase tracking-[0.16em] text-white/40">
                Number match arena
              </p>
            </div>
          </div>

          <div className="rounded-md bg-black/25 p-3 max-lg:row-span-2">
            <div className="mb-2 flex justify-between text-xs font-black uppercase tracking-[0.12em] text-white/40">
              <span>Target</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-rose-400"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="m-0 mt-3 text-sm font-bold leading-5 text-white/70">{message}</p>
          </div>

          <div className="grid content-start gap-3 max-lg:hidden">
            <h2 className="m-0 text-sm font-black uppercase tracking-[0.16em] text-cyan-200">
              How To Score
            </h2>
            {[
              ["01", "Select any two numbers on the board."],
              ["02", "If the total is exactly 10, both cells refresh."],
              ["03", "Correct chains increase the score multiplier."],
              ["04", `Reach ${WIN_SCORE} before time ends to win.`],
            ].map(([step, text]) => (
              <div key={step} className="grid grid-cols-[34px_1fr] gap-3 rounded-md bg-black/20 p-3">
                <span className="font-black text-cyan-200">{step}</span>
                <p className="m-0 text-sm font-bold leading-5 text-white/60">{text}</p>
              </div>
            ))}
          </div>

          <button
            onClick={restartGame}
            className="min-h-12 rounded-md bg-cyan-300 px-4 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
            type="button"
          >
            New Game
          </button>
        </aside>

        <section className="grid min-h-0 grid-rows-[auto_1fr] gap-3 rounded-lg border border-white/10 bg-white/[0.07] p-3 shadow-[0_24px_90px_rgba(0,0,0,0.34)] backdrop-blur-xl">
          <header className="grid grid-cols-[1fr_auto] items-center gap-3 max-md:grid-cols-1">
            <div>
              <p className="m-0 text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
                Match two cells
              </p>
              <h2 className="m-0 text-[clamp(1.5rem,3vw,2.5rem)] font-black leading-tight">
                Make the sum exactly 10
              </h2>
            </div>

            <div className="grid grid-cols-5 gap-2 max-sm:grid-cols-3">
              <Stat label="Score" value={score} />
              <Stat label="Best" value={best} />
              <Stat label="Time" value={`${timer}s`} danger={timer <= 10} />
              <Stat label="Combo" value={`x${multiplier}`} />
              <Stat label="Pick" value={selectedTotal || "-"} />
            </div>
          </header>

          <div className="grid min-h-0 place-items-center overflow-hidden rounded-lg bg-[#0b1020] p-3">
            <div className="grid aspect-square h-full max-h-full max-w-full grid-cols-8 gap-2 sm:gap-3">
              {grid.map((row, rowIndex) =>
                row.map((num, colIndex) => {
                  const isSelected = selected.find(
                    (item) => item.row === rowIndex && item.col === colIndex,
                  );

                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleSelect(rowIndex, colIndex, num)}
                      className={[
                        "relative grid aspect-square min-h-0 place-items-center overflow-hidden rounded-md border text-[clamp(1rem,3.5vw,2.2rem)] font-black transition duration-200",
                        isSelected
                          ? "scale-105 border-white bg-gradient-to-br from-cyan-300 to-rose-300 text-slate-950 shadow-[0_0_34px_rgba(255,255,255,0.35)]"
                          : "border-white/10 bg-white/[0.06] text-white hover:border-cyan-200/50 hover:bg-white/10",
                      ].join(" ")}
                      type="button"
                    >
                      <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 to-transparent" />
                      <span className="relative z-10">{num}</span>
                    </button>
                  );
                }),
              )}
            </div>
          </div>
        </section>
      </section>

      {lastGain > 0 && !gameOver && (
        <div className="pointer-events-none absolute right-6 top-24 rounded-md bg-emerald-300 px-4 py-3 text-sm font-black text-emerald-950 shadow-[0_18px_45px_rgba(52,211,153,0.22)]">
          +{lastGain} POINTS
        </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-[470px] rounded-lg border border-white/10 bg-[#0b1220] p-6 text-center shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
            <p className="m-0 text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
              {result === "win" ? "Winner" : "Loser"}
            </p>
            <h1 className="m-0 mt-3 text-[clamp(2.5rem,8vw,4.8rem)] font-black leading-none">
              {result === "win" ? "You Won" : "Time Up"}
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-sm font-bold leading-6 text-white/60">
              {result === "win"
                ? `Final score ${score}. Rank: ${rankFor(score)}. Combo peak x${multiplier}.`
                : `Final score ${score}. Rank: ${rankFor(score)}. Target was ${WIN_SCORE}.`}
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <Stat label="Score" value={score} />
              <Stat label="Best" value={best} />
              <Stat label="Combo" value={`x${multiplier}`} />
            </div>

            <button
              onClick={restartGame}
              className="mt-5 min-h-12 w-full rounded-md bg-cyan-300 px-4 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
              type="button"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

function Stat({ label, value, danger = false }) {
  return (
    <div
      className={[
        "min-w-[72px] rounded-md px-3 py-2 text-center",
        danger ? "bg-rose-500 text-white" : "bg-black/25 text-white",
      ].join(" ")}
    >
      <div
        className={[
          "text-[10px] font-black uppercase tracking-[0.12em]",
          danger ? "text-white" : "text-white/40",
        ].join(" ")}
      >
        {label}
      </div>
      <div className="mt-0.5 truncate text-base font-black leading-none">{value}</div>
    </div>
  );
}

export default Find;
