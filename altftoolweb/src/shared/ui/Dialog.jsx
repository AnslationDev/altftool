"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export const Dialog = ({ open, onOpenChange, children }) => {
  // Drives the motion-safe entrance: mounted at "closed", flipped to "open"
  // on the next frame so the backdrop fades and the panel scales in.
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }

    const frame = requestAnimationFrame(() => setEntered(true));

    const onKeyDown = (event) => {
      if (event.key === "Escape") onOpenChange?.(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      setEntered(false);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onOpenChange, open]);

  if (!open) return null;

  return createPortal(
    <div
      data-state={entered ? "open" : "closed"}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <div
        aria-hidden="true"
        className={[
          "absolute inset-0 bg-[var(--anslation-ds-overlay)] backdrop-blur-[2px]",
          "transition-opacity duration-200 ease-out motion-reduce:transition-none",
          entered ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={() => onOpenChange?.(false)}
      />

      <div
        className={[
          "relative z-50 flex w-full items-center justify-center",
          "transition-[opacity,scale] duration-200 ease-out",
          "motion-reduce:transition-none motion-reduce:scale-100",
          entered ? "scale-100 opacity-100" : "scale-95 opacity-0",
        ].join(" ")}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};

export const DialogContent = ({ children, className = "" }) => (
  <div
    className={`
      relative z-50 w-full max-w-md
      rounded-xl
      bg-(--card)
      border border-border
      shadow-2xl
      p-6
      ${className}
    `}
  >
    {children}
  </div>
);


export const DialogHeader = ({ children }) => (
  <div className="mb-4">{children}</div>
);

export const DialogTitle = ({ children }) => (
  <h2 className="text-lg font-semibold text-(--card-foreground)">
    {children}
  </h2>
);
