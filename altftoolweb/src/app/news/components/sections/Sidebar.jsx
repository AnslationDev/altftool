"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Twitter, Facebook, Instagram, Youtube, Rss, TrendingUp, MapPin, Newspaper, Radio, Mail, Tag, ChevronRight } from "lucide-react";
import Image from "next/image";

const pagesLinks = [
  { label: "News", href: "/news", icon: Newspaper, badge: null },
  { label: "Trending", href: "/news/trending", icon: TrendingUp, badge: "Hot" },
  { label: "Local News", href: "/news/local", icon: MapPin, badge: null },
  { label: "Headlines", href: "/news/headlines", icon: Radio, badge: "Live" },
  { label: "Newsletter", href: "/news/newsletter", icon: Mail, badge: null },
  { label: "Topics", href: "/news/topics", icon: Tag, badge: null },
];

const socialLinks = [
  { icon: Twitter, label: "Twitter", href: "https://twitter.com", color: "hover:text-sky-400   hover:bg-sky-400/10" },
  { icon: Facebook, label: "Facebook", href: "https://facebook.com", color: "hover:text-blue-500  hover:bg-blue-500/10" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com", color: "hover:text-pink-500  hover:bg-pink-500/10" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com", color: "hover:text-red-500   hover:bg-red-500/10" },
];

const legalLinks = [
  { label: "About Us", href: "/policypages/about" },
  { label: "Privacy Policy", href: "/policypages/privacy" },
  { label: "Terms of Service", href: "/policypages/termsandconditions" },
  { label: "Cookie Policy", href: "/policypages/cookie" },
];

const badgeStyle = {
  Hot: "bg-orange-500/15 text-orange-500 border-orange-500/20",
  Live: "bg-red-500/15   text-red-500   border-red-500/20 animate-pulse",
};

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Site navigation"
      className="
        sticky top-0 flex h-screen w-[260px] shrink-0 flex-col
        border-r border-[var(--border)]
        bg-[var(--card)]
        overflow-y-auto overflow-x-hidden
        scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[var(--border)]
      "
    >
      {/* ── Logo ──────────────────────────────────────────────────────── */}
      <div className="border-b border-[var(--border)] px-5 py-5">
        <Link href="/" aria-label="NewsRoom home">
          <Image
            src="/assets/newslogo.png"
            width={140}
            height={40}
            alt="NewsRoom Logo"
            className="w-[130px] object-contain"
            priority
          />
        </Link>
      </div>

      {/* ── Main nav ──────────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
          Browse
        </p>

        <ul className="space-y-0.5">
          {pagesLinks.map(({ label, href, icon: Icon, badge }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`
                    group flex items-center gap-3 rounded-xl px-3 py-2.5
                    text-sm font-medium transition-all duration-150
                    ${isActive
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--card-hover-bg)] hover:text-[var(--foreground)]"
                    }
                  `}
                >
                  <Icon
                    size={16}
                    className={`shrink-0 transition-transform duration-150 group-hover:scale-110 ${isActive ? "text-inherit" : ""}`}
                  />

                  <span className="flex-1">{label}</span>

                  {badge && (
                    <span
                      className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold leading-none ${badgeStyle[badge]}`}
                    >
                      {badge}
                    </span>
                  )}

                  {!badge && !isActive && (
                    <ChevronRight
                      size={13}
                      className="shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-40"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ── RSS feed link ────────────────────────────────────────── */}
        <div className="mt-4 px-3">
          <a
            href="/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex items-center gap-2.5 rounded-xl border border-[var(--border)]
              bg-[var(--card-active-bg)]/50 px-3 py-2.5 text-xs
              text-[var(--muted-foreground)] transition hover:border-orange-500/40
              hover:bg-orange-500/5 hover:text-orange-500
            "
          >
            <Rss size={13} className="shrink-0" />
            <span>Subscribe to NewsRoom</span>
          </a>
        </div>
      </nav>

      {/* ── Social ────────────────────────────────────────────────────── */}
      <div className="border-t border-[var(--border)] px-5 py-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
          Follow Us
        </p>
        <div className="flex gap-1.5">
          {socialLinks.map(({ icon: Icon, href, label, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Follow on ${label}`}
              className={`
                flex h-9 w-9 items-center justify-center rounded-xl
                border border-[var(--border)] text-[var(--muted-foreground)]
                transition-all duration-150 ${color}
              `}
            >
              <Icon size={15} />
            </a>
          ))}
        </div>
      </div>

      {/* ── Legal ─────────────────────────────────────────────────────── */}
      <div className="border-t border-[var(--border)] px-5 py-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
          Company
        </p>
        <ul className="space-y-0.5">
          {legalLinks.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                className="
                  block rounded-lg px-2 py-1.5 text-xs
                  text-[var(--muted-foreground)] transition
                  hover:bg-[var(--card-hover-bg)] hover:text-[var(--foreground)]
                "
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-[10px] text-[var(--muted-foreground)]">
          © {new Date().getFullYear()} NewsRoom · All rights reserved
        </p>
      </div>
    </aside>
  );
}