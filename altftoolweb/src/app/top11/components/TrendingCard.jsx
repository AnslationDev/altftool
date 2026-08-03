"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import SaveButton from "./ui/SaveButton";
import ImageWithFallback from "./ui/ImageWithFallback";

/**
 * One ranking tile — used by the trending grid, the category grid and the
 * related rail. A real <Link>, so it prefetches, opens in a new tab on
 * middle-click and is keyboard-reachable like every other link on the site.
 */
export default function TrendingCard({ ranking, index }) {
  return (
    <article className="group">
      <Link href={`/top11/item/${ranking.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-slate-200">
          <ImageWithFallback
            src={ranking.image}
            alt={ranking.title}
            className="h-full w-full transition duration-700 group-hover:scale-[1.025]"
          />
          <div className="absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-extrabold text-slate-950 shadow-sm">
            {String(index + 1).padStart(2, "0")}
          </div>
          <div className="absolute right-5 top-5">
            <SaveButton label="Save" />
          </div>
          <span className="absolute bottom-5 right-5 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-slate-950 text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
        <div className="pt-5">
          <div className="mb-3 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.12em] text-blue-600">
            <span>{ranking.category}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="text-slate-400">{ranking.views} views</span>
          </div>
          <h3 className="max-w-md text-2xl font-semibold leading-tight tracking-[-0.035em] text-slate-950 transition group-hover:text-blue-600">
            {ranking.title}
          </h3>
          <p className="mt-3 text-sm text-slate-500">Updated {ranking.updated}</p>
        </div>
      </Link>
    </article>
  );
}
