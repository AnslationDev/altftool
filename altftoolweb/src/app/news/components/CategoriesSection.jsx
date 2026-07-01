"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  Globe, Cpu, Briefcase, Microscope, Heart, Trophy, Building2, Sparkles,
  ChevronLeft, ChevronRight
} from "lucide-react";

const CATEGORIES = [
  { key: "world", icon: Globe, label: "World", color: "bg-blue-500/10 text-blue-500" },
  { key: "tech", icon: Cpu, label: "Technology", color: "bg-cyan-500/10 text-cyan-500" },
  { key: "politics", icon: Building2, label: "Politics", color: "bg-orange-500/10 text-orange-500" },
  { key: "business", icon: Briefcase, label: "Business", color: "bg-emerald-500/10 text-emerald-500" },
  { key: "science", icon: Microscope, label: "Science", color: "bg-purple-500/10 text-purple-500" },
  { key: "sports", icon: Trophy, label: "Sports", color: "bg-amber-500/10 text-amber-500" },
  { key: "health", icon: Heart, label: "Health", color: "bg-rose-500/10 text-rose-500" },
  { key: "entertainment", icon: Sparkles, label: "Entertainment", color: "bg-pink-500/10 text-pink-500" },
];

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CategoriesSection({ articles = [] }) {
  const scrollRef = useRef(null);

  function scrollRight() {
    if (!scrollRef.current) return;
    const card = scrollRef.current.children[0];
    if (!card) return;
    const scrollAmount = card.getBoundingClientRect().width + 16;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }

  function scrollLeft() {
    if (!scrollRef.current) return;
    const card = scrollRef.current.children[0];
    if (!card) return;
    const scrollAmount = card.getBoundingClientRect().width + 16;
    scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  }

  function getCount(catKey) {
    return articles.filter((a) => a.category === catKey).length;
  }

  return (
    <div className="relative">
      <button
        onClick={scrollLeft}
        className="absolute -left-5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] shadow-sm transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
        aria-label="Scroll left"
      >
        <ChevronLeft size={18} />
      </button>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-4 py-2 no-scrollbar"
      >
        {CATEGORIES.map(({ key, icon: Icon, label, color }) => {
          const count = getCount(key);
          return (
            <Link
              key={key}
              href={`/news/topics/${slugify(label)}`}
              className="group flex shrink-0 items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-5 text-sm font-medium text-[var(--muted-foreground)] transition-all hover:scale-105 hover:shadow-md hover:border-[var(--primary)]"
            >
              <Icon size={28} className={color} />
              <div className="text-left">
                <p className="text-sm font-semibold text-[var(--foreground)]">{label}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{count} stories</p>
              </div>
            </Link>
          );
        })}
      </div>
      <button
        onClick={scrollRight}
        className="absolute -right-5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] shadow-sm transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
        aria-label="Scroll right"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
