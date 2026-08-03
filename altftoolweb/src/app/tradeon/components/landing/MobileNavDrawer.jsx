// src/app/tradeon/components/landing/MobileNavDrawer.jsx
// Slide-in navigation drawer for mobile / narrow screens. Opened from the header
// hamburger; contains the primary nav, a Markets link, and account actions.
// Smooth slide + overlay fade, closes on backdrop click, Esc, or nav selection.
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";
import Logo from "../shared/Logo";

export default function MobileNavDrawer({ open, onClose, nav = [], activeHref = "" }) {
  // Close on Esc + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  const linkCls = (href) =>
    cn("flex items-center justify-between rounded-lg px-3 py-2.5 text-[0.95rem] font-medium transition-colors");

  return (
    <div className="md:hidden" aria-hidden={!open}>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[70] bg-black/45 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className="fixed top-0 left-0 bottom-0 z-[71] w-[82%] max-w-[320px] flex flex-col border-r shadow-2xl"
        style={{
          background: "var(--tdn-surface-solid)",
          borderColor: "var(--tdn-border)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between h-[52px] px-4 border-b" style={{ borderColor: "var(--tdn-border)" }}>
          <Link href="/tradeon" onClick={onClose}><Logo size={26} /></Link>
          <button onClick={onClose} className="tdn-btn tdn-btn-icon !w-9 !h-9" aria-label="Close menu"><X size={18} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-0.5">
          <Link
            href="/tradeon#markets"
            onClick={onClose}
            className={linkCls("/tradeon#markets")}
            style={{ color: "var(--tdn-fg)" }}
          >
            Markets
          </Link>
          {nav.map((l) => {
            const active = activeHref && l.href.startsWith("/") && activeHref.startsWith(l.href);
            return (
              <Link
                key={l.label}
                href={l.href}
                onClick={onClose}
                className={linkCls(l.href)}
                data-active={active}
                style={active
                  ? { color: "var(--tdn-iris-2)", background: "color-mix(in srgb, var(--tdn-iris) 12%, transparent)" }
                  : { color: "var(--tdn-fg)" }}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: "var(--tdn-border)" }}>
          <p className="text-[0.7rem] text-center" style={{ color: "var(--tdn-faint)" }}>
            Tradeon · Financial intelligence platform
          </p>
        </div>
      </aside>
    </div>
  );
}
