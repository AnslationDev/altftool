import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import {
  addChemical,
  createGrid,
  getPatternStats,
  stepReaction,
} from '../utils/reactionDiffusion';

const CELL_SCALE = 4;

export default function ReactionCanvas({
  settings,
  paused,
  resetKey,
  seed,
  onStatsUpdate,
  onResolutionUpdate,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const frameRef = useRef(null);
  const gridRef = useRef(null);
  const dimsRef = useRef({ width: 0, height: 0 });
  const imageRef = useRef(null);
  const pointerDownRef = useRef(false);
  const settingsRef = useRef(settings);
  const pausedRef = useRef(paused);
  const statsFrameRef = useRef(0);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const grid = gridRef.current;
    const image = imageRef.current;
    if (!canvas || !grid || !image) return;

    const ctx = canvas.getContext('2d');
    const style = getComputedStyle(document.documentElement);
    const background = parseColor(themeValue(style, '--card', '--background'));
    const primary = parseColor(themeValue(style, '--primary', '--foreground'));
    const width = dimsRef.current.width;
    const height = dimsRef.current.height;

    for (let i = 0; i < grid.b.length; i++) {
      const amount = Math.max(0, Math.min(1, grid.b[i] * 1.6));
      const px = i * 4;
      image.data[px] = mix(background.r, primary.r, amount);
      image.data[px + 1] = mix(background.g, primary.g, amount);
      image.data[px + 2] = mix(background.b, primary.b, amount);
      image.data[px + 3] = 255;
    }

    ctx.imageSmoothingEnabled = false;
    ctx.putImageData(image, 0, 0);
    ctx.drawImage(canvas, 0, 0, width, height, 0, 0, canvas.width, canvas.height);
  }, []);

  const initialize = useCallback((width, height, nextSeed = seed) => {
    if (!width || !height) return;
    dimsRef.current = { width, height };
    gridRef.current = createGrid(width, height, nextSeed);
    imageRef.current = new ImageData(width, height);
    statsFrameRef.current = 0;
    onResolutionUpdate?.(`${width}x${height}`);
    onStatsUpdate?.(getPatternStats(gridRef.current));
    draw();
  }, [draw, onResolutionUpdate, onStatsUpdate, seed]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(80, Math.floor(rect.width / CELL_SCALE));
      const height = Math.max(60, Math.floor(rect.height / CELL_SCALE));

      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      initialize(width, height);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [initialize]);

  useEffect(() => {
    initialize(dimsRef.current.width, dimsRef.current.height, seed);
  }, [initialize, resetKey, seed]);

  const paintAtPointer = useCallback((event) => {
    const canvas = canvasRef.current;
    const grid = gridRef.current;
    if (!canvas || !grid) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * dimsRef.current.width);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * dimsRef.current.height);
    addChemical(grid, dimsRef.current.width, dimsRef.current.height, x, y, 9);
    draw();
  }, [draw]);

  const handlePointerDown = useCallback((event) => {
    pointerDownRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    paintAtPointer(event);
  }, [paintAtPointer]);

  const handlePointerMove = useCallback((event) => {
    if (pointerDownRef.current) paintAtPointer(event);
  }, [paintAtPointer]);

  const handlePointerUp = useCallback(() => {
    pointerDownRef.current = false;
  }, []);

  useEffect(() => {
    const tick = () => {
      if (!pausedRef.current && gridRef.current) {
        for (let i = 0; i < settingsRef.current.stepsPerFrame; i++) {
          stepReaction(gridRef.current, dimsRef.current.width, dimsRef.current.height, settingsRef.current);
        }
        draw();

        statsFrameRef.current += 1;
        if (statsFrameRef.current % 12 === 0) {
          onStatsUpdate?.(getPatternStats(gridRef.current));
        }
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [draw, onStatsUpdate]);

  useEffect(() => {
    const observer = new MutationObserver(() => draw());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class', 'style'],
    });
    return () => observer.disconnect();
  }, [draw]);

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block h-full w-full cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
}

function themeValue(style, name, fallbackName) {
  return style.getPropertyValue(name).trim() || style.getPropertyValue(fallbackName).trim();
}

function parseColor(value) {
  if (value.startsWith('#')) {
    const hex = value.replace('#', '');
    const full = hex.length === 3 ? hex.split('').map((char) => char + char).join('') : hex;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
    };
  }

  const rgb = value.match(/\d+(\.\d+)?/g)?.map(Number);
  if (rgb?.length >= 3) return { r: rgb[0], g: rgb[1], b: rgb[2] };

  return { r: 37, g: 99, b: 235 };
}

function mix(start, end, amount) {
  return Math.round(start + (end - start) * amount);
}
