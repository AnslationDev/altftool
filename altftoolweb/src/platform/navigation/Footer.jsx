"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SocialLinks from "../SocialLinks";
import { FOOTER_ROUTE_GROUPS, LEGAL_ROUTE_LINKS, POPULAR_TOOL_LINKS } from "./siteRoutes";

const HOME_FOOTER_GROUPS = [
  {
    title: "Product",
    links: [
      { label: "Tools", href: "/tools/all" },
      { label: "Extensions", href: "/extensions" },
      { label: "Deals", href: "/exclusivedeals" },
      { label: "All Categories", href: "/tools/all" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Academy", href: "/academy" },
      { label: "Blog", href: "/blogs" },
      { label: "News", href: "/news" },
      { label: "Brand Ratings", href: "/brandrating" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/policypages/about" },
      { label: "Privacy Policy", href: "/policypages/privacy" },
      { label: "Terms of Use", href: "/policypages/termsandconditions" },
      { label: "Contact Us", href: "/policypages/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "/supportsetting" },
      { label: "Support", href: "/supportsetting" },
      { label: "Status", href: "/status" },
      { label: "Request a Tool", href: "/supportsetting" },
    ],
  },
];

const Footer = () => {
  const pathname = usePathname();

  if (pathname === "/") {
    return (
      <footer className="border-t border-[#E4E6F1] bg-white text-[#1D2440] dark:border-[#1B3858] dark:bg-[#06101F] dark:text-[#F4F9FF]">
        <div className="section mx-auto py-8 lg:py-9">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_2.6fr] lg:items-start">
            <div className="max-w-sm">
              <Link
                href="/"
                className="mb-4 inline-flex transition duration-200 hover:-translate-y-0.5"
              >
                <Image
                  src="/assets/logo3.png"
                  alt="AltFTool"
                  width={132}
                  height={40}
                  loading="eager"
                  className="h-10 w-auto object-contain"
                />
              </Link>

              <p className="max-w-[18rem] text-sm leading-6 text-[#4B5568] dark:text-[#A9BAD0]">
                A premium productivity workspace for online tools, extensions,
                deals, resources, and everyday browser workflows.
              </p>

              <div className="mt-5">
                <SocialLinks
                  variant="colorful"
                  className="justify-start"
                  iconClassName="h-5 w-5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
              {HOME_FOOTER_GROUPS.map((group) => (
                <div key={group.title} className="min-w-0">
                  <h3 className="mb-3.5 text-xs font-black uppercase tracking-[0.1em] text-[#111827] dark:text-[#F4F9FF]">
                    {group.title}
                  </h3>
                  <ul className="space-y-2">
                    {group.links.map((link) => (
                      <li key={`${group.title}-${link.label}-${link.href}`}>
                        <Link
                          href={link.href}
                          className="text-sm font-semibold text-[#4B5568] transition duration-200 hover:text-[#6C4DF6] dark:text-[#A9BAD0] dark:hover:text-[#B6A8FF]"
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

        <div className="border-t border-[#E4E6F1] bg-white dark:border-[#1B3858] dark:bg-[#06101F]">
          <div className="section mx-auto flex flex-col gap-3 py-4 text-xs font-semibold text-[#68718A] dark:text-[#A9BAD0] sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} AltFTool. All rights reserved.</p>
            <p>Built for professionals, creators, developers, and businesses.</p>
          </div>
        </div>
      </footer>
    );
  }

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

      <nav
        aria-label="Popular tools"
        className="border-t border-[var(--anslation-ds-footer-border)]"
      >
        <div className="section mx-auto py-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-white">
            Popular Tools
          </h3>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {POPULAR_TOOL_LINKS.map((link) => (
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
      </nav>

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
