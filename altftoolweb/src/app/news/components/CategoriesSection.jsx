"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  Globe, Cpu, Briefcase, Microscope, Heart, Trophy, Building2, Sparkles,
  ChevronLeft, ChevronRight
} from "lucide-react";

const CATEGORIES = [
  { key: "world", icon: Globe, label: "World" },
  { key: "tech", icon: Cpu, label: "Technology" },
  { key: "politics", icon: Building2, label: "Politics" },
  { key: "business", icon: Briefcase, label: "Business" },
  { key: "science", icon: Microscope, label: "Science" },
  { key: "sports", icon: Trophy, label: "Sports" },
  { key: "health", icon: Heart, label: "Health" },
  { key: "entertainment", icon: Sparkles, label: "Entertainment" },
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
        {CATEGORIES.map(({ key, icon: Icon, label }) => {
          const count = getCount(key);
          return (
            <Link
              key={key}
              href={`/news/topics/${slugify(label)}`}
              className="group flex shrink-0 items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] px-6 py-5 text-sm font-medium text-[var(--muted-foreground)] transition-all hover:scale-105 hover:shadow-md hover:border-[var(--primary)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                <Icon size={22} />
              </div>
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
