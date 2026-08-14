// src/app/tradeon/components/dashboard/Sidebar.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Grid2x2,
  LayoutDashboard,
  LineChart,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Gauge,
  Star,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { assetHref } from "../../lib/format";
import Logo from "../shared/Logo";

const NAV = [
  { label: "Dashboard", Icon: LayoutDashboard, href: "/tradeon/dashboard", active: true },
  { label: "Markets", Icon: LineChart, href: "/tradeon#markets" },
  { label: "Workspace", Icon: Grid2x2, href: "/tradeon/workspace" },
  { label: "Predictions", Icon: Gauge, href: "/tradeon#predictions" },
];

export default function Sidebar({ collapsed, onToggle }) {
  const [favorites] = useState(["BTC", "NVDA", "ETH", "AAPL"]);
  const [recent] = useState(["TSLA", "SOL", "SPX"]);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col shrink-0 h-screen sticky top-0 tdn-glass border-r transition-all duration-300 z-30",
        collapsed ? "w-[68px]" : "w-[236px]"
      )}
      style={{ borderColor: "var(--tdn-border)" }}
    >
      <div className={cn("flex items-center h-16 px-4", collapsed && "justify-center px-0")}>
        <Link href="/tradeon">
          <Logo wordmark={!collapsed} size={28} />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto tdn-scroll-thin px-3 py-2 space-y-1">
        {NAV.map(({ label, Icon, href, active }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              collapsed && "justify-center px-0"
            )}
            style={
              active
                ? { background: "var(--tdn-iris)", color: "#fff", boxShadow: "var(--tdn-shadow-sm)" }
                : { color: "var(--tdn-muted)" }
            }
            title={label}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && label}
          </Link>
        ))}

        {!collapsed && (
          <>
            <div className="pt-4 pb-1 px-3 flex items-center gap-1.5 tdn-eyebrow text-[0.6rem]">
              <Star size={11} /> Sample favorites
            </div>
            {favorites.map((s) => (
              <Link href={assetHref(s)} key={s} className="w-full flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm hover:bg-[color-mix(in_srgb,var(--tdn-iris)_7%,transparent)]" style={{ color: "var(--tdn-fg)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--tdn-iris-2)" }} />
                {s}
              </Link>
            ))}
            <div className="pt-3 pb-1 px-3 flex items-center gap-1.5 tdn-eyebrow text-[0.6rem]">
              <Clock size={11} /> Sample recently viewed
            </div>
            {recent.map((s) => (
              <Link href={assetHref(s)} key={s} className="w-full flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm hover:bg-[color-mix(in_srgb,var(--tdn-iris)_7%,transparent)]" style={{ color: "var(--tdn-muted)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--tdn-faint)" }} />
                {s}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="p-3 border-t" style={{ borderColor: "var(--tdn-border)" }}>
        <Link href="/account" className={cn("w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium", collapsed && "justify-center px-0")} style={{ color: "var(--tdn-muted)" }} title="Settings">
          <Settings size={18} />
          {!collapsed && "Settings"}
        </Link>
        <button
          onClick={onToggle}
          className={cn("w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium mt-1", collapsed && "justify-center px-0")}
          style={{ color: "var(--tdn-muted)" }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          {!collapsed && "Collapse"}
        </button>
      </div>
    </aside>
  );
}
