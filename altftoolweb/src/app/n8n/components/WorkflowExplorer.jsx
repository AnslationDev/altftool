"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, ChevronRight, ChevronLeft, LoaderCircle, RefreshCcw } from "lucide-react";
import WorkflowCard from "./WorkflowCard";

const PAGE_SIZE = 12;
const CATALOG_ENDPOINT = "/api/n8n/workflows";

// Self-contained client-side filter over the workflows already passed as props.
function filterWorkflows(list, query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return list;
  return list.filter((w) =>
    [w.title, w.description, ...w.categories.map((c) => c.name), ...w.nodes.map((n) => n.name)]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}

export default function WorkflowExplorer({
  workflows: initialWorkflows = [],
  categories = [],
  totalWorkflows = initialWorkflows.length,
}) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [workflows, setWorkflows] = useState(initialWorkflows);
  const [catalogStatus, setCatalogStatus] = useState("idle");

  const scrollerRef = useRef(null);
  const catalogPromiseRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const catalogComplete = workflows.length >= totalWorkflows;

  const ensureCatalog = useCallback(async () => {
    if (catalogComplete) return workflows;
    if (catalogPromiseRef.current) return catalogPromiseRef.current;

    setCatalogStatus("loading");
    const request = fetch(CATALOG_ENDPOINT, {
      cache: "force-cache",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Catalog request failed with ${response.status}`);
        const payload = await response.json();
        if (!Array.isArray(payload?.workflows)) {
          throw new Error("Catalog response is invalid");
        }
        return payload.workflows;
      })
      .then((nextWorkflows) => {
        setWorkflows(nextWorkflows);
        setCatalogStatus("ready");
        return nextWorkflows;
      })
      .catch((error) => {
        setCatalogStatus("error");
        throw error;
      })
      .finally(() => {
        catalogPromiseRef.current = null;
      });

    catalogPromiseRef.current = request;
    return request;
  }, [catalogComplete, workflows]);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 4);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return undefined;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => updateArrows()) : null;
    ro?.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
      ro?.disconnect();
    };
  }, [updateArrows, categories.length]);

  useEffect(() => {
    if (catalogComplete || (!query.trim() && activeCat === "all")) return;
    ensureCatalog().catch(() => {});
  }, [activeCat, catalogComplete, ensureCatalog, query]);

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(220, el.clientWidth * 0.7), behavior: "smooth" });
  };

  const filtered = useMemo(() => {
    let list = workflows;
    if (activeCat !== "all") {
      list = list.filter((w) => w.categories.some((c) => c.slug === activeCat));
    }
    return filterWorkflows(list, query);
  }, [workflows, query, activeCat]);

  const shown = filtered.slice(0, visible);
  const resolvingMatches =
    !catalogComplete &&
    catalogStatus !== "error" &&
    (Boolean(query.trim()) || activeCat !== "all");
  const hasMore =
    visible < filtered.length ||
    (!catalogComplete && !query.trim() && activeCat === "all");

  const pick = (slug) => {
    setActiveCat(slug);
    setVisible(PAGE_SIZE);
    if (slug !== "all") ensureCatalog().catch(() => {});
  };

  const loadMore = async () => {
    if (!catalogComplete) {
      try {
        await ensureCatalog();
      } catch {
        return;
      }
    }
    setVisible((current) => current + PAGE_SIZE);
  };

  return (
    <div>
      {/* Big search bar */}
      <div className="mx-auto mb-12 flex max-w-3xl items-center gap-2 rounded-2xl border border-(--color-border) bg-(--color-card) p-2 pl-5 shadow-sm focus-within:border-(--color-primary)">
        <Search size={20} className="shrink-0 text-(--color-muted-foreground)" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(PAGE_SIZE);
          }}
          placeholder="Search workflows"
          className="w-full bg-transparent py-2 text-base text-(--color-foreground) outline-none placeholder:text-(--color-muted-foreground)"
        />
        <span className="hidden shrink-0 items-center justify-center rounded-xl bg-(--color-primary) px-5 py-2.5 text-sm font-semibold text-(--color-primary-foreground) sm:flex">
          <Search size={18} />
        </span>
      </div>

      {/* Trending heading with chevron */}
      <div className="mb-1 flex items-center gap-1">
        <h2 className="text-2xl font-extrabold text-(--color-foreground)">Trending n8n Workflows</h2>
        <ChevronRight size={22} className="text-(--color-foreground)" />
      </div>
      <p className="mb-6 text-sm text-(--color-muted-foreground)">
        Explore our collection of verified n8n templates. Download these workflows to jumpstart your
        automation strategy.
      </p>

      {/* Category filters — scrollable row with left/right arrows */}
      <div className="relative mb-8 flex items-center gap-2">
        <div
          ref={scrollerRef}
          className="n8n-no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto scroll-smooth py-1"
        >
          <style>{`.n8n-no-scrollbar::-webkit-scrollbar{display:none;}.n8n-no-scrollbar{-ms-overflow-style:none;scrollbar-width:none;}`}</style>
          <FilterChip label="All" active={activeCat === "all"} onClick={() => pick("all")} />
          {categories.map((c) => (
            <FilterChip
              key={c.slug}
              label={`${c.name} (${c.count})`}
              active={activeCat === c.slug}
              onClick={() => pick(c.slug)}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
          <ArrowBtn direction="left" disabled={!canLeft} onClick={() => scrollBy(-1)} />
          <ArrowBtn direction="right" disabled={!canRight} onClick={() => scrollBy(1)} />
        </div>
      </div>

      {catalogStatus === "error" ? (
        <div
          className="mb-6 flex flex-col gap-3 rounded-lg border border-(--color-border) bg-(--color-card) px-4 py-3 text-sm text-(--color-foreground) sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <span>The full workflow catalog could not be loaded.</span>
          <button
            type="button"
            onClick={() => ensureCatalog().catch(() => {})}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-(--color-border) bg-(--color-card) px-3 font-semibold transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
          >
            <RefreshCcw size={15} aria-hidden="true" />
            Retry
          </button>
        </div>
      ) : null}

      {/* Grid */}
      {shown.length === 0 && resolvingMatches ? (
        <div
          className="flex min-h-40 items-center justify-center gap-2 text-sm text-(--color-muted-foreground)"
          role="status"
        >
          <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
          Loading matching workflows
        </div>
      ) : shown.length === 0 ? (
        <p className="py-16 text-center text-(--color-muted-foreground)">
          No workflows match your search.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((w) => (
            <WorkflowCard key={w.slug} workflow={w} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={catalogStatus === "loading"}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-(--color-border) bg-(--color-card) px-6 py-2.5 text-sm font-semibold text-(--color-foreground) transition-colors hover:border-(--color-primary) hover:text-(--color-primary) disabled:cursor-wait disabled:opacity-70"
          >
            {catalogStatus === "loading" ? (
              <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
            ) : null}
            {catalogStatus === "loading" ? "Loading workflows" : "Load more workflows"}
          </button>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
        active
          ? "border-(--color-primary) bg-(--color-primary) text-(--color-primary-foreground)"
          : "border-(--color-border) bg-(--color-card) text-(--color-foreground) hover:border-(--color-primary) hover:text-(--color-primary)"
      }`}
    >
      {label}
    </button>
  );
}

function ArrowBtn({ direction, disabled, onClick }) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "left" ? "Scroll categories left" : "Scroll categories right"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-(--color-border) bg-(--color-card) text-(--color-foreground) transition-all hover:border-(--color-primary) hover:text-(--color-primary) disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-(--color-border) disabled:hover:text-(--color-foreground)"
    >
      <Icon size={16} />
    </button>
  );
}
