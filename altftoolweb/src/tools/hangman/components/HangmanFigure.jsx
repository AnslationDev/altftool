"use client";

// Minimal, friendly line-art figure drawn with currentColor strokes so it
// inherits the page foreground in both light and dark themes. Parts appear
// one by one as wrong guesses accumulate (0-6).

const PART_STYLE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export default function HangmanFigure({ wrongCount = 0, lost = false }) {
  const visible = (threshold) => wrongCount >= threshold;

  const partClass = (threshold) =>
    `motion-safe:transition-opacity motion-safe:duration-300 ${
      visible(threshold) ? "opacity-100" : "opacity-0"
    }`;

  return (
    <svg
      viewBox="0 0 200 220"
      role="img"
      aria-label={`Hangman figure, ${wrongCount} of 6 wrong guesses`}
      className="h-full w-full"
    >
      {/* Gallows — always visible */}
      <g {...PART_STYLE} opacity="0.55">
        <line x1="20" y1="205" x2="120" y2="205" />
        <line x1="60" y1="205" x2="60" y2="24" />
        <line x1="60" y1="24" x2="140" y2="24" />
        <line x1="140" y1="24" x2="140" y2="44" />
      </g>

      {/* 1 — head */}
      <g {...PART_STYLE} className={partClass(1)}>
        <circle cx="140" cy="60" r="16" />
        {/* friendly face */}
        <g strokeWidth="3">
          <line x1="134" y1="57" x2="134" y2="58.5" />
          <line x1="146" y1="57" x2="146" y2="58.5" />
          {lost ? (
            <path d="M134 67 Q140 63 146 67" />
          ) : (
            <path d="M134 64 Q140 69 146 64" />
          )}
        </g>
      </g>

      {/* 2 — body */}
      <line {...PART_STYLE} className={partClass(2)} x1="140" y1="76" x2="140" y2="128" />
      {/* 3 — left arm */}
      <line {...PART_STYLE} className={partClass(3)} x1="140" y1="90" x2="114" y2="112" />
      {/* 4 — right arm */}
      <line {...PART_STYLE} className={partClass(4)} x1="140" y1="90" x2="166" y2="112" />
      {/* 5 — left leg */}
      <line {...PART_STYLE} className={partClass(5)} x1="140" y1="128" x2="118" y2="164" />
      {/* 6 — right leg */}
      <line {...PART_STYLE} className={partClass(6)} x1="140" y1="128" x2="162" y2="164" />
    </svg>
  );
}
