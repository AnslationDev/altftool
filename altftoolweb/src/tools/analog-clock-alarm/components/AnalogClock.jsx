"use client";

import { useEffect, useRef } from "react";

/**
 * SVG-based smooth analog clock.
 * Props:
 *  - date: Date object (updates every render)
 *  - showSeconds: boolean
 *  - showNumbers: boolean
 *  - showTicks: boolean
 *  - use24h: boolean (affects digital display only; clock always shows 0-12)
 *  - theme: "classic" | "modern" | "minimal" | "glass"
 *  - accentColor: css color string (optional override)
 *  - size: number (px, default 300)
 */
export default function AnalogClock({
  date,
  showSeconds = true,
  showNumbers = true,
  showTicks = true,
  theme = "modern",
  accentColor,
  size = 300,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;

  useEffect(() => {
    const svg = canvasRef.current;
    if (!svg) return;

    function render() {
      const now = new Date();
      const ms = now.getMilliseconds();
      const sec = now.getSeconds() + ms / 1000;
      const min = now.getMinutes() + sec / 60;
      const hr = (now.getHours() % 12) + min / 60;

      // Update hand elements
      const hrHand = svg.querySelector("#clock-hr");
      const minHand = svg.querySelector("#clock-min");
      const secHand = svg.querySelector("#clock-sec");
      const secDot = svg.querySelector("#clock-sec-dot");

      if (hrHand) {
        const angle = (hr / 12) * 360 - 90;
        hrHand.setAttribute("transform", `rotate(${angle}, ${cx}, ${cy})`);
      }
      if (minHand) {
        const angle = (min / 60) * 360 - 90;
        minHand.setAttribute("transform", `rotate(${angle}, ${cx}, ${cy})`);
      }
      if (secHand) {
        const angle = (sec / 60) * 360 - 90;
        secHand.setAttribute("transform", `rotate(${angle}, ${cx}, ${cy})`);
      }
      if (secDot) {
        const angle = (sec / 60) * 360 - 90;
        secDot.setAttribute("transform", `rotate(${angle}, ${cx}, ${cy})`);
      }

      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [cx, cy]);

  // Theme-derived styles
  const themes = {
    classic: {
      face: "var(--card)",
      faceStroke: "var(--border)",
      numbers: "var(--foreground)",
      ticks: "var(--muted-foreground)",
      hrColor: "var(--foreground)",
      minColor: "var(--foreground)",
      secColor: accentColor || "var(--primary)",
      center: "var(--foreground)",
      centerSec: accentColor || "var(--primary)",
    },
    modern: {
      face: "var(--card)",
      faceStroke: "var(--border)",
      numbers: "var(--foreground)",
      ticks: "var(--muted-foreground)",
      hrColor: "var(--foreground)",
      minColor: "var(--foreground)",
      secColor: accentColor || "var(--primary)",
      center: "var(--foreground)",
      centerSec: accentColor || "var(--primary)",
    },
    minimal: {
      face: "transparent",
      faceStroke: "var(--border)",
      numbers: "var(--muted-foreground)",
      ticks: "var(--border)",
      hrColor: "var(--foreground)",
      minColor: "var(--foreground)",
      secColor: accentColor || "var(--primary)",
      center: "var(--primary)",
      centerSec: accentColor || "var(--primary)",
    },
    glass: {
      face: "var(--card)",
      faceStroke: "color-mix(in srgb, var(--primary) 30%, var(--border))",
      numbers: "var(--foreground)",
      ticks: "var(--muted-foreground)",
      hrColor: "var(--primary)",
      minColor: "var(--foreground)",
      secColor: accentColor || "var(--secondary, #22D3EE)",
      center: "var(--primary)",
      centerSec: accentColor || "var(--secondary, #22D3EE)",
    },
  };

  const t = themes[theme] || themes.modern;

  // Tick marks
  const ticks = [];
  if (showTicks) {
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
      const isHour = i % 5 === 0;
      const outerR = r - 2;
      const innerR = isHour ? r - (size * 0.08) : r - (size * 0.04);
      const sw = isHour ? Math.max(2, size * 0.008) : Math.max(1, size * 0.004);
      ticks.push(
        <line
          key={i}
          x1={cx + outerR * Math.cos(angle)}
          y1={cy + outerR * Math.sin(angle)}
          x2={cx + innerR * Math.cos(angle)}
          y2={cy + innerR * Math.sin(angle)}
          stroke={t.ticks}
          strokeWidth={sw}
          strokeLinecap="round"
        />
      );
    }
  }

  // Hour numbers
  const numbers = [];
  if (showNumbers) {
    const numR = r - (size * 0.16);
    const fontSize = Math.max(10, size * 0.07);
    for (let i = 1; i <= 12; i++) {
      const angle = ((i / 12) * 2 * Math.PI) - Math.PI / 2;
      numbers.push(
        <text
          key={i}
          x={cx + numR * Math.cos(angle)}
          y={cy + numR * Math.sin(angle)}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight="600"
          fontFamily="var(--font-primary, system-ui)"
          fill={t.numbers}
        >
          {i}
        </text>
      );
    }
  }

  // Hand dimensions
  const hrLen = r * 0.52;
  const minLen = r * 0.72;
  const secLen = r * 0.82;
  const secBackLen = r * 0.2;
  const hrWidth = Math.max(3, size * 0.022);
  const minWidth = Math.max(2, size * 0.014);
  const secWidth = Math.max(1.5, size * 0.008);

  return (
    <svg
      ref={canvasRef}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="Analog clock"
      role="img"
      style={{ display: "block" }}
    >
      {/* Glassmorphism filter for glass theme */}
      {theme === "glass" && (
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}

      {/* Clock face */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={t.face}
        stroke={t.faceStroke}
        strokeWidth={Math.max(1.5, size * 0.007)}
        style={theme === "glass" ? { backdropFilter: "blur(16px)" } : {}}
      />

      {/* Subtle gradient overlay for modern/glass */}
      {(theme === "modern" || theme === "glass") && (
        <radialGradient id="face-grad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="white" stopOpacity={theme === "glass" ? "0.18" : "0.08"} />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      )}
      {(theme === "modern" || theme === "glass") && (
        <circle cx={cx} cy={cy} r={r} fill="url(#face-grad)" />
      )}

      {/* Ticks */}
      {ticks}

      {/* Numbers */}
      {numbers}

      {/* Hour hand */}
      <line
        id="clock-hr"
        x1={cx - (hrLen * 0.2)}
        y1={cy}
        x2={cx + hrLen}
        y2={cy}
        stroke={t.hrColor}
        strokeWidth={hrWidth}
        strokeLinecap="round"
        filter={theme === "glass" ? "url(#glow)" : undefined}
      />

      {/* Minute hand */}
      <line
        id="clock-min"
        x1={cx - (minLen * 0.15)}
        y1={cy}
        x2={cx + minLen}
        y2={cy}
        stroke={t.minColor}
        strokeWidth={minWidth}
        strokeLinecap="round"
        filter={theme === "glass" ? "url(#glow)" : undefined}
      />

      {/* Second hand */}
      {showSeconds && (
        <>
          <line
            id="clock-sec"
            x1={cx - secBackLen}
            y1={cy}
            x2={cx + secLen}
            y2={cy}
            stroke={t.secColor}
            strokeWidth={secWidth}
            strokeLinecap="round"
            filter={theme === "glass" ? "url(#glow)" : undefined}
          />
          <circle
            id="clock-sec-dot"
            cx={cx - secBackLen * 0.4}
            cy={cy}
            r={Math.max(3, size * 0.02)}
            fill={t.centerSec}
          />
        </>
      )}

      {/* Center dot */}
      <circle
        cx={cx}
        cy={cy}
        r={Math.max(4, size * 0.025)}
        fill={showSeconds ? t.centerSec : t.center}
      />
      <circle
        cx={cx}
        cy={cy}
        r={Math.max(2, size * 0.012)}
        fill="var(--card)"
      />
    </svg>
  );
}
