"use client";

import { forwardRef } from "react";
import {
  PALETTES,
  createFlowerCircles,
  createMetatronNodes,
  createRingPoints,
  createSriYantraTriangles,
} from "../utils/patterns";

const GeometryCanvas = forwardRef(function GeometryCanvas({ settings }, ref) {
  const palette = PALETTES[settings.palette];
  const strokeWidth = settings.strokeWidth;
  const opacity = settings.opacity / 100;
  const scale = settings.scale / 100;

  return (
    <svg
      ref={ref}
      viewBox="-500 -500 1000 1000"
      role="img"
      aria-label={`${settings.pattern} sacred geometry pattern`}
      className="h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="-500" y="-500" width="1000" height="1000" fill="var(--background)" />
      <g transform={`rotate(${settings.rotation}) scale(${scale})`} opacity={opacity}>
        {settings.pattern === "flower" && (
          <FlowerOfLife settings={settings} palette={palette} strokeWidth={strokeWidth} />
        )}
        {settings.pattern === "sriYantra" && (
          <SriYantra settings={settings} palette={palette} strokeWidth={strokeWidth} />
        )}
        {settings.pattern === "metatron" && (
          <MetatronCube settings={settings} palette={palette} strokeWidth={strokeWidth} />
        )}
      </g>
    </svg>
  );
});

export default GeometryCanvas;

function FlowerOfLife({ settings, palette, strokeWidth }) {
  const spacing = 62;
  const circles = createFlowerCircles(settings.complexity, spacing);
  const boundary = spacing * (settings.complexity + 1.15);

  return (
    <>
      <circle
        cx="0"
        cy="0"
        r={boundary}
        fill="none"
        stroke={palette.accent}
        strokeWidth={strokeWidth * 1.15}
      />
      {circles.map((circle, index) => (
        <circle
          key={`${circle.cx}-${circle.cy}-${index}`}
          {...circle}
          fill="none"
          stroke={index % 3 === 0 ? palette.primary : palette.secondary}
          strokeWidth={strokeWidth}
        />
      ))}
      <circle cx="0" cy="0" r="7" fill={palette.accent} />
    </>
  );
}

function SriYantra({ settings, palette, strokeWidth }) {
  const triangles = createSriYantraTriangles(390);
  const lotusInner = createRingPoints(16, 255, -90);
  const lotusOuter = createRingPoints(16, 320, -78.75);

  return (
    <>
      <circle cx="0" cy="0" r="382" fill="none" stroke={palette.secondary} strokeWidth={strokeWidth} />
      <circle cx="0" cy="0" r="330" fill="none" stroke={palette.accent} strokeWidth={strokeWidth * 0.75} />
      {settings.complexity >= 4 &&
        lotusInner.map((point, index) => (
          <ellipse
            key={`lotus-${index}`}
            cx={point.x}
            cy={point.y}
            rx="26"
            ry="74"
            fill="none"
            stroke={index % 2 ? palette.secondary : palette.accent}
            strokeWidth={strokeWidth * 0.72}
            transform={`rotate(${(360 / lotusInner.length) * index} ${point.x} ${point.y})`}
          />
        ))}
      {settings.complexity >= 5 &&
        lotusOuter.map((point, index) => (
          <ellipse
            key={`outer-lotus-${index}`}
            cx={point.x}
            cy={point.y}
            rx="22"
            ry="58"
            fill="none"
            stroke={palette.secondary}
            strokeWidth={strokeWidth * 0.62}
            transform={`rotate(${(360 / lotusOuter.length) * index + 11.25} ${point.x} ${point.y})`}
          />
        ))}
      {triangles.slice(0, Math.min(triangles.length, settings.complexity + 4)).map((points, index) => (
        <polygon
          key={points}
          points={points}
          fill="none"
          stroke={index < 4 ? palette.primary : palette.accent}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      ))}
      <rect
        x="-365"
        y="-365"
        width="730"
        height="730"
        fill="none"
        stroke={palette.secondary}
        strokeWidth={strokeWidth * 0.75}
        transform="rotate(45)"
      />
      <circle cx="0" cy="0" r="8" fill={palette.primary} />
    </>
  );
}

function MetatronCube({ settings, palette, strokeWidth }) {
  const nodeRadius = 84;
  const nodes = createMetatronNodes(nodeRadius);
  const maxDistance = settings.complexity <= 3 ? nodeRadius * 2.05 : nodeRadius * 4.05;

  return (
    <>
      {nodes.flatMap((start, startIndex) =>
        nodes.slice(startIndex + 1).map((end, localIndex) => {
          const distance = Math.hypot(start.x - end.x, start.y - end.y);
          if (distance > maxDistance) return null;
          return (
            <line
              key={`${startIndex}-${localIndex}`}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke={distance > nodeRadius * 2.1 ? palette.accent : palette.secondary}
              strokeWidth={strokeWidth * 0.58}
            />
          );
        })
      )}
      {nodes.map((node, index) => (
        <circle
          key={`${node.x}-${node.y}`}
          cx={node.x}
          cy={node.y}
          r={nodeRadius}
          fill="none"
          stroke={index === 0 ? palette.primary : palette.secondary}
          strokeWidth={strokeWidth}
        />
      ))}
      {nodes.map((node, index) => (
        <circle
          key={`dot-${node.x}-${node.y}`}
          cx={node.x}
          cy={node.y}
          r={index === 0 ? 8 : 5}
          fill={index === 0 ? palette.primary : palette.accent}
        />
      ))}
    </>
  );
}
