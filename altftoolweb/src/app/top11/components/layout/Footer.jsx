"use client";

import Link from "next/link";
import Logo from "../ui/Logo";

// Only destinations that actually exist become links; the rest stay plain text
// rather than pretending to be clickable. The standalone build rendered every
// one as a <button> with no handler.
const COLUMNS = [
  {
    heading: "Explore",
    links: [
      { label: "Trending", href: "/top11/category/trending" },
      { label: "Categories", href: "/top11#categories" },
      { label: "Countries", href: "/top11#countries" },
    ],
  },
  {
    heading: "Company",
    links: [{ label: "About", href: "/policypages/about" }, { label: "Methodology" }, { label: "Editorial" }],
  },
  {
    heading: "Community",
    links: [{ label: "Favorites" }, { label: "Suggest a list" }, { label: "Newsletter" }],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/policypages/privacy" },
      { label: "Terms", href: "/policypages/termsandconditions" },
      { label: "Accessibility" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 px-5 pb-28 pt-20 text-white md:px-10 md:pb-10 md:pt-24 xl:px-16">
      <div className="mx-auto max-w-[1536px]">
        <div className="grid gap-14 border-b border-white/10 pb-16 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo inverse />
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
              The global discovery and ranking platform for everything worth knowing.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map(({ heading, links }) => (
              <div key={heading}>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-white">{heading}</p>
                {links.map((link) =>
                  link.href ? (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="mb-3 block text-sm text-slate-400 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <span key={link.label} className="mb-3 block text-sm text-slate-400">
                      {link.label}
                    </span>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-between gap-4 pt-7 text-xs text-slate-500 sm:flex-row">
          <span>Top11 Global Index / 2026</span>
          <span>Made for better discovery.</span>
        </div>
        <div
          aria-hidden="true"
          className="overflow-hidden pt-10 text-center text-[clamp(5rem,17vw,16rem)] font-black leading-[0.72] tracking-[-0.09em] text-white/[0.035]"
        >
          TOP11
        </div>
      </div>
    </footer>
  );
}
