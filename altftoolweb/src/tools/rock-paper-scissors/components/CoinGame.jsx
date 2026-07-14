"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Play, Square } from "lucide-react";

import { coinFace, nowLabel } from "../utils/game";
import { playSound, resumeAudio } from "../utils/sound";
import { loadValue, saveValue } from "../utils/storage";
import Coin, { COIN_DESIGNS } from "./Coin";
import StatsPanel from "./StatsPanel";

const LS_STATS = "coin.stats";
const LS_SOUND = "coin.sound";
const LS_DESIGN = "coin.design";
const LS_HISTORY = "coin.history";

const EMPTY_STATS = {
  heads: 0,
  tails: 0,
  total: 0,
  streak: 0,
  longest: 0,
  predictedWins: 0,
  predictedTotal: 0,
};

function designById(id) {
  return COIN_DESIGNS.find((d) => d.id === id) || COIN_DESIGNS[0];
}

function persistStats(next) {
  try {
    saveValue(LS_STATS, next);
  } catch {
    /* ignore */
  }
}

function persistHistory(next) {
  try {
    saveValue(LS_HISTORY, next);
  } catch {
    /* ignore */
  }
}

export default function CoinGame({ onBack }) {
  const [hydrated, setHydrated] = useState(false);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [soundOn, setSoundOn] = useState(true);
  const [design, setDesign] = useState(COIN_DESIGNS[0].id);
  const [history, setHistory] = useState([]);

  const [prediction, setPrediction] = useState(null);
  const [face, setFace] = useState("heads");
  const [rotation, setRotation] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [autoFlip, setAutoFlip] = useState(false);

  const busyRef = useRef(false);
  const autoRef = useRef(null);
  const flipRef = useRef(null);

  useEffect(() => {
    const mark = () => setHydrated(true);
    mark();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const load = () => {
      try {
        const s = loadValue(LS_STATS, null);
        if (s) setStats({ ...EMPTY_STATS, ...s });
        const snd = loadValue(LS_SOUND, null);
        if (snd !== null) setSoundOn(!!snd);
        const dg = loadValue(LS_DESIGN, null);
        if (dg) setDesign(dg);
        const h = loadValue(LS_HISTORY, null);
        if (Array.isArray(h)) setHistory(h);
      } catch {
        /* ignore */
      }
    };
    load();
  }, [hydrated]);

  const sfx = useCallback((kind) => {
    if (soundOn) playSound(kind);
  }, [soundOn]);

  const doFlip = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    setFlipping(true);
    resumeAudio();
    sfx("flip");

    const result = coinFace();
    const want = result === "heads" ? 0 : 180;
    setRotation((prev) => {
      const currentParity = (((prev % 360) + 360) % 360) >= 180 ? 180 : 0;
      const delta = 1800 + (((want - currentParity) % 360) + 360) % 360;
      const target = prev + delta;
      return target;
    });
    setFace(result);

    setTimeout(() => {
      setFlipping(false);
      busyRef.current = false;

      const pred = prediction;
      setStats((prev) => {
        const next = { ...prev };
        next.total += 1;
        if (result === "heads") next.heads += 1;
        else next.tails += 1;
        if (pred) {
          next.predictedTotal += 1;
          if (pred === result) {
            next.predictedWins += 1;
            next.streak += 1;
            next.longest = Math.max(next.longest, next.streak);
          } else {
            next.streak = 0;
          }
        }
        persistStats(next);
        return next;
      });

      const time = nowLabel();
      setHistory((prev) => {
        const item = {
          face: result,
          prediction: pred,
          win: pred ? pred === result : null,
          time,
        };
        const next = [item, ...prev].slice(0, 30);
        persistHistory(next);
        return next;
      });

      setPrediction(null);
    }, 1150);
  }, [sfx, prediction]);

  useEffect(() => {
    flipRef.current = doFlip;
  }, [doFlip]);

  // Auto-flip interval.
  useEffect(() => {
    if (autoFlip) {
      const run = () => {
        autoRef.current = setInterval(() => flipRef.current(), 1200);
      };
      run();
    }
    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
    };
  }, [autoFlip]);

  const toggleAuto = () => setAutoFlip((p) => !p);

  const resetStats = () => {
    const next = { ...EMPTY_STATS };
    setStats(next);
    persistStats(next);
    setHistory([]);
    persistHistory([]);
    sfx("click");
  };

  const toggleSound = () => {
    setSoundOn((prev) => {
      const next = !prev;
      try {
        saveValue(LS_SOUND, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const changeDesign = (id) => {
    setDesign(id);
    try {
      saveValue(LS_DESIGN, id);
    } catch {
      /* ignore */
    }
  };

  const predictedRate =
    stats.predictedTotal > 0
      ? Math.round((stats.predictedWins / stats.predictedTotal) * 100)
      : 0;

  const statsRow = [
    { label: "Heads", value: stats.heads, accent: true },
    { label: "Tails", value: stats.tails },
    { label: "Total", value: stats.total },
    { label: "Pred. win %", value: `${predictedRate}%` },
    { label: "Streak", value: stats.streak },
    { label: "Best streak", value: stats.longest },
  ];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Header onBack={onBack} soundOn={soundOn} onToggleSound={toggleSound} />

      <StatsPanel stats={statsRow} />

      {/* Prediction + coin */}
      <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-sm">
        <p className="mb-3 text-center text-sm font-medium text-(--muted-foreground)">
          Predict the outcome, then flip:
        </p>
        <div className="mb-5 flex items-center justify-center gap-3">
          {["heads", "tails"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPrediction(p)}
              disabled={flipping}
              className={`rounded-xl border px-5 py-2 text-sm font-semibold capitalize transition active:scale-95 disabled:opacity-50 ${
                prediction === p
                  ? "border-(--primary) bg-(--primary)/10 text-(--primary)"
                  : "border-(--border) text-(--foreground) hover:bg-(--muted)"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-5">
          <Coin
            face={face}
            rotation={rotation}
            design={designById(design)}
            spinning={flipping}
          />
          <div className="text-sm font-semibold text-(--foreground)">
            {flipping ? "Flipping…" : `Last: ${face}`}
            {prediction && !flipping && (
              <span className="ml-2 text-(--muted-foreground)">
                (you picked {prediction})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Designs */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {COIN_DESIGNS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => changeDesign(d.id)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition active:scale-95 ${
              design === d.id
                ? "border-(--primary) bg-(--primary)/10 text-(--primary)"
                : "border-(--border) text-(--muted-foreground) hover:bg-(--muted)"
            }`}
          >
            <span className={`h-4 w-4 rounded-full ${d.heads}`} />
            {d.name}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={doFlip}
          disabled={flipping || autoFlip}
          className="inline-flex items-center gap-2 rounded-xl bg-(--primary) px-5 py-2.5 text-sm font-semibold text-(--primary-foreground) transition hover:opacity-90 active:scale-95 disabled:opacity-50"
        >
          <Play size={16} /> Flip
        </button>
        <button
          type="button"
          onClick={toggleAuto}
          className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition active:scale-95 ${
            autoFlip
              ? "border-(--primary) bg-(--primary)/10 text-(--primary)"
              : "border-(--border) text-(--foreground) hover:bg-(--muted)"
          }`}
        >
          {autoFlip ? <Square size={16} /> : <Play size={16} />} Auto Flip
        </button>
        <button
          type="button"
          onClick={resetStats}
          className="inline-flex items-center gap-2 rounded-xl border border-(--border) px-4 py-2.5 text-sm font-semibold text-(--foreground) transition hover:bg-(--muted) active:scale-95"
        >
          <RotateCcw size={16} /> Reset
        </button>
      </div>

      {/* History */}
      <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-(--muted-foreground)">
          History (latest first)
        </h3>
        {history.length === 0 ? (
          <div className="flex h-24 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-(--border) text-(--muted-foreground)">
            <Play size={22} />
            <p className="text-sm">Flip the coin to build history.</p>
          </div>
        ) : (
          <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto">
            {history.map((h, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-xl border border-(--border) bg-(--background) px-4 py-2 text-sm"
              >
                <span className="flex items-center gap-2 font-semibold capitalize text-(--foreground)">
                  <span
                    className={`h-3 w-3 rounded-full ${
                      h.face === "heads" ? "bg-(--primary)" : "bg-cyan-400"
                    }`}
                  />
                  {h.face}
                </span>
                {h.prediction ? (
                  <span
                    className={
                      h.win ? "text-(--primary)" : "text-(--muted-foreground)"
                    }
                  >
                    picked {h.prediction} · {h.win ? "won" : "lost"}
                  </span>
                ) : (
                  <span className="text-(--muted-foreground)">no prediction</span>
                )}
                <span className="text-xs text-(--muted-foreground)">{h.time}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Header({ onBack, soundOn, onToggleSound }) {
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-xl border border-(--border) px-3 py-2 text-sm font-semibold text-(--muted-foreground) transition hover:bg-(--muted) active:scale-95"
      >
        <ArrowLeft size={16} /> Menu
      </button>
      <span className="text-sm font-semibold text-(--primary)">Flip Coin</span>
      <button
        type="button"
        onClick={onToggleSound}
        aria-label={soundOn ? "Mute sound" : "Unmute sound"}
        className="inline-flex items-center justify-center rounded-xl border border-(--border) p-2 text-(--muted-foreground) transition hover:bg-(--muted) active:scale-95"
      >
        {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>
    </div>
  );
}
