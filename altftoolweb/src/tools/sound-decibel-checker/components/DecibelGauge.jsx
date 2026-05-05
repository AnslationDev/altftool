"use client";

export default function DecibelGauge({ decibels, level, radius = 90 }) {
  const circumference = 2 * Math.PI * radius;
  const progress = (decibels / 120) * circumference;

  return (
    <div className="rounded-3xl p-8 border border-(--border) bg-(--card) shadow-md transition-colors">
      <h2 className="text-xl font-semibold text-(--foreground) mb-6">
        Decibel Gauge
      </h2>

      <div className="flex flex-col items-center">
        <div className="relative w-64 h-64">
          <svg className="w-64 h-64 transform -rotate-90">
            {/* Background Ring */}
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke="var(--border)"
              strokeWidth="20"
              fill="none"
            />

            {/* Active Gauge Ring */}
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke={level.gaugeColor}
              strokeWidth="20"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
              className="transition-all duration-300"
              style={{
                filter: `drop-shadow(0 0 10px ${level.gaugeColor})`,
              }}
            />
          </svg>

          {/* Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-bold text-(--foreground)">
              {decibels}
            </span>

            <span className="text-2xl font-semibold text-(--muted-foreground)">
              dB
            </span>

            <span className={`text-sm mt-2 font-semibold ${level.color}`}>
              {level.text}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
