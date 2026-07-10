"use client";

// ALTF Engine — shared tab navigation for the Meta SEO Management module.

import { Layers, Search, Globe2, FileEdit, ListChecks, Wrench, FileText, Globe, Bot } from "lucide-react";

const TABS = [
  { key: "dashboard", label: "Dashboard", href: "/altftool/seo/dashboard", icon: Layers },
  { key: "search", label: "Search", href: "/altftool/seo/search", icon: Search },
  { key: "global", label: "Global", href: "/altftool/seo/global", icon: Globe2 },
  { key: "pages", label: "Pages", href: "/altftool/seo/pages", icon: FileEdit },
  { key: "bulk", label: "Bulk", href: "/altftool/seo/bulk", icon: ListChecks },
  { key: "technical", label: "Technical", href: "/altftool/seo/technical", icon: Wrench },
  { key: "config", label: "Config (JSON)", href: "/altftool/seo", icon: FileText },
  { key: "gsc", label: "Search Console", href: "/altftool/seo/gsc", icon: Globe },
  { key: "automation", label: "Automation", href: "/altftool/blogs/automation", icon: Bot },
];

export default function SeoNav({ active }) {
  return (
    <nav
      aria-label="SEO sections"
      className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-border bg-surface-soft/70 p-1.5 shadow-sm"
    >
      {TABS.map(({ key, label, href, icon: Icon }) => {
        const isActive = key === active;
        return isActive ? (
          <span
            key={key}
            aria-current="page"
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-card px-3.5 py-2 text-sm font-semibold text-primary shadow-sm ring-1 ring-border"
          >
            <Icon className="h-4 w-4" />
            {label}
          </span>
        ) : (
          <a
            key={key}
            href={href}
            className="flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-card/70 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Icon className="h-4 w-4" />
            {label}
          </a>
        );
      })}
    </nav>
  );
}
