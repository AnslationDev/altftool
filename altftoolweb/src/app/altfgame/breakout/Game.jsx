
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { GAME_CONFIG, createBricks } from "./logic/GameLogic";
import { playSound } from "./logic/SoundManager";
import { RotateCcw, Play, Maximize, Minimize } from "lucide-react";
import confetti from 'canvas-confetti';

export default function BreakoutGame({ isPreview = false }) {
  // --- React State for UI ---
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(GAME_CONFIG.LIVES);
  const [gameState, setGameState] = useState("START"); // START, PLAYING, GAME_OVER, WON
  const [highScore, setHighScore] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // --- Refs for Game Engine (Mutable state without re-renders) ---
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const requestRef = useRef(null);

  // Game Objects
  const ballRef = useRef({ x: 0, y: 0, dx: 0, dy: 0, radius: 0, speed: 0 });
  const paddleRef = useRef({ x: 0, width: 0, height: 0 });
  const bricksRef = useRef([]);
  // Fixed BUG-03: Track input type to avoid conflict
  const inputRef = useRef({ left: false, right: false, x: null, type: 'mouse' });

  // --- Initialization & Helpers ---

  useEffect(() => {
    const saved = localStorage.getItem("breakout-highscore");
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);



  const resetBall = useCallback((width, height) => {
    const paddle = paddleRef.current;
    const speed = width * GAME_CONFIG.BALL_SPEED_BASE;

    ballRef.current = {
      x: width / 2,
      y: height - 40,
      dx: speed * (Math.random() > 0.5 ? 1 : -1),
      dy: -speed,
      radius: width * GAME_CONFIG.BALL_RADIUS_PCT,
      speed: speed
    };
  }, []);

  const initGame = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const { width, height } = canvas;

    // Initialize Bricks
    bricksRef.current = createBricks(GAME_CONFIG.BRICK_ROWS, GAME_CONFIG.BRICK_COLS);

    // Initialize Paddle
    const paddleW = width * GAME_CONFIG.PADDLE_WIDTH_PCT;
    const paddleH = height * GAME_CONFIG.PADDLE_HEIGHT_PCT;
    paddleRef.current = {
      x: (width - paddleW) / 2,
      width: paddleW,
      height: paddleH,
      y: height - paddleH - 10
    };

    // Initialize Ball
    resetBall(width, height);

    setScore(0);
    setLives(GAME_CONFIG.LIVES);
    setGameState("START");
  }, [resetBall]);

  // --- Game Loop ---

  const fireConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#3b82f6', '#f59e0b']
    });
  };

  const update = useCallback((canvas) => {
    if (gameState !== "PLAYING") return;

    const width = canvas.width;
    const height = canvas.height;
    const ball = ballRef.current;
    const paddle = paddleRef.current;

    // 1. Move Paddle
    // Fixed BUG-03: Prioritize last input method
    if (inputRef.current.type === 'mouse' && inputRef.current.x !== null) {
        let relativeX = inputRef.current.x - canvas.getBoundingClientRect().left;

        if (relativeX > 0 && relativeX < width) {
            paddle.x = relativeX - paddle.width / 2;
        }
    }
    else if (inputRef.current.type === 'keyboard') {
        if (inputRef.current.right) {
            paddle.x += 7;
        } else if (inputRef.current.left) {
            paddle.x -= 7;
        }
    }

    // Paddle Bounds
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > width) paddle.x = width - paddle.width;

    // 2. Move Ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // 3. Wall Collisions
    if (ball.x + ball.radius > width || ball.x - ball.radius < 0) {
      ball.dx = -ball.dx;
      if (soundEnabled) playSound('wall');
    }
    if (ball.y - ball.radius < 0) {
      ball.dy = -ball.dy;
      if (soundEnabled) playSound('wall');
    }

    // 4. Paddle Collision
    if (
        ball.y + ball.radius > paddle.y &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
    ) {
        // Calculate hit position relative to center ( -1 to 1 )
        let collidePoint = ball.x - (paddle.x + paddle.width / 2);
        collidePoint = collidePoint / (paddle.width / 2);

        // Angle: Math.PI / 3 = 60 degrees
        let angle = collidePoint * (Math.PI / 3);

        ball.dx = ball.speed * Math.sin(angle) * 1.5; // Add some english
        ball.dy = -1 * ball.speed * Math.cos(angle);

        if (soundEnabled) playSound('paddle');
    }

    // 5. Brick Collision
    const bricks = bricksRef.current;
    const brickPadding = 10;
    const brickOffsetTop = height * 0.1; // 10% from top
    const brickOffsetLeft = brickPadding;
    const availableWidth = width - (2 * brickOffsetLeft);
    const brickWidth = (availableWidth - (GAME_CONFIG.BRICK_COLS - 1) * brickPadding) / GAME_CONFIG.BRICK_COLS;
    const brickHeight = 20;

    let activeBricksCount = 0;
    let pointsScoredThisFrame = 0;

    for (let c = 0; c < GAME_CONFIG.BRICK_COLS; c++) {
      for (let r = 0; r < GAME_CONFIG.BRICK_ROWS; r++) {
        const b = bricks[c][r];
        if (b.status === 1) {
          activeBricksCount++;
          const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
          const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;

          // Store for rendering
          b.x = brickX;
          b.y = brickY;
          b.w = brickWidth;
          b.h = brickHeight;

          if (
            ball.x > brickX &&
            ball.x < brickX + brickWidth &&
            ball.y > brickY &&
            ball.y < brickY + brickHeight
          ) {
            ball.dy = -ball.dy;
            b.status = 0;
            activeBricksCount--; // Decrement immediately
            pointsScoredThisFrame += 10;
            setScore(prev => prev + 10);
            if (soundEnabled) playSound('brick');
          }
        }
      }
    }

    // 6. Win Condition
    if (activeBricksCount === 0) {
        setGameState("WON");
        if (soundEnabled) playSound('win');
        fireConfetti();
        const finalScore = score + pointsScoredThisFrame;
        if (finalScore > highScore) {
            setHighScore(finalScore);
            localStorage.setItem("breakout-highscore", finalScore.toString());
        }
    }

    // 7. Lose Life (Floor Collision)
    if (ball.y + ball.radius > height) {
        if (soundEnabled) playSound('lose');
        setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
                setGameState("GAME_OVER");
                if (score > highScore) {
                    setHighScore(score);
                    localStorage.setItem("breakout-highscore", score.toString());
                }
            } else {
                // Reset Ball
                resetBall(width, height);
            }
            return newLives;
        });
    }
  }, [gameState, soundEnabled, score, highScore, resetBall]);

  const draw = useCallback((ctx, canvas) => {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Bricks
    const bricks = bricksRef.current;
    bricks.forEach(col => {
        col.forEach(brick => {
            if (brick.status === 1) {
                ctx.beginPath();
                ctx.roundRect(brick.x, brick.y, brick.w, brick.h, 4);
                ctx.fillStyle = brick.color;
                ctx.fill();
                ctx.closePath();

                // Shine effect
                ctx.fillStyle = "rgba(255,255,255,0.1)";
                ctx.fill();
            }
        });
    });

    // Draw Paddle
    const paddle = paddleRef.current;
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 8);
    ctx.fillStyle = "#3b82f6"; // Blue-500
    ctx.fill();
    ctx.closePath();

    // Paddle Detail
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(paddle.x + 10, paddle.y + 5, paddle.width - 20, paddle.height/2);

    // Draw Ball
    const ball = ballRef.current;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#facc15"; // Yellow-400
    ctx.fill();
    ctx.strokeStyle = "#ca8a04";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
  }, []);

  const loop = useCallback(function gameLoop() {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    update(canvas);
    draw(ctx, canvas);

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [update, draw]); // Re-create loop if gameState changes (needed for update logic depending on state)

  // --- Effects ---

  // Resize Handler
  useEffect(() => {
    const handleResize = () => {
        if (containerRef.current && canvasRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            // Handle DPI
            const dpr = window.devicePixelRatio || 1;
            canvasRef.current.width = width * dpr;
            canvasRef.current.height = height * dpr;

            // CSS scale
            canvasRef.current.style.width = `${width}px`;
            canvasRef.current.style.height = `${height}px`;

            // Scale context
            const ctx = canvasRef.current.getContext("2d");
            ctx.scale(dpr, dpr);

            canvasRef.current.width = width;
            canvasRef.current.height = height;

            // Fixed BUG-06: Ensure paddle is within bounds after resize
            const paddle = paddleRef.current;
            if (paddle.x + paddle.width > width) {
                paddle.x = width - paddle.width;
            }
            if (paddle.y > height) { // Reset ball/paddle if screen got much smaller
                 // Safety reset if things are totally out of whack
                 // ...
            }

            // Re-init paddle/ball if resizing during setup
            if (gameState === "START") {
                initGame();
            }
        }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial size

    return () => window.removeEventListener("resize", handleResize);
  }, [initGame, gameState]);

  // Start Loop
  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [loop]);

  // Input Listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
        if (e.key === "ArrowRight") {
            inputRef.current.right = true;
            inputRef.current.type = 'keyboard';
        }
        if (e.key === "ArrowLeft") {
            inputRef.current.left = true;
            inputRef.current.type = 'keyboard';
        }
    };
    const handleKeyUp = (e) => {
        if (e.key === "ArrowRight") inputRef.current.right = false;
        if (e.key === "ArrowLeft") inputRef.current.left = false;
    };

    const handleMouseMove = (e) => {
        inputRef.current.x = e.clientX;
        inputRef.current.type = 'mouse';
    };

    const handleTouchMove = (e) => {
        inputRef.current.x = e.touches[0].clientX;
        inputRef.current.type = 'mouse';
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Attach mouse/touch to window or specific element? Window is safer for drag.
    window.addEventListener("mousemove", handleMouseMove);

    // Clean up
    return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);


  // --- Helper Actions ---
  const startGame = () => {
    setGameState("PLAYING");
  };

  const restartGame = () => {
    initGame();
    setGameState("PLAYING");
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
    } else {
        document.exitFullscreen();
        setIsFullscreen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-zinc-950 rounded-xl font-sans select-none border-4 border-zinc-800 shadow-2xl overflow-hidden flex flex-col">

        {/* Header HUD */}
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 pointer-events-none">
            <div className="flex flex-col">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Score</span>
                <span className="text-white text-2xl font-black">{score}</span>
            </div>

            <div className="flex gap-2">
                {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
                    <div key={i} className="w-4 h-4 rounded-full bg-red-500 border border-red-600 shadow-lg" />
                ))}
            </div>

            <div className="flex flex-col items-end">
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">High Score</span>
                <span className="text-zinc-300 text-xl font-bold">{highScore}</span>
            </div>
        </div>

        {/* Canvas Layer */}
        <canvas
            ref={canvasRef}
            className="block w-full h-full touch-none cursor-crosshair"
            onTouchMove={(e) => {
                // e.preventDefault(); // React handles this slightly differently, usually need CSS touch-action: none
                inputRef.current.x = e.touches[0].clientX;
            }}
            onTouchStart={(e) => {
                inputRef.current.x = e.touches[0].clientX;
            }}
        />

        {/* Overlays */}
        {gameState === "START" && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2 drop-shadow-2xl">
                    BREAKOUT
                </h1>
                <p className="text-zinc-400 mb-8 text-sm uppercase tracking-widest">Smash the bricks</p>
                <button
                    onClick={startGame}
                    className="group relative px-10 py-4 bg-white text-black font-black tracking-widest uppercase rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                >
                    <span className="flex items-center gap-2">
                        <Play size={24} fill="black" />
                        Start Game
                    </span>
                </button>
                <p className="mt-8 text-zinc-500 text-xs">
                    Touch / Mouse to Move
                </p>
            </div>
        )}

        {(gameState === "GAME_OVER" || gameState === "WON") && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in zoom-in duration-300">
                <h2 className={`text-6xl font-black mb-4 drop-shadow-lg ${gameState === "WON" ? "text-green-500" : "text-red-500"}`}>
                    {gameState === "WON" ? "YOU WIN!" : "GAME OVER"}
                </h2>

                <div className="flex flex-col items-center mb-8 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                    <span className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-1">Final Score</span>
                    <span className="text-5xl font-mono font-black text-white">{score}</span>
                </div>

                <button
                    onClick={restartGame}
                    className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black tracking-widest uppercase rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                    <span className="flex items-center gap-2">
                        <RotateCcw size={20} />
                        Play Again
                    </span>
                </button>
            </div>
        )}

        {/* Controls Overlay (Fullscreen/Sound) */}
        {!isPreview && (
            <div className="absolute bottom-4 right-4 z-30 flex gap-2">
                <button
                    onClick={toggleFullscreen}
                    className="p-2 bg-zinc-800/50 text-zinc-400 hover:text-white rounded-lg backdrop-blur-sm transition-colors"
                >
                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
            </div>
        )}
    </div>
  );
}
