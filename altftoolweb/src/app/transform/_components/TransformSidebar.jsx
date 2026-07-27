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
    <aside className="flex h-full w-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90">
      {/* Search Header */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search converters..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-xs font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/25 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-200 dark:placeholder:text-slate-600 dark:focus:border-blue-500 dark:focus:bg-slate-950"
        />
      </div>

      {/* Categories & Links list */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[500px] lg:max-h-[650px] scrollbar-thin">
        {filteredCategories.length === 0 ? (
          <div className="py-8 text-center text-xs font-medium text-slate-400 dark:text-slate-600">
            No converters found
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <div key={cat.name} className="space-y-1">
              <h3 className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                            ? "bg-blue-50/70 text-blue-600 border-l-2 border-blue-600 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-400 font-semibold"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800/40 dark:hover:text-slate-100"
                        }`}
                      >
                        <span className="truncate">{getCompactLabel(tool)}</span>
                        {tool.engine === "server" && (
                          <span className="rounded bg-slate-100 px-1 text-[8px] font-bold text-slate-400 dark:bg-slate-800/60 dark:text-slate-600">
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
