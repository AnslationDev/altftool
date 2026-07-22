"use client";

import React, { useRef, useEffect } from "react";

export default function BackgroundEngine({ currentTheme, themes }) {
  const canvasRef = useRef(null);
  const config = themes[currentTheme] || {
    primary: "#00ff88",
    canvasAlpha: 0.1,
    bgEngine: "binary-grid",
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId,
      waveTracker = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    // Setup basic raw grids
    let binaryRows = Array(Math.floor(canvas.height / 22))
      .fill("")
      .map(() =>
        Array.from({ length: 45 }, () => Math.round(Math.random())).join(" "),
      );

    // 💡 Local variables for Aperture grid particle vectors
    let apertureParticles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 0.4 + Math.random() * 0.6,
      size: 1 + Math.random() * 1.5,
    }));

    const draw = () => {
      ctx.fillStyle = `rgba(0, 0, 0, ${config.canvasAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = `${config.primary}0a`;
      ctx.fillStyle = `${config.primary}12`;
      ctx.font = "10px 'Courier New', monospace";

      // ENGINE A: MILITECH BINARY RAIN
      if (config.bgEngine === "binary-grid") {
        for (let i = 0; i < binaryRows.length; i++) {
          if (Math.random() > 0.98)
            binaryRows[i] = Array.from({ length: 45 }, () =>
              Math.round(Math.random()),
            ).join(" ");
          ctx.fillText(binaryRows[i], 25, i * 24); //
        }
      }
      // ENGINE B: TEGNIO QUANTUM CIRCUITS
      else if (config.bgEngine === "quantum-wave") {
        ctx.lineWidth = 1;
        ctx.beginPath();
        waveTracker += 0.04;
        for (let i = 0; i < canvas.width; i += 60) {
          ctx.moveTo(i, 0);
          for (let j = 0; j < canvas.height; j += 20) {
            ctx.lineTo(i + Math.sin(j * 0.005 + waveTracker) * 30, j);
          }
        }
        ctx.stroke();
      }
      // ENGINE C: 💡 NEW EXCLUSIVE APERTURE LABS COLD MATHEMATICAL GRID
      else if (config.bgEngine === "aperture-grid") {
        ctx.strokeStyle = `${config.primary}06`;
        ctx.lineWidth = 0.5;

        // Draw steady coordinate crosshairs mesh
        const gridSize = 40;
        for (let x = 0; x < canvas.width; x += gridSize) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }

        // Render traveling chemical simulation vectors dots
        ctx.fillStyle = `${config.primary}25`;
        apertureParticles.forEach((p) => {
          p.y -= p.speed;
          if (p.y < 0) {
            p.y = canvas.height;
            p.x = Math.random() * canvas.width;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });

        // Horizontal running analyzer scope bar
        waveTracker += 2.5;
        if (waveTracker > canvas.height) waveTracker = 0;
        ctx.fillStyle = `${config.primary}08`;
        ctx.fillRect(0, waveTracker, canvas.width, 2);
      }

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, [currentTheme, config]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
}
