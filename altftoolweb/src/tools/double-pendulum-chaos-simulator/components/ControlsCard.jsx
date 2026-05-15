import React from 'react';

export default function ControlsCard({
  paused,
  started,
  comparisonMode,
  onStart,
  onTogglePause,
  onReset,
  onResetAll,
  onToggleComparison,
}) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Start / Pause group */}
        <div className="flex-1 flex flex-col gap-3">
          {!started ? (
            <button
              onClick={onStart}
              className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-lg shadow-lg hover:bg-[var(--primary-hover)] transition-all"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Start Simulation
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={onTogglePause}
                className="flex items-center gap-2 flex-1 py-2.5 px-4 rounded-xl bg-[var(--secondary-bg)] border border-[var(--secondary-border)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)] transition-all"
              >
                {paused ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Resume
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                    Pause
                  </>
                )}
              </button>
              <button
                onClick={onReset}
                className="flex items-center gap-2 flex-1 py-2.5 px-4 rounded-xl bg-[var(--secondary-bg)] border border-[var(--secondary-border)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)] transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                Reset
              </button>
            </div>
          )}
          {started && (
            <button
              onClick={onResetAll}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600/20 border border-red-400/30 text-red-300 hover:bg-red-600/30 transition-all text-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Reset All to Defaults
            </button>
          )}
        </div>

        {/* Compare Chaos – always visible */}
        <div className="flex-1">
          <button
            onClick={onToggleComparison}
            className={`flex items-center justify-center gap-3 w-full h-full py-4 rounded-xl font-semibold transition-all ${
              comparisonMode
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg'
                : 'bg-[var(--secondary-bg)] border border-[var(--secondary-border)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)]'
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={comparisonMode ? 'currentColor' : 'var(--secondary-foreground)'} strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="12" y1="3" x2="12" y2="21" />
              <path d="M3 12h18" />
            </svg>
            {comparisonMode ? '⚡ Chaos Comparison ON' : 'Compare Chaos Side‑by‑Side'}
          </button>
        </div>
      </div>
    </div>
  );
}