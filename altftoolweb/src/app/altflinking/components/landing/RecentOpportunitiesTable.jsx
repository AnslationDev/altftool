"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { formatPrice, resolveGuestPostPrice } from "../../lib/pricing";

function timestamp(value) {
  if (!value) return 0;
  if (typeof value?.toDate === "function") return value.toDate().getTime();
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function RecentOpportunitiesTable({
  websites = [],
  onSelectSite,
  onExploreMarketplace,
}) {
  const recent = websites
    .filter((site) => site.status === "APPROVED")
    .sort((a, b) => timestamp(b.createdAt) - timestamp(a.createdAt))
    .slice(0, 5);

  if (!recent.length) return null;

  return (
    <section className="altf-card p-6 space-y-5 my-8 rounded-xl" aria-labelledby="recent-listings-heading">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <h2 id="recent-listings-heading" className="text-xl font-black text-foreground tracking-tight">
            Recent Approved Listings
          </h2>
          <p className="text-xs text-muted">Publisher-provided listing details, ordered by recorded submission time.</p>
        </div>
        <button
          type="button"
          onClick={onExploreMarketplace}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <span>View all listings</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border text-muted font-semibold uppercase text-[10px]">
              <th className="p-3">Website</th>
              <th className="p-3">DR</th>
              <th className="p-3">Traffic</th>
              <th className="p-3">Niche</th>
              <th className="p-3">Guest-post price</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recent.map((site) => (
              <tr key={site.id} className="hover:bg-surface-soft transition">
                <td className="p-3 font-bold text-foreground font-mono">{site.domain}</td>
                <td className="p-3 font-mono text-foreground">{site.dr ?? "—"}</td>
                <td className="p-3 font-mono text-muted">
                  {Number.isFinite(site.traffic) ? `${site.traffic.toLocaleString()}/mo` : "—"}
                </td>
                <td className="p-3 text-muted">{site.niche || "—"}</td>
                <td className="p-3 font-mono font-bold text-primary">
                  {formatPrice(resolveGuestPostPrice(site))}
                </td>
                <td className="p-3 text-right">
                  <button
                    type="button"
                    onClick={() => onSelectSite?.(site)}
                    className="py-1 px-3 rounded-md border border-border text-foreground hover:border-primary hover:text-primary text-xs font-bold transition"
                  >
                    View details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
