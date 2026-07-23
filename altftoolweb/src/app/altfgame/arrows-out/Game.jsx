"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useGameSounds } from "@/app/altfgame/_lib/sounds";

const SIZE = 15;
const START = { x: 1, y: 1 };
const EXIT = { x: 13, y: 13 };
const GAME_TIME = 120;

const maze = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

function rankFor(moves, time) {
  if (moves <= 36 && time >= 80) return "S-Rank Escape";
  if (moves <= 48 && time >= 55) return "Neon Runner";
  if (moves <= 65) return "Maze Breaker";
  return "Survivor";
}

function Loader({ onDone }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setPhase((value) => Math.min(value + 1, 4));
    }, 200);
    const done = window.setTimeout(onDone, 1200);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(done);
    };
  }, [onDone]);

  const arrows = [
    ["top-8 left-1/2 -translate-x-1/2", "translate-y-[34vh]", "v"],
    ["bottom-8 left-1/2 -translate-x-1/2", "-translate-y-[34vh]", "^"],
    ["left-8 top-1/2 -translate-y-1/2", "translate-x-[38vw]", ">"],
    ["right-8 top-1/2 -translate-y-1/2", "-translate-x-[38vw]", "<"],
    ["left-[14%] top-[18%]", "translate-x-[28vw] translate-y-[24vh]", ">"],
    ["right-[14%] bottom-[18%]", "-translate-x-[28vw] -translate-y-[24vh]", "<"],
  ];

  return (
    <main className="relative grid h-full w-full overflow-hidden rounded-xl bg-[#060812] px-4 py-6 font-sans text-white">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#060812,#10172a_50%,#080711)]" />
      <div className="absolute inset-0 opacity-[0.10] [background-image:linear-gradient(rgba(34,211,238,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(244,114,182,0.8)_1px,transparent_1px)] [background-size:38px_38px]" />

      <section className="relative z-10 grid place-items-center">
        {arrows.map(([position, travel, arrow], index) => (
          <div
            key={`${position}-${arrow}`}
            className={[
              "absolute grid h-16 w-16 place-items-center rounded-lg border border-white/10 bg-white/10 text-4xl font-black text-cyan-200 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur transition duration-700",
              position,
              phase > index % 3 ? travel : "",
            ].join(" ")}
          >
            {arrow}
          </div>
        ))}

        <div className="grid place-items-center text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-lg border border-cyan-200/20 bg-cyan-300 text-4xl font-black text-slate-950 shadow-[0_24px_80px_rgba(34,211,238,0.28)]">
            →
          </div>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.3em] text-cyan-200">
            Direction system online
          </p>
          <h1 className="m-0 text-[clamp(1.6rem,4.5vw,2.8rem)] font-black leading-none tracking-normal">
            {phase >= 3 ? "Loading" : "Arrows Out"}
          </h1>
          <div className="mx-auto mt-6 w-[min(560px,82vw)] rounded-full border border-white/10 bg-white/10 p-1">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-300 via-white to-rose-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (phase + 1) * 24)}%` }}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

const Arrow = () => {
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState(START);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(GAME_TIME);
  const [bumps, setBumps] = useState(0);
  const [message, setMessage] = useState("Reach the exit before the timer hits zero.");

  // Site-standard sound effects: move ticks, wall-bump thud, win/lose jingles
  useGameSounds({
    started: !loading,
    won,
    lost,
    score: bumps,
    tick: moves,
    sounds: { point: "hit" },
  });

  const distance = Math.abs(EXIT.x - player.x) + Math.abs(EXIT.y - player.y);
  const progress = useMemo(() => {
    const startDistance = Math.abs(EXIT.x - START.x) + Math.abs(EXIT.y - START.y);
    return Math.max(0, Math.round(((startDistance - distance) / startDistance) * 100));
  }, [distance]);

  useEffect(() => {
    if (loading || won || lost) return undefined;

    const timer = window.setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          setLost(true);
          setMessage("Time expired. The maze locked down.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [loading, lost, won]);

  function movePlayer(dx, dy) {
    if (won || lost || time <= 0) return;

    setPlayer((current) => {
      const nx = current.x + dx;
      const ny = current.y + dy;

      if (nx < 0 || ny < 0 || nx >= SIZE || ny >= SIZE || maze[ny][nx] === 1) {
        setBumps((value) => value + 1);
        setMessage("Wall hit. Find a cleaner route.");
        return current;
      }

      setMoves((prev) => prev + 1);
      setMessage("Good move. Keep flowing.");

      if (nx === EXIT.x && ny === EXIT.y) {
        setWon(true);
        setMessage("Exit reached. Winner result unlocked.");
      }

      return { x: nx, y: ny };
    });
  }

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        movePlayer(0, -1);
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        movePlayer(0, 1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        movePlayer(-1, 0);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        movePlayer(1, 0);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lost, time, won]);

  const restartGame = () => {
    setPlayer(START);
    setMoves(0);
    setWon(false);
    setLost(false);
    setTime(GAME_TIME);
    setBumps(0);
    setMessage("Reach the exit before the timer hits zero.");
  };

  if (loading) {
    return <Loader onDone={() => setLoading(false)} />;
  }

  return (
    <main className="relative h-full w-full overflow-y-auto rounded-xl bg-[#070914] p-3 font-sans text-white">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,#070914,#11182c_54%,#080713)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(34,211,238,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(244,114,182,0.75)_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="mx-auto grid h-full max-w-7xl grid-rows-[auto_1fr] gap-3">
        <header className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-white/[0.07] px-4 py-3 shadow-[0_20px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl max-md:grid-cols-1">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-cyan-300 text-3xl font-black text-slate-950">
              →
            </div>
            <div className="min-w-0">
              <h1 className="m-0 truncate text-xl font-black leading-none">
                Arrows Out: Neon Maze
              </h1>
              <p className="m-0 mt-1 truncate text-xs font-bold uppercase tracking-[0.16em] text-white/40">
                Keyboard or touch controls
              </p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 max-sm:grid-cols-3">
            <Stat label="Time" value={`${time}s`} danger={time <= 15} />
            <Stat label="Moves" value={moves} />
            <Stat label="Bumps" value={bumps} />
            <Stat label="Exit" value={`${progress}%`} />
            <button
              onClick={restartGame}
              className="min-w-[82px] rounded-md bg-cyan-300 px-3 py-2 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
              type="button"
            >
              Reset
            </button>
          </div>
        </header>

        <section className="grid min-h-0 grid-cols-[280px_minmax(0,1fr)_230px] gap-3 max-xl:grid-cols-[240px_minmax(0,1fr)] max-lg:grid-cols-1">
          <aside className="grid min-h-0 content-start gap-3 rounded-lg border border-white/10 bg-white/[0.07] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl max-lg:hidden">
            <div>
              <p className="m-0 text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
                Escape Brief
              </p>
              <h2 className="m-0 mt-2 text-[clamp(2.2rem,4vw,3.6rem)] font-black leading-none">
                Arrows Out
              </h2>
            </div>
            <p className="m-0 rounded-md bg-black/25 p-3 text-sm font-bold leading-6 text-white/60">
              Navigate the maze, avoid wall bumps, and reach the green exit before lockdown.
            </p>
            {[
              ["Goal", "Reach the exit tile"],
              ["Controls", "Arrow keys or touch pad"],
              ["Mode", "Hard neon route"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-white/10 bg-black/20 p-3">
                <p className="m-0 text-xs font-black uppercase tracking-[0.14em] text-white/40">
                  {label}
                </p>
                <p className="m-0 mt-1 text-sm font-black text-white">{value}</p>
              </div>
            ))}
          </aside>

          <section className="grid min-h-0 grid-rows-[auto_1fr_auto] rounded-lg border border-white/10 bg-white/[0.07] p-3 shadow-[0_24px_90px_rgba(0,0,0,0.34)] backdrop-blur-xl">
            <div className="mb-3 grid grid-cols-[1fr_auto] items-center gap-3 max-md:grid-cols-1">
              <div>
                <p className="m-0 text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
                  Live Maze
                </p>
                <h2 className="m-0 text-[clamp(1.35rem,3vw,2.3rem)] font-black leading-tight">
                  Reach the portal
                </h2>
              </div>
              <div className="max-w-md rounded-md bg-black/30 px-3 py-2 text-sm font-bold leading-5 text-white/70">
                {message}
              </div>
            </div>

            <div className="grid min-h-0 place-items-center overflow-hidden rounded-lg bg-[#08101e] p-3">
              <div
                className="grid aspect-square h-full max-h-full max-w-full gap-[3px] rounded-md border border-white/10 bg-black/35 p-2 shadow-[inset_0_0_60px_rgba(34,211,238,0.08)]"
                style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
              >
                {maze.map((row, y) =>
                  row.map((cell, x) => {
                    const isPlayer = player.x === x && player.y === y;
                    const isExit = EXIT.x === x && EXIT.y === y;
                    const isStart = START.x === x && START.y === y;

                    return (
                      <div
                        key={`${x}-${y}`}
                        className={[
                          "relative grid min-h-0 place-items-center rounded-[3px] transition duration-100",
                          cell === 1
                            ? "bg-gradient-to-br from-rose-500 to-fuchsia-500 shadow-[0_0_10px_rgba(244,114,182,0.45)]"
                            : "bg-white/[0.04]",
                          isStart && cell === 0 ? "bg-cyan-950/70" : "",
                        ].join(" ")}
                      >
                        {isExit && (
                          <span className="absolute h-[58%] w-[58%] rounded-full bg-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.95)]" />
                        )}
                        {isPlayer && (
                          <span className="absolute h-[64%] w-[64%] rounded-full bg-cyan-300 shadow-[0_0_22px_rgba(34,211,238,1)] ring-2 ring-white/70" />
                        )}
                      </div>
                    );
                  }),
                )}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 md:hidden">
              <span />
              <ControlButton label="^" onClick={() => movePlayer(0, -1)} />
              <span />
              <ControlButton label="<" onClick={() => movePlayer(-1, 0)} />
              <ControlButton label="v" onClick={() => movePlayer(0, 1)} />
              <ControlButton label=">" onClick={() => movePlayer(1, 0)} />
            </div>
          </section>

          <aside className="grid min-h-0 content-start gap-3 rounded-lg border border-white/10 bg-white/[0.07] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl max-xl:hidden">
            <div>
              <p className="m-0 text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
                Route Meter
              </p>
              <h3 className="m-0 mt-1 text-3xl font-black">{progress}%</h3>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="grid gap-2">
              <ControlButton label="^" onClick={() => movePlayer(0, -1)} />
              <div className="grid grid-cols-3 gap-2">
                <ControlButton label="<" onClick={() => movePlayer(-1, 0)} />
                <ControlButton label="v" onClick={() => movePlayer(0, 1)} />
                <ControlButton label=">" onClick={() => movePlayer(1, 0)} />
              </div>
            </div>
          </aside>
        </section>
      </section>

      {(won || lost) && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-[480px] rounded-lg border border-white/10 bg-[#0b1220] p-6 text-center shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
            <p className="m-0 text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
              {won ? "Winner" : "Loser"}
            </p>
            <h1 className="m-0 mt-3 text-[clamp(2.5rem,8vw,4.8rem)] font-black leading-none">
              {won ? "Escaped" : "Locked In"}
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-sm font-bold leading-6 text-white/60">
              {won
                ? `${rankFor(moves, time)} in ${moves} moves with ${time}s left.`
                : `Time ran out after ${moves} moves and ${bumps} wall hits.`}
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <Stat label="Moves" value={moves} />
              <Stat label="Time" value={`${time}s`} />
              <Stat label="Bumps" value={bumps} />
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

function ControlButton({ label, onClick }) {
  return (
    <button
      className="min-h-11 rounded-md bg-white/10 px-4 text-lg font-black text-white transition hover:bg-cyan-300 hover:text-slate-950"
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function Stat({ label, value, danger = false }) {
  return (
    <div
      className={[
        "min-w-[82px] rounded-md px-3 py-2 text-center",
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

export default Arrow;
