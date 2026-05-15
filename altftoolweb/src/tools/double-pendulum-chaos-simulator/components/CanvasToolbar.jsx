import React from 'react';

export default function CanvasToolbar({
  started,
  paused,
  comparisonMode,
  onStart,
  onTogglePause,
  onReset,
  onResetAll,
  onToggleComparison,
}) {
  return (
    <div className="bg-[var(--card)]/70 backdrop-blur-xl border border-[var(--border)] rounded-2xl p-3 mb-4 flex items-center justify-between shadow-xl">
      <div className="flex items-center gap-2">
        {!started ? (
          <button
            onClick={onStart}
            className="flex items-center gap-2 py-2 px-5 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold shadow-md hover:bg-[var(--primary-hover)] transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Start
          </button>
        ) : (
          <>
            <button
              onClick={onTogglePause}
              className="flex items-center gap-2 py-2 px-4 rounded-xl bg-[var(--secondary-bg)]/80 backdrop-blur-sm border border-[var(--secondary-border)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)] transition-all"
            >
              {paused ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              )}
              {paused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={onReset}
              className="p-2 rounded-xl bg-[var(--secondary-bg)]/80 backdrop-blur-sm border border-[var(--secondary-border)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)] transition-all"
              title="Reset"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </button>
          </>
        )}
        {started && (
          <button
            onClick={onResetAll}
            className="p-2 rounded-xl bg-red-600/20 backdrop-blur-sm border border-red-400/30 text-red-300 hover:bg-red-600/30 transition-all"
            title="Reset All to Defaults"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        )}
      </div>

      <button
        onClick={onToggleComparison}
        className={`flex items-center gap-2 py-2 px-5 rounded-xl font-semibold transition-all ${
          comparisonMode
            ? 'bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md'
            : 'bg-[var(--secondary-bg)]/80 backdrop-blur-sm border border-[var(--secondary-border)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)]'
        }`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={comparisonMode ? 'currentColor' : 'var(--secondary-foreground)'} strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="12" y1="3" x2="12" y2="21" />
          <path d="M3 12h18" />
        </svg>
        {comparisonMode ? 'Comparison ON' : 'Compare'}
      </button>
    </div>
  );
}