"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Play, RefreshCw, Sparkles, Trophy, Undo2 } from "lucide-react";
import GameShell from "@/tools/_shared/game/GameShell";
import useBestScore from "@/tools/_shared/game/useBestScore";
import CardView, { EmptySlot } from "../components/CardView";
import {
  applyMove,
  canAutoComplete,
  cardLabel,
  deal,
  drawFromStock,
  findAutoMove,
  findFoundationTarget,
  getMovableCards,
  isWon,
  legalDestinations,
  runAllAutoMoves,
} from "../lib/klondike";
import { createAudioEngine } from "../lib/sounds";

// The felt is the play area, so it may use fixed game-art colors; all
// surrounding chrome (toolbar, overlays, stats) uses semantic tokens only.
const FELT_STYLE = {
  background: "radial-gradient(130% 130% at 50% 0%, #2f8f5b 0%, #1f6b45 55%, #154b31 100%)",
  boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.09), inset 0 0 48px rgba(0, 0, 0, 0.35)",
  touchAction: "manipulation",
};

const GRID_STYLE = {
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  gap: "1.5%",
};

const BUTTON_CLASS =
  "inline-flex h-11 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const PRIMARY_BUTTON_CLASS =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const DOUBLE_TAP_MS = 350;

const CONFETTI_GLYPHS = ["♠", "♥", "♦", "♣"];
// Deterministic pseudo-random layout so server and client render identically.
const CONFETTI_PIECES = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  delay: `${((i * 53) % 20) / 10}s`,
  duration: `${2.4 + ((i * 29) % 14) / 10}s`,
  size: 13 + ((i * 17) % 12),
  glyph: CONFETTI_GLYPHS[i % 4],
  color: i % 2 === 0 ? "#f6c445" : "#7be3f0",
}));

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function DrawModeToggle({ value, onChange }) {
  return (
    <div role="group" aria-label="Draw mode" className="inline-flex overflow-hidden rounded-md border border-border">
      {[1, 3].map((mode) => (
        <button
          key={mode}
          type="button"
          aria-pressed={value === mode}
          onClick={() => onChange(mode)}
          className={`inline-flex h-11 items-center px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${
            value === mode
              ? "bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Draw {mode}
        </button>
      ))}
    </div>
  );
}

function BoardOverlay({ children }) {
  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center rounded-lg p-4"
      style={{ background: "rgba(10, 24, 18, 0.62)", backdropFilter: "blur(2px)" }}
    >
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-5 text-center shadow-lg">
        {children}
      </div>
    </div>
  );
}

export default function KlondikeSolitaire() {
  const [status, setStatus] = useState("ready"); // ready -> playing -> (paused) -> won
  const [paused, setPaused] = useState(false);
  const [drawMode, setDrawMode] = useState(1);
  const [game, setGame] = useState(null);
  const [history, setHistory] = useState([]);
  const [selection, setSelection] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [autoRunning, setAutoRunning] = useState(false);
  const [winInfo, setWinInfo] = useState(null);
  const [cardW, setCardW] = useState(46);

  const [bestScore, submitBestScore] = useBestScore("klondike-solitaire");
  const [bestTime, submitBestTime] = useBestScore("klondike-solitaire-time", { lowerIsBetter: true });

  const boardInnerRef = useRef(null);
  const audioRef = useRef(null);
  const gameRef = useRef(game);
  const lastTapRef = useRef({ key: "", time: 0 });
  const keyHandlerRef = useRef(() => {});

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  // ----- sound ---------------------------------------------------------------
  const soundOnRef = useRef(soundOn);
  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  const play = useCallback((name) => {
    if (!soundOnRef.current) return;
    if (!audioRef.current) audioRef.current = createAudioEngine();
    audioRef.current.play(name);
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.dispose();
        audioRef.current = null;
      }
    };
  }, []);

  // ----- board sizing --------------------------------------------------------
  useEffect(() => {
    const node = boardInnerRef.current;
    if (!node || typeof ResizeObserver === "undefined") return undefined;
    const update = () => {
      const width = node.clientWidth;
      if (width > 0) setCardW(width * 0.13);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // ----- timer ---------------------------------------------------------------
  useEffect(() => {
    if (status !== "playing" || paused) return undefined;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [status, paused]);

  // ----- lifecycle -----------------------------------------------------------
  const startGame = useCallback(
    (mode) => {
      setDrawMode(mode);
      setGame(deal(mode));
      setHistory([]);
      setSelection(null);
      setSeconds(0);
      setWinInfo(null);
      setPaused(false);
      setAutoRunning(false);
      setStatus("playing");
      play("place");
    },
    [play],
  );

  const handleTogglePause = useCallback(() => {
    if (status !== "playing") return;
    setPaused((p) => !p);
    setSelection(null);
  }, [status]);

  const handleDrawModeChange = (mode) => {
    if (mode === drawMode) return;
    if (status === "ready") {
      setDrawMode(mode);
    } else {
      startGame(mode); // changing draw style deals a fresh game
    }
  };

  const interactive = status === "playing" && !paused && !autoRunning && game !== null;

  // ----- moves ---------------------------------------------------------------
  const attemptMove = (sel, dest) => {
    const result = applyMove(game, sel, dest);
    if (!result) return false;
    setHistory((h) => [...h, game]);
    setGame(result.next);
    setSelection(null);
    play(dest.type === "foundation" ? "foundation" : "place");
    if (result.flipped) play("flip");
    return true;
  };

  const sendToFoundation = (sel) => {
    const cards = getMovableCards(game, sel);
    if (cards.length !== 1) return false;
    const target = findFoundationTarget(game, cards[0]);
    if (target === -1) return false;
    return attemptMove(sel, { type: "foundation", index: target });
  };

  const registerTap = (zone, id) => {
    const key = `${zone}:${id}`;
    const now = Date.now();
    const isDouble = lastTapRef.current.key === key && now - lastTapRef.current.time < DOUBLE_TAP_MS;
    lastTapRef.current = { key, time: now };
    return isDouble;
  };

  const handleDraw = () => {
    if (!interactive) return;
    const next = drawFromStock(game);
    if (!next) return;
    setHistory((h) => [...h, game]);
    setGame(next);
    setSelection(null);
    play("draw");
  };

  const handleUndo = () => {
    if (!interactive || history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setGame(previous);
    setSelection(null);
    play("undo");
  };

  const onTableauCardClick = (pileIndex, cardIndex) => {
    if (!interactive) return;
    const pile = game.tableau[pileIndex];
    const card = pile[cardIndex];
    if (!card.faceUp) return;
    const isTop = cardIndex === pile.length - 1;
    if (isTop && registerTap(`t${pileIndex}`, card.id)) {
      if (sendToFoundation({ type: "tableau", index: pileIndex, cardIndex })) return;
    }
    if (selection) {
      if (!(selection.type === "tableau" && selection.index === pileIndex)) {
        if (attemptMove(selection, { type: "tableau", index: pileIndex })) return;
      }
      if (
        selection.type === "tableau" &&
        selection.index === pileIndex &&
        selection.cardIndex === cardIndex
      ) {
        setSelection(null);
        return;
      }
    }
    setSelection({ type: "tableau", index: pileIndex, cardIndex });
  };

  const onEmptyTableauClick = (pileIndex) => {
    if (!interactive) return;
    if (selection) attemptMove(selection, { type: "tableau", index: pileIndex });
  };

  const onWasteClick = () => {
    if (!interactive || game.waste.length === 0) return;
    const top = game.waste[game.waste.length - 1];
    if (registerTap("waste", top.id) && sendToFoundation({ type: "waste" })) return;
    setSelection((sel) => (sel && sel.type === "waste" ? null : { type: "waste" }));
  };

  const onFoundationClick = (index) => {
    if (!interactive) return;
    if (selection && selection.type !== "foundation") {
      if (attemptMove(selection, { type: "foundation", index })) return;
    }
    if (selection && selection.type === "foundation" && selection.index === index) {
      setSelection(null);
      return;
    }
    setSelection(game.foundations[index].length ? { type: "foundation", index } : null);
  };

  // ----- auto-complete -------------------------------------------------------
  const autoAvailable = interactive && canAutoComplete(game);

  const startAutoComplete = () => {
    if (!interactive || !canAutoComplete(game)) return;
    setHistory((h) => [...h, game]);
    setSelection(null);
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setGame(runAllAutoMoves(game));
      play("foundation");
      return;
    }
    setAutoRunning(true);
  };

  useEffect(() => {
    if (!autoRunning || paused) return undefined;
    const id = window.setInterval(() => {
      const current = gameRef.current;
      const move = current ? findAutoMove(current) : null;
      if (!move) {
        setAutoRunning(false);
        return;
      }
      const result = applyMove(current, move.sel, move.dest);
      if (!result) {
        setAutoRunning(false);
        return;
      }
      setGame(result.next);
      play("foundation");
    }, 140);
    return () => window.clearInterval(id);
  }, [autoRunning, paused, play]);

  // ----- win detection -------------------------------------------------------
  useEffect(() => {
    if (status !== "playing" || !game || !isWon(game)) return;
    setStatus("won");
    setPaused(false);
    setAutoRunning(false);
    setSelection(null);
    const recordTime = bestTime === null || seconds < bestTime;
    const recordScore = bestScore === null || game.score > bestScore;
    setWinInfo({ score: game.score, time: seconds, recordTime, recordScore });
    submitBestTime(seconds);
    submitBestScore(game.score);
    play("win");
  }, [game, status, seconds, bestTime, bestScore, submitBestTime, submitBestScore, play]);

  // ----- keyboard ------------------------------------------------------------
  useEffect(() => {
    keyHandlerRef.current = (event) => {
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) return;
        if (tag === "BUTTON" && (event.key === " " || event.key === "Enter")) return;
      }
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && key === "z") {
        if (interactive) {
          event.preventDefault();
          handleUndo();
        }
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (status === "ready" || status === "won") {
        if (key === "enter") {
          event.preventDefault();
          startGame(drawMode);
        }
        return;
      }
      if (key === "p") {
        event.preventDefault();
        handleTogglePause();
        return;
      }
      if (!interactive) return;
      if (key === " " || key === "d") {
        event.preventDefault();
        handleDraw();
      } else if (key === "u") {
        event.preventDefault();
        handleUndo();
      } else if (key === "a") {
        event.preventDefault();
        startAutoComplete();
      } else if (key === "escape") {
        event.preventDefault();
        setSelection(null);
      }
    };
  });

  useEffect(() => {
    const onKey = (event) => keyHandlerRef.current(event);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ----- derived render data -------------------------------------------------
  const legal = useMemo(
    () => (game && selection ? legalDestinations(game, selection) : null),
    [game, selection],
  );

  const isTableauCardSelected = (pileIndex, cardIndex) =>
    selection !== null &&
    selection.type === "tableau" &&
    selection.index === pileIndex &&
    cardIndex >= selection.cardIndex;

  const cardH = cardW * 1.4;

  const stats = [
    { label: "Score", value: game ? game.score : 0 },
    { label: "Best", value: bestScore !== null ? bestScore : "—" },
    { label: "Time", value: formatTime(seconds) },
    { label: "Moves", value: game ? game.moves : 0 },
  ];

  const wasteFan = game ? game.waste.slice(-(game.drawMode === 3 ? 3 : 1)) : [];

  return (
    <GameShell
      title="Klondike Solitaire"
      stats={stats}
      onRestart={() => startGame(drawMode)}
      paused={paused}
      onTogglePause={status === "playing" ? handleTogglePause : undefined}
      soundOn={soundOn}
      onToggleSound={() => setSoundOn((v) => !v)}
      help="Tap or click a card to select it, then tap the pile you want to move it to — legal spots light up. Double-tap a card to send it to its foundation. Switching Draw 1 / Draw 3 deals a new game. Keyboard: Space or D draws, U undoes, A auto-completes, P pauses, Esc clears the selection."
    >
      <div className="flex w-full flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={!interactive || history.length === 0}
            className={BUTTON_CLASS}
          >
            <Undo2 className="h-4 w-4" aria-hidden="true" />
            Undo
          </button>
          <DrawModeToggle value={drawMode} onChange={handleDrawModeChange} />
          {autoAvailable ? (
            <button type="button" onClick={startAutoComplete} className={PRIMARY_BUTTON_CLASS}>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Auto-complete
            </button>
          ) : null}
        </div>

        <div
          className="relative w-full select-none rounded-lg p-2 sm:p-3"
          style={{ ...FELT_STYLE, minHeight: game ? undefined : 360 }}
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelection(null);
          }}
        >
          <div ref={boardInnerRef} className="w-full">
            {game ? (
              <>
                <div style={GRID_STYLE}>
                  {/* Stock */}
                  <div className="relative">
                    {game.stock.length > 0 ? (
                      <>
                        <CardView
                          card={{ id: "stock-top", suit: "spades", rank: 1, faceUp: false }}
                          cardW={cardW}
                          onClick={handleDraw}
                          ariaLabel={`Draw ${Math.min(game.drawMode, game.stock.length)} from stock, ${game.stock.length} left`}
                        />
                        <span
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            bottom: "4%",
                            right: "6%",
                            padding: "1px 6px",
                            borderRadius: 999,
                            background: "rgba(0, 0, 0, 0.55)",
                            color: "#ffffff",
                            fontSize: Math.max(9, cardW * 0.2),
                            lineHeight: 1.4,
                            pointerEvents: "none",
                          }}
                        >
                          {game.stock.length}
                        </span>
                      </>
                    ) : (
                      <EmptySlot
                        cardW={cardW}
                        onClick={game.waste.length ? handleDraw : undefined}
                        ariaLabel={
                          game.waste.length ? "Recycle waste into stock" : "Empty stock"
                        }
                      >
                        <RefreshCw aria-hidden="true" size={Math.max(14, cardW * 0.38)} />
                      </EmptySlot>
                    )}
                  </div>

                  {/* Waste (fans right into the spacer column in draw-3) */}
                  <div className="relative" style={{ aspectRatio: "5 / 7" }}>
                    {wasteFan.length === 0 ? (
                      <EmptySlot cardW={cardW} ariaLabel="Empty waste" />
                    ) : (
                      wasteFan.map((card, i) => {
                        const isTopCard = i === wasteFan.length - 1;
                        return (
                          <CardView
                            key={card.id}
                            card={card}
                            cardW={cardW}
                            selected={isTopCard && selection !== null && selection.type === "waste"}
                            onClick={isTopCard ? onWasteClick : undefined}
                            ariaLabel={isTopCard ? `Waste: ${cardLabel(card)}` : cardLabel(card)}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: `${i * 42}%`,
                              zIndex: i + 1,
                              pointerEvents: isTopCard ? "auto" : "none",
                            }}
                          />
                        );
                      })
                    )}
                  </div>

                  {/* Spacer column */}
                  <div aria-hidden="true" />

                  {/* Foundations */}
                  {game.foundations.map((pile, i) => {
                    const top = pile[pile.length - 1];
                    return (
                      <div key={`foundation-${i}`}>
                        {top ? (
                          <CardView
                            card={top}
                            cardW={cardW}
                            selected={
                              selection !== null &&
                              selection.type === "foundation" &&
                              selection.index === i
                            }
                            highlighted={Boolean(legal && legal.foundations[i])}
                            onClick={() => onFoundationClick(i)}
                            ariaLabel={`Foundation ${i + 1}: ${cardLabel(top)}`}
                          />
                        ) : (
                          <EmptySlot
                            cardW={cardW}
                            onClick={() => onFoundationClick(i)}
                            highlighted={Boolean(legal && legal.foundations[i])}
                            ariaLabel={`Foundation ${i + 1}: empty, needs an ace`}
                          >
                            A
                          </EmptySlot>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Tableau */}
                <div style={{ ...GRID_STYLE, marginTop: "3%" }}>
                  {game.tableau.map((pile, pileIndex) => (
                    <div
                      key={`pile-${pileIndex}`}
                      role="group"
                      aria-label={`Tableau pile ${pileIndex + 1}`}
                      style={{ minHeight: cardH }}
                    >
                      {pile.length === 0 ? (
                        <EmptySlot
                          cardW={cardW}
                          onClick={() => onEmptyTableauClick(pileIndex)}
                          highlighted={Boolean(legal && legal.tableau[pileIndex])}
                          ariaLabel={`Empty tableau pile ${pileIndex + 1}, needs a king`}
                        >
                          K
                        </EmptySlot>
                      ) : (
                        pile.map((card, cardIndex) => (
                          <CardView
                            key={card.id}
                            card={card}
                            cardW={cardW}
                            selected={isTableauCardSelected(pileIndex, cardIndex)}
                            highlighted={
                              Boolean(legal && legal.tableau[pileIndex]) &&
                              cardIndex === pile.length - 1
                            }
                            onClick={
                              card.faceUp ? () => onTableauCardClick(pileIndex, cardIndex) : undefined
                            }
                            style={{
                              marginTop:
                                cardIndex === 0
                                  ? 0
                                  : pile[cardIndex - 1].faceUp
                                    ? "-98%"
                                    : "-126%",
                            }}
                          />
                        ))
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          {/* Celebration confetti (decorative, hidden for reduced motion) */}
          {status === "won" ? (
            <div aria-hidden="true" className="ks-confetti pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-lg">
              {CONFETTI_PIECES.map((piece, i) => (
                <span
                  key={i}
                  style={{
                    position: "absolute",
                    top: "-10%",
                    left: piece.left,
                    fontSize: piece.size,
                    color: piece.color,
                    animation: `ksConfettiFall ${piece.duration} linear ${piece.delay} infinite`,
                  }}
                >
                  {piece.glyph}
                </span>
              ))}
              <style>{`
                @keyframes ksConfettiFall {
                  from { top: -10%; transform: rotate(0deg); }
                  to { top: 105%; transform: rotate(320deg); }
                }
                @media (prefers-reduced-motion: reduce) {
                  .ks-confetti { display: none; }
                }
              `}</style>
            </div>
          ) : null}

          {status === "ready" ? (
            <BoardOverlay>
              <h3 className="text-lg font-semibold text-foreground">Ready to deal?</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Build all four foundations from Ace to King. Choose your draw style, then deal the
                cards.
              </p>
              <div className="mt-4 flex justify-center">
                <DrawModeToggle value={drawMode} onChange={handleDrawModeChange} />
              </div>
              <button
                type="button"
                onClick={() => startGame(drawMode)}
                className={`${PRIMARY_BUTTON_CLASS} mt-4 w-full`}
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                Deal cards
              </button>
            </BoardOverlay>
          ) : null}

          {status === "playing" && paused ? (
            <BoardOverlay>
              <h3 className="text-lg font-semibold text-foreground">Paused</h3>
              <p className="mt-1 text-sm text-muted-foreground">The timer is stopped.</p>
              <button
                type="button"
                onClick={handleTogglePause}
                className={`${PRIMARY_BUTTON_CLASS} mt-4 w-full`}
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                Resume
              </button>
            </BoardOverlay>
          ) : null}

          {status === "won" && winInfo ? (
            <BoardOverlay>
              <Trophy className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
              <h3 className="mt-2 text-lg font-semibold text-foreground">You won!</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Score {winInfo.score} · Time {formatTime(winInfo.time)} · Best time{" "}
                {bestTime !== null ? formatTime(bestTime) : formatTime(winInfo.time)}
              </p>
              {winInfo.recordTime ? (
                <p className="mt-1 text-sm font-medium text-primary">New best time!</p>
              ) : null}
              {winInfo.recordScore ? (
                <p className="mt-1 text-sm font-medium text-primary">New best score!</p>
              ) : null}
              <button
                type="button"
                onClick={() => startGame(drawMode)}
                className={`${PRIMARY_BUTTON_CLASS} mt-4 w-full`}
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                Play again
              </button>
            </BoardOverlay>
          ) : null}
        </div>

        <p className="sr-only" role="status">
          {status === "won" && winInfo
            ? `You won with a score of ${winInfo.score} in ${formatTime(winInfo.time)}.`
            : status === "playing" && paused
              ? "Game paused."
              : ""}
        </p>
      </div>
    </GameShell>
  );
}
