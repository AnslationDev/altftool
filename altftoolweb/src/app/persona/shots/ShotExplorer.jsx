"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import ShotCard from "../_components/ShotCard";

/*
 * Fifty-four shots in ten walls is a wall, not a library. The filter that
 * matters most is ROUTE — "what can I afford to shoot" is the question a
 * production plan turns on — so it leads, and the counts sit on the chips so
 * the answer is visible before anything is clicked.
 *
 * Like the cast explorer, filter state stays in the component: every category
 * has a real page at /persona/shots/category/{slug} with its own copy, and
 * mirroring the filters into the URL would mint thin duplicates competing with
 * those pages.
 */
export default function ShotExplorer({ shots, categories, routes, niches }) {
  const [route, setRoute] = useState("all");
  const [category, setCategory] = useState("all");
  const [kind, setKind] = useState("all");
  const [niche, setNiche] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return shots.filter((shot) => {
      if (route !== "all" && shot.minRoute !== route) return false;
      if (category !== "all" && shot.category !== category) return false;
      if (kind !== "all" && shot.kind !== kind) return false;
      if (niche !== "all" && shot.niches?.length && !shot.niches.includes(niche)) {
        return false;
      }
      if (
        needle.length >= 2 &&
        !`${shot.title} ${shot.framing} ${shot.direction} ${shot.categoryLabel}`
          .toLowerCase()
          .includes(needle)
      ) {
        return false;
      }
      return true;
    });
  }, [shots, route, category, kind, niche, query]);

  const active =
    route !== "all" || category !== "all" || kind !== "all" || niche !== "all" || query;

  return (
    <div>
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search framings and directions"
            aria-label="Search the shot library"
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        <FacetRow
          label="Route"
          value={route}
          onChange={setRoute}
          options={routes}
          hint="What you must build before the frame is reproducible"
        />
        <FacetRow
          label="Group"
          value={category}
          onChange={setCategory}
          options={categories}
        />
        <FacetRow
          label="Kind"
          value={kind}
          onChange={setKind}
          options={[
            { id: "still", label: "Still" },
            { id: "video", label: "Video" },
          ]}
        />
        <FacetRow
          label="Niche"
          value={niche}
          onChange={setNiche}
          options={niches}
          hint="Keeps every universal shot and drops the ones bound elsewhere"
        />
      </div>

      <div className="mb-4 mt-6 flex items-center gap-3">
        <p className="text-sm text-muted-foreground">
          {filtered.length} of {shots.length} shots
        </p>
        {active ? (
          <button
            type="button"
            onClick={() => {
              setRoute("all");
              setCategory("all");
              setKind("all");
              setNiche("all");
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
          {filtered.map((shot) => (
            <ShotCard key={shot.slug} shot={shot} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nothing matches that combination. Motion and UGC frames only exist on
          the trained route, so pairing either with &ldquo;prompt only&rdquo;
          returns nothing by design rather than by accident.
        </p>
      )}
    </div>
  );
}

function FacetRow({ label, value, onChange, options, hint }) {
  return (
    <div className="flex flex-wrap items-start gap-2">
      <div className="w-16 shrink-0 pt-1.5">
        <span className="psn-stamp">{label}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap gap-1.5">
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
        {hint ? (
          <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
        ) : null}
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
