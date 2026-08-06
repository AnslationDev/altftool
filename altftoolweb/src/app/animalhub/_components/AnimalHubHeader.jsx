"use client";

// Animal Hub header — the module's own chrome.
//
// The global site header is suppressed for self-chrome routes, so this is the
// module's navigation. It is a client component only because of the mobile
// drawer and the active-route highlight; the category list is passed in from
// the server, so this component holds no data of its own.

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AnimalHubHeader({ categories = [] }) {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);

  // Lock the page behind the drawer while it is open. Closing on navigation is
  // handled by the links themselves rather than a pathname effect, which would
  // cause a cascading render on every route change.
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header className="ah-header">
      <div className="ah-header__inner">
        <Link href="/animalhub" className="ah-header__brand">
          <span className="ah-header__mark" aria-hidden="true" />
          <span className="ah-header__wordmark">
            Animal<span className="ah-header__wordmark-accent">Hub</span>
          </span>
        </Link>

        <nav className="ah-header__nav" aria-label="Animal categories">
          {categories.map((category) => {
            const href = `/animalhub/${category.slug}`;
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={category.slug}
                href={href}
                className={`ah-header__link${isActive ? " is-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {category.name}
              </Link>
            );
          })}
          {/* Compare sits with the categories rather than in the actions
              cluster: it is a way of browsing the catalogue, not a way out
              of it. */}
          <Link
            href="/animalhub/compare"
            className={`ah-header__link${pathname.startsWith("/animalhub/compare") ? " is-active" : ""}`}
            aria-current={pathname.startsWith("/animalhub/compare") ? "page" : undefined}
          >
            Compare
          </Link>
        </nav>

        <div className="ah-header__actions">
          <Link href="/" className="ah-header__home">
            AltFTool
          </Link>
          <button
            type="button"
            className="ah-header__toggle"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="ah-mobile-nav"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span className={`ah-header__bars${open ? " is-open" : ""}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        id="ah-mobile-nav"
        className={`ah-drawer${open ? " is-open" : ""}`}
        hidden={!open}
      >
        <nav aria-label="Animal categories (mobile)">
          <ul className="ah-drawer__list">
            {categories.map((category, i) => (
              <li key={category.slug}>
                <Link
                  href={`/animalhub/${category.slug}`}
                  className="ah-drawer__link"
                  onClick={() => setOpen(false)}
                >
                  <span className="ah-drawer__ordinal" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{category.name}</span>
                  <span className="ah-drawer__count">{category.animalCount}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/animalhub/compare"
                className="ah-drawer__link"
                onClick={() => setOpen(false)}
              >
                <span className="ah-drawer__ordinal" aria-hidden="true">
                  ——
                </span>
                <span>Compare</span>
              </Link>
            </li>
          </ul>
        </nav>
        <Link href="/" className="ah-drawer__home" onClick={() => setOpen(false)}>
          Back to AltFTool
        </Link>
      </div>
    </header>
  );
}
