"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";
import { NAV_GROUPS, studioHref } from "../../data/navigation";
import { Logo } from "../shared/logo";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export function StudioSidebar({ onNavigate }) {
  const pathname = usePathname();
  const [query, setQuery] = React.useState("");

  const isActive = (slug) =>
    slug === "dashboard" ? pathname === "/imgprompt/studio" : pathname === `/imgprompt/studio/${slug}`;

  const groups = React.useMemo(() => {
    if (!query.trim()) return NAV_GROUPS;
    const q = query.toLowerCase();
    return NAV_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((i) => i.label.toLowerCase().includes(q)),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  return (
    <div className="flex h-full flex-col bg-card/40 backdrop-blur-xl">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Logo />
      </div>

      <div className="px-3 pb-2">
        <Button asChild className="w-full" size="sm">
          <Link href="/imgprompt/studio/prompt-generator" onClick={onNavigate}>
            <Sparkles className="h-4 w-4" /> New Prompt
          </Link>
        </Button>
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools…"
            className="h-9 pl-9 text-sm"
          />
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto app-scroll px-3 py-3 lg:max-h-[75vh]">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.slug);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.slug}
                    href={studioHref(item.slug)}
                    onClick={onNavigate}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                      active
                        ? "bg-primary/15 text-foreground"
                        : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand-gradient" />
                    )}
                    <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <Badge variant={active ? "gradient" : "secondary"} className="h-5 px-1.5 text-[10px]">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">No tools match "{query}".</p>
        )}
      </nav>
    </div>
  );
}
