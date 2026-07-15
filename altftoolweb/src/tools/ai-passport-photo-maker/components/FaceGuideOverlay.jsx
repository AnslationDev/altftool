"use client";

export default function FaceGuideOverlay({
  faceBounds,
  imageWidth = 800,
  imageHeight = 1000,
  template,
  visible = true,
}) {
  if (!visible) return null;

  const guideX = faceBounds ? faceBounds.x : imageWidth * 0.25;
  const guideY = faceBounds ? faceBounds.y : imageHeight * 0.15;
  const guideW = faceBounds ? faceBounds.w : imageWidth * 0.5;
  const guideH = faceBounds ? faceBounds.h : imageHeight * 0.55;

  const cx = guideX + guideW / 2;
  const cy = guideY + guideH / 2;
  const rx = guideW / 2;
  const ry = guideH / 2;
  const eyeLineY = cy - ry * 0.25;

  const aspect = imageWidth / imageHeight;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${imageWidth} ${imageHeight}`}
        preserveAspectRatio={aspect > 1 ? "xMidYMid meet" : "xMidYMid meet"}
        className="h-full w-full"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill="none"
          stroke="rgba(20,184,166,0.7)"
          strokeWidth="2"
          strokeDasharray="6 4"
          filter="url(#glow)"
        />

        <line
          x1={cx - rx * 0.6}
          y1={eyeLineY}
          x2={cx + rx * 0.6}
          y2={eyeLineY}
          stroke="rgba(251,191,36,0.6)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
        <text
          x={cx + rx * 0.65}
          y={eyeLineY - 4}
          fill="rgba(251,191,36,0.7)"
          fontSize={imageWidth * 0.022}
          fontFamily="system-ui"
        >
          Eye line
        </text>

        <line
          x1={cx - rx * 0.1}
          y1={cy - ry}
          x2={cx - rx * 0.1}
          y2={cy + ry}
          stroke="rgba(20,184,166,0.4)"
          strokeWidth="1"
        />
        <line
          x1={cx - rx}
          y1={cy - ry * 0.1}
          x2={cx + rx}
          y2={cy - ry * 0.1}
          stroke="rgba(20,184,166,0.4)"
          strokeWidth="1"
        />

        <line
          x1={cx - rx * 0.3}
          y1={cy - ry * 0.85}
          x2={cx + rx * 0.3}
          y2={cy - ry * 0.85}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <line
          x1={cx - rx * 0.3}
          y1={cy + ry * 0.85}
          x2={cx + rx * 0.3}
          y2={cy + ry * 0.85}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <text
          x={cx + rx * 0.35}
          y={cy - ry * 0.88}
          fill="rgba(255,255,255,0.5)"
          fontSize={imageWidth * 0.018}
          fontFamily="system-ui"
        >
          Min
        </text>
        <text
          x={cx + rx * 0.35}
          y={cy + ry * 0.88}
          fill="rgba(255,255,255,0.5)"
          fontSize={imageWidth * 0.018}
          fontFamily="system-ui"
        >
          Max
        </text>

        <line
          x1={cx - 12}
          y1={cy}
          x2={cx + 12}
          y2={cy}
          stroke="rgba(20,184,166,0.5)"
          strokeWidth="1"
        />
        <line
          x1={cx}
          y1={cy - 12}
          x2={cx}
          y2={cy + 12}
          stroke="rgba(20,184,166,0.5)"
          strokeWidth="1"
        />

        <text
          x={cx}
          y={cy + ry + 24}
          textAnchor="middle"
          fill="rgba(255,255,255,0.7)"
          fontSize={imageWidth * 0.022}
          fontFamily="system-ui"
          filter="url(#glow)"
        >
          Align your face within the guide
        </text>
      </svg>
    </div>
  );
}
