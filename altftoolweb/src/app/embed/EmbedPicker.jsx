"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import EmbedCodeCopy from "./EmbedCodeCopy";
import {
  EMBED_SNIPPET_VARIANTS,
  embedNaturalSize,
} from "./embedSnippet";

/**
 * Interactive widget chooser for the /embed hub: search + category filter,
 * live iframe preview, and the copy-paste snippet in each of the formats a
 * publisher actually pastes into (raw HTML, a responsive wrapper, a WordPress
 * block, and the bare URL for editors that resolve oEmbed).
 *
 * Every entry is identified by its widget id — a bare tool slug, or
 * `<source>/<slug>` for a namespaced family — which is also its path under
 * /embed/widget/ and the argument the snippet builders take.
 */
export default function EmbedPicker({
  seedTools = [],
  totalCount = 0,
  indexUrl,
  categories = [],
  baseUrl,
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(seedTools[0]?.id || "");
  const [variantId, setVariantId] = useState(EMBED_SNIPPET_VARIANTS[0].id);
  // Null until the full index arrives; the seed carries the page until then.
  const [allTools, setAllTools] = useState(null);
  const [loadState, setLoadState] = useState("idle");
  const requested = useRef(false);

  const tools = allTools || seedTools;
  const hasEverything = Boolean(allTools) || totalCount <= seedTools.length;

  /**
   * Fetch the rest of the index, once, the first time someone searches or
   * filters. Shipping all of it as props cost ~160 KiB in the initial payload
   * of the page we most want people to land on; almost nobody scrolls past the
   * seed, and anyone who searches gets the full set on their first keystroke.
   */
  const ensureFullIndex = useCallback(() => {
    if (requested.current || !indexUrl || hasEverything) return;
    requested.current = true;
    setLoadState("loading");
    fetch(indexUrl)
      .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
      .then((data) => {
        setAllTools(Array.isArray(data?.widgets) ? data.widgets : []);
        setLoadState("idle");
      })
      .catch(() => {
        // The seed stays usable, so this degrades rather than breaks. Allow a
        // retry on the next keystroke instead of failing for the whole session.
        requested.current = false;
        setLoadState("error");
      });
  }, [indexUrl, hasEverything]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter(
      (tool) =>
        (category === "All" || tool.category === category) &&
        (!q || tool.name.toLowerCase().includes(q) || tool.id.includes(q)),
    );
  }, [tools, query, category]);

  // Derive from the FILTERED list so the preview/snippet always matches a
  // visible row; when the selection is filtered out, advance to the first
  // visible tool instead of showing a stale preview.
  const active = filtered.find((tool) => tool.id === selected) || filtered[0];

  const variant =
    EMBED_SNIPPET_VARIANTS.find((item) => item.id === variantId) || EMBED_SNIPPET_VARIANTS[0];
  const snippet = active ? variant.build(baseUrl, active.id, active.name) : "";
  const activeSize = active ? embedNaturalSize(active.id) : null;

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
              onChange={(event) => {
                ensureFullIndex();
                setQuery(event.target.value);
              }}
              onFocus={ensureFullIndex}
              placeholder={`Search ${totalCount} widgets…`}
              className="h-10 w-full rounded-[8px] border border-(--border) bg-(--surface) pl-9 pr-3 text-sm text-(--foreground) placeholder:text-(--muted-foreground) focus-visible:border-(--primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--anslation-ds-primary-hover)]/35"
            />
          </label>
          <label>
            <span className="sr-only">Filter by category</span>
            <select
              value={category}
              onChange={(event) => {
                ensureFullIndex();
                setCategory(event.target.value);
              }}
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
            <li className="p-4 text-sm text-(--muted-foreground)" aria-live="polite">
              {loadState === "loading"
                ? `Searching all ${totalCount} widgets…`
                : loadState === "error"
                  ? "The full widget list could not be loaded. Type again to retry."
                  : "No widgets match that search."}
            </li>
          ) : (
            filtered.map((tool) => (
              <li key={tool.id} className="border-b border-(--border) last:border-b-0">
                <button
                  type="button"
                  onClick={() => setSelected(tool.id)}
                  aria-pressed={tool.id === active?.id}
                  className={`block w-full px-4 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--anslation-ds-primary-hover)]/35 ${
                    tool.id === active?.id
                      ? "border-l-2 border-(--primary) bg-(--primary-soft) text-(--primary-text)"
                      : "hover:bg-(--muted)"
                  }`}
                >
                  <span className="block text-sm font-semibold">{tool.name}</span>
                  <span
                    className={`block text-xs ${
                      tool.id === active?.id ? "text-(--primary-text)" : "text-(--muted-foreground)"
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
            src={`/embed/widget/${active.id}`}
            title={`${active.name} widget preview`}
            className="h-[var(--embed-narrow-height)] w-full rounded-[12px] border border-(--border) bg-(--surface) sm:h-[var(--embed-height)]"
            loading="lazy"
            scrolling="yes"
            style={{
              "--embed-height": `${activeSize.height}px`,
              "--embed-narrow-height": `${activeSize.narrowHeight}px`,
            }}
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
              Keep the &ldquo;Widget by AltFTool&rdquo; credit visible so visitors
              can identify the widget&rsquo;s source.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
