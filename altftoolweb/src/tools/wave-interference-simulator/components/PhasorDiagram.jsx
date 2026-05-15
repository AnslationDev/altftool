import { useRef, useEffect, useCallback } from "react";

export default function PhasorDiagram({ waves, simTimeRef, staticPhasor = null }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const draw = useCallback(
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "var(--card)";
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // Static phasor (double‑slit hover)
      if (staticPhasor) {
        const { a1, a2, phaseDiff } = staticPhasor;
        const maxAmp = Math.max(a1, a2, 2);
        const scale = Math.min(w, h) / (maxAmp * 2.5);

        ctx.strokeStyle = "var(--border)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, cy); ctx.lineTo(w, cy);
        ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
        ctx.stroke();

        // Vector 1
        ctx.strokeStyle = "#ff44aa";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + a1 * scale, cy);
        ctx.stroke();
        ctx.fillStyle = "#ff44aa";
        ctx.beginPath();
        ctx.arc(cx + a1 * scale, cy, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Vector 2
        const x2 = cx + a2 * scale * Math.cos(phaseDiff);
        const y2 = cy - a2 * scale * Math.sin(phaseDiff);
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.fillStyle = "#00e5ff";
        ctx.beginPath();
        ctx.arc(x2, y2, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Resultant
        const sumX = a1 * scale + a2 * scale * Math.cos(phaseDiff);
        const sumY = -a2 * scale * Math.sin(phaseDiff);
        ctx.strokeStyle = "#ffe066";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#ffe066";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + sumX, cy + sumY);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffe066";
        ctx.beginPath();
        ctx.arc(cx + sumX, cy + sumY, 5, 0, 2 * Math.PI);
        ctx.fill();
        return;
      }

      // Dynamic rotating phasor
      if (!waves || waves.length === 0) return;

      const time = simTimeRef.current;
      const maxAmp = Math.max(waves[0]?.amplitude || 1, waves[1]?.amplitude || 1, 2);
      const scale = Math.min(w, h) / (maxAmp * 2.5);

      ctx.strokeStyle = "var(--border)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, cy); ctx.lineTo(w, cy);
      ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
      ctx.stroke();

      waves.forEach((wave, idx) => {
        const omega = 2 * Math.PI * wave.frequency * wave.speed;
        const angle = omega * time + wave.phase;
        const len = wave.amplitude * scale;
        const x = cx + len * Math.cos(angle);
        const y = cy - len * Math.sin(angle);
        ctx.strokeStyle = idx === 0 ? "#ff44aa" : "#00e5ff";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = idx === 0 ? "#ff44aa" : "#00e5ff";
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });

      const a1 = waves[0]?.amplitude || 0;
      const a2 = waves[1]?.amplitude || 0;
      const omega = 2 * Math.PI * (waves[0]?.frequency || 1) * (waves[0]?.speed || 1);
      const sum = {
        x: a1 * Math.cos(omega * time + waves[0]?.phase || 0) + a2 * Math.cos(omega * time + (waves[1]?.phase || 0)),
        y: a1 * Math.sin(omega * time + waves[0]?.phase || 0) + a2 * Math.sin(omega * time + (waves[1]?.phase || 0)),
      };
      const mag = Math.sqrt(sum.x ** 2 + sum.y ** 2);
      if (mag > 0.01) {
        ctx.strokeStyle = "#ffe066";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#ffe066";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + sum.x * scale, cy - sum.y * scale);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffe066";
        ctx.beginPath();
        ctx.arc(cx + sum.x * scale, cy - sum.y * scale, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    },
    [waves, simTimeRef, staticPhasor]
  );

  useEffect(() => {
    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      const clientW = canvas.clientWidth;
      const clientH = canvas.clientHeight;
      canvas.width = clientW * dpr;
      canvas.height = clientH * dpr;
      ctx.scale(dpr, dpr);
      draw(ctx, clientW, clientH);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="w-full h-36 rounded-xl"
        style={{ background: "var(--card)" }}
      />
      <p className="text-[10px] text-[var(--foreground)]/50 mt-1 text-center">
        {staticPhasor ? "Phase difference at selected point" : "Rotating vectors – yellow shows resultant"}
      </p>
    </div>
  );
}