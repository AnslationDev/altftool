"use client";

import { Bookmark, Compass, Home, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTop11Search } from "../SearchContext";

export default function MobileNav() {
  const { openSearch } = useTop11Search();
  const pathname = usePathname() || "";

  const items = [
    { label: "Home", icon: Home, href: "/top11", active: pathname === "/top11" },
    {
      label: "Explore",
      icon: Compass,
      href: "/top11/category/trending",
      active: pathname.startsWith("/top11/category"),
    },
    { label: "Search", icon: Search, onClick: openSearch, active: false },
    // No saved-items feature exists yet, so this stays visibly inert rather
    // than looking clickable and doing nothing.
    { label: "Saved", icon: Bookmark, disabled: true, active: false },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-4 rounded-2xl border border-slate-200/70 bg-white/95 p-1.5 shadow-2xl backdrop-blur-xl md:hidden"
    >
      {items.map(({ label, icon: Icon, href, onClick, disabled, active }) => {
        const className = `flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold ${active ? "bg-slate-950 text-white" : "text-slate-500"} ${disabled ? "opacity-40" : ""}`;
        const content = (
          <>
            <Icon className="h-4 w-4" />
            {label}
          </>
        );

        if (href) {
          return (
            <Link key={label} href={href} className={className}>
              {content}
            </Link>
          );
        }

        return (
          <button key={label} type="button" onClick={onClick} disabled={disabled} className={className}>
            {content}
          </button>
        );
      })}
    </nav>
  );
}
