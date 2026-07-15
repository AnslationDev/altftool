import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = [
  "#14B8A6", "#0D9488", "#0F766E", "#115E59", "#134E4A",
  "#5EEAD4", "#2DD4BF", "#99F6E4", "#CCFBF1", "#F0FDFA",
];

export default function WheelCanvas({ entries, colors, isSpinning, spinSpeed, onSpinEnd }) {
  const segments = useMemo(() => {
    if (entries.length === 0) return [];
    const total = entries.length;
    const arc = 360 / total;
    return entries.map((entry, i) => ({
      ...entry,
      startAngle: i * arc,
      endAngle: (i + 1) * arc,
      color: colors[i % colors.length] || COLORS[i % COLORS.length],
    }));
  }, [entries, colors]);

  const rotation = useMemo(() => {
    if (!isSpinning) return 0;
    const extraSpins = 5 + Math.floor(Math.random() * 4);
    const randomAngle = Math.floor(Math.random() * 360);
    return extraSpins * 360 + randomAngle;
  }, [isSpinning]);

  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="text-center text-(--muted-foreground)">
          <svg className="mx-auto mb-2 opacity-30" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
          </svg>
          <p className="text-sm">Add entries to spin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <motion.div
        className="relative"
        animate={{ rotate: isSpinning ? rotation : 0 }}
        transition={{
          duration: isSpinning ? Math.max(2, spinSpeed * 0.8) : 0.8,
          ease: isSpinning ? [0.15, 0.85, 0.35, 1] : "easeOut",
          onComplete: () => { if (isSpinning) onSpinEnd?.(); },
        }}
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((seg, i) => {
            const startRad = (seg.startAngle - 90) * (Math.PI / 180);
            const endRad = (seg.endAngle - 90) * (Math.PI / 180);
            const x1 = cx + r * Math.cos(startRad);
            const y1 = cy + r * Math.sin(startRad);
            const x2 = cx + r * Math.cos(endRad);
            const y2 = cy + r * Math.sin(endRad);
            const largeArc = seg.endAngle - seg.startAngle > 180 ? 1 : 0;
            return (
              <g key={seg.id}>
                <path
                  d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={seg.color}
                  stroke="var(--card)"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}
        </svg>
      </motion.div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-12 h-12 rounded-full bg-(--card) border-2 border-(--border) flex items-center justify-center shadow-lg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
      </div>

      <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none z-10">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--primary)">
          <polygon points="12,2 4,22 20,22" />
        </svg>
      </div>
    </div>
  );
}
