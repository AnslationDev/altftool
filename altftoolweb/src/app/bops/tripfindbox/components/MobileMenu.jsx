"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { tfbPath } from "@/app/bops/tripfindbox/lib/tfbLink";
import { useTripFindBoxContactInfo } from "@/app/bops/tripfindbox/hooks/useTripFindBoxContactInfo";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function MobileMenu({ className, links, iconSize = 24, initialContact }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const contact = useTripFindBoxContactInfo(initialContact);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event) {
      const target = event.target;

      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) {
        return;
      }

      if (!panelRef.current?.contains(target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const drawer = (
    <div className={`mobile-menu-layer${open ? " is-open" : ""}`} aria-hidden={!open}>
      <button type="button" className="mobile-menu-overlay" aria-label="Close mobile menu" onClick={() => setOpen(false)} />
      <aside ref={panelRef} className="mobile-menu-dropdown" role="dialog" aria-modal="true" aria-label="Mobile navigation">
        <div className="mobile-menu-head">
          <button type="button" aria-label="Close menu" onClick={() => setOpen(false)}>
            <X size={30} />
          </button>
        </div>
        <nav aria-label="Mobile menu links">
          {links.map((link) => (
            <Link key={`${link.href}-${link.label}`} href={tfbPath(link.href)} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <a className="mobile-menu-call" href={contact.href} onClick={() => setOpen(false)}>Call Now</a>
          <a className="mobile-menu-phone" href={contact.href} onClick={() => setOpen(false)}>{contact.phone}</a>
        </nav>
      </aside>
    </div>
  );

  return (
    <div className={`${className} mobile-menu-control${open ? " is-open" : ""}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Menu size={iconSize} />
      </button>
      {mounted ? createPortal(drawer, document.body) : null}
    </div>
  );
}
