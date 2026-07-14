"use client";

// Module-level helper so the impure Math.random call stays out of the render
// scope (keeps the component idempotent for React's purity rules).
function pickRandom(list) {
  if (!list || list.length === 0) return undefined;
  return list[Math.floor(Math.random() * list.length)];
}

import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2,
  Shuffle,
  Play,
  Sparkles,
  Hand,
  Brain,
  Dices,
  EyeOff,
} from "lucide-react";

import { useCardTrick } from "../utils/useCardTrick";
import { buildDeck, shuffle } from "../utils/deck";
import {
  startPickTrick,
  startPredictTrick,
  forceCard,
  startMemoryTrick,
  guessMemory,
} from "../utils/tricks";

import Card from "../components/Card";
import Deck from "../components/Deck";
import Controls from "../components/Controls";
import Reveal from "../components/Reveal";
import ThemePicker from "../components/ThemePicker";
import Description from "../components/Description";

const MODES = [
  { key: "pick", label: "Pick a Card", icon: <Hand size={16} />, blurb: "Memorise & reveal" },
  { key: "predict", label: "Prediction", icon: <Sparkles size={16} />, blurb: "Mind reading" },
  { key: "memory", label: "Memory", icon: <Brain size={16} />, blurb: "Recall the card" },
  { key: "free", label: "Free Play", icon: <Dices size={16} />, blurb: "Shuffle & draw" },
];

function useResponsiveSize(base) {
  const [size, setSize] = useState(base);
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      const next =
        w < 480 ? Math.round(base * 0.74) : w < 768 ? Math.round(base * 0.88) : base;
      setSize(next);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [base]);
  return size;
}

function fireConfetti() {
  const colors = ["#14b8a6", "#22d3ee", "#facc15", "#f472b6", "#a78bfa"];
  confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors });
  setTimeout(
    () => confetti({ particleCount: 80, spread: 120, origin: { y: 0.4 }, colors }),
    180
  );
}

export default function ToolHome() {
  const t = useCardTrick();
  const spreadSize = useResponsiveSize(74);
  const gridSize = useResponsiveSize(58);

  const [mode, setMode] = useState("free");
  const [shuffling, setShuffling] = useState(false);

  const [pickState, setPickState] = useState(null);
  const [predictState, setPredictState] = useState(null);
  const [memoryState, setMemoryState] = useState(null);
  const [streak, setStreak] = useState(0);

  const [reveal, setReveal] = useState(null);

  const openReveal = (card, title, subtitle) => {
    setReveal({ card, title, subtitle });
    t.sfx("reveal");
    fireConfetti();
  };
  const closeReveal = () => setReveal(null);

  // ---- Shuffle (shared deck + animation) ----------------------------------
  const handleShuffle = () => {
    setShuffling(true);
    t.shuffleDeck();
    setTimeout(() => setShuffling(false), 600);
  };

  // ---- Mode switching ------------------------------------------------------
  const selectMode = (key) => {
    setMode(key);
    setPickState(null);
    setPredictState(null);
    setMemoryState(null);
    setReveal(null);
  };

  const freshDeck = () => shuffle(buildDeck());

  // ---- Pick a Card ---------------------------------------------------------
  const startPick = () => setPickState(startPickTrick(freshDeck(), 7));
  const pickMemorized = () => {
    t.sfx("flip");
    setPickState((s) => (s ? { ...s, step: "hide" } : s));
  };
  const pickChoose = (cardId) => {
    t.sfx("select");
    setPickState((s) => (s ? { ...s, step: "done", chosenId: cardId } : s));
    const card = pickState?.spread.find((c) => c.id === cardId);
    if (card) openReveal(card, "Your card!", `You picked the ${card.name}.`);
  };

  // ---- Prediction ----------------------------------------------------------
  const startPredict = () =>
    setPredictState({ ...startPredictTrick(freshDeck(), 6), step: "intro" });
  const predictChoose = (cardId) => {
    setPredictState((s) => (s ? forceCard(s, cardId) : s));
    t.sfx("select");
    const card = predictState?.prediction;
    if (card) {
      setTimeout(
        () =>
          openReveal(
            card,
            "I knew it!",
            `Your card was the ${card.name} — exactly as I predicted.`
          ),
        450
      );
    }
  };

  // ---- Memory --------------------------------------------------------------
  const startMemory = () => {
    setMemoryState(startMemoryTrick(freshDeck(), 8));
    setMode("memory");
  };
  const memoryGuess = (cardId) => {
    if (!memoryState || memoryState.step !== "find") return;
    const next = guessMemory(memoryState, cardId);
    setMemoryState(next);
    if (next.solved) {
      t.sfx("win");
      const newStreak = streak + 1;
      setStreak(newStreak);
      t.recordScore(newStreak);
      setTimeout(
        () => openReveal(next.target, "Found it!", `Correct! Streak: ${newStreak}.`),
        350
      );
    } else {
      t.sfx("error");
      toast.error("Not quite — study the spread and try again.");
    }
  };

  // Auto-advance memory "show" -> "find" after a brief study window.
  useEffect(() => {
    if (mode === "memory" && memoryState?.step === "show") {
      const id = setTimeout(
        () => setMemoryState((s) => (s ? { ...s, step: "find" } : s)),
        2600
      );
      return () => clearTimeout(id);
    }
  }, [mode, memoryState?.step]);

  // ---- Free play -----------------------------------------------------------
  const freeRandom = () => {
    const deck = t.remaining ? t.deck : freshDeck();
    const card = pickRandom(deck);
    if (card) openReveal(card, "Random card", `The fates reveal the ${card.name}.`);
  };

  const resetAll = () => {
    setPickState(null);
    setPredictState(null);
    setMemoryState(null);
    setReveal(null);
    setStreak(0);
    t.resetDeck();
  };

  const replayLabel = mode === "pick" ? "New spread" : mode === "predict" ? "New prediction" : mode === "memory" ? "New round" : null;
  const onReplay = mode === "pick" ? startPick : mode === "predict" ? startPredict : mode === "memory" ? startMemory : null;

  // ---- Render helpers ------------------------------------------------------
  const fanStyle = (i, n) => ({
    rotate: (i - (n - 1) / 2) * 4,
    marginLeft: i === 0 ? 0 : -spreadSize * 0.18,
    zIndex: i,
  });

  return (
    <div className="min-h-screen bg-(--background) p-4 text-(--foreground) md:p-8">
      <Toaster position="top-center" richColors />

      {/* Hero */}
      <div className="mb-6 pt-6 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-(--primary)/30 bg-(--primary)/10 px-4 py-1.5 text-xs font-semibold text-(--primary)">
          <Wand2 size={14} />
          Interactive Magic
        </div>
        <h1 className="section-title tool-heading-accent">Card Trick</h1>
        <p className="description mx-auto mt-3 max-w-xl text-(--muted-foreground)">
          Shuffle, draw, pick a card, and watch a dramatic magic reveal — with
          smooth animations, sound, and confetti.
        </p>
      </div>

      {/* Mode tabs */}
      <div className="mx-auto mb-6 flex max-w-2xl flex-wrap items-center justify-center gap-2">
        {MODES.map((m) => {
          const active = mode === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => selectMode(m.key)}
              aria-pressed={active}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition active:scale-95 ${
                active
                  ? "border-(--primary) bg-(--primary) text-(--primary-foreground) shadow-sm"
                  : "border-(--border) text-(--muted-foreground) hover:bg-(--muted)"
              }`}
            >
              {m.icon}
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Stage */}
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {mode === "free" && (
              <FreePlay
                deck={t}
                shuffleAnim={shuffling}
                onShuffle={handleShuffle}
                onRandom={freeRandom}
                cardSize={spreadSize}
              />
            )}

            {mode === "pick" && (
              <PickStage
                state={pickState}
                onStart={startPick}
                onMemorized={pickMemorized}
                onChoose={pickChoose}
                theme={t.theme}
                cardSize={spreadSize}
                fanStyle={fanStyle}
              />
            )}

            {mode === "predict" && (
              <PredictStage
                state={predictState}
                onStart={startPredict}
                onBegin={() => setPredictState((s) => (s ? { ...s, step: "choose" } : s))}
                onChoose={predictChoose}
                theme={t.theme}
                cardSize={spreadSize}
                fanStyle={fanStyle}
              />
            )}

            {mode === "memory" && (
              <MemoryStage
                state={memoryState}
                onStart={startMemory}
                onGuess={memoryGuess}
                theme={t.theme}
                cardSize={gridSize}
                streak={streak}
                best={t.highScore}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <Controls
          actions={controlActions({
            mode,
            deck: t,
            onShuffle: handleShuffle,
            onDraw1: () => t.draw(1),
            onDraw5: () => t.draw(5),
            onRandom: freeRandom,
          })}
          soundOn={t.soundOn}
          onToggleSound={t.toggleSound}
          onReset={resetAll}
          onReplay={onReplay}
          replayLabel={replayLabel}
        />

        <ThemePicker theme={t.theme} onChange={t.changeTheme} />
      </div>

      <Description />

      <Reveal
        open={!!reveal}
        card={reveal?.card}
        theme={t.theme}
        title={reveal?.title}
        subtitle={reveal?.subtitle}
        onClose={closeReveal}
      />
    </div>
  );
}

// Build the contextual action buttons for the control bar.
function controlActions({ mode, deck, onShuffle, onDraw1, onDraw5, onRandom }) {
  if (mode === "free") {
    return [
      { key: "shuffle", label: "Shuffle", icon: <Shuffle size={16} />, onClick: onShuffle, variant: "outline" },
      { key: "draw1", label: "Draw 1", icon: <Play size={16} />, onClick: onDraw1, disabled: deck.remaining === 0 },
      { key: "draw5", label: "Draw 5", icon: <Play size={16} />, onClick: onDraw5, disabled: deck.remaining === 0 },
      { key: "random", label: "Random card", icon: <Sparkles size={16} />, onClick: onRandom },
    ];
  }
  if (mode === "pick" || mode === "predict" || mode === "memory") {
    return [
      { key: "shuffle", label: "Shuffle deck", icon: <Shuffle size={16} />, onClick: onShuffle, variant: "outline" },
    ];
  }
  return [];
}

// ---- Free play stage -------------------------------------------------------
function FreePlay({ deck, shuffleAnim, onShuffle, onRandom, cardSize }) {
  return (
    <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
      <div className="flex flex-col items-center gap-3">
        <Deck
          count={deck.remaining}
          theme={deck.theme}
          shuffling={shuffleAnim}
          size={cardSize}
          onShuffle={onShuffle}
        />
        <button
          type="button"
          onClick={onRandom}
          className="rounded-xl bg-(--primary) px-4 py-2 text-sm font-semibold text-(--primary-foreground) transition hover:opacity-90 active:scale-95"
        >
          <Sparkles size={14} className="mr-1.5 inline" />
          Reveal random
        </button>
      </div>

      <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-(--muted-foreground)">
          Drawn cards ({deck.drawn.length})
        </h3>
        {deck.drawn.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-(--border) text-(--muted-foreground)">
            <Play size={28} />
            <p className="text-sm">Draw cards from the deck to begin.</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-3">
            <AnimatePresence>
              {deck.drawn.map((c, i) => (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: -20, rotateY: 180 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                >
                  <Card card={c} faceUp theme={deck.theme} size={cardSize} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Pick a card stage -----------------------------------------------------
function PickStage({ state, onStart, onMemorized, onChoose, theme, cardSize, fanStyle }) {
  if (!state) {
    return (
      <StageIntro
        title="Pick a Card"
        text="Memorise one card from the spread. It will turn face down, then you tap it for a magical reveal."
        cta="Deal the cards"
        onStart={onStart}
      />
    );
  }

  const faceUp = state.step === "memorize";

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-sm font-medium text-(--muted-foreground)">
        {faceUp
          ? "Memorise ONE card…"
          : state.step === "done"
          ? "Ta-da! Your chosen card:"
          : "Now tap the card you memorised."}
      </p>

      <div className="flex flex-wrap items-end justify-center" style={{ minHeight: cardSize * 1.5 }}>
        {state.spread.map((c, i) => {
          const isChosen = state.chosenId === c.id;
          return (
            <motion.div key={c.id} style={fanStyle(i, state.spread.length)} layout>
              <Card
                card={c}
                faceUp={faceUp || isChosen}
                theme={theme}
                size={cardSize}
                disabled={!faceUp && (state.step !== "hide" || isChosen)}
                highlight={isChosen}
                onClick={() => state.step === "hide" && onChoose(c.id)}
                ariaLabel={faceUp ? `Card ${c.name}` : "Face-down card — tap to select"}
              />
            </motion.div>
          );
        })}
      </div>

      {state.step === "memorize" && (
        <button
          type="button"
          onClick={onMemorized}
          className="rounded-xl bg-(--primary) px-6 py-2.5 font-semibold text-(--primary-foreground) transition hover:opacity-90 active:scale-95"
        >
          <EyeOff size={16} className="mr-1.5 inline" /> I memorised it
        </button>
      )}
    </div>
  );
}

// ---- Prediction stage ------------------------------------------------------
function PredictStage({ state, onStart, onBegin, onChoose, theme, cardSize, fanStyle }) {
  if (!state) {
    return (
      <StageIntro
        title="The Prediction"
        text="I will seal a prediction, then you choose a card. Watch as your choice matches my prediction exactly."
        cta="Begin the prediction"
        onStart={onStart}
      />
    );
  }

  if (state.step === "intro") {
    return (
      <div className="flex flex-col items-center gap-5">
        <p className="text-sm font-medium text-(--muted-foreground)">
          A prediction is sealed. Choose a card to test my mind.
        </p>
        <div className="flex items-center gap-4">
          <Card card={null} faceUp={false} theme={theme} size={cardSize * 1.2} />
          <span className="text-2xl text-(--primary)">→</span>
          <Card card={state.prediction} faceUp={false} theme={theme} size={cardSize * 1.2} highlight />
        </div>
          <button
            type="button"
            onClick={onBegin}
            className="rounded-xl bg-(--primary) px-6 py-2.5 font-semibold text-(--primary-foreground) transition hover:opacity-90 active:scale-95"
          >
            <Play size={16} className="mr-1.5 inline" /> Reveal the test
          </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-sm font-medium text-(--muted-foreground)">
        Choose any card — the prediction already knows.
      </p>
      <div className="flex flex-wrap items-end justify-center" style={{ minHeight: cardSize * 1.5 }}>
        {state.spread.map((c, i) => {
          const isChosen = state.chosenId === c.id;
          return (
            <motion.div key={c.id} style={fanStyle(i, state.spread.length)} layout>
              <Card
                card={c}
                faceUp={isChosen}
                theme={theme}
                size={cardSize}
                disabled={state.step !== "choose" || isChosen}
                highlight={isChosen}
                onClick={() => state.step === "choose" && onChoose(c.id)}
                ariaLabel="Face-down card — tap to choose"
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Memory stage ----------------------------------------------------------
function MemoryStage({ state, onStart, onGuess, theme, cardSize, streak, best }) {
  if (!state) {
    return (
      <StageIntro
        title="Memory Trick"
        text="Study one card for a few seconds, then find it again among the decoys. Build your recall streak!"
        cta="Start memory round"
        onStart={onStart}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-4 text-sm font-semibold">
        <span className="rounded-full bg-(--primary)/10 px-3 py-1 text-(--primary)">
          Streak: {streak}
        </span>
        <span className="rounded-full bg-(--muted) px-3 py-1 text-(--muted-foreground)">
          Best: {best}
        </span>
      </div>

      {state.step === "show" && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm font-medium text-(--muted-foreground)">
            Memorise this card…
          </p>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Card card={state.target} faceUp theme={theme} size={cardSize * 1.6} />
          </motion.div>
          <p className="text-xs text-(--muted-foreground)">It will hide in 3… 2… 1</p>
        </div>
      )}

      {state.step !== "show" && (
        <>
          <p className="text-sm font-medium text-(--muted-foreground)">
            {state.step === "win"
              ? "Correct! Find the next one."
              : "Now find the card you memorised."}
          </p>
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(4, ${cardSize}px)` }}
          >
            {state.grid.map((c) => {
              const revealed = state.step === "win" && c.id === state.target.id;
              const isChosen = state.chosenId === c.id;
              return (
                <Card
                  key={c.id}
                  card={c}
                  faceUp={revealed}
                  theme={theme}
                  size={cardSize}
                  disabled={state.step !== "find"}
                  highlight={revealed}
                  dimmed={isChosen && state.step === "miss"}
                  onClick={() => state.step === "find" && onGuess(c.id)}
                  ariaLabel="Face-down card — tap to guess"
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ---- Shared intro card -----------------------------------------------------
function StageIntro({ title, text, cta, onStart }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-(--border) bg-(--card) p-8 text-center shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--primary)/10 text-(--primary)">
        <Wand2 size={26} />
      </div>
      <h3 className="text-xl font-bold text-(--foreground)">{title}</h3>
      <p className="text-sm leading-relaxed text-(--muted-foreground)">{text}</p>
      <button
        type="button"
        onClick={onStart}
        className="rounded-xl bg-(--primary) px-6 py-2.5 font-semibold text-(--primary-foreground) transition hover:opacity-90 active:scale-95"
      >
        <Play size={16} className="mr-1.5 inline" /> {cta}
      </button>
    </div>
  );
}
