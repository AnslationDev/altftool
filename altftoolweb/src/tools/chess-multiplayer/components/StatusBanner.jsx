// components/StatusBanner.jsx
"use client";

import { AlertTriangle, Crown, Flag, Handshake } from "lucide-react";

export default function StatusBanner({ status, result, resultReason, turn }) {
  if (result) {
    const tone =
      result === "draw"
        ? "border-sky-600 bg-sky-600/10 text-sky-700 dark:text-sky-300"
        : "border-(--primary) bg-(--primary)/10 text-(--primary)";
    const Icon = result === "draw" ? Handshake : Crown;
    const text =
      result === "draw"
        ? `Draw — ${resultReason}`
        : `${result === "w" ? "White" : "Black"} wins — ${resultReason}`;
    return (
      <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${tone}`}>
        <Icon size={18} />
        {text}
      </div>
    );
  }

  if (status.checkmate) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-600 bg-red-600/10 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300">
        <Crown size={18} /> Checkmate
      </div>
    );
  }
  if (status.stalemate) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-sky-600 bg-sky-600/10 px-4 py-3 text-sm font-semibold text-sky-700 dark:text-sky-300">
        <Flag size={18} /> Stalemate — draw
      </div>
    );
  }
  if (status.draw) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-sky-600 bg-sky-600/10 px-4 py-3 text-sm font-semibold text-sky-700 dark:text-sky-300">
        <Handshake size={18} /> Draw — {status.drawReason}
      </div>
    );
  }
  if (status.inCheck) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-600 bg-red-600/10 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-300">
        <AlertTriangle size={18} /> {turn === "w" ? "White" : "Black"} is in check
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-(--border) bg-(--card) px-4 py-3 text-sm font-medium text-(--muted-foreground)">
      {turn === "w" ? "White" : "Black"} to move
    </div>
  );
}
