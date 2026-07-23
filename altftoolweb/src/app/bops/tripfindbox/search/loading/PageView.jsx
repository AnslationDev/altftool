"use client";

import { Plane, Radar, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { loadSearchCriteria, saveSearchResults } from "@/app/bops/tripfindbox/lib/searchSession";
import { searchTravelResults } from "@/app/bops/tripfindbox/lib/travelResults";

const statuses = [
  "Scanning live airline availability",
  "Comparing route timing and cabin options",
  "Checking fare rules and baggage signals",
  "Preparing your travel options",
];

export default function SearchLoadingPage() {
  const router = useRouter();
  const [status, setStatus] = useState(statuses[0]);

  useEffect(() => {
    const statusTimer = window.setInterval(() => {
      setStatus((current) => statuses[(statuses.indexOf(current) + 1) % statuses.length]);
    }, 900);

    const runSearch = async () => {
      const criteria = loadSearchCriteria();
      if (!criteria) {
        router.replace("/bops/tripfindbox");
        return;
      }

      const minimumDelay = new Promise((resolve) => window.setTimeout(resolve, 1100));
      const results = await searchTravelResults(criteria);
      await minimumDelay;
      saveSearchResults(results);
      router.replace(results.length ? "/bops/tripfindbox/search/results" : "/bops/tripfindbox/search/no-results");
    };

    runSearch();
    return () => window.clearInterval(statusTimer);
  }, [router]);

  return (
    <main className="flow-page loading-page">
      <section className="flow-shell loading-shell">
        <div className="route-radar">
          <span><Plane size={34} /></span>
          <i />
          <b><Radar size={28} /></b>
        </div>
        <p className="flow-eyebrow"><Sparkles size={16} /> Travel search analysis</p>
        <h1>Building your best route options.</h1>
        <p>{status}</p>
        <div className="progress-track"><span /></div>
        <div className="loading-skeleton-grid" aria-hidden="true">
          <i /><i /><i />
        </div>
      </section>
    </main>
  );
}
