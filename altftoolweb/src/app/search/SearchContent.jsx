"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { useFirebaseExtensions } from "@/app/extensions/hooks/useFirebaseExtensions";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Braces,
  Calculator,
  FileArchive,
  FileCode2,
  FileJson,
  FileText,
  Gamepad2,
  GraduationCap,
  Image as ImageIcon,
  Link2,
  Newspaper,
  Puzzle,
  QrCode,
  Scissors,
  Search,
  ShoppingBag,
  Sparkles,
  Type,
  Wrench,
} from "lucide-react";
import { AltftoolLoader } from "@/components/ui/route-loading";

const POPULAR_SEARCHES = ["json", "pdf", "image", "base64", "regex", "coupon", "news", "academy"];

function getSearchResultIcon(item, sectionTitle) {
  const category = Array.isArray(item.category) ? item.category.join(" ") : item.category || "";
  const searchable = `${item.slug || ""} ${item.name || ""} ${item.description || ""} ${category}`.toLowerCase();

  if (searchable.includes("base64") || searchable.includes("encode") || searchable.includes("decode")) return Braces;
  if (searchable.includes("qr")) return QrCode;
  if (searchable.includes("json")) return FileJson;
  if (searchable.includes("regex")) return FileCode2;
  if (searchable.includes("image") || searchable.includes("photo") || searchable.includes("background")) return ImageIcon;
  if (searchable.includes("word") || searchable.includes("text") || searchable.includes("case") || searchable.includes("docx")) return Type;
  if (searchable.includes("merge") || searchable.includes("compress") || searchable.includes("zip")) return FileArchive;
  if (searchable.includes("split") || searchable.includes("remove") || searchable.includes("crop") || searchable.includes("trim")) return Scissors;
  if (searchable.includes("annotation") || searchable.includes("watermark") || searchable.includes("purifier") || searchable.includes("clean")) return BadgeCheck;
  if (searchable.includes("pdf")) return FileText;
  if (searchable.includes("calculator") || searchable.includes("convert") || searchable.includes("currency")) return Calculator;
  if (searchable.includes("coupon") || searchable.includes("deal") || searchable.includes("shop")) return ShoppingBag;
  if (searchable.includes("news")) return Newspaper;
  if (searchable.includes("academy") || searchable.includes("learn")) return GraduationCap;
  if (searchable.includes("game")) return Gamepad2;
  if (searchable.includes("link") || searchable.includes("url")) return Link2;
  if (sectionTitle === "Extensions") return Puzzle;
  return Wrench;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const { extensions: dynamicExtensions, loading } = useFirebaseExtensions();

  const trimmedQuery = query.trim().toLowerCase();
  const isValid = trimmedQuery.length >= 2;

  // Blog posts were entirely absent from site-wide search. Reuse the existing
  // ISR-cached /api/blogs route (live Firestore posts) — fetched lazily, once,
  // and only when there is a valid query.
  const [blogIndex, setBlogIndex] = useState([]);
  useEffect(() => {
    if (!isValid || blogIndex.length) return undefined;

    const controller = new AbortController();
    fetch("/api/blogs?limit=72", {
      headers: { accept: "application/json" },
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        const posts = Array.isArray(payload?.posts) ? payload.posts : [];
        if (!posts.length) return;
        setBlogIndex(
          posts.map((post) => ({
            slug: post.slug,
            name: post.heading || post.title,
            description: post.excerpt || post.seoDescription || "",
            category: post.category,
            searchable: [
              post.heading,
              String(post.slug || "").replace(/-/g, " "),
              post.category,
              post.excerpt,
              ...(Array.isArray(post.tags) ? post.tags : []),
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase(),
          })),
        );
      })
      .catch(() => {
        /* search still works for tools/extensions */
      });

    return () => controller.abort();
  }, [isValid, blogIndex.length]);

  const tools = useMemo(
    () =>
      Object.entries(toolMetaMap).map(([slug, data]) => ({
        slug,
        ...data,
      })),
    [],
  );

  const results = useMemo(() => {
    if (!isValid) return null;
    const matchItem = (item) => {
      const category = Array.isArray(item.category) ? item.category.join(" ") : item.category || "";
      const text = `${item.slug || ""} ${item.name} ${item.description || ""} ${category}`.toLowerCase();
      return text.includes(trimmedQuery);
    };
    const rankItem = (item) => {
      const name = String(item.name || "").toLowerCase();
      const slug = String(item.slug || "").replace(/-/g, " ");
      if (name === trimmedQuery || slug === trimmedQuery) return 0;
      if (name.startsWith(trimmedQuery) || slug.startsWith(trimmedQuery)) return 1;
      return 2;
    };

    return {
      tools: tools.filter(matchItem).sort((a, b) => rankItem(a) - rankItem(b) || a.name.localeCompare(b.name)),
      extensions: dynamicExtensions.filter(matchItem).sort((a, b) => rankItem(a) - rankItem(b) || a.name.localeCompare(b.name)),
      blogs: blogIndex
        .filter((item) => item.searchable.includes(trimmedQuery))
        .sort((a, b) => rankItem(a) - rankItem(b) || a.name.localeCompare(b.name)),
    };
  }, [blogIndex, dynamicExtensions, isValid, tools, trimmedQuery]);

  if (!isValid) {
    return (
      <main className="altf-search-page">
        <section className="altf-search-shell altf-search-empty-shell">
          <div className="altf-search-orb altf-search-orb-left" aria-hidden="true" />
          <div className="altf-search-orb altf-search-orb-right" aria-hidden="true" />
          <div className="mx-auto max-w-3xl text-center">
            <div className="altf-search-icon-badge mx-auto">
              <Search className="h-5 w-5" />
            </div>
            <p className="altf-search-kicker mt-5">AltFTool Search</p>
            <h1 className="altf-search-title mt-3">Search your productivity workspace</h1>
            <p className="altf-search-description mx-auto mt-4">
              Type at least 2 characters to find tools, extensions, guides, and feature routes.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-2.5">
              {POPULAR_SEARCHES.map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="altf-search-pill"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  const hasResults =
    results.tools.length ||
    results.extensions.length ||
    results.blogs.length;
  const totalResults = results.tools.length + results.extensions.length + results.blogs.length;

  return (
    <main className="altf-search-page">
      <section className="altf-search-shell">
        <div className="altf-search-orb altf-search-orb-left" aria-hidden="true" />
        <div className="altf-search-orb altf-search-orb-right" aria-hidden="true" />

        <div className="altf-search-hero-grid">
          <div>
            <div className="altf-search-badge">
              <Sparkles className="h-4 w-4" />
              Smart search results
            </div>
            <h1 className="altf-search-title mt-5">
              Results for <span>&quot;{query}&quot;</span>
            </h1>
            <p className="altf-search-description mt-4">
              Jump into matching tools and extensions from the same workspace experience as the homepage.
            </p>
          </div>
        </div>

        {loading ? (
          <AltftoolLoader
            label="Refreshing extension results"
            detail="Tools are ready while live extensions finish loading"
            compact
            className="mx-auto mt-5 max-w-xl"
          />
        ) : null}
        <div className="altf-search-actions">
          <Link
            href={`/tools/all?search=${encodeURIComponent(query.trim())}`}
            className="altf-search-primary-action"
          >
            <Wrench className="h-3.5 w-3.5" />
            Search tools directory
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/extensions"
            className="altf-search-secondary-action"
          >
            <Puzzle className="h-3.5 w-3.5" />
            Browse extensions
          </Link>
        </div>
      </section>

      <div className="altf-search-inline-summary" aria-label="Search result summary">
        <span><strong>{totalResults}</strong> total matches</span>
        <span><strong>{results.tools.length}</strong> tools</span>
        <span><strong>{results.extensions.length}</strong> extensions</span>
        <span><strong>{results.blogs.length}</strong> guides</span>
      </div>

      {!hasResults && (
        <section className="altf-search-empty-state">
          <div className="altf-search-icon-badge mx-auto">
            <Search className="h-5 w-5" />
          </div>
          <h2 className="mt-5 text-2xl font-black text-[var(--foreground)]">No results found</h2>
          <p className="altf-search-description mx-auto mt-3">
            Try a shorter keyword or open the tools directory search.
          </p>
        </section>
      )}

      <div className="altf-search-results-wrap">
        <ResultSection
          title="Tools"
          items={results.tools}
          base="/tools/all"
          accent="primary"
        />
        <ResultSection
          title="Extensions"
          items={results.extensions}
          base="/extensions"
          accent="cyan"
        />
        <ResultSection
          title="Guides & Blogs"
          items={results.blogs}
          base="/blogs"
          accent="primary"
        />
      </div>
    </main>
  );
}

function ResultSection({ title, items, base, accent }) {
  if (!items.length) return null;

  return (
    <section className="altf-search-result-section">
      <div className="altf-search-section-heading">
        <div>
          <p className="altf-search-kicker">Matched {title}</p>
          <h2>{title}</h2>
        </div>
        <span>{items.length} result{items.length === 1 ? "" : "s"}</span>
      </div>

      <div className="altf-search-result-grid">
        {items.map((item) => {
          const ResultIcon = getSearchResultIcon(item, title);

          return (
            <Link
              key={item.slug}
              href={`${base}/${item.slug}`}
              className={`altf-search-result-card group altf-search-result-card-${accent}`}
            >
              <div className="altf-search-result-card-top">
                <span className="altf-search-result-icon">
                  <ResultIcon className="h-5 w-5" />
                </span>
                <span className="altf-search-result-status">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Match
                </span>
              </div>

              <h3>{item.name}</h3>

              <p className="line-clamp-2">
                {item.description}
              </p>
              {item.category ? (
                <div className="altf-search-category-row">
                  {(Array.isArray(item.category) ? item.category : [item.category]).slice(0, 3).map((category) => (
                    <span
                      key={category}
                    >
                      {category}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="altf-search-card-arrow">
                <ArrowUpRight
                  className="h-4 w-4"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
