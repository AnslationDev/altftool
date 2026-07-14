"use client";

// ALTF Engine — shared tab navigation for the Meta SEO Management module.
// The module is mounted per-project at /<project>/seo/..., so every tab is
// built relative to the active project (read from the route params).

import { useParams } from "next/navigation";
import { Layers, Search, Globe2, FileEdit, ListChecks, Wrench, FileText, Globe, Bot } from "lucide-react";

function buildTabs(project) {
  const base = `/${project}/seo`;
  const tabs = [
    { key: "dashboard", label: "Dashboard", href: `${base}/dashboard`, icon: Layers },
    { key: "search", label: "Search", href: `${base}/search`, icon: Search },
    { key: "global", label: "Global", href: `${base}/global`, icon: Globe2 },
    { key: "pages", label: "Pages", href: `${base}/pages`, icon: FileEdit },
    { key: "bulk", label: "Bulk", href: `${base}/bulk`, icon: ListChecks },
    { key: "technical", label: "Technical", href: `${base}/technical`, icon: Wrench },
    { key: "config", label: "Config (JSON)", href: base, icon: FileText },
  ];
  // Search Console (single altftool-global Google connection) and Automation
  // (altftool blogs) are altftool-only until per-project wiring exists.
  if (project === "altftool") {
    tabs.push({ key: "gsc", label: "Search Console", href: `${base}/gsc`, icon: Globe });
    tabs.push({ key: "automation", label: "Automation", href: `/${project}/blogs/automation`, icon: Bot });
  }
  return tabs;
}

export default function SeoNav({ active }) {
  const params = useParams();
  const project =
    (typeof params?.project === "string" && params.project) || "altftool";
  const TABS = buildTabs(project);

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
