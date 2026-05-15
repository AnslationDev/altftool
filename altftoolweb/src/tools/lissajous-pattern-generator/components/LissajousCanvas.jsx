import React, { useCallback, useEffect, useRef } from 'react';
import { buildPoints } from '../utils/lissajous';

export default function LissajousCanvas({ settings, paused }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const settingsRef = useRef(settings);
  const pausedRef = useRef(paused);
  const timeRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const style = getComputedStyle(document.documentElement);
    const card = themeValue(style, '--card', '--background');
    const primary = themeValue(style, '--primary', '--foreground');
    const border = themeValue(style, '--card-border', '--border');
    const muted = themeValue(style, '--secondary-foreground', '--foreground');
    const points = buildPoints(settingsRef.current, timeRef.current);
    const scale = Math.min(width, height) * 0.43;
    const cx = width / 2;
    const cy = height / 2;

    ctx.fillStyle = card;
    ctx.fillRect(0, 0, width, height);
    drawGrid(ctx, width, height, border, muted);

    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = primary;
    ctx.shadowColor = primary;
    ctx.shadowBlur = 14;
    ctx.beginPath();

    points.forEach((point, index) => {
      const x = cx + point.x * scale;
      const y = cy + point.y * scale;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
    ctx.shadowBlur = 0;

    const head = points[Math.floor((timeRef.current * 90) % points.length)] || points[0];
    if (head) {
      ctx.fillStyle = primary;
      ctx.beginPath();
      ctx.arc(cx + head.x * scale, cy + head.y * scale, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, []);

  useEffect(() => {
    const tick = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      if (!pausedRef.current) {
        timeRef.current += dt * settingsRef.current.animationSpeed;
      }

      draw();
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [draw]);

  useEffect(() => {
    const observer = new MutationObserver(() => draw());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class', 'style'],
    });
    return () => observer.disconnect();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="block h-full w-full"
      aria-label="Lissajous pattern preview"
    />
  );
}

function drawGrid(ctx, width, height, border, muted) {
  const cx = width / 2;
  const cy = height / 2;
  const spacing = Math.max(28, Math.min(width, height) / 10);

  ctx.save();
  ctx.strokeStyle = border;
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 1;

  for (let x = cx % spacing; x < width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = cy % spacing; y < height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.globalAlpha = 0.7;
  ctx.strokeStyle = muted;
  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, height);
  ctx.moveTo(0, cy);
  ctx.lineTo(width, cy);
  ctx.stroke();
  ctx.restore();
}

function themeValue(style, name, fallbackName) {
  return style.getPropertyValue(name).trim() || style.getPropertyValue(fallbackName).trim();
}
