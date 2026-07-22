"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ROWS,
  COLS,
  createBoard,
  cloneBoard,
  findMatches,
  swapCells,
  clearCells,
  applyGravity,
  refill,
  hasPossibleMoves,
  shuffleBoard,
} from "./board";
import { scoreForClear } from "./scoring";
import { CANDY_COUNT } from "./candies";
import { playSound } from "./sound";

export const LEVELS = [
  { level: 1, target: 500, moves: 25, time: 60 },
  { level: 2, target: 1000, moves: 22, time: 55 },
  { level: 3, target: 1500, moves: 20, time: 50 },
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const HS_KEY = "cc_highscore";
const SOUND_KEY = "cc_sound";

export function useGame() {
  // Board starts as null and is created on the client (useEffect) to avoid
  // React hydration mismatches from Math.random during SSR.
  const [board, setBoardState] = useState(null);
  const boardRef = useRef(null);

  const [score, setScoreState] = useState(0);
  const scoreRef = useRef(0);

  const [moves, setMovesState] = useState(LEVELS[0].moves);
  const movesRef = useRef(LEVELS[0].moves);

  const [time, setTimeState] = useState(LEVELS[0].time);
  const timeRef = useRef(LEVELS[0].time);

  const [levelIndex, setLevelIndexState] = useState(0);
  const levelIndexRef = useRef(0);

  const [mode, setModeState] = useState("classic"); // "classic" | "timed"
  const modeRef = useRef("classic");

  const [status, setStatusState] = useState("playing"); // playing|paused|won|lost
  const statusRef = useRef("playing");

  const [selected, setSelectedState] = useState(null);
  const selectedRef = useRef(null);

  // Set of "r,c" keys currently highlighted as a match (animated out before
  // they are actually removed from the board). `null` when nothing is clearing.
  const [clearing, setClearingState] = useState(null);

  const [resolving, setResolvingState] = useState(false);
  const resolvingRef = useRef(false);

  const [soundOn, setSoundOn] = useState(true);
  const soundRef = useRef(true);

  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);

  // ---- synced setters (ref = source of truth, state = render mirror) ----
  const setBoard = useCallback((b) => {
    boardRef.current = b;
    setBoardState(b);
  }, []);
  const addScore = useCallback((n) => {
    scoreRef.current += n;
    setScoreState(scoreRef.current);
  }, []);
  const spendMove = useCallback(() => {
    movesRef.current = Math.max(0, movesRef.current - 1);
    setMovesState(movesRef.current);
  }, []);
  const setTime = useCallback((t) => {
    const v = typeof t === "function" ? t(timeRef.current) : t;
    timeRef.current = v;
    setTimeState(v);
  }, []);
  const setLevelIndex = useCallback((i) => {
    levelIndexRef.current = i;
    setLevelIndexState(i);
  }, []);
  const setMode = useCallback((m) => {
    modeRef.current = m;
    setModeState(m);
  }, []);
  const setStatus = useCallback((s) => {
    statusRef.current = s;
    setStatusState(s);
  }, []);
  const setSelected = useCallback((s) => {
    selectedRef.current = s;
    setSelectedState(s);
  }, []);
  const setClearing = useCallback((s) => {
    setClearingState(s);
  }, []);
  const setResolving = useCallback((r) => {
    resolvingRef.current = r;
    setResolvingState(r);
  }, []);
  const setSound = useCallback((s) => {
    soundRef.current = s;
    setSoundOn(s);
  }, []);
  const sound = useCallback((kind) => {
    if (soundRef.current) playSound(kind);
  }, []);

  // ---- load persisted prefs ----
  useEffect(() => {
    try {
      const hs = Number(localStorage.getItem(HS_KEY) || 0);
      setHighScore(hs);
      const so = localStorage.getItem(SOUND_KEY);
      if (so !== null) setSound(so === "1");
    } catch {}
    // create the board on the client
    startLevel(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem(HS_KEY, String(score));
      } catch {}
    }
  }, [score, highScore]);

  // persist sound preference
  useEffect(() => {
    try {
      localStorage.setItem(SOUND_KEY, soundOn ? "1" : "0");
    } catch {}
  }, [soundOn]);

  const startLevel = useCallback(
    (idx) => {
      const lv = LEVELS[idx];
      scoreRef.current = 0;
      setScoreState(0);
      movesRef.current = lv.moves;
      setMovesState(lv.moves);
      timeRef.current = lv.time;
      setTimeState(lv.time);
      levelIndexRef.current = idx;
      setLevelIndexState(idx);
      setBoard(createBoard(ROWS, COLS));
      setStatus("playing");
      setResolving(false);
      setSelected(null);
      setClearing(null);
      setCombo(0);
    },
    [setBoard, setStatus, setResolving, setSelected, setClearing]
  );

  const resolveStep = useCallback(
    async (startBoard) => {
      let current = cloneBoard(startBoard);
      let cascade = 0;
      while (true) {
        const matches = findMatches(current);
        if (matches.size === 0) break;
        cascade += 1;
        const gained = scoreForClear(matches.size, cascade);
        addScore(gained);
        setCombo(cascade);
        // Highlight the matched candies, then animate them out before removal.
        setClearing(matches);
        sound("match");
        await delay(280);
        current = clearCells(current, matches);
        setClearing(null);
        setBoard(current);
        await delay(160);
        current = applyGravity(current);
        setBoard(current);
        await delay(160);
        current = refill(current, CANDY_COUNT);
        setBoard(current);
        await delay(160);
      }
      if (!hasPossibleMoves(current)) {
        const shuffled = shuffleBoard(ROWS, COLS, CANDY_COUNT);
        setBoard(shuffled);
        sound("swap");
        try {
          const m = await import("sonner");
          m.toast("No moves left — board shuffled!");
        } catch {}
        await delay(300);
      }
      return current;
    },
    [addScore, setBoard, setClearing, sound]
  );

  const checkEnd = useCallback(
    (finalBoard) => {
      const lv = LEVELS[levelIndexRef.current];
      if (scoreRef.current >= lv.target) {
        setStatus("won");
        sound("win");
        try {
          import("canvas-confetti").then((m) => m.default({ particleCount: 140, spread: 75, origin: { y: 0.6 } }));
        } catch {}
        return true;
      }
      if (modeRef.current === "classic" && movesRef.current <= 0) {
        setStatus("lost");
        sound("lose");
        return true;
      }
      return false;
    },
    [setStatus, sound]
  );

  const attemptSwap = useCallback(
    async (r1, c1, r2, c2) => {
      if (resolvingRef.current || statusRef.current !== "playing") return;
      const adjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
      if (!adjacent) return;

      resolvingRef.current = true;
      setResolving(true);

      let current = cloneBoard(boardRef.current);
      current = swapCells(current, { r: r1, c: c1 }, { r: r2, c: c2 });
      setBoard(current);
      await delay(220);

      if (findMatches(current).size === 0) {
        // not a valid move — swap back
        current = swapCells(current, { r: r1, c: c1 }, { r: r2, c: c2 });
        setBoard(current);
        sound("invalid");
        resolvingRef.current = false;
        setResolving(false);
        return;
      }

      sound("swap");
      spendMove();
      const finalBoard = await resolveStep(current);
      setBoard(finalBoard);
      checkEnd(finalBoard);
      resolvingRef.current = false;
      setResolving(false);
    },
    [setBoard, setResolving, spendMove, resolveStep, checkEnd, sound]
  );

  const handleSelect = useCallback(
    (r, c) => {
      if (resolvingRef.current || statusRef.current !== "playing") return;
      const sel = selectedRef.current;
      if (!sel) {
        setSelected({ r, c });
        return;
      }
      if (sel.r === r && sel.c === c) {
        setSelected(null);
        return;
      }
      const adjacent = Math.abs(sel.r - r) + Math.abs(sel.c - c) === 1;
      if (adjacent) {
        const a = sel;
        setSelected(null);
        attemptSwap(a.r, a.c, r, c);
      } else {
        setSelected({ r, c });
      }
    },
    [setSelected, attemptSwap]
  );

  const togglePause = useCallback(() => {
    if (statusRef.current === "playing") setStatus("paused");
    else if (statusRef.current === "paused") setStatus("playing");
  }, [setStatus]);

  const restart = useCallback(() => startLevel(levelIndexRef.current), [startLevel]);

  const nextLevel = useCallback(() => {
    const ni = levelIndexRef.current + 1;
    startLevel(ni < LEVELS.length ? ni : 0);
  }, [startLevel]);

  const changeMode = useCallback(
    (m) => {
      setMode(m);
      startLevel(levelIndexRef.current);
    },
    [setMode, startLevel]
  );

  // ---- timed mode countdown ----
  useEffect(() => {
    if (status !== "playing" || mode !== "timed") return;
    const id = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          if (scoreRef.current >= LEVELS[levelIndexRef.current].target) setStatus("won");
          else setStatus("lost");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [status, mode, levelIndex, setTime, setStatus]);

  return {
    ROWS,
    COLS,
    board,
    score,
    moves,
    time,
    levelIndex,
    level: LEVELS[levelIndex],
    levelsCount: LEVELS.length,
    mode,
    status,
    selected,
    resolving,
    clearing,
    soundOn,
    highScore,
    combo,
    setSound,
    handleSelect,
    attemptSwap,
    togglePause,
    restart,
    nextLevel,
    changeMode,
  };
}
