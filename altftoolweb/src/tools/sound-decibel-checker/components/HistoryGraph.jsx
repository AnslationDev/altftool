"use client";

export default function HistoryGraph({ history }) {
  return (
    <div className="rounded-3xl p-8 border border-(--border) bg-(--card) shadow-md transition-colors mb-6">
      <h2 className="text-xl font-semibold text-(--foreground) mb-6">
        Decibel History
      </h2>

      <div className="rounded-xl p-4 border border-(--border) bg-(--muted)">
        <div className="relative h-40">
          <svg className="w-full h-full">
            {[0, 30, 60, 90, 120].map((db) => {
              const y = 160 - (db / 120) * 160;
              return (
                <g key={db}>
                  <line
                    x1="0"
                    y1={y}
                    x2="100%"
                    y2={y}
                    stroke="rgba(0,0,0,0.1)"
                    className="dark:stroke-[rgba(255,255,255,0.1)]"
                    strokeWidth="1"
                  />
                  <text
                    x="5"
                    y={y - 5}
                    fontSize="10"
                    className="fill-(--muted-foreground)"
                  >
                    {db} dB
                  </text>
                </g>
              );
            })}

            {history.length > 1 && (
              <polyline
                points={history
                  .map((db, i) => {
                    const x = (i / 49) * 100;
                    const y = 160 - (db / 120) * 160;
                    return `${x},${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="text-center text-xs text-(--muted-foreground) mt-2">
          Last 50 measurements
        </div>
      </div>
    </div>
  );
}
