"use client";

import Link from "next/link";

const QUICK_LINKS = [
  { label: "Home", href: "/news" },
  { label: "About Us", href: "/policypages/about" },
  { label: "Contact Us", href: "/policypages/contact" },
  { label: "Privacy Policy", href: "/policypages/privacy" },
  { label: "Terms & Conditions", href: "/policypages/termsandconditions" },
];

const CATEGORIES_LEFT = [
  { label: "India", href: "/news/topics/india" },
  { label: "World", href: "/news/topics/world" },
  { label: "Politics", href: "/news/topics/politics" },
  { label: "Business", href: "/news/topics/business" },
  { label: "Technology", href: "/news/topics/technology" },
];

const CATEGORIES_RIGHT = [
  { label: "Sports", href: "/news/topics/sports" },
  { label: "Entertainment", href: "/news/topics/entertainment" },
  { label: "Health", href: "/news/topics/health" },
  { label: "Lifestyle", href: "/news/topics/lifestyle" },
  { label: "Education", href: "/news/topics/education" },
];

const OTHER_LINKS = [
  { label: "Sitemap", href: "/sitemap" },
  { label: "Advertise With Us", href: "/advertise" },
  { label: "Careers", href: "/careers" },
  { label: "Subscribe", href: "/news/newsletter" },
];

const SOCIAL_ICONS = [
  { label: "Facebook", href: "https://facebook.com", mark: "f" },
  { label: "Twitter", href: "https://twitter.com", mark: "X" },
  { label: "Instagram", href: "https://instagram.com", mark: "in" },
  { label: "Youtube", href: "https://youtube.com", mark: "▶" },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto max-w-[1360px] px-[60px] py-[40px]">
        <div className="flex items-start justify-between gap-12">
          {/* Column 1 – Brand */}
          <div className="max-w-[260px]">
            <Link href="/news" className="inline-block">
              <span className="text-[34px] font-bold text-[var(--primary)]">News</span>
            </Link>
            <p className="mt-4 text-sm leading-[1.6] text-[var(--muted-foreground)]">
              Your trusted source for accurate and timely news from around the world.
            </p>
            <div className="mt-5 flex items-center gap-4">
              {SOCIAL_ICONS.map(({ label, href, mark }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-base text-[var(--muted-foreground)] transition hover:text-[var(--primary)]"
                >
                  {mark}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 – Quick Links */}
          <div>
            <h3 className="mb-[18px] text-sm font-bold uppercase text-[var(--foreground)]">Quick Links</h3>
            <ul className="flex flex-col gap-[10px]">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--primary)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 – Categories (2 columns) */}
          <div>
            <h3 className="mb-[18px] text-sm font-bold uppercase text-[var(--foreground)]">Categories</h3>
            <div className="flex gap-10">
              <ul className="flex flex-col gap-[10px]">
                {CATEGORIES_LEFT.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--primary)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="flex flex-col gap-[10px]">
                {CATEGORIES_RIGHT.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--primary)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 4 – Other */}
          <div>
            <h3 className="mb-[18px] text-sm font-bold uppercase text-[var(--foreground)]">Other</h3>
            <ul className="flex flex-col gap-[10px]">
              {OTHER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--primary)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5 – Download App */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase text-[var(--foreground)]">Download App</h3>
            <div className="flex flex-col gap-3">
              <a
                href="#"
                className="flex h-[50px] w-[160px] items-center justify-center rounded-lg bg-[var(--muted)] text-sm font-medium text-[var(--foreground)] transition hover:scale-[1.02]"
              >
                Google Play
              </a>
              <a
                href="#"
                className="flex h-[50px] w-[160px] items-center justify-center rounded-lg bg-[var(--muted)] text-sm font-medium text-[var(--foreground)] transition hover:scale-[1.02]"
              >
                App Store
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="mt-8 text-center text-[13px] text-[var(--muted-foreground)]">
          &copy; {new Date().getFullYear()} ALTF Tool. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
