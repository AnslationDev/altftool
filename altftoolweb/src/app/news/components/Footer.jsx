"use client";

import Link from "next/link";
import { Facebook, Twitter, Youtube, Instagram, Rss, ChevronRight } from "lucide-react";

const FOOTER_NAV = [
  {
    title: "Quick Links",
    links: [
      { label: "Home", href: "/news" },
      { label: "About Us", href: "/policypages/about" },
      { label: "Contact Us", href: "/policypages/contact" },
      { label: "Privacy Policy", href: "/policypages/privacy" },
      { label: "Terms & Conditions", href: "/policypages/termsandconditions" },
    ],
  },
  {
    title: "Categories",
    links: [
      { label: "India", href: "/news/topics/india" },
      { label: "World", href: "/news/topics/world" },
      { label: "Politics", href: "/news/topics/politics" },
      { label: "Business", href: "/news/topics/business" },
      { label: "Technology", href: "/news/topics/technology" },
    ],
  },
  {
    title: "More",
    links: [
      { label: "Sports", href: "/news/topics/sports" },
      { label: "Entertainment", href: "/news/topics/entertainment" },
      { label: "Health", href: "/news/topics/health" },
      { label: "Lifestyle", href: "/news/topics/lifestyle" },
      { label: "Education", href: "/news/topics/education" },
    ],
  },
  {
    title: "Other",
    links: [
      { label: "Sitemap", href: "/sitemap" },
      { label: "Advertise With Us", href: "/advertise" },
      { label: "Careers", href: "/careers" },
      { label: "Subscribe", href: "/news/newsletter" },
    ],
  },
];

const SOCIAL_ICONS = [
  { icon: Facebook, label: "Facebook", href: "https://facebook.com" },
  { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { icon: Youtube, label: "Youtube", href: "https://youtube.com" },
];

function FooterLink({ href, children }) {
  return (
    <li>
      <Link
        href={href}
        className="group inline-flex items-center gap-2 text-sm font-medium leading-6 text-[var(--muted-foreground)] transition duration-200 hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/25"
      >
        <ChevronRight size={12} className="shrink-0 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
        {children}
      </Link>
    </li>
  );
}

function FooterGroup({ group }) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--foreground)] [font-family:var(--font-secondary)]">
        {group.title}
      </h3>
      <ul className="space-y-2">
        {group.links.map((link) => (
          <FooterLink key={link.href} href={link.href}>
            {link.label}
          </FooterLink>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)] [font-family:var(--font-primary)]">
      <div className="mx-auto max-w-[var(--anslation-ds-container-wide)] px-4 pb-8 pt-12 md:px-8 lg:px-12 lg:pb-10 lg:pt-16">
        {/* ── Top: Brand + Link Groups ────────────────────────────────── */}
        <div className="grid gap-10 lg:grid-cols-[1.3fr_2.2fr] lg:gap-16">
          {/* Brand column */}
          <div className="max-w-sm">
            <Link href="/news" className="inline-block transition duration-200 hover:-translate-y-0.5">
              <span className="text-[28px] font-extrabold tracking-tight sm:text-[32px]">
                <span className="text-[var(--foreground)]">New</span>
                <span className="text-[var(--primary)]">s</span>
              </span>
            </Link>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
              Everything Matters
            </p>
            <p className="mt-5 text-sm leading-6 text-[var(--muted-foreground)]">
              Your trusted source for accurate and timely news from around the world.
            </p>

            {/* Social + RSS */}
            <div className="mt-6 flex items-center gap-3">
              {SOCIAL_ICONS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/25"
                >
                  <Icon size={16} />
                </a>
              ))}
              <a
                href="/rss.xml"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="RSS Feed"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--anslation-ds-accent)] hover:bg-[var(--anslation-ds-accent)]/10 hover:text-[var(--anslation-ds-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--anslation-ds-accent)]/25"
              >
                <Rss size={16} />
              </a>
            </div>
          </div>

          {/* Link Groups */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_NAV.map((group) => (
              <FooterGroup key={group.title} group={group} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Copyright ─────────────────────────────────────────── */}
      <div className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-[var(--anslation-ds-container-wide)] flex-col items-center gap-2 px-4 py-5 text-xs font-medium text-[var(--muted-foreground)] md:flex-row md:justify-between md:px-8 lg:px-12">
          <p>&copy; {new Date().getFullYear()} BATBYTE. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link
              href="/policypages/privacy"
              className="transition duration-200 hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/25"
            >
              Privacy
            </Link>
            <span className="h-3 w-px bg-[var(--border)]" />
            <Link
              href="/policypages/termsandconditions"
              className="transition duration-200 hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/25"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
