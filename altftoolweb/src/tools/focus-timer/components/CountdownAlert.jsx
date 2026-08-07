"use client";

import { useEffect, useRef } from "react";
import { Repeat } from "lucide-react";

export default function CountdownAlert({ autoCountdown, onCancel }) {
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (autoCountdown === null) return;
    cancelButtonRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [autoCountdown, onCancel]);

  if (autoCountdown === null) return null;

  return (
    <>
      {/* BACKDROP */}
      <div className="fixed inset-0 bg-black/50 z-40" />

      {/* ALERT BOX */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="countdown-alert-heading"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-sm bg-(--card) border border-(--border) rounded-2xl p-6 text-center shadow-xl"
      >
        {/* Icon */}
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 rounded-full bg-(--primary)/10">
            <Repeat size={24} className="text-(--primary)" />
          </div>
        </div>

        {/* Countdown number */}
        <p
          className="font-black font-primary text-(--primary) mb-2"
          style={{ fontSize: "clamp(3rem, 10vw, 4rem)" }}
        >
          {autoCountdown}
        </p>

        {/* Message */}
        <p id="countdown-alert-heading" className="text-sm font-bold font-primary text-(--foreground) mb-1">
          Next session starting...
        </p>
        <p className="text-xs font-secondary text-(--muted-foreground) mb-6">
          Get ready! Your session begins in {autoCountdown} second
          {autoCountdown !== 1 ? "s" : ""}.
        </p>

        {/* Cancel button */}
        <button
          ref={cancelButtonRef}
          onClick={onCancel}
          className="w-full py-2.5 rounded-xl font-primary font-bold text-sm border border-(--border) bg-(--background) text-(--foreground) cursor-pointer hover:border-(--primary) transition-all"
        >
          Cancel
        </button>
      </div>
    </>
  );
}
