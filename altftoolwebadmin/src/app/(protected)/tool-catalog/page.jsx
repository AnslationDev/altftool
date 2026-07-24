"use client";

import { useDeferredValue, useMemo, useState } from "react";
import {
  ExternalLink,
  Layers,
  LayoutGrid,
  Search,
  Tags,
  Wrench,
  X,
} from "lucide-react";
import { TOOL_CATALOG } from "@/config/toolCatalog.generated";

const LIVE_SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.altftool.com";
const PAGE_SIZE = 60;

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--surface-soft)] text-[var(--primary)]">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
            {label}
          </p>
          <p className="text-xl font-black text-[var(--foreground)]">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function ToolCatalogPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const deferredQuery = useDeferredValue(query);

  const categories = useMemo(() => {
    const counts = new Map();
    for (const tool of TOOL_CATALOG) {
      for (const cat of tool.categories) {
        counts.set(cat, (counts.get(cat) || 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, []);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return TOOL_CATALOG.filter((tool) => {
      const matchesCategory =
        category === "all" || tool.categories.includes(category);
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        tool.slug.includes(q) ||
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.categories.some((cat) => cat.toLowerCase().includes(q))
      );
    });
  }, [deferredQuery, category]);

  const shown = filtered.slice(0, visible);

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 text-[var(--foreground)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="p-6">
            <p className="text-xs font-black uppercase tracking-widest text-[var(--primary)]">
              Super Admin Console
            </p>
            <h1 className="mt-2 text-2xl font-black">Tool Catalog</h1>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-[var(--muted)]">
              Live registry of every tool shipped on the public site — search,
              filter by canonical category, and jump straight to the production
              page. Regenerated automatically on every build.
            </p>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Tools" value={TOOL_CATALOG.length} icon={Wrench} />
          <Metric label="Categories" value={categories.length} icon={Layers} />
          <Metric label="Matching filter" value={filtered.length} icon={LayoutGrid} />
        </div>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative min-w-0 flex-1" htmlFor="tool-catalog-search">
              <span className="sr-only">Search tools</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input
                id="tool-catalog-search"
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setVisible(PAGE_SIZE);
                }}
                placeholder="Search 1,100+ tools by name, slug, category…"
                className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] pl-9 pr-9 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
              />
              {query ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            <button
              type="button"
              onClick={() => {
                setCategory("all");
                setVisible(PAGE_SIZE);
              }}
              aria-pressed={category === "all"}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                category === "all"
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
              }`}
            >
              All
              <span className="opacity-70">{TOOL_CATALOG.length}</span>
            </button>
            {categories.map(([cat, count]) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategory(cat === category ? "all" : cat);
                  setVisible(PAGE_SIZE);
                }}
                aria-pressed={category === cat}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                  category === cat
                    ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                    : "border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                }`}
              >
                {cat}
                <span className="opacity-70">{count}</span>
              </button>
            ))}
          </div>
        </section>

        {shown.length === 0 ? (
          <section className="grid min-h-[160px] place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <div>
              <Tags className="mx-auto h-8 w-8 text-[var(--muted)]" />
              <p className="mt-3 font-bold">No tools match this filter</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Try a different search term or clear the category filter.
              </p>
            </div>
          </section>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((tool) => (
              <li
                key={tool.slug}
                className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm transition hover:border-[var(--primary)]/50 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-black text-[var(--foreground)]">{tool.name}</p>
                  <a
                    href={`${LIVE_SITE}/tools/all/${tool.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${tool.name} on the live site`}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--primary)]"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                  {tool.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tool.categories.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-md bg-[var(--surface-soft)] px-1.5 py-0.5 text-[11px] font-bold text-[var(--muted)]"
                    >
                      {cat}
                    </span>
                  ))}
                  <span className="ml-auto font-mono text-[11px] text-[var(--muted)]/70">
                    /{tool.slug}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {visible < filtered.length ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setVisible((count) => count + PAGE_SIZE)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-bold text-[var(--foreground)] shadow-sm transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              Show more ({filtered.length - visible} remaining)
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
