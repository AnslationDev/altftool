"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Moon, Sun, Menu, X, Sparkles, Layers, Compass } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Monitor scroll actions to toggle glass state density
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved ? saved === "dark" : prefersDark;
    setIsDark(dark);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.setAttribute("data-theme", newDark ? "dark" : "light");
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  const navLinks = [
    { name: "Home", href: "/", icon: Compass },
    { name: "Generators", href: "/fodey-new", icon: Layers },
    { name: "About Studio", href: "/fodey-new/landing#about", icon: Sparkles },
  ];

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
        ? "bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-800/50 shadow-xs"
        : "bg-white/40 dark:bg-neutral-950/40 backdrop-blur-xs border-b border-transparent"
      }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 py-3.5 lg:px-8">

        {/* Animated Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group outline-none">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center transition-transform group-hover:rotate-12 duration-300">
            <Sparkles className="w-4 h-4 text-white dark:text-neutral-900" />
          </div>
          <span className="text-lg font-black tracking-tight text-neutral-900 dark:text-white uppercase">
            AltF<span className="text-neutral-400 font-normal"> Maker Studio</span>
          </span>
        </Link>

        {/* Desktop Navigation Link Matrix */}
        <nav className="hidden md:flex space-x-1 items-center">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 outline-none ${isActive
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/80 dark:hover:bg-neutral-900/50"
                  }`}
              >
                <link.icon className="w-3.5 h-3.5" />
                {link.name}
              </Link>
            );
          })}

          <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-2" />

          {/* Theme Mode Toggle Button Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 border border-neutral-200/60 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all duration-200 shadow-3xs outline-none"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </nav>

        {/* Mobile Toggle Trigger */}
        <button
          className="md:hidden p-2 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-lg transition-colors outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-4 h-4 text-neutral-800 dark:text-white" /> : <Menu className="w-4 h-4 text-neutral-800 dark:text-white" />}
        </button>
      </div>

      {/* Mobile Drawer Panel Navigation Overlay */}
      {menuOpen && (
        <nav className="md:hidden border-t border-neutral-100 dark:border-neutral-900 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl animate-fade-in">
          <div className="flex flex-col space-y-1.5 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </Link>
            ))}
            <div className="h-px bg-neutral-100 dark:bg-neutral-900 my-2" />
            <button
              onClick={() => { toggleTheme(); setMenuOpen(false); }}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300"
            >
              <span>Appearance Mode</span>
              {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
