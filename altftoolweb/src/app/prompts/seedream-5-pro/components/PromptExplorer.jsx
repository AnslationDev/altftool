"use client";

import { useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { ToastProvider } from "./Toast";
import SortTabs from "./SortTabs";
import CategoryChips from "./CategoryChips";
import PromptCard from "./PromptCard";
import PromptModal from "./PromptModal";

const PAGE_SIZE = 12;

function matchesQuery(prompt, q) {
  if (!q) return true;
  const haystack = [
    prompt.title,
    prompt.description,
    prompt.prompt,
    prompt.category,
    prompt.author?.name,
    ...(prompt.tags || []),
    ...(prompt.chips || []),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export default function PromptExplorer({ prompts = [], categories = [] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("liked");
  const [activeCat, setActiveCat] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [openPrompt, setOpenPrompt] = useState(null);
  // The element that opened the modal, so focus returns to it on close
  // (mouse clicks don't focus buttons in Safari/Firefox).
  const triggerRef = useRef(null);

  const resetPaging = () => setVisible(PAGE_SIZE);

  const openModal = (prompt, el) => {
    triggerRef.current = el || null;
    setOpenPrompt(prompt);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = prompts.filter((p) => matchesQuery(p, q));
    if (activeCat !== "all") {
      list = list.filter((p) => (p.chipSlugs || []).includes(activeCat));
    }
    const sorted = [...list];
    if (sort === "liked") {
      sorted.sort((a, b) => b.likes - a.likes);
    } else {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return sorted;
  }, [prompts, query, activeCat, sort]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <ToastProvider>
      <h2 className="sr-only">Seedream 5 Pro prompt collection</h2>

      {/* Search */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="mx-auto flex max-w-2xl items-center gap-2 rounded-2xl border border-(--color-border) bg-(--color-card) p-2 pl-4 shadow-sm transition-colors focus-within:border-(--color-primary)"
      >
        <Search size={18} className="shrink-0 text-(--color-muted-foreground)" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            resetPaging();
          }}
          placeholder="Search prompts, styles, subjects…"
          aria-label="Search prompts"
          className="w-full bg-transparent text-sm text-(--color-foreground) outline-none placeholder:text-(--color-muted-foreground)"
        />
        <button
          type="submit"
          aria-label="Search"
          className="flex h-9 items-center gap-1.5 rounded-xl bg-(--color-primary) px-4 text-sm font-semibold text-(--color-primary-foreground) transition-colors hover:bg-(--color-primary-hover)"
        >
          <Search size={15} />
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>

      {/* Controls */}
      <div className="mt-8 flex justify-center">
        <SortTabs value={sort} onChange={(v) => { setSort(v); resetPaging(); }} />
      </div>

      <div className="mt-5">
        <CategoryChips
          categories={categories}
          active={activeCat}
          onChange={(slug) => {
            setActiveCat(slug);
            resetPaging();
          }}
        />
      </div>

      {/* Result meta */}
      <p
        role="status"
        aria-live="polite"
        className="mt-6 text-sm text-(--color-muted-foreground)"
      >
        {filtered.length} {filtered.length === 1 ? "prompt" : "prompts"}
        {activeCat !== "all"
          ? ` in ${categories.find((c) => c.slug === activeCat)?.name || ""}`
          : ""}
      </p>

      {/* Grid */}
      {shown.length === 0 ? (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-(--color-border) py-20 text-center"
        >
          <p className="text-base font-semibold text-(--color-foreground)">
            No prompts found
          </p>
          <p className="mt-1 text-sm text-(--color-muted-foreground)">
            Try a different search or category.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((prompt) => (
            <PromptCard key={prompt.slug} prompt={prompt} onOpen={openModal} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="rounded-full border border-(--color-border) bg-(--color-card) px-7 py-3 text-sm font-semibold text-(--color-foreground) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
          >
            Load more prompts
          </button>
        </div>
      ) : null}

      <PromptModal
        prompt={openPrompt}
        triggerRef={triggerRef}
        onClose={() => setOpenPrompt(null)}
      />
    </ToastProvider>
  );
}
