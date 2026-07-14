// components/Controls.jsx
"use client";

import { useState } from "react";
import { Flag, Handshake, RotateCcw, FlipHorizontal2, Check, X } from "lucide-react";

export default function Controls({
  onResign,
  onOfferDraw,
  onAcceptDraw,
  onDeclineDraw,
  onFlip,
  onRestart,
  finished,
  drawOffer,
  myColor,
}) {
  const [confirmResign, setConfirmResign] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);

  const btn =
    "inline-flex items-center gap-2 rounded-lg border border-(--border) bg-(--card) px-3 py-2 text-sm font-semibold text-(--foreground) transition-colors hover:bg-(--muted) focus-visible:ring-2 focus-visible:ring-(--primary)";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!finished && !drawOffer && (
        <button type="button" className={btn} onClick={onOfferDraw}>
          <Handshake size={16} /> Offer Draw
        </button>
      )}

      {drawOffer && (
        <div className="flex items-center gap-2 rounded-lg border border-sky-600 bg-sky-600/10 px-2 py-1.5 text-sm">
          <span className="font-medium text-sky-700 dark:text-sky-300">
            Draw offered
          </span>
          {drawOffer.from !== myColor ? (
            <>
              <button
                type="button"
                onClick={onAcceptDraw}
                className="inline-flex items-center gap-1 rounded-md bg-(--primary) px-2 py-1 text-xs font-semibold text-(--primary-foreground)"
              >
                <Check size={14} /> Accept
              </button>
              <button
                type="button"
                onClick={onDeclineDraw}
                className="inline-flex items-center gap-1 rounded-md border border-(--border) bg-(--card) px-2 py-1 text-xs font-semibold"
              >
                <X size={14} /> Decline
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onDeclineDraw}
              className="inline-flex items-center gap-1 rounded-md border border-(--border) bg-(--card) px-2 py-1 text-xs font-semibold"
            >
              <X size={14} /> Cancel
            </button>
          )}
        </div>
      )}

      {!finished && (
        <button
          type="button"
          className={btn}
          onClick={() => setConfirmResign((v) => !v)}
          aria-expanded={confirmResign}
        >
          <Flag size={16} /> Resign
        </button>
      )}
      {confirmResign && !finished && (
        <span className="flex items-center gap-2 text-sm">
          <span className="text-(--muted-foreground)">Sure?</span>
          <button
            type="button"
            onClick={() => {
              setConfirmResign(false);
              onResign(myColor);
            }}
            className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white"
          >
            Yes, resign
          </button>
          <button
            type="button"
            onClick={() => setConfirmResign(false)}
            className="rounded-md border border-(--border) bg-(--card) px-2 py-1 text-xs font-semibold"
          >
            No
          </button>
        </span>
      )}

      <button type="button" className={btn} onClick={onFlip} aria-label="Flip board">
        <FlipHorizontal2 size={16} /> Flip
      </button>

      <button
        type="button"
        className={btn}
        onClick={() => setConfirmRestart((v) => !v)}
        aria-expanded={confirmRestart}
      >
        <RotateCcw size={16} /> New Game
      </button>
      {confirmRestart && (
        <span className="flex items-center gap-2 text-sm">
          <span className="text-(--muted-foreground)">Restart?</span>
          <button
            type="button"
            onClick={() => {
              setConfirmRestart(false);
              onRestart();
            }}
            className="rounded-md bg-(--primary) px-2 py-1 text-xs font-semibold text-(--primary-foreground)"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setConfirmRestart(false)}
            className="rounded-md border border-(--border) bg-(--card) px-2 py-1 text-xs font-semibold"
          >
            No
          </button>
        </span>
      )}
    </div>
  );
}
