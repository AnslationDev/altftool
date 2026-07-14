"use client";

import ColorPad from "./ColorPad";

export default function GameBoard({ activePad, onPadClick, disabled }) {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-[340px] mx-auto"
      role="group"
      aria-label="Simon game board"
    >
      {["green", "red", "yellow", "blue"].map((color) => (
        <ColorPad
          key={color}
          color={color}
          isFlashing={activePad === color}
          onClick={() => onPadClick(color)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
