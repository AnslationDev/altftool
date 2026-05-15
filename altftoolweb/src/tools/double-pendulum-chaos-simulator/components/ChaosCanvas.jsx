import React, { useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { rk4Step } from '../utils/physics';

const TRAIL_LENGTH = 150;

export default function ChaosCanvas({ params, initialAngles, paused, restartKey, onStatsUpdate }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastRestartKey = useRef(restartKey);
  const drawRef = useRef(() => {});

  // ------------------------------------------------------------------
  // 1. Simulation ref – created IMMEDIATELY (before any effects)
  // ------------------------------------------------------------------
  const simRef = useRef(null);
  if (!simRef.current) {
    simRef.current = {
      theta1: initialAngles.theta1,
      theta2: initialAngles.theta2,
      omega1: 0,
      omega2: 0,
      trail1: [],
      trail2: [],
      paused: paused,
      ...params,
    };
  }

  // stats
  const statsRef = useRef({
    lastTime: performance.now(),
    frameCount: 0,
    fps: 60,
  });

  // ------------------------------------------------------------------
  // 2. Re‑initialise only when restartKey changes
  // ------------------------------------------------------------------
  useEffect(() => {
    if (lastRestartKey.current !== restartKey) {
      simRef.current = {
        theta1: initialAngles.theta1,
        theta2: initialAngles.theta2,
        omega1: 0,
        omega2: 0,
        trail1: [],
        trail2: [],
        paused: paused,
        ...params,
      };
      lastRestartKey.current = restartKey;

      // force a draw after reset
      requestAnimationFrame(() => {
        drawRef.current?.();
      });
    }
  }, [restartKey, initialAngles, params, paused]);

  // ------------------------------------------------------------------
  // 3. Sync mutable parameters and pause state
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!simRef.current) return;
    simRef.current.L1 = params.L1;
    simRef.current.L2 = params.L2;
    simRef.current.m1 = params.m1;
    simRef.current.m2 = params.m2;
    simRef.current.g = params.g;
    simRef.current.damping = params.damping;
    simRef.current.speed = params.speed;
  }, [params]);

  useEffect(() => {
    if (!simRef.current) return;
    simRef.current.paused = paused;
  }, [paused]);

  // ------------------------------------------------------------------
  // 4. Drawing function
  // ------------------------------------------------------------------
  const getScale = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !simRef.current) return 50;
    const { L1, L2 } = simRef.current;
    const totalLength = L1 + L2 || 1.0;
    const w = canvas.width;
    const h = canvas.height;
    if (w === 0 || h === 0) return 50;
    const dpr = window.devicePixelRatio || 1;
    const effectiveW = w / dpr;
    const effectiveH = h / dpr;
    return Math.min(effectiveW, effectiveH) * 0.45 / totalLength;
  }, []);

  const drawPendulum = useCallback(() => {
    const canvas = canvasRef.current;
    const sim = simRef.current;
    if (!canvas || !sim) return;
    if (canvas.width === 0 || canvas.height === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);  // transparent → card background shows

    const scale = getScale();
    const cx = w / 2;
    const cy = h / 2;

    const { L1, L2, theta1, theta2 } = sim;

    const x1 = L1 * Math.sin(theta1);
    const y1 = L1 * Math.cos(theta1);
    const x2 = x1 + L2 * Math.sin(theta2);
    const y2 = y1 + L2 * Math.cos(theta2);

    // update trails
    sim.trail1.push({ x: cx + x1 * scale, y: cy + y1 * scale });
    sim.trail2.push({ x: cx + x2 * scale, y: cy + y2 * scale });
    if (sim.trail1.length > TRAIL_LENGTH) sim.trail1.shift();
    if (sim.trail2.length > TRAIL_LENGTH) sim.trail2.shift();

    const drawTrail = (trail, color) => {
      if (trail.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      for (let i = 1; i < trail.length; i++) {
        const alpha = i / trail.length;
        ctx.globalAlpha = alpha * 0.8;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    };

    drawTrail(sim.trail1, '#0ea5e9');   // cyan
    drawTrail(sim.trail2, '#d946ef');   // pink

    // red arm
    ctx.beginPath();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#f87171';
    ctx.shadowBlur = 8;
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + x1 * scale, cy + y1 * scale);
    ctx.stroke();

    // green arm
    ctx.beginPath();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#4ade80';
    ctx.shadowBlur = 8;
    ctx.moveTo(cx + x1 * scale, cy + y1 * scale);
    ctx.lineTo(cx + x2 * scale, cy + y2 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // bobs
    const drawBob = (x, y, color) => {
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    drawBob(cx + x1 * scale, cy + y1 * scale, '#ef4444');
    drawBob(cx + x2 * scale, cy + y2 * scale, '#22c55e');

    // draw pivot marker (small metallic cross)
    ctx.beginPath();
    ctx.strokeStyle = '#ffffff33';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 0;
    ctx.moveTo(cx - 8, cy);
    ctx.lineTo(cx + 8, cy);
    ctx.moveTo(cx, cy - 8);
    ctx.lineTo(cx, cy + 8);
    ctx.stroke();

    ctx.restore();
  }, [getScale]);

  // keep drawRef in sync
  useEffect(() => {
    drawRef.current = drawPendulum;
  }, [drawPendulum]);

  // ------------------------------------------------------------------
  // 5. Animation loop (always draws, even paused)
  // ------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let lastTimestamp = performance.now();
    const animate = (timestamp) => {
      const sim = simRef.current;
      if (!sim) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      if (!sim.paused) {
        const dt = (timestamp - lastTimestamp) / 1000;
        lastTimestamp = timestamp;
        const effectiveDt = Math.min(dt, 0.05) * sim.speed;

        const newState = rk4Step(
          { theta1: sim.theta1, theta2: sim.theta2, omega1: sim.omega1, omega2: sim.omega2 },
          effectiveDt,
          sim.L1, sim.L2, sim.m1, sim.m2, sim.g, sim.damping
        );
        sim.theta1 = newState.theta1;
        sim.theta2 = newState.theta2;
        sim.omega1 = newState.omega1;
        sim.omega2 = newState.omega2;

        // stats
        statsRef.current.frameCount++;
        const now = performance.now();
        if (now - statsRef.current.lastTime >= 250) {
          statsRef.current.fps = Math.round(
            (statsRef.current.frameCount * 1000) / (now - statsRef.current.lastTime)
          );
          statsRef.current.frameCount = 0;
          statsRef.current.lastTime = now;

          if (onStatsUpdate) {
            onStatsUpdate({
              fps: statsRef.current.fps,
              theta1: sim.theta1,
              theta2: sim.theta2,
              omega1: sim.omega1,
              omega2: sim.omega2,
              paused: sim.paused,
            });
          }
        }
      }

      drawPendulum();
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [drawPendulum, onStatsUpdate]);

  // ------------------------------------------------------------------
  // 6. Canvas sizing – using layout effect to draw before paint
  // ------------------------------------------------------------------
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      // draw immediately after sizing
      drawRef.current?.();
    };

    resize(); // initial size + draw
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // ------------------------------------------------------------------
  // 7. Render – with scientific grid background
  // ------------------------------------------------------------------
  return (
    <div
      ref={containerRef}
      className="relative w-full h-full rounded-3xl overflow-hidden border border-[var(--border)] backdrop-blur-xl shadow-2xl"
      style={{
        height: '100%',
        background: `
          radial-gradient(circle at 50% 0%, var(--primary)/8 0%, transparent 60%),
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px),
          var(--card)/70
        `,
        backgroundSize: '100% 100%, 25px 25px, 25px 25px, auto',
      }}
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}