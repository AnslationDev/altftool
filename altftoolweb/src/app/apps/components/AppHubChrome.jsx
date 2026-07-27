import Link from "next/link";
import { Facebook, Instagram, Search, Twitter, Youtube } from "lucide-react";

export function AppHubLogo() {
  return (
    <Link href="/apps" className="group inline-flex min-w-0 shrink-0 items-center" aria-label="AppHub home">
      <span className="relative flex h-9 min-w-0 items-center pl-0.5 pr-2 sm:h-10 sm:pr-4">
        <span className="absolute bottom-0 left-7 right-0 h-[3px] rounded-full bg-[var(--primary)] transition-all duration-300 group-hover:left-5 sm:left-8 sm:right-1" />
        <svg viewBox="0 0 42 42" className="mr-1.5 h-8 w-8 shrink-0 transition duration-300 group-hover:-translate-y-0.5 sm:mr-2 sm:h-9 sm:w-9" role="img" aria-hidden="true">
          <path d="M8 22c0-7.2 5.8-13 13-13h8.5c2 0 3.1 2.4 1.8 3.9L18.8 28.2c-1.3 1.6-3.8.7-3.8-1.4V21" fill="var(--foreground)" />
          <path d="M16.5 33h9.8c5 0 9-4 9-9v-2.4c0-1.9-2.3-2.9-3.7-1.6L17.4 33.5c-.3.3-.6-.5-.9-.5Z" fill="var(--primary)" />
          <path d="M20 16.5v8m0 0 3.2-3.2M20 24.5l-3.2-3.2" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
        </svg>
        <span className="truncate text-lg font-bold tracking-normal text-[var(--foreground)] transition group-hover:text-[var(--primary)] sm:text-xl">
          AppHub
        </span>
      </span>
    </Link>
  );
}

export function AppHubHeader() {
  const navItems = [
    { label: "Home", href: "/apps#apphub-home" },
    { label: "Categories", href: "/apps#categories" },
    { label: "Featured Apps", href: "/apps#featured-apps" },
    { label: "All Apps", href: "/apps#all-apps" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--home-border)] bg-[color-mix(in_srgb,var(--background)_92%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-[60px] max-w-[1320px] items-center justify-between gap-3 px-4 sm:h-[64px] sm:gap-5 sm:px-6 lg:gap-6 lg:px-8">
        <AppHubLogo />

        <nav className="hidden items-center gap-2 lg:flex xl:gap-3">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className="rounded-full px-3 py-2 text-[13px] font-medium text-[var(--foreground)] transition duration-200 hover:bg-[var(--card-hover-bg)] hover:text-[var(--primary)]">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden min-w-0 items-center gap-3 md:flex lg:gap-4">
          <form action="/apps#featured-apps" className="flex h-10 w-[170px] items-center gap-2 rounded-full border border-[var(--home-border)] bg-[color-mix(in_srgb,var(--card)_88%,transparent)] px-4 shadow-[var(--home-shadow-sm)] lg:w-[220px]">
            <button type="submit" className="-ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--muted-foreground)] transition hover:bg-[var(--home-hover)] hover:text-[var(--primary)]" aria-label="Search apps">
              <Search size={16} aria-hidden="true" />
            </button>
            <input
              name="q"
              placeholder="Search apps, tools..."
              className="min-w-0 flex-1 bg-transparent text-[12px] font-semibold text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
            />
          </form>
          <a
            href="#featured-apps"
            className="inline-flex h-10 shrink-0 items-center rounded-full bg-[image:var(--anslation-ds-cta-gradient)] px-4 text-[12px] font-semibold text-[var(--primary-foreground)] shadow-[0_14px_28px_color-mix(in_srgb,var(--primary)_24%,transparent)] transition hover:-translate-y-0.5 hover:bg-[image:var(--anslation-ds-cta-gradient-hover)] lg:px-5"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </header>
  );
}

export function AppHubFooter() {
  const socialLinks = [
    { label: "Facebook", icon: Facebook, className: "bg-[#1877f2] text-white hover:bg-[#0f5fc8]" },
    { label: "Twitter", icon: Twitter, className: "bg-[#1da1f2] text-white hover:bg-[#0c86d2]" },
    { label: "Instagram", icon: Instagram, className: "bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white hover:brightness-105" },
    { label: "YouTube", icon: Youtube, className: "bg-[#ff0000] text-white hover:bg-[#cc0000]" },
  ];

  return (
    <footer className="border-t border-[var(--home-border)] bg-[var(--section-highlight)]">
      <div className="mx-auto grid max-w-[1320px] items-center gap-4 px-4 py-5 text-center sm:grid-cols-[1fr_auto_1fr] sm:px-6 lg:px-8">
        <div className="flex justify-center sm:justify-start">
          <AppHubLogo />
        </div>

        <p className="text-[12px] font-semibold text-[var(--muted-foreground)]">© 2024 AppHub. Trusted APK downloads.</p>

        <div className="flex justify-center gap-3 sm:justify-end">
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <Link
                key={social.label}
                href="/apps"
                className={`flex h-9 w-9 items-center justify-center rounded-full shadow-[0_10px_22px_rgba(15,23,42,0.1)] transition hover:-translate-y-0.5 ${social.className}`}
                aria-label={social.label}
              >
                <Icon size={16} aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
