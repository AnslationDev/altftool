"use client";

import { useEffect, useRef } from "react";
import { NUMBER_COLORS } from "../lib/board";

// Fixed game-art palette: the board paints its own light surface so tiles and
// classic number colors stay legible on both light and dark page themes.
const FRAME_BG = "#8296ad";
const TILE_HIDDEN_SHADOW =
  "inset 1px 1px 0 rgba(255,255,255,0.85), inset -1px -1px 0 rgba(71,85,105,0.5)";
const TILE_HIDDEN_STYLE = {
  background: "linear-gradient(135deg, #f2f6fa 0%, #c7d3e0 100%)",
  boxShadow: TILE_HIDDEN_SHADOW,
};
const TILE_REVEALED_STYLE = {
  background: "#dce4ee",
  boxShadow: "inset 0 0 0 1px rgba(100,116,139,0.3)",
};
const TILE_EXPLODED_STYLE = {
  background: "#ef4444",
  boxShadow: "inset 0 0 0 1px rgba(127,29,29,0.6)",
};
const CURSOR_RING = "inset 0 0 0 2px #0d9488";
const LONG_PRESS_MS = 320;
const LONG_PRESS_MOVE_SQ = 100; // cancel if the pointer drifts > 10px

function cellDescription(cell, r, c) {
  const at = `row ${r + 1}, column ${c + 1}`;
  if (cell.wrong) return `Wrong flag, ${at}`;
  if (cell.flagged) return `Flagged, ${at}`;
  if (!cell.revealed) return `Hidden, ${at}`;
  if (cell.mine) return `Mine, ${at}`;
  if (cell.adjacent > 0) {
    return `${cell.adjacent} adjacent mine${cell.adjacent === 1 ? "" : "s"}, ${at}`;
  }
  return `Empty, ${at}`;
}

/**
 * Renders the tile grid and translates gestures into game intents:
 * click/tap -> onPrimary, right-click or touch long-press -> onSecondary.
 * Wide boards scroll horizontally inside their own container.
 */
export default function Board({
  board,
  config,
  exploded,
  cursor,
  showCursor,
  onPrimary,
  onSecondary,
  overlay,
}) {
  const cellRefs = useRef({});
  const longPress = useRef({ timer: null, fired: false, x: 0, y: 0 });
  const lastPointerType = useRef("mouse");

  useEffect(() => {
    const lp = longPress.current;
    return () => {
      if (lp.timer) clearTimeout(lp.timer);
      lp.timer = null;
    };
  }, []);

  // Keep the keyboard cursor visible when a wide board scrolls.
  useEffect(() => {
    if (!showCursor || !cursor) return;
    const el = cellRefs.current[`${cursor[0]}-${cursor[1]}`];
    el?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [cursor, showCursor]);

  const cancelLongPress = () => {
    if (longPress.current.timer) {
      clearTimeout(longPress.current.timer);
      longPress.current.timer = null;
    }
  };

  const handlePointerDown = (e, r, c) => {
    lastPointerType.current = e.pointerType || "mouse";
    longPress.current.fired = false;
    if (e.pointerType === "touch" || e.pointerType === "pen") {
      cancelLongPress();
      longPress.current.x = e.clientX;
      longPress.current.y = e.clientY;
      longPress.current.timer = setTimeout(() => {
        longPress.current.timer = null;
        longPress.current.fired = true;
        if (navigator.vibrate) navigator.vibrate(12);
        onSecondary(r, c);
      }, LONG_PRESS_MS);
    }
  };

  const handlePointerMove = (e) => {
    if (!longPress.current.timer) return;
    const dx = e.clientX - longPress.current.x;
    const dy = e.clientY - longPress.current.y;
    if (dx * dx + dy * dy > LONG_PRESS_MOVE_SQ) cancelLongPress();
  };

  const handleClick = (r, c) => {
    if (longPress.current.fired) {
      longPress.current.fired = false;
      return;
    }
    onPrimary(r, c);
  };

  const handleContextMenu = (e, r, c) => {
    e.preventDefault();
    // Touch long-press already flagged; don't double-toggle via contextmenu.
    if (lastPointerType.current === "touch" || lastPointerType.current === "pen") {
      return;
    }
    onSecondary(r, c);
  };

  return (
    <div className="relative">
      <div className="overflow-x-auto overscroll-x-contain">
        <div
          className="mx-auto"
          style={{
            minWidth: `${config.cols * config.minCell}px`,
            maxWidth: `${config.cols * 48}px`,
          }}
        >
          <div
            role="group"
            tabIndex={0}
            aria-label="Minesweeper board. Use arrow keys to move, Space or Enter to reveal, F to flag."
            className="grid gap-0.5 rounded-lg p-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            style={{
              gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
              background: FRAME_BG,
              touchAction: "manipulation",
            }}
          >
            {board.map((row, r) =>
              row.map((cell, c) => {
                const key = `${r}-${c}`;
                const isExploded =
                  cell.mine && exploded === r * config.cols + c;
                const isCursor =
                  showCursor &&
                  cursor &&
                  cursor[0] === r &&
                  cursor[1] === c;

                let style;
                if (!cell.revealed) style = TILE_HIDDEN_STYLE;
                else if (isExploded) style = TILE_EXPLODED_STYLE;
                else style = TILE_REVEALED_STYLE;

                let content = null;
                let contentStyle;
                if (cell.wrong) content = "❌";
                else if (cell.flagged) content = "\u{1F6A9}";
                else if (cell.revealed && cell.mine) content = "\u{1F4A3}";
                else if (cell.revealed && cell.adjacent > 0) {
                  content = cell.adjacent;
                  contentStyle = { color: NUMBER_COLORS[cell.adjacent] };
                }

                if (isCursor) {
                  style = {
                    ...style,
                    boxShadow: `${style.boxShadow}, ${CURSOR_RING}`,
                  };
                }

                return (
                  <button
                    key={key}
                    ref={(el) => {
                      if (el) cellRefs.current[key] = el;
                      else delete cellRefs.current[key];
                    }}
                    type="button"
                    tabIndex={-1}
                    aria-label={cellDescription(cell, r, c)}
                    onClick={() => handleClick(r, c)}
                    onContextMenu={(e) => handleContextMenu(e, r, c)}
                    onPointerDown={(e) => handlePointerDown(e, r, c)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={cancelLongPress}
                    onPointerLeave={cancelLongPress}
                    onPointerCancel={cancelLongPress}
                    className={`flex aspect-square select-none items-center justify-center rounded-sm font-bold leading-none ${config.textClass}`}
                    style={{
                      ...style,
                      touchAction: "manipulation",
                      WebkitTouchCallout: "none",
                      WebkitUserSelect: "none",
                      userSelect: "none",
                    }}
                  >
                    {content != null ? (
                      <span aria-hidden="true" style={contentStyle}>
                        {content}
                      </span>
                    ) : null}
                  </button>
                );
              }),
            )}
          </div>
        </div>
      </div>
      {overlay}
    </div>
  );
}
