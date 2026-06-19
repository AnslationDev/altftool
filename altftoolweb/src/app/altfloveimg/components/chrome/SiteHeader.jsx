"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Sun, Moon, ArrowRight } from "lucide-react";
import Logo from "../illustrations/Logo";
import { TOOLS, CATEGORIES, BASE } from "../../data/tools";
import { useTheme } from "@/contexts/ThemeContext";

const MENU_CATS = CATEGORIES.filter((c) => c.id !== "all");

export default function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resolvedTheme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close menus on route change
  useEffect(() => {
    setToolsOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // lock scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "ali-glass border-b shadow-sm" : "border-b border-transparent"
      }`}
      style={{ borderColor: scrolled ? "var(--ali-border)" : "transparent", background: scrolled ? undefined : "color-mix(in srgb, var(--ali-page) 88%, transparent)" }}
    >
      <div className="ali-container flex h-16 items-center justify-between gap-4">
        {/* brand */}
        <Link href={BASE} className="flex items-center gap-2.5 shrink-0" aria-label="ALTF Love IMG home">
          <Logo size={34} />
          <span className="text-[17px] font-bold tracking-tight">
            ALTF <span className="ali-gradient-text">Love IMG</span>
          </span>
        </Link>

        {/* desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setToolsOpen(true)}
            onMouseLeave={() => setToolsOpen(false)}
          >
            <button
              className="ali-tab inline-flex items-center gap-1"
              data-active={toolsOpen || pathname !== BASE}
              onClick={() => setToolsOpen((v) => !v)}
              aria-expanded={toolsOpen}
            >
              Tools <ChevronDown size={15} className={`transition-transform ${toolsOpen ? "rotate-180" : ""}`} />
            </button>

            {toolsOpen && (
              <div className="absolute left-1/2 top-full w-[640px] -translate-x-1/2 pt-3">
                <div className="ali-card grid grid-cols-2 gap-1 p-3" style={{ boxShadow: "var(--ali-shadow-lg)" }}>
                  {MENU_CATS.map((cat) => (
                    <div key={cat.id} className="p-2">
                      <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--ali-muted)" }}>{cat.label}</p>
                      {TOOLS.filter((t) => t.category === cat.id).map((t) => {
                        const Icon = t.icon;
                        return (
                          <Link key={t.slug} href={`${BASE}/${t.slug}`}
                            className="group flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-[var(--ali-soft)]"
                            style={{ "--ali-accent": t.accent }}>
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: "color-mix(in srgb, var(--ali-accent) 13%, transparent)", color: "var(--ali-accent)" }}>
                              <Icon size={16} />
                            </span>
                            <span className="text-sm font-medium">{t.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link href={`${BASE}/compress`} className="ali-tab">Compress</Link>
          <Link href={`${BASE}/editor`} className="ali-tab">Editor</Link>
          <Link href={`${BASE}#tools`} className="ali-tab">All tools</Link>
        </nav>

        {/* right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="grid h-10 w-10 place-items-center rounded-xl border transition-colors hover:bg-[var(--ali-soft)]"
            style={{ borderColor: "var(--ali-border)" }}
          >
            {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link href={`${BASE}/compress`} className="ali-btn ali-btn-primary hidden sm:inline-flex">
            Start free <ArrowRight size={16} />
          </Link>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            className="grid h-10 w-10 place-items-center rounded-xl border transition-colors hover:bg-[var(--ali-soft)] lg:hidden"
            style={{ borderColor: "var(--ali-border)" }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto lg:hidden" style={{ background: "var(--ali-page)" }}>
          <div className="ali-container py-6">
            {MENU_CATS.map((cat) => (
              <div key={cat.id} className="mb-5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--ali-muted)" }}>{cat.label}</p>
                <div className="grid grid-cols-2 gap-2">
                  {TOOLS.filter((t) => t.category === cat.id).map((t) => {
                    const Icon = t.icon;
                    return (
                      <Link key={t.slug} href={`${BASE}/${t.slug}`}
                        className="ali-card flex items-center gap-2.5 p-3"
                        style={{ "--ali-accent": t.accent }}>
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: "color-mix(in srgb, var(--ali-accent) 13%, transparent)", color: "var(--ali-accent)" }}>
                          <Icon size={18} />
                        </span>
                        <span className="text-sm font-semibold">{t.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            <Link href={`${BASE}/compress`} className="ali-btn ali-btn-primary ali-btn-lg mt-2 w-full">
              Start free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
