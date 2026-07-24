"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Home, Puzzle, Tags, Wrench, X } from "lucide-react";
import { BrandMark } from "@altftool/ui";
import { ALTF_LAUNCHER_LINKS } from "./altfLinks";

const ICONS = { home: Home, tools: Wrench, extensions: Puzzle, deals: Tags };

/**
 * Floating AltFTool launcher.
 *
 * Business Ops products are standalone — they carry no AltFTool header or
 * footer — so this is the single persistent piece of parent branding and the
 * only route back into the main site. It stays out of each module's own
 * layout entirely, which is why it works identically above HousingNeeds and
 * TripFindBox despite their unrelated stylesheets.
 */
export default function AltfLauncher() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      // Return focus to the trigger rather than dropping it on <body>.
      buttonRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="altfl" ref={wrapRef} data-open={open ? "true" : "false"}>
      {open && (
        <nav className="altfl-menu" id="altfl-menu" aria-label="AltFTool">
          <p className="altfl-menu-title">Explore AltFTool</p>
          <ul>
            {ALTF_LAUNCHER_LINKS.map((link) => {
              const Icon = ICONS[link.icon] ?? Home;
              return (
                <li key={link.href}>
                  <Link href={link.href} onClick={() => setOpen(false)}>
                    <span className="altfl-menu-icon" aria-hidden="true">
                      <Icon size={16} strokeWidth={2.1} />
                    </span>
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <button
        ref={buttonRef}
        type="button"
        className="altfl-btn"
        aria-expanded={open}
        aria-controls={open ? "altfl-menu" : undefined}
        aria-label={open ? "Close AltFTool menu" : "Open AltFTool menu"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? (
          <X size={20} strokeWidth={2.3} />
        ) : (
          <BrandMark decorative className="altfl-mark" />
        )}
      </button>
    </div>
  );
}
