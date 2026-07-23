"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";

const controls = [
  { direction: "up", icon: ArrowUp, label: "Move up", className: "col-start-2" },
  { direction: "left", icon: ArrowLeft, label: "Move left", className: "col-start-1" },
  { direction: "down", icon: ArrowDown, label: "Move down", className: "col-start-2" },
  { direction: "right", icon: ArrowRight, label: "Move right", className: "col-start-3" },
];

export default function MobileControls({ onMove }) {
  return (
    <div className="mx-auto grid w-48 grid-cols-3 gap-2 sm:hidden" aria-label="Touch movement controls">
      {controls.map(({ direction, icon: Icon, label, className }) => (
        <button
          key={direction}
          type="button"
          onClick={() => onMove(direction)}
          aria-label={label}
          className={`inline-flex h-12 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] transition hover:border-[var(--primary)] focus:outline-none focus:shadow-[var(--anslation-ds-focus-ring)] ${className}`}
        >
          <Icon className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
}
