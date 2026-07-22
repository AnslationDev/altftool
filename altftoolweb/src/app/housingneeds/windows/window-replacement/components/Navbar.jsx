"use client";
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import clsx from "clsx";
import Icon from "./Icons.jsx";
import { Container, Button } from "./ui.jsx";
import { navLinks, company } from "../data/site.js";
import { useActionPopup } from "./ActionPopup.jsx";

export default function Navbar() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { trigger, Popup } = useActionPopup();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const solid = scrolled || !isHome || open;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Main bar */}
      <div
        className={clsx(
          "transition-all duration-500",
          solid
            ? "border-b border-stone-200/80 bg-cream/95 shadow-sm backdrop-blur-md"
            : "bg-transparent"
        )}
      >
        <Container className="flex h-[72px] items-center justify-between">
          {/* Text logo */}
          <NavLink to="/" className="group flex flex-col leading-none" aria-label={company.full}>
            <span
              className={clsx(
                "font-display text-2xl font-semibold tracking-tight transition-colors",
                solid ? "text-ink" : "text-white"
              )}
            >
              {company.name}
              <span className="text-bronze-500">.</span>
            </span>
            <span
              className={clsx(
                "mt-0.5 text-[10px] font-semibold uppercase tracking-[0.32em] transition-colors",
                solid ? "text-stone-500" : "text-white/70"
              )}
            >
              Windows &amp; Facades
            </span>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1.5 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  clsx(
                    "relative rounded-full px-5 py-2.5 text-[17px] font-semibold tracking-tight transition-colors",
                    solid
                      ? isActive
                        ? "text-bronze-700"
                        : "text-stone-700 hover:text-bronze-700"
                      : isActive
                      ? "text-white"
                      : "text-white/90 hover:text-white",
                    "after:absolute after:inset-x-5 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-bronze-500 after:transition-transform hover:after:scale-x-100",
                    (link.to === pathname || (link.to !== "/" && pathname.startsWith(link.to))) &&
                      "after:scale-x-100"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={trigger}
              className={clsx(
                "hidden items-center gap-2 rounded-full px-4 py-2.5 text-[15px] font-semibold transition-all md:inline-flex",
                solid
                  ? "bg-bronze-50 text-bronze-700 hover:bg-bronze-100"
                  : "bg-white/10 text-white backdrop-blur-sm ring-1 ring-white/20 hover:bg-white/20"
              )}
            >
              <Icon name="phone" className="h-4 w-4" />
              {company.phone}
            </button>


            {/* Mobile toggle */}
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
              className={clsx(
                "inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors md:hidden",
                solid
                  ? "border-stone-300 text-ink hover:bg-stone-100"
                  : "border-white/30 text-white hover:bg-white/10"
              )}
            >
              <Icon name={open ? "close" : "menu"} className="h-5 w-5" />
            </button>
          </div>
        </Container>
      </div>

      {/* Mobile menu */}
      <div
        className={clsx(
          "overflow-hidden border-b border-stone-200 bg-cream transition-all duration-500 md:hidden",
          open ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <Container className="flex flex-col gap-1 py-5">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                clsx(
                  "flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-colors",
                  isActive
                    ? "bg-bronze-50 text-bronze-700"
                    : "text-stone-700 hover:bg-stone-100"
                )
              }
            >
              {link.label}
              <Icon name="arrowRight" className="h-4 w-4 opacity-50" />
            </NavLink>
          ))}

          <div className="mt-3 flex items-center gap-4 px-1 text-sm text-stone-500">
            <button onClick={trigger} className="flex items-center gap-2 hover:text-bronze-600 transition-colors">
              <Icon name="phone" className="h-4 w-4 text-bronze-600" />
              {company.phone}
            </button>
          </div>
        </Container>
      </div>
      <Popup />
    </header>
  );
}
