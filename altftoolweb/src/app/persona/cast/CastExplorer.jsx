"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import PersonaCard from "../_components/PersonaCard";

/*
 * Filters are component state, not query params.
 *
 * Every niche worth indexing has a real server-rendered page at
 * /persona/niche/{slug} with its own copy, so mirroring the filters into
 * `?niche=` on every click would mint thin duplicates competing with those
 * pages. `?niche=` is still honoured on the way IN — old links and anything
 * pointing here rather than at the niche page — and it is resolved on the
 * server into `initialNiche` so the filtered grid is server-rendered rather
 * than corrected after hydration. The address bar is then left alone.
 */
export default function CastExplorer({
  entries,
  niches,
  platforms,
  routes,
  initialNiche,
}) {
  const [niche, setNiche] = useState(initialNiche || "all");
  const [platform, setPlatform] = useState("all");
  const [route, setRoute] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (niche !== "all" && entry.niche !== niche) return false;
      if (platform !== "all" && entry.platform !== platform) return false;
      if (route !== "all" && entry.routeId !== route) return false;
      if (
        needle.length >= 2 &&
        !`${entry.name} ${entry.handle} ${entry.tagline} ${entry.nicheLabel}`
          .toLowerCase()
          .includes(needle)
      ) {
        return false;
      }
      return true;
    });
  }, [entries, niche, platform, route, query]);

  const active = niche !== "all" || platform !== "all" || route !== "all" || query;

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the cast"
            aria-label="Search the cast"
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        <FacetRow
          label="Niche"
          value={niche}
          onChange={setNiche}
          options={niches.map((entry) => ({
            id: entry.slug,
            label: entry.label,
            count: entry.count,
          }))}
        />
        <FacetRow
          label="Platform"
          value={platform}
          onChange={setPlatform}
          options={platforms}
        />
        <FacetRow label="Route" value={route} onChange={setRoute} options={routes} />
      </div>

      <div className="mb-4 flex items-center gap-3">
        <p className="text-sm text-muted-foreground">
          {filtered.length} of {entries.length} personas
        </p>
        {active ? (
          <button
            type="button"
            onClick={() => {
              setNiche("all");
              setPlatform("all");
              setRoute("all");
              setQuery("");
            }}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            Clear
          </button>
        ) : null}
      </div>

      {filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((entry) => (
            <PersonaCard key={entry.slug} entry={entry} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nothing matches that combination. The cast is 24 personas, not 24,000 —
          widen a filter rather than narrowing the search.
        </p>
      )}
    </div>
  );
}

function FacetRow({ label, value, onChange, options }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="psn-stamp w-16 shrink-0">{label}</span>
      <div className="psn-rail flex flex-wrap gap-1.5">
        <Chip active={value === "all"} onClick={() => onChange("all")}>
          All
        </Chip>
        {options.map((option) => (
          <Chip
            key={option.id}
            active={value === option.id}
            onClick={() => onChange(option.id)}
          >
            {option.label}
            {option.count !== undefined ? (
              <span className="opacity-60"> {option.count}</span>
            ) : null}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="psn-option rounded-full px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {children}
    </button>
  );
}
