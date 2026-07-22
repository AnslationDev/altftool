import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, ArrowUp, ArrowDown, Trophy, Gauge } from 'lucide-react';

/**
 * DINO RUN — a polished, React-native reimagining of the classic
 * offline runner. Canvas handles the game simulation; everything
 * around it (scoreboard, overlays, controls) is real React/DOM
 * so it can be themed, animated and made accessible properly.
 */

// ---- Virtual game-space constants ------------------------------------------------
const VW = 800, VH = 300, GY = VH - 4; // ground line
const JUMP_V = -640, GRAV = 2300, DINO_X = 80;

// Desert palette — deep teal ink against a warm sand gradient, amber for hazards.
const INK = '#0d4a4a';
const ACCENT = '#c2660a';
const PANEL_A = '#fbf6ea';
const PANEL_B = '#f2e6cf';
const CLOUD = '#cfe6e3';
const GMARK = '#a9c7c4';

const CACTI = [
  [{ rx: 4, ry: 0, rw: 10, rh: 36 }, { rx: 0, ry: 10, rw: 6, rh: 8 }, { rx: 14, ry: 12, rw: 6, rh: 8 }],
  [{ rx: 4, ry: 0, rw: 12, rh: 48 }, { rx: 0, ry: 14, rw: 8, rh: 8 }, { rx: 16, ry: 16, rw: 8, rh: 8 }],
  [{ rx: 0, ry: 0, rw: 12, rh: 36 }, { rx: 18, ry: 0, rw: 12, rh: 30 }, { rx: -4, ry: 10, rw: 6, rh: 8 }, { rx: 30, ry: 8, rw: 6, rh: 8 }],
  [{ rx: 0, ry: 0, rw: 10, rh: 26 }, { rx: 14, ry: 0, rw: 10, rh: 26 }, { rx: 28, ry: 0, rw: 10, rh: 26 }],
  [{ rx: 0, ry: 0, rw: 12, rh: 38 }, { rx: 16, ry: 0, rw: 14, rh: 52 }, { rx: 34, ry: 0, rw: 12, rh: 38 }],
];

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export default function DinoRun() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);
  const dprRef = useRef(1);

  // Mutable simulation state lives in refs so the game loop never depends on
  // stale React closures or triggers a re-render every frame.
  const phaseRef = useRef('idle'); // idle | running | dead
  const scoreRef = useRef(0);
  const hiScoreRef = useRef(0);
  const speedRef = useRef(480);
  const obstaclesRef = useRef([]);
  const cloudsRef = useRef([]);
  const gMarksRef = useRef([]);
  const timersRef = useRef({ obstTimer: 0, obstInterval: 1.4, cloudTimer: 0, gMarkTimer: 0, flashAlpha: 0, lastMile: 0 });
  const heldRef = useRef({});
  const duckHeldRef = useRef(false);

  const dinoRef = useRef({
    y: GY, vy: 0, h: 52, duck: false, ground: true, legPhase: 0, blinkT: 0,
  });

  // Thin React state — only what the UI actually needs to re-render for.
  const [phase, setPhase] = useState('idle');
  const [score, setScore] = useState(0);
  const [hiScore, setHiScore] = useState(0);
  const [speedMult, setSpeedMult] = useState(1);
  const [duckPressed, setDuckPressed] = useState(false);
  const frameCountRef = useRef(0);

  // ---- Dino behaviour --------------------------------------------------------
  const doJump = useCallback(() => {
    const d = dinoRef.current;
    if (d.ground && !d.duck) { d.vy = JUMP_V; d.ground = false; }
  }, []);

  const setDuck = useCallback((on) => {
    const d = dinoRef.current;
    d.duck = on;
    d.h = on ? 34 : 52;
    setDuckPressed(on);
  }, []);

  const dinoBox = () => {
    const d = dinoRef.current;
    return {
      x: DINO_X + 10,
      y: d.y - d.h + (d.duck ? 18 : 8),
      w: 26,
      h: d.h - (d.duck ? 22 : 18),
    };
  };

  const drawDino = (ctx) => {
    const d = dinoRef.current;
    const x = DINO_X, top = d.y - d.h;
    ctx.fillStyle = INK;

    if (d.duck) {
      ctx.fillRect(x + 4, top + 18, 36, 16);
      ctx.fillRect(x + 28, top + 10, 14, 13);
      ctx.fillRect(x + 39, top + 12, 5, 4);
      ctx.fillStyle = PANEL_A; ctx.fillRect(x + 30, top + 11, 6, 5);
      ctx.fillStyle = INK; ctx.fillRect(x + 31, top + 12, 3, 3);
      ctx.fillRect(x + 6, top + 31, 8, 3);
      ctx.fillRect(x + 22, top + 31, 8, 3);
    } else {
      ctx.fillRect(x - 5, top + 22, 14, 8);
      ctx.fillRect(x - 2, top + 18, 8, 8);
      ctx.fillRect(x + 8, top + 10, 28, 22);
      ctx.fillRect(x + 22, top, 22, 20);
      ctx.fillRect(x + 40, top + 6, 4, 5);
      ctx.fillRect(x + 18, top + 24, 9, 5);
      ctx.fillStyle = PANEL_A;
      ctx.fillRect(x + 27, top + 4, 9, 7);
      ctx.fillStyle = INK;
      const blink = (d.blinkT % 3.2) > 0.12;
      if (blink) ctx.fillRect(x + 29, top + 5, 4, 4);
      else ctx.fillRect(x + 27, top + 8, 9, 2);
      ctx.fillStyle = INK;
      if (d.legPhase < 0.5) {
        ctx.fillRect(x + 14, top + 32, 8, 12);
        ctx.fillRect(x + 24, top + 27, 8, 8);
      } else {
        ctx.fillRect(x + 14, top + 27, 8, 8);
        ctx.fillRect(x + 24, top + 32, 8, 12);
      }
    }

    if (phaseRef.current === 'dead') {
      ctx.fillStyle = PANEL_A;
      ctx.fillRect(x + 27, top + 4, 9, 7);
      ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x + 28, top + 5); ctx.lineTo(x + 35, top + 10);
      ctx.moveTo(x + 35, top + 5); ctx.lineTo(x + 28, top + 10);
      ctx.stroke();
    }
  };

  // ---- Obstacles --------------------------------------------------------------
  const spawnObst = () => {
    if (speedRef.current > 800 && Math.random() < 0.28) {
      const ys = [GY - 60, GY - 110, GY - 165];
      obstaclesRef.current.push({ type: 'bird', x: VW + 40, y: ys[Math.floor(Math.random() * 3)], wingT: 0, wingUp: true });
      return;
    }
    const parts = CACTI[Math.floor(Math.random() * CACTI.length)];
    obstaclesRef.current.push({ type: 'cactus', x: VW + 20, parts });
  };

  const drawCactus = (ctx, o) => {
    ctx.fillStyle = ACCENT;
    for (const p of o.parts) ctx.fillRect(o.x + p.rx, GY - p.rh + p.ry, p.rw, p.rh);
  };

  const drawBird = (ctx, o) => {
    const { x, y } = o;
    ctx.fillStyle = INK;
    ctx.fillRect(x + 8, y + 8, 30, 10);
    ctx.fillRect(x + 32, y + 2, 14, 9);
    ctx.fillStyle = ACCENT;
    ctx.fillRect(x + 44, y + 6, 9, 4);
    ctx.fillStyle = PANEL_A; ctx.fillRect(x + 34, y + 3, 6, 5);
    ctx.fillStyle = INK; ctx.fillRect(x + 35, y + 4, 3, 3);
    ctx.fillRect(x + 10, o.wingUp ? y - 3 : y + 18, 22, 9);
  };

  const cactusHitbox = (o) => {
    let mh = 0, mw = 0;
    for (const p of o.parts) { if (p.rh > mh) mh = p.rh; if (p.rx + p.rw > mw) mw = p.rx + p.rw; }
    return { x: o.x + 4, y: GY - mh + 4, w: mw - 8, h: mh - 4 };
  };
  const birdHitbox = (o) => ({ x: o.x + 8, y: o.y + 2, w: 44, h: 20 });

  const spawnCloud = () => cloudsRef.current.push({ x: VW + 80, y: 20 + Math.random() * 90, w: 70 + Math.random() * 50, h: 18 + Math.random() * 12 });
  const spawnGMark = () => gMarksRef.current.push({ x: VW, y: GY - 1 - Math.random() * 5, w: 3 + Math.random() * 14, h: 1 + Math.random() * 1.5 });

  // ---- Reset / start / die ------------------------------------------------------
  const reset = () => {
    scoreRef.current = 0;
    speedRef.current = 480;
    obstaclesRef.current = [];
    cloudsRef.current = [];
    gMarksRef.current = [];
    timersRef.current = { obstTimer: 0, obstInterval: 1.4, cloudTimer: 0, gMarkTimer: 0, flashAlpha: 0, lastMile: 0 };
    const d = dinoRef.current;
    d.y = GY; d.vy = 0; d.ground = true; d.legPhase = 0; d.blinkT = 0;
    setDuck(false);
    for (let i = 0; i < 3; i++) cloudsRef.current.push({ x: 60 + i * 270, y: 30 + Math.random() * 80, w: 80, h: 22 });
    setScore(0);
    setSpeedMult(1);
  };

  const die = useCallback(() => {
    phaseRef.current = 'dead';
    cancelAnimationFrame(rafRef.current);
    const ctx = canvasRef.current.getContext('2d');
    drawDino(ctx);
    if (scoreRef.current > hiScoreRef.current) hiScoreRef.current = scoreRef.current;
    setHiScore(Math.floor(hiScoreRef.current));
    setScore(Math.floor(scoreRef.current));
    setPhase('dead');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loop = useCallback((ts) => {
    const ctx = canvasRef.current.getContext('2d');
    const dt = Math.min((ts - lastTsRef.current) / 1000, 0.05);
    lastTsRef.current = ts;
    const T = timersRef.current;

    scoreRef.current += dt * speedRef.current / 8;
    speedRef.current = Math.min(480 + Math.floor(scoreRef.current / 180) * 28, 1200);

    const mile = Math.floor(scoreRef.current / 100) * 100;
    if (mile > 0 && mile !== T.lastMile) { T.lastMile = mile; T.flashAlpha = 0.6; }
    if (T.flashAlpha > 0) T.flashAlpha = Math.max(0, T.flashAlpha - dt * 2.8);

    T.obstTimer += dt;
    if (T.obstTimer >= T.obstInterval) {
      spawnObst();
      T.obstTimer = 0;
      T.obstInterval = Math.max(0.52, 0.88 + Math.random() * 1.1 - Math.min(0.38, scoreRef.current / 5000));
    }
    T.cloudTimer += dt;
    if (T.cloudTimer > 2.4) { spawnCloud(); T.cloudTimer = 0; }
    T.gMarkTimer += dt;
    if (T.gMarkTimer > 0.26) { spawnGMark(); T.gMarkTimer = 0; }

    // background
    const grad = ctx.createLinearGradient(0, 0, 0, VH);
    grad.addColorStop(0, PANEL_A);
    grad.addColorStop(1, PANEL_B);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VW, VH);

    // clouds
    const clouds = cloudsRef.current;
    for (let i = clouds.length - 1; i >= 0; i--) {
      const cl = clouds[i];
      cl.x -= speedRef.current * 0.24 * dt;
      if (cl.x + cl.w < 0) { clouds.splice(i, 1); continue; }
      ctx.fillStyle = CLOUD;
      ctx.beginPath();
      ctx.ellipse(cl.x + cl.w * 0.5, cl.y, cl.w * 0.5, cl.h * 0.5, 0, 0, Math.PI * 2);
      ctx.ellipse(cl.x + cl.w * 0.3, cl.y + cl.h * 0.1, cl.w * 0.3, cl.h * 0.4, 0, 0, Math.PI * 2);
      ctx.ellipse(cl.x + cl.w * 0.72, cl.y + cl.h * 0.1, cl.w * 0.28, cl.h * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // ground marks
    const gMarks = gMarksRef.current;
    for (let i = gMarks.length - 1; i >= 0; i--) {
      gMarks[i].x -= speedRef.current * dt;
      if (gMarks[i].x < -20) { gMarks.splice(i, 1); continue; }
      ctx.fillStyle = GMARK;
      ctx.fillRect(gMarks[i].x, gMarks[i].y, gMarks[i].w, gMarks[i].h);
    }

    ctx.fillStyle = INK;
    ctx.fillRect(0, GY, VW, 2);

    // dino physics
    const d = dinoRef.current;
    if (!d.ground) {
      d.vy += GRAV * dt;
      d.y += d.vy * dt;
      if (d.y >= GY) { d.y = GY; d.vy = 0; d.ground = true; }
    }
    if (d.ground) d.legPhase = (d.legPhase + dt * speedRef.current / 90) % 1;
    d.blinkT += dt;
    drawDino(ctx);

    // obstacles
    const box = dinoBox();
    const obstacles = obstaclesRef.current;
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i];
      o.x -= speedRef.current * dt;
      if (o.x < -80) { obstacles.splice(i, 1); continue; }
      if (o.type === 'cactus') {
        drawCactus(ctx, o);
        if (overlap(box, cactusHitbox(o))) { die(); return; }
      } else {
        o.wingT += dt;
        if (o.wingT > 0.22) { o.wingUp = !o.wingUp; o.wingT = 0; }
        drawBird(ctx, o);
        if (overlap(box, birdHitbox(o))) { die(); return; }
      }
    }

    if (T.flashAlpha > 0) {
      ctx.fillStyle = `rgba(13,74,74,${T.flashAlpha * 0.18})`;
      ctx.fillRect(0, 0, VW, VH);
    }

    // throttle React state sync so the DOM doesn't repaint 60x/sec
    frameCountRef.current++;
    if (frameCountRef.current % 3 === 0) {
      setScore(Math.floor(scoreRef.current));
      setSpeedMult(Number((speedRef.current / 480).toFixed(1)));
    }

    rafRef.current = requestAnimationFrame(loop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [die]);

  const startGame = useCallback(() => {
    if (phaseRef.current === 'running') return;
    reset();
    phaseRef.current = 'running';
    setPhase('running');
    lastTsRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loop]);

  const handlePrimary = useCallback(() => {
    phaseRef.current !== 'running' ? startGame() : doJump();
  }, [startGame, doJump]);

  // ---- Canvas sizing (HiDPI) --------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const setup = () => {
      dprRef.current = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = VW * dprRef.current;
      canvas.height = VH * dprRef.current;
      ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);
      // idle-state static render
      const grad = ctx.createLinearGradient(0, 0, 0, VH);
      grad.addColorStop(0, PANEL_A);
      grad.addColorStop(1, PANEL_B);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, VW, VH);
      ctx.fillStyle = INK;
      ctx.fillRect(0, GY, VW, 2);
      drawDino(ctx);
    };
    setup();
    window.addEventListener('resize', setup);
    return () => window.removeEventListener('resize', setup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Keyboard controls --------------------------------------------------------
  useEffect(() => {
    const onKeyDown = (e) => {
      if (heldRef.current[e.code]) return;
      heldRef.current[e.code] = true;
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); handlePrimary(); }
      if (e.code === 'ArrowDown') { e.preventDefault(); if (phaseRef.current === 'running') setDuck(true); }
    };
    const onKeyUp = (e) => {
      heldRef.current[e.code] = false;
      if (e.code === 'ArrowDown') setDuck(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handlePrimary, setDuck]);

  // ---- Canvas pointer + swipe ---------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    let swipeY0 = 0;
    const onPointerDown = (e) => { e.preventDefault(); handlePrimary(); };
    const onTouchStart = (e) => { swipeY0 = e.touches[0].clientY; };
    const onTouchEnd = (e) => {
      const dy = e.changedTouches[0].clientY - swipeY0;
      if (dy < -25 && phaseRef.current === 'running') doJump();
    };
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [handlePrimary, doJump]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const pad5 = (n) => String(n).padStart(5, '0');

  return (
    <div className="relative w-full min-h-full overflow-hidden" style={{ background: 'linear-gradient(180deg, #eaf6f5 0%, #fdf3df 100%)' }}>
      <style>{`
        @keyframes dr-sun-arc {
          0%   { transform: translate(-10vw, 12vh); opacity: .55; }
          50%  { transform: translate(50vw, -6vh); opacity: .85; }
          100% { transform: translate(110vw, 12vh); opacity: .55; }
        }
        @keyframes dr-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        .dr-sun { animation: dr-sun-arc 26s linear infinite; }
        .dr-pulse { animation: dr-pulse 1.8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .dr-sun, .dr-pulse { animation: none; }
        }
      `}</style>

      {/* decorative sun + dunes — signature ambient motion, purely atmospheric */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="dr-sun absolute w-24 h-24 rounded-full" style={{ background: 'radial-gradient(circle, #fbbf5c 0%, #f5a623 60%, transparent 72%)', filter: 'blur(1px)' }} />
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1200 140" preserveAspectRatio="none" style={{ opacity: 0.35 }}>
          <path d="M0,90 Q150,40 320,80 T650,70 T1000,90 T1200,60 L1200,140 L0,140 Z" fill="#bfe3df" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1200 110" preserveAspectRatio="none" style={{ opacity: 0.4 }}>
          <path d="M0,70 Q200,30 420,60 T800,50 T1200,75 L1200,110 L0,110 Z" fill="#f0dfb8" />
        </svg>
      </div>

      <div className="relative flex flex-col items-center px-4 py-10 sm:py-14">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-teal-800 text-amber-200 text-xs font-semibold tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
            ENDLESS DESERT SPRINT
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-teal-900">
            Dino Run
          </h1>
          <p className="mt-1 text-sm text-teal-700/70 font-medium">Jump the cacti. Duck the birds. Beat your best.</p>
        </div>

        {/* Stat bar */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-xl mb-4">
          <StatCard label="High Score" value={pad5(hiScore)} icon={<Trophy className="w-4 h-4" />} accent="amber" />
          <StatCard label="Score" value={pad5(score)} icon={<Gauge className="w-4 h-4" />} accent="teal" highlight />
          <StatCard label="Speed" value={`×${speedMult.toFixed(1)}`} icon={<Gauge className="w-4 h-4" />} accent="teal" />
        </div>

        {/* Game console */}
        <div className="relative w-full max-w-xl rounded-2xl bg-white/70 backdrop-blur-sm shadow-xl shadow-teal-900/10 border border-teal-900/10 p-3">
          <div className="relative rounded-xl overflow-hidden border border-teal-900/15">
            <canvas
              ref={canvasRef}
              className="block w-full h-auto touch-none cursor-pointer"
              style={{ aspectRatio: `${VW} / ${VH}` }}
            />
            {phase !== 'running' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6" style={{ background: 'linear-gradient(180deg, rgba(251,246,234,0.9), rgba(242,230,207,0.92))' }}>
                {phase === 'idle' ? (
                  <>
                    <div className="dr-pulse w-16 h-16 rounded-2xl bg-teal-800 flex items-center justify-center shadow-lg shadow-teal-900/25">
                      <Play className="w-7 h-7 text-amber-300 fill-amber-300 ml-1" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-[0.2em] text-teal-900">DINO RUN</h2>
                    <p className="text-xs tracking-[0.15em] text-teal-700/70 font-mono">SPACE / TAP TO PLAY</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-amber-600 flex items-center justify-center shadow-lg shadow-amber-900/25">
                      <RotateCcw className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-[0.2em] text-teal-900">GAME OVER</h2>
                    <p className="text-xs tracking-[0.15em] text-teal-700/70 font-mono">SPACE / TAP TO RESTART</p>
                    <div className="mt-1 px-4 py-1.5 rounded-full bg-teal-900/8 text-teal-800 font-mono text-sm font-bold">
                      SCORE {pad5(score)}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex md:hidden w-full max-w-xl gap-3 mt-4">
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); handlePrimary(); }}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-teal-800 text-teal-800 font-bold text-sm tracking-widest active:bg-teal-800/10 select-none"
          >
            <ArrowUp className="w-4 h-4" /> JUMP
          </button>
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); if (phaseRef.current === 'running') setDuck(true); }}
            onPointerUp={() => setDuck(false)}
            onPointerLeave={() => setDuck(false)}
            onPointerCancel={() => setDuck(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-teal-800 text-teal-800 font-bold text-sm tracking-widest select-none ${duckPressed ? 'bg-teal-800/10' : ''}`}
          >
            <ArrowDown className="w-4 h-4" /> DUCK
          </button>
        </div>

        <p className="hidden md:block mt-4 text-xs tracking-widest text-teal-700/50 font-mono">
          SPACE / ↑ JUMP &nbsp;·&nbsp; ↓ DUCK
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, accent, highlight }) {
  const isAmber = accent === 'amber';
  return (
    <div
      className={`rounded-xl px-3 py-2.5 border ${highlight ? 'bg-teal-900 border-teal-900' : 'bg-white/70 border-teal-900/10'}`}
    >
      <div className={`flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase ${highlight ? 'text-amber-300' : isAmber ? 'text-amber-700' : 'text-teal-700'}`}>
        {icon}
        {label}
      </div>
      <div className={`mt-1 font-mono text-lg font-bold tabular-nums ${highlight ? 'text-white' : 'text-teal-900'}`}>
        {value}
      </div>
    </div>
  );
}
