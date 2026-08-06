"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fingerprint } from "lucide-react";

/*
 * Product-level sub-navigation.
 *
 * Sticks directly under the 4rem global header (top-16). Horizontally
 * scrollable below lg rather than collapsing into a menu — nine short labels a
 * reader can swipe through beat a second hamburger nested inside the first.
 *
 * "Studio" is second, not last, because it is the only destination on this list
 * that does anything. Everything else is reference material for it.
 */
const LINKS = [
  { href: "/persona", label: "Persona", exact: true },
  { href: "/persona/studio", label: "Studio" },
  { href: "/persona/cast", label: "Cast" },
  { href: "/persona/shots", label: "Shots" },
  { href: "/persona/playbook", label: "30-day plan" },
  { href: "/persona/captions", label: "Captions" },
  { href: "/persona/models", label: "Models" },
  { href: "/persona/disclosure", label: "Disclosure" },
  { href: "/persona/rates", label: "Rates" },
  { href: "/persona/learn", label: "Guides" },
];

export default function PersonaNav() {
  const pathname = usePathname() || "";

  return (
    <div className="sticky top-16 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[var(--anslation-ds-container)] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/persona"
          prefetch={false}
          className="hidden shrink-0 items-center gap-1.5 py-3 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:inline-flex"
        >
          <Fingerprint
            className="h-4 w-4"
            style={{ color: "var(--psn-accent)" }}
            aria-hidden="true"
          />
          AltF Persona
        </Link>

        <nav
          aria-label="AltF Persona sections"
          className="psn-rail -mb-px flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
        >
          {LINKS.map((link) => {
            const active = link.exact
              ? pathname === link.href
              : pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 whitespace-nowrap border-b-2 px-2.5 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active
                    ? "text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                style={
                  active
                    ? {
                        borderBottomColor: "var(--psn-accent)",
                        color: "var(--psn-accent-text)",
                      }
                    : undefined
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
