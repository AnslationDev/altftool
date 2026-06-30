"use client";

// ALTF Engine — shared tab navigation for the Meta SEO Management module.

import { Layers, Search, Globe2, FileEdit, ListChecks, Wrench, FileText, Globe } from "lucide-react";

const TABS = [
  { key: "dashboard", label: "Dashboard", href: "/altftool/seo/dashboard", icon: Layers },
  { key: "search", label: "Search", href: "/altftool/seo/search", icon: Search },
  { key: "global", label: "Global", href: "/altftool/seo/global", icon: Globe2 },
  { key: "pages", label: "Pages", href: "/altftool/seo/pages", icon: FileEdit },
  { key: "bulk", label: "Bulk", href: "/altftool/seo/bulk", icon: ListChecks },
  { key: "technical", label: "Technical", href: "/altftool/seo/technical", icon: Wrench },
  { key: "config", label: "Config (JSON)", href: "/altftool/seo", icon: FileText },
  { key: "gsc", label: "Search Console", href: "/altftool/seo/gsc", icon: Globe },
];

export default function SeoNav({ active }) {
  return (
    <nav className="flex items-center gap-5 overflow-x-auto border-b border-border pb-3">
      {TABS.map(({ key, label, href, icon: Icon }) => {
        const isActive = key === active;
        return isActive ? (
          <span
            key={key}
            aria-current="page"
            className="flex shrink-0 items-center gap-1.5 border-b-2 border-primary pb-3 -mb-3.5 font-semibold text-primary"
          >
            <Icon className="h-4 w-4" />
            {label}
          </span>
        ) : (
          <a
            key={key}
            href={href}
            className="flex shrink-0 items-center gap-1.5 pb-3 -mb-3.5 text-muted transition-colors hover:text-foreground"
          >
            <Icon className="h-4 w-4" />
            {label}
          </a>
        );
      })}
    </nav>
  );
}
