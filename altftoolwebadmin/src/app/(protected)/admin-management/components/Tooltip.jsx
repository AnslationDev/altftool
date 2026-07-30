"use client";

import { createPortal } from "react-dom";
import { useCallback, useRef, useState } from "react";

/**
 * Portal-based hover tooltip, shared by admin-management/page.jsx and
 * admin-management/components/AdminCard.jsx (previously two independent
 * copies that had already drifted — only one supported `direction`, and a
 * future fix to one was never guaranteed to land on the other).
 *
 * Also responds to keyboard focus (`onFocus`/`onBlur`), not just
 * `onMouseEnter`/`onMouseLeave` — the wrapped elements are icon-only
 * Edit/Deactivate buttons, so without this a sighted keyboard user tabbing
 * through the row never sees what the button does (WCAG 2.1 SC 1.4.13 /
 * SC 4.1.2 name-role-value for icon-only controls).
 */
export default function Tooltip({ label, children, direction = "top" }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);

  const show = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos(
      direction === "bottom"
        ? { top: r.bottom + 8, left: r.left + r.width / 2 }
        : { top: r.top - 8, left: r.left + r.width / 2 },
    );
  }, [direction]);

  const hide = useCallback(() => setPos(null), []);

  const tip =
    pos && typeof document !== "undefined"
      ? createPortal(
          <div
            role="tooltip"
            className="pointer-events-none fixed z-[9999] px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap bg-[var(--foreground)] text-[var(--background)] shadow-lg"
            style={
              direction === "bottom"
                ? {
                    top: pos.top,
                    left: pos.left,
                    transform: "translateX(-50%)",
                  }
                : {
                    top: pos.top,
                    left: pos.left,
                    transform: "translateX(-50%) translateY(-100%)",
                  }
            }
          >
            {label}
            {direction === "bottom" ? (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[var(--foreground)]" />
            ) : (
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--foreground)]" />
            )}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div
        ref={ref}
        className="inline-flex"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </div>
      {tip}
    </>
  );
}
