"use client";

import Image from "next/image";
import Link from "next/link";
import SocialLinks from "../SocialLinks";
import { FOOTER_ROUTE_GROUPS, LEGAL_ROUTE_LINKS } from "./siteRoutes";

const Footer = () => {
  return (
    <footer className="border-t border-[var(--anslation-ds-footer-border)] bg-[var(--anslation-ds-footer)] text-[var(--anslation-ds-footer-text)]">
      <div className="section mx-auto py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr] lg:gap-12">
          <div className="max-w-md">
            <Link href="/" className="mb-4 inline-flex">
              <Image
                src="/assets/altf_white.png"
                alt="AltFTool"
                width={132}
                height={40}
                loading="eager"
                className="object-contain"
                style={{ width: "auto", height: "auto" }}
              />
            </Link>

            <p className="max-w-sm text-sm leading-6 text-[var(--anslation-ds-footer-muted)]">
              A compact productivity platform for tools, extensions, smart
              shopping workflows, and digital resources.
            </p>

            <div className="mt-5">
              <SocialLinks
                variant="ghost"
                className="justify-start"
                iconClassName="h-5 w-5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_ROUTE_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-white">
                  {group.title}
                </h3>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-[var(--anslation-ds-footer-muted)] transition-colors hover:text-[var(--anslation-ds-primary-hover)]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--anslation-ds-footer-border)]">
        <div className="section mx-auto flex flex-col gap-3 py-5 text-xs text-[var(--anslation-ds-footer-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} AltFTool. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {LEGAL_ROUTE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-[var(--anslation-ds-primary-hover)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
