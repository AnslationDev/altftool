import { Target, Coffee} from "lucide-react";

export default function ProgressRing({ seconds, totalSeconds, phase, focusMinutes, breakMinutes }) {
  const radius = 90;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = totalSeconds > 0 ? (totalSeconds - seconds) / totalSeconds : 0;
  const strokeDashoffset = circumference - progress * circumference;

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-center my-4">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="-rotate-90">
          <circle
            stroke="var(--border)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={phase === "focus" ? "var(--primary)" : "#22c55e"}
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center gap-1">
          <span className="text-xs font-bold font-primary text-(--muted-foreground) uppercase tracking-widest">
            {phase === "focus" ? "Focus" : "Break"}
          </span>
          <span
            className="font-black font-primary text-(--primary)"
            style={{ fontSize: "clamp(1.8rem, 6vw, 2.5rem)", letterSpacing: "2px" }}
          >
            {formatTime(seconds)}
          </span>
          <span className="text-xs text-(--muted-foreground) font-secondary">
            <span className="flex items-center gap-1">
              {phase === "focus" ? <Target size={12} /> : <Coffee size={12} />}
              {phase === "focus" ? "Stay locked in" : "Take a break"}
            </span>
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 flex items-center justify-center gap-1 text-xs text-(--muted-foreground) font-secondary">
      </div>
    </div>
  );
}