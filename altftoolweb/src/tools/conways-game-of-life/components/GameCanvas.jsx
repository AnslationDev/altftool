import React, { useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import {
  createEmptyGrid,
  createSeedGrid,
  getPopulation,
  nextGeneration,
  randomGrid,
  resizeGrid,
} from '../utils/gameLogic';

const CELL_SIZE = 12;
const BORDER = 1;

function themeValue(style, name, fallbackName) {
  return (
    style.getPropertyValue(name).trim()
    || style.getPropertyValue(fallbackName).trim()
    || 'currentColor'
  );
}

export default function GameCanvas({
  speed,
  paused,
  restartKey,
  randomizeFlag,
  stepSignal,
  onGenerationUpdate,
  onPopulationUpdate,
  onGridInfoUpdate,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);
  const gridRef = useRef(null);
  const rowsRef = useRef(0);
  const colsRef = useRef(0);
  const generationRef = useRef(0);
  const lastTimeRef = useRef(0);
  const drawRef = useRef(() => {});
  const pointerDownRef = useRef(false);
  const drawModeRef = useRef(1);
  const randomizeReadyRef = useRef(false);
  const initializedRef = useRef(false);

  const syncStats = useCallback(() => {
    onGenerationUpdate?.(generationRef.current);
    onPopulationUpdate?.(getPopulation(gridRef.current));
    onGridInfoUpdate?.(`${colsRef.current}x${rowsRef.current}`);
  }, [onGenerationUpdate, onGridInfoUpdate, onPopulationUpdate]);

  const resetGrid = useCallback((grid) => {
    gridRef.current = grid;
    generationRef.current = 0;
    drawRef.current?.();
    syncStats();
  }, [syncStats]);

  // ---------- initialise / reset / randomize ----------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const cols = Math.floor(w / CELL_SIZE);
    const rows = Math.floor(h / CELL_SIZE);
    rowsRef.current = rows;
    colsRef.current = cols;
    const nextGrid = initializedRef.current
      ? createEmptyGrid(rows, cols)
      : createSeedGrid(rows, cols);
    initializedRef.current = true;
    resetGrid(nextGrid);
  }, [restartKey, resetGrid]);

  useEffect(() => {
    // randomizeFlag increments => fill with random cells
    if (!randomizeReadyRef.current) {
      randomizeReadyRef.current = true;
      return;
    }

    const rows = rowsRef.current;
    const cols = colsRef.current;
    if (!rows || !cols) return;
    resetGrid(randomGrid(rows, cols));
  }, [randomizeFlag, resetGrid]);

  // ---------- draw ----------
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    const grid = gridRef.current;
    if (!canvas || !grid) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const style = getComputedStyle(document.documentElement);
    const bg = themeValue(style, '--card', '--background');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const rows = rowsRef.current;
    const cols = colsRef.current;
    const cellColor = themeValue(style, '--primary', '--foreground');
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === 1) {
          ctx.fillStyle = cellColor;
          ctx.fillRect(c * CELL_SIZE + BORDER, r * CELL_SIZE + BORDER, CELL_SIZE - 2 * BORDER, CELL_SIZE - 2 * BORDER);
        }
      }
    }

    const border = themeValue(style, '--border', '--card');
    ctx.strokeStyle = border;
    ctx.globalAlpha = 0.42;
    ctx.lineWidth = BORDER;
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL_SIZE);
      ctx.lineTo(cols * CELL_SIZE, r * CELL_SIZE);
      ctx.stroke();
    }
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL_SIZE, 0);
      ctx.lineTo(c * CELL_SIZE, rows * CELL_SIZE);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }, []);

  useEffect(() => {
    drawRef.current = drawGrid;
  }, [drawGrid]);

  // ---------- resize ----------
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

      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const cols = Math.floor(w / CELL_SIZE);
      const rows = Math.floor(h / CELL_SIZE);
      if (!gridRef.current || rows !== rowsRef.current || cols !== colsRef.current) {
        gridRef.current = resizeGrid(gridRef.current, rows, cols);
        rowsRef.current = rows;
        colsRef.current = cols;
        syncStats();
      }
      drawRef.current?.();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [syncStats]);

  const getCellFromEvent = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const dpr = window.devicePixelRatio || 1;
    const x = (e.clientX - rect.left) * scaleX / dpr;
    const y = (e.clientY - rect.top) * scaleY / dpr;
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);
    if (row < 0 || row >= rowsRef.current || col < 0 || col >= colsRef.current) return null;
    return { row, col };
  }, []);

  const paintCell = useCallback((row, col, value) => {
    const grid = gridRef.current;
    if (!grid) return;
    if (grid[row][col] === value) return;
    grid[row][col] = value;
    drawRef.current?.();
    syncStats();
  }, [syncStats]);

  // ---------- pointer draw / erase ----------
  const handlePointerDown = useCallback((e) => {
    const cell = getCellFromEvent(e);
    if (!cell) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerDownRef.current = true;
    drawModeRef.current = gridRef.current?.[cell.row]?.[cell.col] === 1 ? 0 : 1;
    paintCell(cell.row, cell.col, drawModeRef.current);
  }, [getCellFromEvent, paintCell]);

  const handlePointerMove = useCallback((e) => {
    if (!pointerDownRef.current) return;
    const cell = getCellFromEvent(e);
    if (!cell) return;
    paintCell(cell.row, cell.col, drawModeRef.current);
  }, [getCellFromEvent, paintCell]);

  const handlePointerUp = useCallback(() => {
    pointerDownRef.current = false;
  }, []);

  const advanceGeneration = useCallback(() => {
    const rows = rowsRef.current;
    const cols = colsRef.current;
    const oldGrid = gridRef.current;
    if (!oldGrid || rows <= 0 || cols <= 0) return;

    const newGrid = nextGeneration(oldGrid, rows, cols);
    gridRef.current = newGrid;
    generationRef.current += 1;
    drawRef.current?.();
    syncStats();
  }, [syncStats]);

  useEffect(() => {
    if (stepSignal > 0) advanceGeneration();
  }, [advanceGeneration, stepSignal]);

  // ---------- animation loop ----------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const tick = (timestamp) => {
      if (!paused) {
        const dt = timestamp - lastTimeRef.current;
        if (dt >= 1000 / speed) {
          lastTimeRef.current = timestamp;
          advanceGeneration();
        }
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [advanceGeneration, paused, speed]);

  // initial draw
  useEffect(() => {
    const timer = setTimeout(() => drawGrid(), 0);
    return () => clearTimeout(timer);
  }, [drawGrid]);

  useEffect(() => {
    const observer = new MutationObserver(() => drawRef.current?.());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class', 'style'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden"
      style={{ height: '100%' }}
    >
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
