// src/app/tradeon/components/shared/Dropdown.jsx
"use client";

import { useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useClickOutside } from "../../hooks/useClickOutside";

/**
 * Small self-contained dropdown menu used for language / currency / profile in
 * the Tradeon header. Fully themed, keyboard-dismissable, closes on outside click.
 */
export default function Dropdown({
  label,
  icon: Icon,
  items = [],
  value,
  onSelect,
  align = "right",
  buttonClassName = "",
  showChevron = true,
  width = 200,
  children,
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const btnRef = useRef(null);
  const ref = useClickOutside(() => setOpen(false), open);

  // Fixed positioning so the menu is never clipped by an overflow toolbar.
  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const left = align === "right" ? r.right - width : r.left;
      setCoords({ top: r.bottom + 6, left: Math.max(8, Math.min(left, window.innerWidth - width - 8)) });
    }
    setOpen((o) => !o);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        className={`inline-flex items-center gap-1.5 ${buttonClassName}`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {Icon && <Icon size={15} />}
        {label && <span>{label}</span>}
        {showChevron && <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />}
      </button>

      {open && coords && (
        <div
          role="menu"
          className="tdn-panel fixed p-1.5 z-[200] tdn-rise"
          style={{ top: coords.top, left: coords.left, width, maxHeight: 340, overflowY: "auto" }}
        >
          {children
            ? children({ close: () => setOpen(false) })
            : items.map((item) => (
                <button
                  key={item.value ?? item.label}
                  role="menuitem"
                  onClick={() => {
                    onSelect?.(item.value ?? item.label);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left transition-colors hover:bg-[color-mix(in_srgb,var(--tdn-iris)_10%,transparent)]"
                  style={{ color: "var(--tdn-fg)" }}
                >
                  {item.icon && <span className="text-base leading-none">{item.icon}</span>}
                  <span className="flex-1">{item.label}</span>
                  {(item.value ?? item.label) === value && <Check size={14} style={{ color: "var(--tdn-iris-2)" }} />}
                </button>
              ))}
        </div>
      )}
    </div>
  );
}
