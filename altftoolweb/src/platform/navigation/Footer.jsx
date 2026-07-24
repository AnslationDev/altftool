"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { BrandLogo } from "@altftool/ui";
import SocialLinks from "../SocialLinks";
import {
  FOOTER_ROUTE_GROUPS,
  LEGAL_ROUTE_LINKS,
  POPULAR_TOOL_LINKS,
  SITE_ROUTES,
} from "./siteRoutes";

const footerLinkClass =
  "inline-flex min-h-8 items-center text-sm font-medium leading-5 text-[var(--anslation-ds-footer-muted)] transition hover:text-[var(--anslation-ds-primary-hover)] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--anslation-ds-primary-hover)]/35";

export default function Footer() {
  return (
    <footer
      aria-label="AltFTool footer"
      className="border-t border-[var(--anslation-ds-footer-border)] bg-[var(--anslation-ds-footer)] text-[var(--anslation-ds-footer-text)]"
    >
      <div className="section mx-auto py-10 lg:py-12">
        <div className="grid gap-10 xl:grid-cols-[minmax(14rem,1fr)_minmax(0,3fr)] xl:gap-12">
          <div className="max-w-sm">
            <Link
              href="/"
              aria-label="AltFTool home"
              className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--anslation-ds-primary-hover)]/35"
            >
              <BrandLogo
                size="sm"
                className="text-[var(--anslation-ds-footer-text)]"
              />
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 text-[var(--anslation-ds-footer-muted)]">
              Tools, apps, products, guides, and focused digital workflows in
              one organized platform.
            </p>

            <div className="mt-5">
              <SocialLinks
                variant="ghost"
                className="justify-start"
                iconClassName="h-5 w-5"
              />
            </div>
          </div>

          <nav
            aria-label="Footer directory"
            className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 xl:grid-cols-6"
          >
            {FOOTER_ROUTE_GROUPS.map((group) => (
              <section
                aria-labelledby={`footer-${group.title.toLowerCase()}`}
                key={group.title}
              >
                <h2
                  id={`footer-${group.title.toLowerCase()}`}
                  className="text-xs font-semibold uppercase text-[var(--anslation-ds-footer-text)]"
                >
                  {group.title}
                </h2>
                <ul className="mt-3 space-y-1">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={footerLinkClass}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        </div>
      </div>

      <nav
        aria-label="Popular tools"
        className="border-t border-[var(--anslation-ds-footer-border)]"
      >
        <div className="section mx-auto py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xs font-semibold uppercase text-[var(--anslation-ds-footer-text)]">
              Popular tools
            </h2>
            <Link href={SITE_ROUTES.tools.href} className={footerLinkClass}>
              Browse all tools
            </Link>
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
            {POPULAR_TOOL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={footerLinkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="border-t border-[var(--anslation-ds-footer-border)]">
        <div className="section mx-auto flex flex-col gap-3 py-5 text-xs font-medium text-[var(--anslation-ds-footer-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2">
            <ShieldCheck
              className="h-4 w-4 text-[var(--anslation-ds-primary-hover)]"
              aria-hidden="true"
            />
            © {new Date().getFullYear()} AltFTool. All rights reserved.
          </p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-1">
            {[SITE_ROUTES.privacy, SITE_ROUTES.terms, ...LEGAL_ROUTE_LINKS].map(
              (link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={footerLinkClass}
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>
        </div>
      </div>
    </footer>
  );
}
