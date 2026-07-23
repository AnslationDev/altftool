"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Home,
  Layers,
  Landmark,
  Plane,
  Search,
  SearchX,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { STATUS_META } from "../businessOps";

// Registry `icon` keys -> lucide components. Add new keys here alongside a new
// entry in businessOps.js.
const ICONS = {
  plane: Plane,
  home: Home,
  landmark: Landmark,
  shield: ShieldCheck,
  wrench: Wrench,
  layers: Layers,
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "planned", label: "In development" },
];

function ProductCard({ product }) {
  const Icon = ICONS[product.icon] ?? Layers;
  const status = STATUS_META[product.status] ?? STATUS_META.planned;
  const isOpenable = Boolean(product.href);
  const sectionCount = product.sections?.length ?? 0;

  const body = (
    <>
      <div className="bizops-card-top">
        <span className="bizops-card-icon" data-accent={product.accent} aria-hidden="true">
          <Icon size={22} strokeWidth={2} />
        </span>

        <span className="bizops-card-heading">
          <span className="bizops-card-title">{product.name}</span>
          <span className="bizops-card-tagline">{product.tagline}</span>
        </span>

        <span className="bizops-badge" data-tone={status.tone}>
          <span className="bizops-badge-dot" aria-hidden="true" />
          {status.label}
        </span>
      </div>

      <p className="bizops-card-desc">{product.description}</p>

      {product.tags?.length > 0 && (
        <div className="bizops-tags">
          {product.tags.map((tag) => (
            <span key={tag} className="bizops-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="bizops-card-foot">
        <span className="bizops-card-meta">
          {sectionCount > 0
            ? `${sectionCount} ${sectionCount === 1 ? "section" : "sections"}`
            : "No sections yet"}
        </span>

        {isOpenable ? (
          <span className="bizops-card-cta">
            Open
            <ArrowRight className="bizops-card-arrow" size={15} strokeWidth={2.2} />
          </span>
        ) : (
          <span className="bizops-card-cta bizops-card-cta--muted">
            Not built yet
          </span>
        )}
      </div>
    </>
  );

  if (!isOpenable) {
    return (
      <div className="bizops-card bizops-card--planned" aria-disabled="true">
        {body}
      </div>
    );
  }

  // Without this the accessible name is the card's entire text content.
  return (
    <Link
      href={product.href}
      className="bizops-card"
      aria-label={`${product.name} — ${product.tagline}`}
    >
      {body}
    </Link>
  );
}

export default function BusinessOpsCatalog({ products }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(
    () => ({
      all: products.length,
      live: products.filter((p) => p.status === "live").length,
      planned: products.filter((p) => p.status !== "live").length,
    }),
    [products],
  );

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "live" && product.status === "live") ||
        (filter === "planned" && product.status !== "live");

      if (!matchesFilter) return false;
      if (!term) return true;

      const haystack = [
        product.name,
        product.tagline,
        product.description,
        ...(product.tags ?? []),
        ...(product.sections ?? []),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [products, filter, query]);

  // A search box over two cards is noise; it earns its place as the catalog grows.
  const showSearch = products.length > 3;

  return (
    <>
      <div className="bizops-toolbar">
        <div className="bizops-filters" role="group" aria-label="Filter products">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              className="bizops-filter"
              aria-pressed={filter === option.value}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
              <span className="bizops-filter-count">{counts[option.value]}</span>
            </button>
          ))}
        </div>

        {showSearch && (
          <div className="bizops-search">
            <Search className="bizops-search-icon" size={15} strokeWidth={2.2} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products..."
              aria-label="Search business products"
            />
          </div>
        )}
      </div>

      <div className="bizops-grid">
        {visible.length > 0 ? (
          visible.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))
        ) : (
          <div className="bizops-empty">
            <span className="bizops-empty-icon" aria-hidden="true">
              <SearchX size={22} strokeWidth={2} />
            </span>
            <p className="bizops-empty-title">No products match</p>
            <p className="bizops-empty-text">
              Try a different filter or search term.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
