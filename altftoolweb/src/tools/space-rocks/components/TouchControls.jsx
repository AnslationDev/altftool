"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ChevronLeft, ChevronRight, Zap } from "lucide-react";

function HoldButton({ name, label, Icon, accent = false, onControl }) {
  const press = (event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    onControl(name, true);
  };
  const release = () => onControl(name, false);

  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onContextMenu={(event) => event.preventDefault()}
      className={`flex h-14 w-14 select-none touch-none items-center justify-center rounded-lg border border-border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        accent
          ? "bg-primary text-primary-foreground active:opacity-80"
          : "bg-muted text-foreground active:bg-primary active:text-primary-foreground"
      }`}
    >
      <Icon className="h-6 w-6" aria-hidden="true" />
    </button>
  );
}

/**
 * On-screen hold-to-act pads, rendered only on touch-capable devices.
 * Every target is 56px (>= 44px minimum).
 */
export default function TouchControls({ onControl }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse)");
    const sync = () => setShow(query.matches || navigator.maxTouchPoints > 0);
    sync();
    query.addEventListener?.("change", sync);
    return () => query.removeEventListener?.("change", sync);
  }, []);

  if (!show) return null;

  return (
    <div className="flex items-center justify-between gap-3" aria-label="Touch controls">
      <div className="flex gap-2">
        <HoldButton name="left" label="Rotate left" Icon={ChevronLeft} onControl={onControl} />
        <HoldButton name="right" label="Rotate right" Icon={ChevronRight} onControl={onControl} />
      </div>
      <div className="flex gap-2">
        <HoldButton name="thrust" label="Thrust" Icon={ArrowUp} onControl={onControl} />
        <HoldButton name="fire" label="Fire" Icon={Zap} accent onControl={onControl} />
      </div>
    </div>
  );
}
