"use client";

import Link from "next/link";
import { ChevronDown, Home } from "lucide-react";
import { findPrank, logoImage, navGroups } from "../data/pranxData";

export default function PranxHeader({ activeSlug }) {
  return (
    <header className="sticky top-0 z-40 border-b-4 border-[#12313a] bg-[#fff4dc] shadow-[0_8px_0_rgba(18,49,58,0.16)]">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-5 px-4 py-3 sm:px-6">
        <Link href="/pranx" className="flex shrink-0 items-center">
          <img src={logoImage} alt="PRANXHUB" className="h-16 w-auto max-w-[260px] object-contain sm:h-[4.75rem] sm:max-w-[340px]" />
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-3 lg:flex">
          <Link
            href="/pranx"
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xl font-black transition ${!activeSlug ? "bg-[#12313a] text-white shadow-[0_3px_0_#69e6d1]" : "text-[#12313a] hover:bg-white/70"}`}
          >
            <Home className="h-5 w-5" /> Home
          </Link>
          {navGroups.map((group) => {
            const GroupIcon = group.icon;
            return (
              <div key={group.label} className="group relative">
                <button
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xl font-black text-[#12313a] transition hover:bg-white/70"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl border-2 border-[#12313a] bg-[#1b726c] text-white shadow-[0_2px_0_#12313a]">
                    <GroupIcon className="h-6 w-6" />
                  </span>
                  {group.label}
                  <ChevronDown className="h-4 w-4 text-[#ff7a59]" />
                </button>
                <div className="invisible absolute left-0 top-full w-80 translate-y-3 border border-slate-200 bg-white p-3 opacity-0 shadow-2xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {group.items.map((slug) => {
                    const item = findPrank(slug);
                    if (!item) return null;
                    const Icon = item.icon;
                    return (
                      <Link key={slug} href={`/pranx/${slug}`} className="flex min-w-0 items-center gap-3 rounded-lg px-3 py-2 text-lg font-black text-slate-700 transition hover:bg-[#eef7fa] hover:text-[#2f7080]">
                        <Icon className="h-5 w-5 shrink-0 text-[#2f7080]" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
        <Link href="/pranx/hacker" className="hidden shrink-0 rounded-xl border-2 border-[#12313a] bg-white px-4 py-2 text-sm font-black text-[#12313a] shadow-[0_3px_0_#12313a] transition hover:bg-[#ffe66d] sm:inline-flex">
          Open a prank
        </Link>
      </div>
      <div className="flex gap-2 overflow-x-auto border-t border-[#12313a]/20 px-4 py-2 lg:hidden">
        {[...navGroups.flatMap((group) => group.items)].slice(0, 14).map((slug) => {
          const item = findPrank(slug);
          return item ? (
            <Link key={slug} href={`/pranx/${slug}`} className="shrink-0 rounded-full border border-[#12313a]/25 bg-white px-3 py-2 text-xs font-black text-[#12313a]">
              {item.title}
            </Link>
          ) : null;
        })}
      </div>
    </header>
  );
}
