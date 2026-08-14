"use client";

import Link from "next/link";
import { BrandLogo } from "@altftool/ui";
import { LEGAL_ROUTE_LINKS, POPULAR_TOOL_LINKS } from "./siteRoutes";
import {
  FaFacebookF,
  FaInstagram,
  FaThreads,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { Heart, ShieldCheck } from "lucide-react";

/**
 * This is the footer nearly every page renders: `usesLandingChrome` is true
 * unless the path is on the hidden-shell list, and FOOTER_ROUTE_GROUPS — which
 * does carry the embed hub — only renders on that minority.
 *
 * So the three pages built specifically for other people to link to were
 * reachable from tool pages and /site-map and nowhere else. A publisher, a
 * developer or a journalist browsing the site never saw them. They are the
 * cheapest links to earn and the hardest to earn if nobody can find the page.
 *
 * "All Categories" made room: it pointed at /tools/all, the same URL as "Tools"
 * directly above it.
 */
const HOME_FOOTER_GROUPS = [
  {
    title: "Product",
    links: [
      { label: "Tools", href: "/tools/all" },
      { label: "Extensions", href: "/extensions" },
      { label: "Embed widgets", href: "/embed" },
      { label: "Deals", href: "/exclusivedeals" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Academy", href: "/academy" },
      { label: "Blog", href: "/blogs" },
      { label: "News", href: "/news" },
      { label: "Open data", href: "/open-data" },
      { label: "Brand Ratings", href: "/brandrating" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/policypages/about" },
      { label: "Press kit", href: "/press" },
      { label: "Privacy Policy", href: "/policypages/privacy" },
      { label: "Terms of Use", href: "/policypages/termsandconditions" },
      { label: "Contact Us", href: "/policypages/contact" },
      ...LEGAL_ROUTE_LINKS,
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "/policypages/faq" },
      { label: "Support", href: "/supportsetting" },
      { label: "Request a Tool", href: "/request-a-tool" },
    ],
  },
];

const HOME_FOOTER_SOCIALS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61586134133885",
    icon: FaFacebookF,
    className:
      "border-[color-mix(in_srgb,var(--primary)_42%,white_10%)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_18%,transparent),rgba(6,16,34,0.08))] text-[color-mix(in_srgb,var(--primary)_84%,white_16%)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--primary)_10%,transparent),0_16px_38px_color-mix(in_srgb,var(--primary)_18%,transparent)] hover:border-[color-mix(in_srgb,var(--primary)_72%,white_18%)] hover:text-white hover:shadow-[0_0_24px_color-mix(in_srgb,var(--primary)_28%,transparent)]",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/altftools/",
    icon: FaInstagram,
    className:
      "border-[color-mix(in_srgb,var(--primary)_38%,#38BDF8_22%)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_15%,#38BDF8_10%),rgba(6,16,34,0.08))] text-[#7DE3F2] shadow-[0_0_0_1px_color-mix(in_srgb,var(--primary)_10%,transparent),0_16px_38px_rgba(56,189,248,0.12)] hover:border-[#7DE3F2] hover:text-white hover:shadow-[0_0_24px_rgba(56,189,248,0.24)]",
  },
  {
    label: "Threads",
    href: "https://www.threads.com/@altftools",
    icon: FaThreads,
    className:
      "border-[color-mix(in_srgb,var(--primary)_34%,#14B8A6_28%)] bg-[linear-gradient(180deg,color-mix(in_srgb,#14B8A6_20%,var(--primary)_10%),rgba(6,16,34,0.08))] text-[#77F2E6] shadow-[0_0_0_1px_rgba(20,184,166,0.08),0_16px_38px_rgba(20,184,166,0.12)] hover:border-[#77F2E6] hover:text-white hover:shadow-[0_0_24px_rgba(20,184,166,0.24)]",
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/altftool17279",
    icon: FaXTwitter,
    className:
      "border-[color-mix(in_srgb,#38BDF8_34%,var(--primary)_20%)] bg-[linear-gradient(180deg,rgba(18,40,72,0.22),rgba(6,16,34,0.12))] text-[#E2F5FF] shadow-[0_0_0_1px_rgba(48,213,248,0.06),0_16px_38px_rgba(48,213,248,0.12)] hover:border-[#8BE8FF] hover:text-white hover:shadow-[0_0_24px_rgba(48,213,248,0.2)]",
  },
  {
    label: "Youtube",
    href: "https://www.youtube.com/@AltFTool",
    icon: FaYoutube,
    className:
      "border-[color-mix(in_srgb,#0EA5E9_36%,var(--primary)_24%)] bg-[linear-gradient(180deg,color-mix(in_srgb,#0EA5E9_18%,var(--primary)_8%),rgba(6,16,34,0.08))] text-[#8FDBFF] shadow-[0_0_0_1px_rgba(14,165,233,0.08),0_16px_38px_rgba(14,165,233,0.12)] hover:border-[#B5ECFF] hover:text-white hover:shadow-[0_0_24px_rgba(14,165,233,0.22)]",
  },
];

function HomeFooterSection({ group, withBorder = false }) {
  return (
    <div className={withBorder ? "lg:border-l lg:border-[#0EA5E9]/16 lg:pl-10" : ""}>
      <h3 className="text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-white">
        {group.title}
      </h3>
      <div className="mt-3 flex items-center gap-2">
        <span className="h-[3px] w-10 rounded-full bg-[linear-gradient(90deg,#14B8A6,#0EA5E9)]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#22D3EE]" />
      </div>
      <ul className="mt-6 space-y-3.5">
        {group.links.map((link) => (
          <li key={`${group.title}-${link.label}-${link.href}`}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-3 text-sm font-medium leading-6 text-[#D6E3F2] transition duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE]/30"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#06B6D4] transition duration-200 group-hover:scale-110 group-hover:bg-[#22D3EE]" />
              <span>{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PopularToolsSection() {
  return (
    <nav aria-label="Popular tools" className="mt-10 border-t border-[#0EA5E9]/22 pt-8">
      <h3 className="text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-white">
        Popular Tools
      </h3>
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
        {POPULAR_TOOL_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm font-medium leading-6 text-[#D6E3F2] transition duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22D3EE]/30"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-[#0EA5E9]/25 bg-[#020B1D] text-white [font-family:var(--font-inter)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(14,165,233,0.08),transparent_22%),radial-gradient(circle_at_100%_20%,rgba(20,184,166,0.09),transparent_24%),linear-gradient(180deg,rgba(2,11,29,0.98),rgba(2,9,24,1))]" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-56 w-[42rem] opacity-80">
        {/* Ornament only — an untitled SVG is still a graphics node to AT. */}
        <svg viewBox="0 0 680 180" className="h-full w-full" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, index) => (
            <path
              key={index}
              d={`M-40 ${54 + index * 8} C 10 ${78 + index * 4}, 42 ${132 + index * 5}, 98 ${154 - index * 2} C 138 ${168 - index}, 186 ${158 - index * 2}, 246 ${142 - index * 4} C 314 ${124 - index * 4}, 392 ${126 - index * 2}, 486 ${146 - index} C 552 ${160 - index}, 618 ${164 - index * 1.2}, 706 ${166 - index * 1.5}`}
              fill="none"
              stroke={index % 2 === 0 ? "rgba(34,211,238,0.38)" : "rgba(14,165,233,0.26)"}
              strokeWidth={index === 0 ? "1.8" : "1.05"}
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>
      <div className="pointer-events-none absolute right-0 top-0 h-44 w-[46rem] opacity-85">
        <svg viewBox="0 0 760 180" className="h-full w-full" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, index) => (
            <path
              key={index}
              d={`M118 ${18 + index * 3} C 214 ${18 + index * 2}, 284 ${28 + index * 2}, 340 ${64 + index * 4} C 380 ${90 + index * 4}, 420 ${100 + index * 3}, 466 ${70 + index * 1.6} C 514 ${36 + index * 1.2}, 578 ${18 + index * 1.5}, 660 ${12 + index * 2.4} C 716 ${10 + index * 2.8}, 764 ${12 + index * 3.2}, 812 ${16 + index * 3.6}`}
              fill="none"
              stroke={index % 2 === 0 ? "rgba(34,211,238,0.34)" : "rgba(14,165,233,0.22)"}
              strokeWidth={index === 1 ? "1.9" : "1.02"}
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>
      <span className="pointer-events-none absolute left-7 top-14 h-4 w-4 rounded-full bg-[#22D3EE] shadow-[0_0_22px_rgba(34,211,238,0.85)]" />
      <span className="pointer-events-none absolute left-3 top-28 h-2.5 w-2.5 rounded-full bg-[#1D9BF0] shadow-[0_0_18px_rgba(29,155,240,0.8)]" />
      <span className="pointer-events-none absolute right-8 top-20 h-7 w-7 rounded-full bg-[radial-gradient(circle_at_30%_30%,#38BDF8,#0EA5E9_70%,transparent_72%)] opacity-95 shadow-[0_0_28px_rgba(14,165,233,0.5)]" />
      <span className="pointer-events-none absolute right-24 bottom-44 h-3.5 w-3.5 rounded-full bg-[#22D3EE] shadow-[0_0_18px_rgba(34,211,238,0.68)]" />

      <div className="relative section mx-auto px-6 pb-0 pt-10 sm:px-8 lg:px-10 lg:pt-12">
        <div className="pt-9 lg:pt-10">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_3fr] lg:gap-10">
            <div className="min-w-0 lg:pr-6">
              <Link href="/" className="inline-flex transition duration-200 hover:-translate-y-0.5">
                <BrandLogo size="sm" className="text-[var(--anslation-ds-footer-text)]" />
              </Link>

              <p className="mt-6 max-w-[18rem] text-sm font-medium leading-8 text-[#D7E5F5]">
                A premium productivity workspace for online tools, extensions, deals, resources, and everyday browser workflows.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {HOME_FOOTER_SOCIALS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.label}
                      className={`flex h-11 w-11 items-center justify-center rounded-[0.95rem] border backdrop-blur-md transition duration-200 hover:-translate-y-1 ${item.className}`}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4 lg:gap-x-0 lg:gap-y-0">
              {HOME_FOOTER_GROUPS.map((group, index) => (
                <HomeFooterSection
                  key={group.title}
                  group={group}
                  withBorder={index > 0}
                />
              ))}
            </div>
          </div>
        </div>

        <PopularToolsSection />

        <div className="mt-8 border-t border-[#0EA5E9]/22 py-4">
          <div className="flex flex-col gap-3 text-xs text-[#D6E3F2] lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-[#22D3EE]" strokeWidth={2.1} />
              <p className="text-xs font-medium tracking-[0.01em] sm:text-sm">
                © {new Date().getFullYear()} AltFTool. All rights reserved.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-medium sm:text-sm">
              <Heart className="h-4.5 w-4.5 fill-[#22D3EE] text-[#22D3EE]" strokeWidth={2.2} />
              <p>Built for professionals, creators, developers, and businesses.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
