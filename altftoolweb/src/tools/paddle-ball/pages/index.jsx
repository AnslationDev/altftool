"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell from "@/tools/_shared/game/GameShell";
import useBestScore from "@/tools/_shared/game/useBestScore";
import {
  BALL_R,
  COURT_H,
  COURT_W,
  DIFFICULTIES,
  PADDLE_H,
  PADDLE_MARGIN,
  PADDLE_W,
  PLAYER_SPEED,
  SERVE_DELAY,
  WIN_SCORE,
  clampPaddleY,
  collidePaddle,
  createBall,
  launchBall,
  resetBall,
  stepAI,
  stepBall,
} from "../lib/engine";
import { createSynth } from "../lib/audio";

const MODES = [
  { id: "ai", label: "Vs Computer" },
  { id: "2p", label: "2 Players" },
];

// Fixed vivid palette for the play area only (game art, self-backed for both themes).
const ART = {
  bgTop: "#0b1626",
  bgBottom: "#101f38",
  line: "rgba(148, 163, 184, 0.4)",
  scoreText: "rgba(226, 232, 240, 0.26)",
  hintText: "rgba(226, 232, 240, 0.72)",
  leftPaddle: "#14B8A6",
  rightPaddle: "#22D3EE",
  ball: "#F8FAFC",
};

function drawPaddle(ctx, x, centerY, color) {
  const y = centerY - PADDLE_H / 2;
  ctx.fillStyle = color;
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, PADDLE_W, PADDLE_H, 7);
    ctx.fill();
  } else {
    ctx.fillRect(x, y, PADDLE_W, PADDLE_H);
  }
}

function normalizeKey(key) {
  return key.length === 1 ? key.toLowerCase() : key;
}

const PRIMARY_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
const SECONDARY_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-muted px-4 text-sm font-medium text-foreground transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export default function PaddleBallArcade() {
  const canvasRef = useRef(null);

  // ready -> playing <-> paused -> over -> (restart)
  const [status, setStatus] = useState("ready");
  const [mode, setMode] = useState("ai");
  const [difficultyId, setDifficultyId] = useState("medium");
  const [scores, setScores] = useState({ left: 0, right: 0 });
  const [rally, setRallyState] = useState(0);
  const [winner, setWinner] = useState(null);
  const [soundOn, setSoundOn] = useState(true);
  const [bestRally, submitBestRally] = useBestScore("paddle-ball");

  // Mutable mirrors for the rAF loop.
  const statusRef = useRef("ready");
  const modeRef = useRef("ai");
  const difficultyRef = useRef(DIFFICULTIES[1]);
  const soundOnRef = useRef(true);
  const synthRef = useRef(null);
  const reducedMotionRef = useRef(false);

  const ballRef = useRef(createBall());
  const leftYRef = useRef(COURT_H / 2);
  const rightYRef = useRef(COURT_H / 2);
  const leftTargetRef = useRef(null);
  const rightTargetRef = useRef(null);
  const keysRef = useRef(new Set());
  const pointersRef = useRef(new Map());
  const scoresRef = useRef({ left: 0, right: 0 });
  const rallyRef = useRef(0);
  const serveRef = useRef({ timer: 0, dir: 1 });
  const aiRef = useRef({ offset: 0, timer: 0 });
  const trailRef = useRef([]);
  const sizeRef = useRef({ w: COURT_W, h: COURT_H });
  const frameRef = useRef(0);
  const lastTsRef = useRef(0);

  const setStatusBoth = useCallback((next) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const getSynth = useCallback(() => {
    if (!synthRef.current) synthRef.current = createSynth();
    return synthRef.current;
  }, []);

  const unlockAudio = useCallback(() => {
    if (soundOnRef.current) getSynth().unlock();
  }, [getSynth]);

  const playSound = useCallback((name) => {
    if (!soundOnRef.current || !synthRef.current) return;
    synthRef.current[name]();
  }, []);

  useEffect(() => () => synthRef.current?.dispose(), []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reducedMotionRef.current = mq.matches;
    };
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Keep the canvas backing store matched to its CSS size (crisp on high-DPR).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const applySize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      sizeRef.current = { w, h };
    };
    applySize();
    const observer = new ResizeObserver(applySize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const { w, h } = sizeRef.current;
    ctx.setTransform(w / COURT_W, 0, 0, h / COURT_H, 0, 0);

    const bg = ctx.createLinearGradient(0, 0, 0, COURT_H);
    bg.addColorStop(0, ART.bgTop);
    bg.addColorStop(1, ART.bgBottom);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, COURT_W, COURT_H);

    ctx.strokeStyle = ART.line;
    ctx.lineWidth = 4;
    ctx.setLineDash([14, 16]);
    ctx.beginPath();
    ctx.moveTo(COURT_W / 2, 10);
    ctx.lineTo(COURT_W / 2, COURT_H - 10);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = ART.scoreText;
    ctx.font = "700 84px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(String(scoresRef.current.left), COURT_W / 2 - 110, 26);
    ctx.fillText(String(scoresRef.current.right), COURT_W / 2 + 110, 26);

    const trail = trailRef.current;
    if (statusRef.current === "playing" && trail.length > 1) {
      for (let i = 0; i < trail.length; i += 1) {
        const t = (i + 1) / trail.length;
        ctx.fillStyle = `rgba(248, 250, 252, ${(0.04 + t * 0.1).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(trail[i].x, trail[i].y, BALL_R * (0.35 + t * 0.45), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawPaddle(ctx, PADDLE_MARGIN, leftYRef.current, ART.leftPaddle);
    drawPaddle(ctx, COURT_W - PADDLE_MARGIN - PADDLE_W, rightYRef.current, ART.rightPaddle);

    const ball = ballRef.current;
    ctx.fillStyle = ART.ball;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();

    if (statusRef.current === "playing" && serveRef.current.timer > 0) {
      ctx.fillStyle = ART.hintText;
      ctx.font = "600 22px system-ui, sans-serif";
      ctx.fillText("Get ready…", COURT_W / 2, COURT_H - 60);
    }
  }, []);

  // Main loop: always draws; physics only advances while playing.
  useEffect(() => {
    const movePaddleToward = (yRef, targetRef, keyDir, dt) => {
      if (keyDir !== 0) {
        targetRef.current = null;
        yRef.current = clampPaddleY(yRef.current + keyDir * PLAYER_SPEED * dt);
      } else if (targetRef.current !== null) {
        const delta = targetRef.current - yRef.current;
        const maxStep = PLAYER_SPEED * 1.6 * dt;
        yRef.current = clampPaddleY(yRef.current + Math.max(-maxStep, Math.min(maxStep, delta)));
      }
    };

    const endPoint = (scorer) => {
      // Only meaningful rallies count — an untouched serve must not record 0 as best.
      if (rallyRef.current > 0) submitBestRally(rallyRef.current);
      rallyRef.current = 0;
      setRallyState(0);
      trailRef.current = [];
      const next = { ...scoresRef.current, [scorer]: scoresRef.current[scorer] + 1 };
      scoresRef.current = next;
      setScores(next);
      resetBall(ballRef.current);
      if (next[scorer] >= WIN_SCORE) {
        setWinner(scorer);
        setStatusBoth("over");
        if (modeRef.current === "ai" && scorer === "right") playSound("matchLoss");
        else playSound("matchWin");
      } else {
        playSound("point");
        // Serve toward the side that conceded the point.
        serveRef.current = { timer: SERVE_DELAY, dir: scorer === "left" ? 1 : -1 };
      }
    };

    const update = (dt) => {
      const ball = ballRef.current;
      const keys = keysRef.current;
      const twoPlayer = modeRef.current === "2p";

      let leftDir = 0;
      let rightDir = 0;
      if (twoPlayer) {
        if (keys.has("w")) leftDir -= 1;
        if (keys.has("s")) leftDir += 1;
        if (keys.has("ArrowUp")) rightDir -= 1;
        if (keys.has("ArrowDown")) rightDir += 1;
      } else {
        if (keys.has("w") || keys.has("ArrowUp")) leftDir -= 1;
        if (keys.has("s") || keys.has("ArrowDown")) leftDir += 1;
      }
      movePaddleToward(leftYRef, leftTargetRef, leftDir, dt);
      if (twoPlayer) {
        movePaddleToward(rightYRef, rightTargetRef, rightDir, dt);
      } else {
        const ai = aiRef.current;
        ai.timer -= dt;
        if (ai.timer <= 0) {
          ai.timer = 0.45 + Math.random() * 0.5;
          ai.offset = (Math.random() * 2 - 1) * difficultyRef.current.aiError;
        }
        rightYRef.current = stepAI(rightYRef.current, ball, difficultyRef.current, ai.offset, dt);
      }

      const serve = serveRef.current;
      if (serve.timer > 0) {
        serve.timer -= dt;
        if (serve.timer <= 0) launchBall(ball, serve.dir);
        return;
      }

      const prevX = ball.x;
      if (stepBall(ball, dt)) playSound("wallHit");
      if (
        collidePaddle(ball, prevX, leftYRef.current, -1) ||
        collidePaddle(ball, prevX, rightYRef.current, 1)
      ) {
        rallyRef.current += 1;
        setRallyState(rallyRef.current);
        playSound("paddleHit");
      }

      if (!reducedMotionRef.current) {
        const trail = trailRef.current;
        trail.push({ x: ball.x, y: ball.y });
        if (trail.length > 10) trail.shift();
      }

      if (ball.x < -BALL_R * 2) endPoint("right");
      else if (ball.x > COURT_W + BALL_R * 2) endPoint("left");
    };

    const frame = (ts) => {
      const last = lastTsRef.current || ts;
      lastTsRef.current = ts;
      const dt = Math.min((ts - last) / 1000, 0.04);
      if (statusRef.current === "playing") update(dt);
      draw();
      frameRef.current = requestAnimationFrame(frame);
    };
    frameRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameRef.current);
  }, [draw, playSound, setStatusBoth, submitBestRally]);

  const startMatch = useCallback(() => {
    scoresRef.current = { left: 0, right: 0 };
    setScores(scoresRef.current);
    rallyRef.current = 0;
    setRallyState(0);
    setWinner(null);
    leftYRef.current = COURT_H / 2;
    rightYRef.current = COURT_H / 2;
    leftTargetRef.current = null;
    rightTargetRef.current = null;
    trailRef.current = [];
    resetBall(ballRef.current);
    serveRef.current = { timer: SERVE_DELAY, dir: Math.random() < 0.5 ? -1 : 1 };
    unlockAudio();
    setStatusBoth("playing");
  }, [setStatusBoth, unlockAudio]);

  const handleTogglePause = useCallback(() => {
    if (statusRef.current === "playing") {
      setStatusBoth("paused");
    } else if (statusRef.current === "paused") {
      unlockAudio();
      setStatusBoth("playing");
    }
  }, [setStatusBoth, unlockAudio]);

  const handleToggleSound = useCallback(() => {
    const next = !soundOnRef.current;
    soundOnRef.current = next;
    setSoundOn(next);
    if (next) getSynth().unlock();
  }, [getSynth]);

  const backToMenu = useCallback(() => {
    setStatusBoth("ready");
  }, [setStatusBoth]);

  // Auto-pause when the tab is hidden mid-rally.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && statusRef.current === "playing") setStatusBoth("paused");
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [setStatusBoth]);

  // Keyboard: W/S + arrows move, Space starts/pauses, P pauses.
  useEffect(() => {
    const MOVE_KEYS = new Set(["ArrowUp", "ArrowDown", "w", "s"]);
    const onKeyDown = (event) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }
      if (event.key === " ") {
        // A focused button must keep native Space activation (mode/difficulty
        // pickers, shell controls) — only hijack Space for the game elsewhere.
        if (target instanceof HTMLElement && target.closest("button")) return;
        event.preventDefault();
        if (statusRef.current === "ready" || statusRef.current === "over") startMatch();
        else handleTogglePause();
        return;
      }
      if (event.key === "p" || event.key === "P") {
        if (statusRef.current === "playing" || statusRef.current === "paused") {
          event.preventDefault();
          handleTogglePause();
        }
        return;
      }
      const key = normalizeKey(event.key);
      if (!MOVE_KEYS.has(key)) return;
      event.preventDefault();
      keysRef.current.add(key);
      unlockAudio();
    };
    const onKeyUp = (event) => {
      keysRef.current.delete(normalizeKey(event.key));
    };
    const onBlur = () => keysRef.current.clear();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [handleTogglePause, startMatch, unlockAudio]);

  const pointerToCourt = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * COURT_W,
      y: ((event.clientY - rect.top) / rect.height) * COURT_H,
    };
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const { x, y } = pointerToCourt(event);
    const side = modeRef.current === "2p" ? (x < COURT_W / 2 ? "left" : "right") : "left";
    pointersRef.current.set(event.pointerId, side);
    if (side === "left") leftTargetRef.current = clampPaddleY(y);
    else rightTargetRef.current = clampPaddleY(y);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    unlockAudio();
  };

  const handlePointerMove = (event) => {
    const side = pointersRef.current.get(event.pointerId);
    if (!side) return;
    const { y } = pointerToCourt(event);
    if (side === "left") leftTargetRef.current = clampPaddleY(y);
    else rightTargetRef.current = clampPaddleY(y);
  };

  const handlePointerEnd = (event) => {
    pointersRef.current.delete(event.pointerId);
  };

  const twoPlayer = mode === "2p";
  const resultTitle =
    winner === null
      ? ""
      : twoPlayer
        ? winner === "left"
          ? "Player 1 wins the match!"
          : "Player 2 wins the match!"
        : winner === "left"
          ? "You win the match!"
          : "The computer takes the match";

  return (
    <GameShell
      title="Paddle Ball Arcade"
      stats={[
        { label: twoPlayer ? "P1" : "You", value: scores.left },
        { label: twoPlayer ? "P2" : "CPU", value: scores.right },
        { label: "Rally", value: rally },
        { label: "Best rally", value: bestRally ?? "—" },
      ]}
      onRestart={startMatch}
      paused={status === "paused"}
      onTogglePause={status === "playing" || status === "paused" ? handleTogglePause : undefined}
      soundOn={soundOn}
      onToggleSound={handleToggleSound}
      help="First to 7 points wins. Move your paddle with W/S or the arrow keys, or drag on the court with a finger — hits near a paddle's edge angle the ball sharply, and every return speeds the rally up. Space starts or pauses. In two-player mode the left paddle uses W/S (or the left half of the screen) and the right paddle uses the arrow keys (or the right half)."
    >
      <div className="relative w-full overflow-hidden rounded-lg">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Paddle ball court"
          className="block aspect-[8/5] w-full touch-none select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        />

        {status === "ready" ? (
          <div className="absolute inset-0 flex items-center justify-center overflow-y-auto bg-card/90 p-4 backdrop-blur-sm">
            <div className="flex w-full max-w-sm flex-col items-center gap-3 text-center">
              <h3 className="text-lg font-semibold text-foreground">Paddle Ball Arcade</h3>
              <p className="text-sm text-muted-foreground">
                Rally paddle against paddle — first to {WIN_SCORE} points takes the match.
              </p>
              <div role="radiogroup" aria-label="Game mode" className="flex w-full gap-2">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={mode === m.id}
                    onClick={() => {
                      setMode(m.id);
                      modeRef.current = m.id;
                    }}
                    className={`min-h-11 flex-1 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                      mode === m.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              {mode === "ai" ? (
                <div role="radiogroup" aria-label="Difficulty" className="flex w-full gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      role="radio"
                      aria-checked={difficultyId === d.id}
                      onClick={() => {
                        setDifficultyId(d.id);
                        difficultyRef.current = d;
                      }}
                      className={`min-h-11 flex-1 rounded-md border px-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                        difficultyId === d.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              ) : null}
              <button type="button" onClick={startMatch} className={`${PRIMARY_BUTTON_CLASS} w-full`}>
                Start match
              </button>
            </div>
          </div>
        ) : null}

        {status === "paused" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/90 p-4 backdrop-blur-sm">
            <p className="text-lg font-semibold text-foreground">Paused</p>
            <button type="button" onClick={handleTogglePause} className={PRIMARY_BUTTON_CLASS}>
              Resume
            </button>
          </div>
        ) : null}

        {status === "over" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/90 p-4 text-center backdrop-blur-sm">
            <p className="text-xl font-bold text-foreground">{resultTitle}</p>
            <p className="text-sm text-muted-foreground">
              Final score {scores.left} – {scores.right}
              {bestRally != null ? ` · Best rally ${bestRally}` : ""}
            </p>
            <div className="flex w-full max-w-xs flex-col gap-2 sm:flex-row">
              <button type="button" onClick={startMatch} className={`${PRIMARY_BUTTON_CLASS} flex-1`}>
                Play again
              </button>
              <button type="button" onClick={backToMenu} className={`${SECONDARY_BUTTON_CLASS} flex-1`}>
                Change settings
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <p className="sr-only" role="status">
        {status === "over"
          ? `${resultTitle} Final score ${scores.left} to ${scores.right}.`
          : `Score ${scores.left} to ${scores.right}.`}
      </p>
    </GameShell>
  );
}
