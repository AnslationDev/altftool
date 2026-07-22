"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronsDown,
  Repeat,
  RotateCw,
} from "lucide-react";

const BUTTON_CLASS =
  "flex h-12 items-center justify-center rounded-md border border-border bg-muted text-foreground transition-colors select-none touch-none active:bg-primary active:text-primary-foreground disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function ControlButton({ label, onPress, repeat = false, disabled = false, children }) {
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  const stop = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  // A button disabled mid-press (e.g. game over while holding soft drop) stops
  // firing pointer events, so pointerup can never clear the repeat timers.
  // Stop them here or the interval keeps firing into the next game.
  useEffect(() => {
    if (disabled) stop();
  }, [disabled, stop]);

  const handlePointerDown = (event) => {
    if (disabled) return;
    event.preventDefault();
    onPress();
    if (repeat) {
      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(onPress, 80);
      }, 240);
    }
  };

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className={BUTTON_CLASS}
      onPointerDown={handlePointerDown}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(event) => event.preventDefault()}
    >
      {children}
    </button>
  );
}

/** On-screen controls: hold / rotate / hard drop on top, move + soft drop below. */
export default function TouchControls({
  disabled,
  onLeft,
  onRight,
  onDown,
  onRotate,
  onHardDrop,
  onHold,
}) {
  return (
    <div
      role="group"
      aria-label="Touch controls"
      className="grid w-full max-w-sm grid-cols-3 gap-2"
    >
      <ControlButton label="Hold piece" onPress={onHold} disabled={disabled}>
        <Repeat className="h-5 w-5" />
      </ControlButton>
      <ControlButton label="Rotate piece" onPress={onRotate} disabled={disabled}>
        <RotateCw className="h-5 w-5" />
      </ControlButton>
      <ControlButton label="Hard drop" onPress={onHardDrop} disabled={disabled}>
        <ChevronsDown className="h-5 w-5" />
      </ControlButton>
      <ControlButton label="Move left" onPress={onLeft} repeat disabled={disabled}>
        <ArrowLeft className="h-5 w-5" />
      </ControlButton>
      <ControlButton label="Soft drop" onPress={onDown} repeat disabled={disabled}>
        <ArrowDown className="h-5 w-5" />
      </ControlButton>
      <ControlButton label="Move right" onPress={onRight} repeat disabled={disabled}>
        <ArrowRight className="h-5 w-5" />
      </ControlButton>
    </div>
  );
}
