"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

export const Dialog = ({ open, onClose, children }) => {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-[rgba(15,23,42,0.22)] backdrop-blur-[2px]"
        onClick={onClose}
      />

      {children}
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
