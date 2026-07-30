"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import EmbedCodeCopy from "./EmbedCodeCopy";
import { EMBED_SNIPPET_VARIANTS } from "./embedSnippet";

/**
 * Interactive widget chooser for the /embed hub: search + category filter,
 * live iframe preview, and the copy-paste snippet in each of the formats a
 * publisher actually pastes into (raw HTML, a responsive wrapper, a WordPress
 * block, and the bare URL for editors that resolve oEmbed).
 */
export default function EmbedPicker({ tools = [], categories = [], baseUrl }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(tools[0]?.slug || "");
  const [variantId, setVariantId] = useState(EMBED_SNIPPET_VARIANTS[0].id);

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

  const variant =
    EMBED_SNIPPET_VARIANTS.find((item) => item.id === variantId) || EMBED_SNIPPET_VARIANTS[0];
  const snippet = active ? variant.build(baseUrl, active.slug, active.name) : "";

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
          {filtered.length === 0 ? (
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
            className="h-[420px] w-full rounded-[12px] border border-(--border) bg-(--surface)"
            loading="lazy"
          />
          <div>
            <h3 className="text-sm font-semibold text-(--foreground)">Embed code</h3>
            <div
              role="tablist"
              aria-label="Embed code format"
              className="mt-2 flex flex-wrap gap-1.5"
            >
              {EMBED_SNIPPET_VARIANTS.map((item) => {
                const isActive = item.id === variant.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    id={`embed-format-${item.id}`}
                    aria-selected={isActive}
                    aria-controls="embed-format-panel"
                    onClick={() => setVariantId(item.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--anslation-ds-primary-hover)]/35 motion-reduce:transition-none ${
                      isActive
                        ? "border-(--primary) bg-(--primary-soft) text-(--primary-text)"
                        : "border-(--border) bg-(--surface) text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            role="tabpanel"
            id="embed-format-panel"
            aria-labelledby={`embed-format-${variant.id}`}
            className="flex flex-col gap-2"
          >
            <p className="text-xs leading-5 text-(--muted-foreground)">{variant.help}</p>
            <EmbedCodeCopy
              snippet={snippet}
              label={`Copy ${variant.language.toLowerCase()}`}
            />
            <p className="text-xs leading-5 text-(--muted-foreground)">
              Keep the &ldquo;Widget by AltFTool&rdquo; credit link exactly as it comes — a plain,
              followable link. That credit is the price of the widget.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
