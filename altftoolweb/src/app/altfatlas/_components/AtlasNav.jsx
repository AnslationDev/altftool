"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass } from "lucide-react";

/*
 * Product-level sub-navigation.
 *
 * Sticks directly under the 4rem global header (top-16). Horizontally
 * scrollable below lg rather than collapsing into a menu: seven short labels
 * that a reader can swipe through beat a second hamburger nested inside the
 * first one.
 */
const LINKS = [
  { href: "/altfatlas", label: "Atlas", exact: true },
  { href: "/altfatlas/browse", label: "Browse all" },
  { href: "/altfatlas/categories", label: "Categories" },
  { href: "/altfatlas/use-case", label: "By task" },
  { href: "/altfatlas/collections", label: "Collections" },
  { href: "/altfatlas/compare", label: "Compare" },
  { href: "/altfatlas/archive", label: "Archive" },
  { href: "/altfatlas/learn", label: "Guides" },
];

export default function AtlasNav() {
  const pathname = usePathname() || "";

  return (
    <div className="sticky top-16 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[var(--anslation-ds-container)] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/altfatlas"
          prefetch={false}
          className="hidden shrink-0 items-center gap-1.5 py-3 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:inline-flex"
        >
          <Compass className="h-4 w-4 text-primary" aria-hidden="true" />
          AltF Atlas
        </Link>

        <nav
          aria-label="AltF Atlas sections"
          className="afa-rail -mb-px flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
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
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
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
