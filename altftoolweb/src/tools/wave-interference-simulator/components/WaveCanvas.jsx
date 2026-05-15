import { forwardRef, useRef, useEffect, useCallback, useImperativeHandle } from "react";
import { sinWave, rippleWave, doubleSlitIntensity, TWO_PI, createCustomWaveFn, evalCustomWave } from "../utils/waveMath";

const DRAW = { rippleRes: 180 };

const WaveCanvas = forwardRef(function WaveCanvas(
  {
    mode,
    waves,
    emitterDistance,
    doubleSettings,
    customFormula,
    simTimeRef,
    snapshotCanvas,
    showSnapshot,
    onHover,
  },
  ref
) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const lastFrameRef = useRef(0);
  const paramsRef = useRef({ mode, waves, emitterDistance, doubleSettings, customFormula });
  const mouseRef = useRef({ x: null, y: null });

  const customFnsRef = useRef([null, null]);

  useImperativeHandle(ref, () => canvasRef.current, []);

  // Read CSS variables *directly* every draw – no state, no delay
  const getThemeColors = () => {
    const style = getComputedStyle(document.documentElement);
    return {
      bg: style.getPropertyValue("--background").trim() || "#000A1F",
      border: style.getPropertyValue("--border").trim() || "#2a2a2e",
      foreground: style.getPropertyValue("--foreground").trim() || "#ffffff",
      card: style.getPropertyValue("--card").trim() || "#1A2130",
    };
  };

  useEffect(() => {
    if (customFormula) {
      [0, 1].forEach(idx => {
        const formulaStr = idx === 0 ? customFormula.wave1 : customFormula.wave2;
        customFnsRef.current[idx] = customFormula.useCustom[idx] ? createCustomWaveFn(formulaStr) : null;
      });
    }
  }, [customFormula]);

  useEffect(() => {
    paramsRef.current = { mode, waves: waves.map(w => ({...w})), emitterDistance, doubleSettings, customFormula };
  }, [mode, waves, emitterDistance, doubleSettings, customFormula]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const scaleX = canvas.width / rect.width / dpr;
    const scaleY = canvas.height / rect.height / dpr;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const w = rect.width;
    const h = rect.height;
    const px = (mx / w) * 8 - 4;
    const py = (my / h) * 8 - 4;
    mouseRef.current = { x: px, y: py };
    if (onHover) onHover(mouseRef.current);
  };

  const handleMouseLeave = () => {
    mouseRef.current = { x: null, y: null };
    if (onHover) onHover(null);
  };

  // Helper to convert card hex to rgba for tooltips
  const hexToRgba = (hex, alpha) => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0,2), 16);
    const g = parseInt(hex.substring(2,4), 16);
    const b = parseInt(hex.substring(4,6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  const draw1D = useCallback((ctx, w, h) => {
    const { mode, waves, emitterDistance, customFormula: cf } = paramsRef.current;
    const time = simTimeRef.current;
    const { bg, border, foreground, card } = getThemeColors();

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Soft grid lines
    ctx.strokeStyle = border;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;
    for (let i = 0; i <= w; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
    }
    for (let j = 0; j <= h; j += 40) {
      ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(w, j); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const midY = h / 2;
    const scale = 50;

    if (mode !== "ripple" && mode !== "doubleslit") {
      waves.forEach((wave, idx) => {
        const customFn = customFnsRef.current[idx];
        const activeCustom = cf?.useCustom[idx];
        ctx.save();
        ctx.strokeStyle = idx === 0 ? "#ff44aa" : "#00e5ff";
        ctx.lineWidth = 2.2;
        ctx.shadowColor = "rgba(0,0,0,0.7)";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const phaseX = (x / w) * 8 - 4;
          let y;
          if (activeCustom && customFn) {
            y = evalCustomWave(customFn, phaseX, time, {
              A: wave.amplitude, k: TWO_PI / wave.wavelength,
              w: TWO_PI * wave.frequency, phi: wave.phase,
              wavelength: wave.wavelength, frequency: wave.frequency,
              phase: wave.phase, amplitude: wave.amplitude,
            });
          } else {
            y = sinWave(phaseX, time, wave);
          }
          const canvasY = midY - y * scale;
          if (x === 0) ctx.moveTo(x, canvasY);
          else ctx.lineTo(x, canvasY);
        }
        ctx.stroke();
        ctx.restore();
      });
    }

    if (mode === "interference" || mode === "standing") {
      ctx.save();
      ctx.strokeStyle = "#ffe066";
      ctx.lineWidth = 3;
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const phaseX = (x / w) * 8 - 4;
        let sum = 0;
        waves.forEach((wave, idx) => {
          const customFn = customFnsRef.current[idx];
          const activeCustom = cf?.useCustom[idx];
          if (activeCustom && customFn) {
            sum += evalCustomWave(customFn, phaseX, time, {
              A: wave.amplitude, k: TWO_PI / wave.wavelength,
              w: TWO_PI * wave.frequency, phi: wave.phase,
            });
          } else {
            sum += sinWave(phaseX, time, wave);
          }
        });
        const canvasY = midY - sum * scale;
        if (x === 0) ctx.moveTo(x, canvasY);
        else ctx.lineTo(x, canvasY);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Tooltip
    if ((mode === "interference" || mode === "standing") && mouseRef.current.x !== null) {
      const mousePhysX = mouseRef.current.x;
      const sep = emitterDistance;
      const s1x = -sep / 2;
      const s2x = sep / 2;
      const dist1 = Math.abs(mousePhysX - s1x);
      const dist2 = Math.abs(mousePhysX - s2x);
      const deltaR = dist1 - dist2;
      const wl = waves[0].wavelength;
      const phaseFromPath = ((deltaR % wl) / wl) * 360;
      const extraPhase = ((waves[0].phase - (waves[1]?.phase || 0)) * 180) / Math.PI;
      const totalPhase = (phaseFromPath + extraPhase) % 360;
      const normalizedPhase = totalPhase > 180 ? 360 - totalPhase : totalPhase;
      const isConstructive = normalizedPhase < 30;
      const isDestructive = normalizedPhase > 150;

      const cursorX = ((mousePhysX + 4) / 8) * w;
      ctx.save();
      ctx.strokeStyle = foreground;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.6;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(cursorX, 0);
      ctx.lineTo(cursorX, h);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      const tipX = cursorX + 8;
      const tipY = 26;
      ctx.fillStyle = hexToRgba(card, 0.92);
      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(tipX, tipY - 16, 180, 56, 6);
      ctx.fill();
      ctx.stroke();

      ctx.font = "bold 11px 'Manrope', sans-serif";
      ctx.fillStyle = isConstructive ? "#4dff4d" : isDestructive ? "#ff4d4d" : foreground;
      ctx.fillText(isConstructive ? "✓ Constructive" : isDestructive ? "✗ Destructive" : "∼ Mixed", tipX + 8, tipY);

      ctx.font = "11px 'Manrope', sans-serif";
      ctx.fillStyle = foreground;
      ctx.fillText(`Δr: ${deltaR.toFixed(2)} | φ total: ${totalPhase.toFixed(0)}°`, tipX + 8, tipY + 18);
      ctx.restore();
    }
  }, [simTimeRef]);

  const drawRipple = useCallback((ctx, w, h) => {
    const { waves, emitterDistance } = paramsRef.current;
    const time = simTimeRef.current;
    const { bg, border, foreground, card } = getThemeColors();
    const res = DRAW.rippleRes;
    const cellW = w / res, cellH = h / res;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const centerX = w / 2, centerY = h / 2, sepPx = emitterDistance * 40;
    for (let j = 0; j < res; j++) {
      for (let i = 0; i < res; i++) {
        const px = (i / res) * 8 - 4, py = (j / res) * 8 - 4;
        let disp = rippleWave(px, py, -sepPx / 2 / 40, 0, time, waves[0]);
        disp += rippleWave(px, py, sepPx / 2 / 40, 0, time, waves[1] || waves[0]);
        const t = Math.min(1, Math.abs(disp) * 0.9);
        ctx.fillStyle = `rgb(${30 + t * 225}, ${30 + t * 80}, ${100 + t * 155})`;
        ctx.fillRect(i * cellW, j * cellH, cellW + 1, cellH + 1);
      }
    }
    ctx.fillStyle = "#ff44aa";
    ctx.beginPath(); ctx.arc(centerX - sepPx / 2, centerY, 5, 0, TWO_PI); ctx.fill();
    ctx.fillStyle = "#00e5ff";
    ctx.beginPath(); ctx.arc(centerX + sepPx / 2, centerY, 5, 0, TWO_PI); ctx.fill();

    if (mouseRef.current.x !== null) {
      // ... same tooltip logic as before using foreground, card, border ...
      const pPhysX = mouseRef.current.x, pPhysY = mouseRef.current.y;
      const s1x = -emitterDistance/2, s2x = emitterDistance/2;
      const r1 = Math.sqrt((pPhysX-s1x)**2 + (pPhysY)**2), r2 = Math.sqrt((pPhysX-s2x)**2 + (pPhysY)**2);
      const deltaR = r1 - r2, wl = waves[0].wavelength;
      const phaseFromPath = ((deltaR % wl) / wl) * 360;
      const extraPhase = ((waves[0].phase - (waves[1]?.phase || 0)) * 180) / Math.PI;
      const totalPhase = (phaseFromPath + extraPhase) % 360;
      const normalizedPhase = totalPhase > 180 ? 360 - totalPhase : totalPhase;
      const isConstructive = normalizedPhase < 30, isDestructive = normalizedPhase > 150;
      const cursorX = ((pPhysX + 4) / 8) * w, cursorY = ((pPhysY + 4) / 8) * h;

      ctx.save();
      ctx.strokeStyle = foreground;
      ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.arc(cursorX, cursorY, 8, 0, TWO_PI); ctx.stroke();
      ctx.globalAlpha = 1;
      const tipX = cursorX + 12, tipY = cursorY - 24;
      ctx.fillStyle = hexToRgba(card, 0.92);
      ctx.strokeStyle = border;
      ctx.beginPath(); ctx.roundRect(tipX, tipY, 170, 50, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = isConstructive ? "#4dff4d" : isDestructive ? "#ff4d4d" : foreground;
      ctx.font = "bold 11px 'Manrope', sans-serif";
      ctx.fillText(isConstructive ? "✓ Constructive" : isDestructive ? "✗ Destructive" : "∼ Mixed", tipX+6, tipY+16);
      ctx.fillStyle = foreground;
      ctx.fillText(`Δr: ${deltaR.toFixed(2)} | φ: ${totalPhase.toFixed(0)}°`, tipX+6, tipY+34);
      ctx.restore();
    }
  }, [simTimeRef]);

  const drawDoubleSlit = useCallback((ctx, w, h) => {
    const { doubleSettings: ds } = paramsRef.current;
    const { bg, foreground } = getThemeColors();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const screenY = h * 0.75, barHeight = h * 0.15;
    const xMin = -1.5e-2, xMax = 1.5e-2;
    for (let i = 0; i < w; i++) {
      const xPhys = xMin + (i / w) * (xMax - xMin);
      const intensity = doubleSlitIntensity(xPhys, ds);
      const r = 40 + intensity * 215, g = 30 + intensity * 130, b = 150 + intensity * 105;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(i, screenY, 1, barHeight);
    }
    const graphY = screenY + barHeight + 20, graphH = h - graphY - 10;
    ctx.strokeStyle = foreground;
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 4;
    ctx.beginPath();
    for (let i = 0; i < w; i++) {
      const xPhys = xMin + (i / w) * (xMax - xMin);
      const intensity = doubleSlitIntensity(xPhys, ds);
      const yPos = graphY + graphH * (1 - intensity);
      if (i === 0) ctx.moveTo(i, yPos); else ctx.lineTo(i, yPos);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, []);

  useEffect(() => {
    function animateFrame(timestamp) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      const clientW = canvas.clientWidth, clientH = canvas.clientHeight;
      canvas.width = clientW * dpr; canvas.height = clientH * dpr;
      ctx.scale(dpr, dpr);

      if (!lastFrameRef.current) lastFrameRef.current = timestamp;
      lastFrameRef.current = timestamp;

      const currentMode = paramsRef.current.mode;
      if (currentMode === "doubleslit") drawDoubleSlit(ctx, clientW, clientH);
      else if (currentMode === "ripple") drawRipple(ctx, clientW, clientH);
      else draw1D(ctx, clientW, clientH);

      if (showSnapshot && snapshotCanvas) {
        ctx.globalAlpha = 0.35;
        ctx.drawImage(snapshotCanvas, 0, 0, clientW, clientH);
        ctx.globalAlpha = 1;
      }
      animRef.current = requestAnimationFrame(animateFrame);
    }

    animRef.current = requestAnimationFrame(animateFrame);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw1D, drawDoubleSlit, drawRipple, showSnapshot, snapshotCanvas]);

  return (
    <div
      className="relative h-[460px] w-full overflow-hidden rounded-lg border border-[var(--border)] shadow-[var(--anslation-ds-shadow-sm)]"
      style={{ background: 'var(--background)' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
});

export default WaveCanvas;
