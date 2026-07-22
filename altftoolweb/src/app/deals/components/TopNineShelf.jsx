"use client";

import DealCard from "./DealCard";
import { getTopNine } from "../data/deals";

export default function TopNineShelf() {
  const deals = getTopNine();
  if (!deals.length) return null;

  return (
    <section className="section pt-4 pb-6" aria-labelledby="top-nine-heading">
      <div className="mb-6 md:mb-8">
        <h2 id="top-nine-heading" className="section-title text-left! mb-2">
          Top 9 deals
        </h2>
        <p className="text-sm text-(--muted-foreground) md:text-lg">
          Our top performing free tools, ranked by the community.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {deals.map((deal) => (
          <DealCard key={deal.slug} deal={deal} rank={deal.topRank} />
        ))}
      </div>
    </section>
  );
}
