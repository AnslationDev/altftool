"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import DealCard from "./DealCard";
import { getDealsByShelf } from "../data/deals";

export default function DealShelf({ shelf, title, subtitle, headingId }) {
  const deals = getDealsByShelf(shelf);
  const scrollRef = useRef(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: true });

  if (!deals.length) return null;

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScroll({
      left: el.scrollLeft > 8,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 8,
    });
  };

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <section className="section py-6" aria-labelledby={headingId}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id={headingId} className="section-title text-left! mb-1">
            {title}
          </h2>
          <p className="text-sm text-(--muted-foreground) md:text-base">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={!canScroll.left}
            aria-label={`Scroll ${title} backward`}
            className="afd-cta-secondary h-10 w-10 min-h-0 p-0 disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={!canScroll.right}
            aria-label={`Scroll ${title} forward`}
            className="afd-cta-secondary h-10 w-10 min-h-0 p-0 disabled:opacity-40"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
          <Link
            href="#browse-deals"
            className="hidden text-sm font-semibold text-(--primary) hover:underline sm:inline"
          >
            View all
          </Link>
        </div>
      </div>
      <div ref={scrollRef} onScroll={checkScroll} className="afd-shelf no-scrollbar">
        {deals.map((deal) => (
          <DealCard key={deal.slug} deal={deal} />
        ))}
      </div>
    </section>
  );
}
