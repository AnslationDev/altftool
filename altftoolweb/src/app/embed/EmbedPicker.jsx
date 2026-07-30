"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import EmbedCodeCopy from "./EmbedCodeCopy";
import { buildSnippet, EMBED_IFRAME_HEIGHT } from "./embedSnippet";

/**
 * Interactive widget chooser for the /embed hub: search + category filter,
 * live iframe preview, and the copy-paste snippet.
 */
export default function EmbedPicker({ tools = [], categories = [], baseUrl }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(tools[0]?.slug || "");
  // The catalog has grown past 1,300 embeddable tools — server-rendering
  // every row blows the prerendered HTML past the size budget (enforced by
  // scripts/check-prerender-size.mjs). The list is unusable without JS
  // anyway (search/select are handlers), so hydrate it client-side instead
  // of paying for it in the static HTML.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter(
      (tool) =>
        (category === "All" || tool.category === category) &&
        (!q || tool.name.toLowerCase().includes(q) || tool.slug.includes(q)),
    );
  }, [tools, query, category]);

  // Derive from the FILTERED list so the preview/snippet always matches a
  // visible row; when the selection is filtered out, advance to the first
  // visible tool instead of showing a stale preview.
  const active = filtered.find((tool) => tool.slug === selected) || filtered[0];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search widgets</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${tools.length} widgets…`}
              className="h-10 w-full rounded-[8px] border border-(--border) bg-(--surface) pl-9 pr-3 text-sm text-(--foreground) placeholder:text-(--muted-foreground) focus-visible:border-(--primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--anslation-ds-primary-hover)]/35"
            />
          </label>
          <label>
            <span className="sr-only">Filter by category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-10 rounded-[8px] border border-(--border) bg-(--surface) px-3 text-sm text-(--foreground) focus-visible:border-(--primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--anslation-ds-primary-hover)]/35"
            >
              <option>All</option>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <ul
          className="max-h-[420px] overflow-auto rounded-[12px] border border-(--border) bg-(--surface)"
          aria-label="Embeddable widgets"
        >
          {!mounted ? (
            <li className="p-4 text-sm text-(--muted-foreground)">
              Loading {tools.length} widgets…
            </li>
          ) : filtered.length === 0 ? (
            <li className="p-4 text-sm text-(--muted-foreground)">No widgets match that search.</li>
          ) : (
            filtered.map((tool) => (
              <li key={tool.slug} className="border-b border-(--border) last:border-b-0">
                <button
                  type="button"
                  onClick={() => setSelected(tool.slug)}
                  aria-pressed={tool.slug === active?.slug}
                  className={`block w-full px-4 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--anslation-ds-primary-hover)]/35 ${
                    tool.slug === active?.slug
                      ? "border-l-2 border-(--primary) bg-(--primary-soft) text-(--primary-text)"
                      : "hover:bg-(--muted)"
                  }`}
                >
                  <span className="block text-sm font-semibold">{tool.name}</span>
                  <span
                    className={`block text-xs ${
                      tool.slug === active?.slug
                        ? "text-(--primary-text)"
                        : "text-(--muted-foreground)"
                    }`}
                  >
                    {tool.category}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      {active ? (
        <div className="flex min-w-0 flex-col gap-3">
          <h3 className="text-sm font-semibold text-(--foreground)">
            Preview: {active.name}
          </h3>
          <iframe
            src={`/embed/widget/${active.slug}`}
            title={`${active.name} widget preview`}
            className="w-full rounded-[12px] border border-(--border) bg-(--surface)"
            style={{ height: EMBED_IFRAME_HEIGHT }}
            loading="lazy"
          />
          <h3 className="text-sm font-semibold text-(--foreground)">Embed code</h3>
          <EmbedCodeCopy snippet={buildSnippet(baseUrl, active.slug, active.name)} />
        </div>
      ) : null}
    </div>
  );
}
