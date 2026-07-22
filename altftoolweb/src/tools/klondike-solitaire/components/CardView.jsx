"use client";

// Card faces are game art inside the play area, so they use a fixed vivid
// palette (white face, red/black pips, navy back) that stays legible on the
// green felt in both light and dark page themes.

import { RANK_LABELS, SUIT_GLYPHS, cardLabel, isRed } from "../lib/klondike";

const RED_PIP = "#c22b45";
const BLACK_PIP = "#252b3f";

const MOTION_CLASS =
  "motion-safe:transition-[transform,box-shadow] motion-safe:duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export default function CardView({
  card,
  cardW,
  selected = false,
  highlighted = false,
  onClick,
  ariaLabel,
  style,
}) {
  const shadows = [];
  if (selected) {
    shadows.push("0 0 0 3px #f6c445", "0 8px 16px rgba(0, 0, 0, 0.45)");
  } else if (highlighted) {
    shadows.push("0 0 0 3px rgba(34, 211, 238, 0.85)");
  } else {
    shadows.push("0 1px 2px rgba(0, 0, 0, 0.35)");
  }

  const base = {
    position: "relative",
    display: "block",
    width: "100%",
    aspectRatio: "5 / 7",
    borderRadius: Math.max(4, cardW * 0.1),
    padding: 0,
    transform: selected ? "translateY(-4%)" : "none",
    cursor: onClick ? "pointer" : "default",
  };

  let inner = null;
  if (card.faceUp) {
    const color = isRed(card.suit) ? RED_PIP : BLACK_PIP;
    const glyph = SUIT_GLYPHS[card.suit];
    base.background = "linear-gradient(160deg, #ffffff 0%, #f1f1e8 100%)";
    base.border = "1px solid rgba(37, 43, 63, 0.4)";
    base.boxShadow = shadows.join(", ");
    inner = (
      <>
        <span
          style={{
            position: "absolute",
            top: "3.5%",
            left: "7%",
            display: "flex",
            alignItems: "baseline",
            gap: Math.max(1, cardW * 0.03),
            fontWeight: 700,
            lineHeight: 1,
            fontSize: Math.max(10, cardW * 0.27),
            color,
          }}
        >
          {RANK_LABELS[card.rank]}
          <span style={{ fontSize: Math.max(9, cardW * 0.23) }}>{glyph}</span>
        </span>
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            right: "8%",
            bottom: "5%",
            lineHeight: 1,
            fontSize: Math.max(12, cardW * 0.44),
            color,
          }}
        >
          {glyph}
        </span>
      </>
    );
  } else {
    base.background = "repeating-linear-gradient(135deg, #24479c 0 6px, #1b3679 6px 12px)";
    base.border = "1px solid #10224e";
    base.boxShadow = `${shadows.join(", ")}, inset 0 0 0 2px rgba(255, 255, 255, 0.22)`;
  }

  const merged = { ...base, ...style };
  const label = ariaLabel || (card.faceUp ? cardLabel(card) : "Face-down card");

  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-label={label} className={MOTION_CLASS} style={merged}>
        {inner}
      </button>
    );
  }
  return (
    <div role="img" aria-label={label} className={MOTION_CLASS} style={merged}>
      {inner}
    </div>
  );
}

export function EmptySlot({ cardW, onClick, highlighted = false, ariaLabel, children, style }) {
  const slotStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    aspectRatio: "5 / 7",
    borderRadius: Math.max(4, cardW * 0.1),
    border: `2px dashed ${highlighted ? "rgba(34, 211, 238, 0.95)" : "rgba(255, 255, 255, 0.4)"}`,
    background: highlighted ? "rgba(34, 211, 238, 0.16)" : "rgba(0, 0, 0, 0.14)",
    color: "rgba(255, 255, 255, 0.65)",
    fontSize: Math.max(11, cardW * 0.34),
    lineHeight: 1,
    padding: 0,
    cursor: onClick ? "pointer" : "default",
    ...style,
  };

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        style={slotStyle}
      >
        {children}
      </button>
    );
  }
  return (
    <div role="img" aria-label={ariaLabel} style={slotStyle}>
      {children}
    </div>
  );
}
