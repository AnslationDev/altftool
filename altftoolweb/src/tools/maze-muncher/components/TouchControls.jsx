"use client";

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";

const BTN_CLASS =
  "flex h-14 w-14 select-none touch-manipulation items-center justify-center rounded-lg border border-border bg-muted text-foreground transition-colors active:bg-primary active:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/**
 * On-screen D-pad for touch play. Buttons are 56px (>= 44px targets) and fire
 * on pointerdown for arcade responsiveness; hidden on md+ where keyboards rule.
 */
export default function TouchControls({ onUp, onDown, onLeft, onRight }) {
  const press = (fn) => (event) => {
    event.preventDefault();
    fn();
  };

  return (
    <div className="grid w-fit grid-cols-3 gap-1.5 md:hidden" aria-label="Direction controls" role="group">
      <span aria-hidden="true" />
      <button type="button" className={BTN_CLASS} aria-label="Move up" onPointerDown={press(onUp)}>
        <ChevronUp className="h-6 w-6" />
      </button>
      <span aria-hidden="true" />
      <button type="button" className={BTN_CLASS} aria-label="Move left" onPointerDown={press(onLeft)}>
        <ChevronLeft className="h-6 w-6" />
      </button>
      <span aria-hidden="true" className="h-14 w-14" />
      <button type="button" className={BTN_CLASS} aria-label="Move right" onPointerDown={press(onRight)}>
        <ChevronRight className="h-6 w-6" />
      </button>
      <span aria-hidden="true" />
      <button type="button" className={BTN_CLASS} aria-label="Move down" onPointerDown={press(onDown)}>
        <ChevronDown className="h-6 w-6" />
      </button>
      <span aria-hidden="true" />
    </div>
  );
}
