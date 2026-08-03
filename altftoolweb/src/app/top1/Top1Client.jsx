"use client";

import { useEffect, useState } from "react";
import { Loader2, SearchX } from "lucide-react";
import Top1Hero from "./components/Top1Hero";
import PickCard from "./components/PickCard";
import { TOP_PICKS } from "./data/top1Data";
import { fetchLeadPicks } from "./lib/liveData";

const SNAPSHOT_EYEBROW = "First in this category's saved provider snapshot";
const LIVE_EYEBROW = "First in this category's live provider list";
const SEARCH_LIMIT = 6;

export default function Top1Client() {
  // Every card renders from its provider snapshot on the server; live
  // cards replace them once the fetch lands. A provider that fails keeps
  // its snapshot rather than blanking the card.
  const [livePickByKey, setLivePickByKey] = useState(null);
  // Non-null only while a query matched no category on this page.
  const [search, setSearch] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchLeadPicks()
      .then((picks) => {
        if (cancelled) return;
        const byKey = {};
        picks.forEach((pick) => {
          byKey[pick.key] = pick;
        });
        setLivePickByKey(byKey);
      })
      .catch(() => {
        // The snapshot cards already on screen stay exactly as they are.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // A query naming one of these categories scrolls to it; anything else
  // goes to the keyless Wikipedia search /top10 already uses as its
  // catch-all, so the box answers arbitrary topics too.
  const handleSearch = async (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const normalized = trimmed.toLowerCase();

    const match = TOP_PICKS.find(
      (pick) =>
        pick.label.toLowerCase().includes(normalized) ||
        pick.tag.toLowerCase().includes(normalized),
    );
    if (match) {
      setSearch(null);
      document
        .getElementById(`top1-${match.key}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setSearch({ status: "loading", query: trimmed, items: [] });

    try {
      const response = await fetch(
        `/api/top10/search-wikipedia?query=${encodeURIComponent(trimmed)}`,
      );
      const data = await response.json();
      const items = (data.results || [])
        .filter((result) => result.image && result.title)
        .slice(0, SEARCH_LIMIT)
        .map((result) => ({
          key: `wikipedia-${result.title}`,
          // label is the card heading and item.title the line beneath it; the same
          // string in both printed the title twice on every search result.
          label: "Encyclopedia result",
          tag: "Wikipedia",
          item: result,
        }));
      setSearch({
        status: items.length ? "ok" : "empty",
        query: trimmed,
        items,
      });
    } catch {
      setSearch({ status: "error", query: trimmed, items: [] });
    }
  };

  return (
    <main className="min-h-screen bg-(--background) text-(--foreground)">
      <Top1Hero onSearch={handleSearch} />

      {search && (
        <section className="section">
          <h2 className="font-primary text-2xl font-extrabold tracking-tight text-(--foreground)">
            Wikipedia results for &ldquo;{search.query}&rdquo;
          </h2>
          {search.status === "ok" ? (
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {search.items.map((pick) => (
                <PickCard
                  key={pick.key}
                  pick={pick}
                  eyebrow="Live Wikipedia result"
                />
              ))}
            </div>
          ) : (
            <p
              role="status"
              aria-live="polite"
              className="mt-4 flex items-center gap-2 text-sm text-(--muted-foreground) font-secondary"
            >
              {search.status === "loading" ? (
                <Loader2
                  className="h-4 w-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : (
                <SearchX className="h-4 w-4" aria-hidden="true" />
              )}
              {search.status === "loading"
                ? "Searching Wikipedia…"
                : search.status === "error"
                  ? "Wikipedia could not be reached just now. Try again in a moment."
                  : "No Wikipedia results with a picture for that term. Try a broader one."}
            </p>
          )}
        </section>
      )}

      <section className="section">
        {/* The 11 PickCard headings are h3. Without this the document went
            h1 -> h3 by default; the only other h2 lives inside the search
            block, which is not rendered until someone searches. */}
        <h2 className="mb-5 font-primary text-2xl font-extrabold tracking-tight text-(--foreground)">
          One pick per category
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOP_PICKS.map((pick) => {
            const live = livePickByKey?.[pick.key];
            return (
              <div key={pick.key} id={`top1-${pick.key}`} className="scroll-mt-28">
                <PickCard
                  pick={live || pick}
                  eyebrow={live ? LIVE_EYEBROW : SNAPSHOT_EYEBROW}
                />
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
