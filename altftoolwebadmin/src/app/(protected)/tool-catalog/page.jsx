"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { ExternalLink, Layers, LayoutGrid, Tags, Wrench } from "lucide-react";
import {
  DataState,
  EmptyState,
  FilterBar,
  PageHeader,
  SectionCard,
  StatGrid,
} from "@/ansets";
import { TOOL_CATALOG } from "@/config/toolCatalog.generated";

const LIVE_SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.altftool.com";
const PAGE_SIZE = 60;

export default function ToolCatalogPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);
  // The catalog is ~1,100 static entries: deferring keeps the search box
  // responsive while the card grid re-renders behind it.
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

  const categoryOptions = useMemo(
    () => [
      { value: "all", label: `All categories · ${TOOL_CATALOG.length}` },
      ...categories.map(([cat, count]) => ({
        value: cat,
        label: `${cat} · ${count}`,
      })),
    ],
    [categories],
  );

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
      <div className="mx-auto max-w-7xl">
        <PageHeader
          eyebrow="Super Admin Console"
          icon={Wrench}
          title="Tool Catalog"
          description="Live registry of every tool shipped on the public site — search, filter by canonical category, and jump straight to the production page. Regenerated automatically on every build."
        />

        <div className="flex flex-col gap-5">
          <StatGrid
            columns={3}
            items={[
              { label: "Tools", value: TOOL_CATALOG.length, icon: Wrench },
              { label: "Categories", value: categories.length, icon: Layers },
              {
                label: "Matching filter",
                value: filtered.length,
                icon: LayoutGrid,
                tone: "primary",
              },
            ]}
          />

          <FilterBar
            search={query}
            onSearchChange={(value) => {
              setQuery(value);
              setVisible(PAGE_SIZE);
            }}
            searchPlaceholder="Search tools by name, slug, or category…"
            filters={[
              {
                key: "category",
                label: "Filter by category",
                value: category,
                onChange: (value) => {
                  setCategory(value);
                  setVisible(PAGE_SIZE);
                },
                options: categoryOptions,
              },
            ]}
            count={`${filtered.length} of ${TOOL_CATALOG.length} tools`}
          />

          <DataState
            isEmpty={!shown.length}
            empty={
              <SectionCard>
                <EmptyState
                  icon={Tags}
                  title="No tools match this filter"
                  description="Try a different search term or clear the category filter."
                />
              </SectionCard>
            }
          >
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((tool) => (
                <li key={tool.slug}>
                  <SectionCard
                    flush
                    className="h-full transition hover:border-[var(--primary)]/50 hover:shadow-md"
                    bodyClassName="flex h-full flex-col p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-[var(--foreground)]">
                        {tool.name}
                      </p>
                      <a
                        href={`${LIVE_SITE}/tools/all/${tool.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${tool.name} on the live site`}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--primary)]"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                      {tool.description}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {tool.categories.map((cat) => (
                        <span
                          key={cat}
                          className="rounded-md bg-[var(--surface-soft)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--muted)]"
                        >
                          {cat}
                        </span>
                      ))}
                      <span className="ml-auto font-mono text-[11px] text-[var(--muted)]">
                        /{tool.slug}
                      </span>
                    </div>
                  </SectionCard>
                </li>
              ))}
            </ul>
          </DataState>

          {visible < filtered.length ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setVisible((count) => count + PAGE_SIZE)}
                className="inline-flex min-h-11 items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                Show more ({filtered.length - visible} remaining)
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
