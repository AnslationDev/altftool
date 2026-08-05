"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchX } from "lucide-react";
import CategoryFilterBar from "./CategoryFilterBar";
import RankingCard from "./RankingCard";
import { Reveal, EASE } from "./motion";

/**
 * Client-side explorer for the category index page.
 *
 * Owns three pieces of interactivity the server page can't provide:
 *   1. Working filter tabs for the authored preview fields
 *      plus a working topic dropdown.
 *   2. Live search — listens for the `top5:category-search` event emitted
 *      by CategorySearchForm up in the hero.
 *   3. The "spotlight" hover treatment on the card grid: the card being
 *      looked at lifts and sharpens while its siblings gently dim and
 *      recede, so the eye lands exactly on the ranking under the cursor.
 */

function parseViews(views) {
  const match = String(views).match(/^([\d.]+)\s*([KMB]?)$/i);
  if (!match) return 0;
  const base = parseFloat(match[1]);
  const unit = { K: 1e3, M: 1e6, B: 1e9 }[match[2]?.toUpperCase()] || 1;
  return base * unit;
}

function parseUpdatedDate(updated) {
  const time = Date.parse(updated);
  return Number.isNaN(time) ? 0 : time;
}

function sortRankings(rankings, filter) {
  const list = [...rankings];
  switch (filter) {
    case "Highlighted":
      // Keep the authored preview ordering stable while using its demo fields.
      return list.sort(
        (a, b) =>
          parseViews(b.views) * 0.6 + parseUpdatedDate(b.updated) / 1e9 -
          (parseViews(a.views) * 0.6 + parseUpdatedDate(a.updated) / 1e9),
      );
    case "Preview date":
      return list.sort((a, b) => parseUpdatedDate(b.updated) - parseUpdatedDate(a.updated));
    case "Preview activity":
      return list.sort((a, b) => parseViews(b.views) - parseViews(a.views));
    default:
      return list;
  }
}

export default function CategoryExplorer({
  rankings,
  entityName,
  hasDedicatedRankings,
  mode = "fallback",
}) {
  const [activeFilter, setActiveFilter] = useState("Show all");
  const [activeTopic, setActiveTopic] = useState("All topics");
  const [query, setQuery] = useState("");
  const [hoveredSlug, setHoveredSlug] = useState(null);

  // Live search events from the hero search form (a separate client island).
  useEffect(() => {
    const onSearch = (event) => setQuery(String(event.detail || "").trim().toLowerCase());
    window.addEventListener("top5:category-search", onSearch);
    return () => window.removeEventListener("top5:category-search", onSearch);
  }, []);

  const topics = useMemo(
    () => ["All topics", ...Array.from(new Set(rankings.map((r) => r.category)))],
    [rankings],
  );

  const visible = useMemo(() => {
    let list = sortRankings(rankings, activeFilter);
    if (activeTopic !== "All topics") {
      list = list.filter((r) => r.category === activeTopic);
    }
    if (query) {
      list = list.filter((r) =>
        `${r.title} ${r.shortLabel} ${r.category}`.toLowerCase().includes(query),
      );
    }
    return list;
  }, [rankings, activeFilter, activeTopic, query]);

  return (
    <div>
      <CategoryFilterBar
        active={activeFilter}
        onChange={setActiveFilter}
        topics={topics}
        activeTopic={activeTopic}
        onTopicChange={setActiveTopic}
      />

      <Reveal className="mt-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0b1120]">
            {mode === "dedicated" || hasDedicatedRankings
              ? `Preview rankings in ${entityName}`
              : mode === "related"
                ? `Closest to ${entityName.toLowerCase()}`
                : "Top5 preview rankings"}
          </h2>
          {mode === "related" ? (
            <p className="mt-1.5 max-w-lg text-sm text-[#6b7280]">
              Dedicated{" "}{entityName.toLowerCase()}{" "}rankings are in the works &mdash;
              until they land, these are the picks most related to{" "}
              {entityName.toLowerCase()} across Top5.
            </p>
          ) : null}
          {mode === "fallback" && !hasDedicatedRankings ? (
            <p className="mt-1.5 max-w-lg text-sm text-[#6b7280]">
              We haven&apos;t published dedicated{" "}{entityName.toLowerCase()}{" "}rankings
              yet &mdash; here are related preview rankings in the meantime.
            </p>
          ) : null}
        </div>
        <p className="text-sm text-[#9ca3af] shrink-0" aria-live="polite">
          Showing {visible.length} ranking{visible.length === 1 ? "" : "s"}
        </p>
      </Reveal>

      <motion.div
        layout
        onMouseLeave={() => setHoveredSlug(null)}
        style={{ perspective: 1100 }}
        className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-6"
      >
        <AnimatePresence mode="popLayout">
          {visible.map((ranking, index) => {
            const state =
              hoveredSlug === null
                ? "idle"
                : hoveredSlug === ranking.slug
                  ? "active"
                  : "dim";
            return (
              <motion.div
                key={ranking.slug}
                layout
                initial={{ opacity: 0, y: 48, rotateX: 14, scale: 0.94, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.15 }}
                exit={{ opacity: 0, scale: 0.92, filter: "blur(4px)", transition: { duration: 0.25, ease: EASE } }}
                transition={{ duration: 0.7, delay: Math.min(index * 0.09, 0.45), ease: EASE }}
                onMouseEnter={() => setHoveredSlug(ranking.slug)}
                onFocus={() => setHoveredSlug(ranking.slug)}
                onBlur={() => setHoveredSlug(null)}
                style={{ zIndex: state === "active" ? 10 : 1 }}
                className="relative"
              >
                <RankingCard ranking={ranking} index={index} state={state} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {visible.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-[#f7f8fa] px-6 py-16 text-center"
          >
            <SearchX size={28} className="text-[#9ca3af]" />
            <p className="mt-4 font-semibold text-[#0b1120]">No rankings match</p>
            <p className="mt-1 text-sm text-[#6b7280]">
              Try a different search, topic, or filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveTopic("All topics");
                setActiveFilter("Show all");
                window.dispatchEvent(new CustomEvent("top5:category-search-reset"));
              }}
              className="mt-5 rounded-full bg-[#0b1120] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95"
            >
              Reset filters
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
