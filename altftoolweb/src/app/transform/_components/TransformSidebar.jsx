"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronDown } from "lucide-react";
import { getToolsByCategory } from "../_lib/manifest";

export default function TransformSidebar({ activeSlug }) {
  const [search, setSearch] = useState("");
  const categories = getToolsByCategory();

  // Filter tools based on search query
  const filteredCategories = categories
    .map((cat) => {
      const filteredTools = cat.tools.filter(
        (tool) =>
          tool.title.toLowerCase().includes(search.toLowerCase()) ||
          tool.description.toLowerCase().includes(search.toLowerCase()) ||
          tool.slug.toLowerCase().includes(search.toLowerCase())
      );
      return { ...cat, tools: filteredTools };
    })
    .filter((cat) => cat.tools.length > 0);

  // Helper to make tool names compact, e.g. "SVG to JSX" -> "to JSX"
  function getCompactLabel(tool) {
    const prefix = tool.category.toLowerCase(); // e.g. "svg"
    const title = tool.title; // e.g. "SVG to JSX"
    // If the title starts with the category name followed by " to ", strip it
    const regex = new RegExp(`^${prefix}\\s+to\\s+`, "i");
    if (regex.test(title)) {
      return title.replace(regex, "to ");
    }
    return title;
  }

  return (
    <aside className="flex h-full w-full flex-col rounded-2xl border border-(--border) bg-(--card) p-4 shadow-sm">
      {/* Search Header */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search converters..."
          className="w-full rounded-xl border border-(--border) bg-(--background) py-2 pl-9 pr-4 text-xs font-semibold text-(--foreground) outline-none transition placeholder:text-(--muted-foreground) focus:border-(--primary) focus:bg-(--card) focus:ring-2 focus:ring-(--primary)/25"
        />
      </div>

      {/* Categories & Links list */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[500px] lg:max-h-[650px] scrollbar-thin">
        {filteredCategories.length === 0 ? (
          <div className="py-8 text-center text-xs font-medium text-(--muted-foreground)">
            No converters found
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div key={cat.name} className="space-y-1">
              <h3 className="px-2 text-[10px] font-bold uppercase tracking-wider text-(--muted-foreground)">
                {cat.name}
              </h3>
              <ul className="space-y-0.5">
                {cat.tools.map((tool) => {
                  const isActive = tool.slug === activeSlug;
                  return (
                    <li key={tool.slug}>
                      <Link
                        href={`/transform/${tool.slug}`}
                        className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                          isActive
                            ? "bg-(--primary-soft)/70 text-(--primary-text) border-l-2 border-(--primary) font-semibold"
                            : "text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
                        }`}
                      >
                        <span className="truncate">{getCompactLabel(tool)}</span>
                        {tool.engine === "server" && (
                          <span className="rounded bg-(--muted) px-1 text-[8px] font-bold text-(--muted-foreground)">
                            SRV
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
