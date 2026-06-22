"use client";

import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Search,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { tfbPath } from "@/app/tripfindbox/lib/tfbLink";

function BlogCard({ post, featured = false }) {
  return (
    <article className={featured ? "blog-card blog-card-featured" : "blog-card"}>
      <Link href={tfbPath(`/blogs/${post.slug}`)} className="blog-card-image" aria-label={post.title}>
        <img src={post.image} alt="" loading="lazy" />
        <span>{post.category}</span>
      </Link>
      <div className="blog-card-body">
        <div className="blog-meta-row">
          <span>
            <CalendarDays size={15} />
            {post.date}
          </span>
          <span>
            <Clock3 size={15} />
            {post.readingTime}
          </span>
        </div>
        <h3>
          <Link href={tfbPath(`/blogs/${post.slug}`)}>{post.title}</Link>
        </h3>
        <p>{post.description}</p>
        <Link href={tfbPath(`/blogs/${post.slug}`)} className="blog-read-more">
          Read More
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}

function CompactPost({ post }) {
  return (
    <Link href={tfbPath(`/blogs/${post.slug}`)} className="blog-compact-post">
      <img src={post.image} alt="" loading="lazy" />
      <span>
        <small>{post.category}</small>
        <strong>{post.title}</strong>
      </span>
    </Link>
  );
}

export default function BlogExplorer({ posts, categories }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesCategory = activeCategory === "All" || post.category === activeCategory;
      const matchesSearch =
        !normalizedQuery ||
        post.title.toLowerCase().includes(normalizedQuery) ||
        post.category.toLowerCase().includes(normalizedQuery) ||
        post.description.toLowerCase().includes(normalizedQuery) ||
        post.tags.join(" ").toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [posts, query, activeCategory]);

  const featuredPosts = filteredPosts.filter((post) => post.featured);
  const visibleFeatured = featuredPosts.length ? featuredPosts : filteredPosts.slice(0, 4);
  const popularPosts = filteredPosts.filter((post) => post.popular).slice(0, 4);
  const visiblePopular = popularPosts.length ? popularPosts : filteredPosts.slice(0, 4);
  const recentPosts = filteredPosts.filter((post) => post.recent).slice(0, 5);
  const visibleRecent = recentPosts.length ? recentPosts : filteredPosts.slice(0, 5);
  const hasArticleSelection = activeCategory !== "All" || query.trim().length > 0;
  const categoryCounts = categories.map((category) => ({
    category,
    count: posts.filter((post) => post.category === category).length,
  }));

  const hasNoResults = filteredPosts.length === 0;

  return (
    <>
      <section className="blog-hero">
        <div className="blog-hero-card">
          <span className="blog-eyebrow">
            <Sparkles size={18} />
            Blog
          </span>
          <h1>Discover smarter travel stories</h1>
          <p>
            Search live travel updates, destination guides, airline notes, booking tips, and flight deal
            ideas from trusted public travel sources.
          </p>
          <form className="blog-search-box" onSubmit={(event) => event.preventDefault()}>
            <Search size={20} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search blogs, destinations, airlines, or travel tips"
              aria-label="Search blogs"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear blog search">
                <X size={18} />
              </button>
            ) : null}
            <button type="submit" className="blog-search-submit">
              Find Now
            </button>
          </form>
        </div>
        <div className="blog-hero-panel" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=75"
            alt=""
          />
          <div>
            <strong>16</strong>
            <span>Travel categories</span>
          </div>
        </div>
      </section>

      <section className="blog-category-section" aria-label="Blog categories">
        <div className="blog-category-strip">
          {["All", ...categories].map((category) => (
            <button
              key={category}
              type="button"
              className={activeCategory === category ? "active" : ""}
              onClick={() => setActiveCategory(category)}
            >
              <Tag size={15} />
              {category}
            </button>
          ))}
        </div>
      </section>

      {hasNoResults ? (
        <section className="blog-empty-state" aria-live="polite">
          <div>
            <Search size={34} />
            <h2>No blog posts found</h2>
            <p>
              Try another destination, airline, travel topic, or clear the category filter. Live feed
              availability can change by publisher.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveCategory("All");
              }}
            >
              Reset Search
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className="blog-section">
            <div className="blog-section-heading">
              <span>Featured Reads</span>
              <h2>Travel updates worth opening first</h2>
              <p>Fresh flight planning ideas, destination notes, and practical guides from live feeds.</p>
            </div>
            <div className="blog-featured-grid">
              {visibleFeatured.slice(0, 4).map((post) => (
                <BlogCard key={post.slug} post={post} featured />
              ))}
            </div>
          </section>

          <section className="blog-section blog-main-layout">
            <div>
              <div className="blog-section-heading compact">
                <span>{posts.length} Live Travel Articles</span>
                <h2>
                  {hasArticleSelection
                    ? `${filteredPosts.length} ${activeCategory === "All" ? "matching" : activeCategory} stories`
                    : "Choose a category to explore"}
                </h2>
              </div>
              {hasArticleSelection ? (
                <button
                  type="button"
                  className="blog-category-reset"
                  onClick={() => {
                    setQuery("");
                    setActiveCategory("All");
                  }}
                >
                  Browse all categories
                </button>
              ) : null}
              {hasArticleSelection ? (
                <div className="blog-latest-grid">
                  {filteredPosts.map((post) => (
                    <BlogCard key={post.slug} post={post} />
                  ))}
                </div>
              ) : (
                <div className="blog-category-directory" aria-label="Choose a blog category">
                  {categoryCounts.map(({ category, count }) => (
                    <button key={category} type="button" onClick={() => setActiveCategory(category)}>
                      <span>
                        <Tag size={15} />
                        {category}
                      </span>
                      <strong>{count || "New"}</strong>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <aside className="blog-side-panel" aria-label="Popular and recent posts">
              <div>
                <h2>Popular Posts</h2>
                {visiblePopular.map((post) => (
                  <CompactPost key={post.slug} post={post} />
                ))}
              </div>
              <div>
                <h2>Recent Posts</h2>
                {visibleRecent.map((post) => (
                  <CompactPost key={post.slug} post={post} />
                ))}
              </div>
            </aside>
          </section>
        </>
      )}

      <section className="blog-newsletter">
        <div>
          <span>TripFindBox Updates</span>
          <h2>Get travel ideas before your next search.</h2>
          <p>Receive route inspiration, flight planning notes, and destination ideas from TripFindBox.</p>
        </div>
        <form onSubmit={(event) => event.preventDefault()}>
          <label>
            <span className="sr-only">Email address</span>
            <input type="email" placeholder="Enter your email address" />
          </label>
          <button type="submit">Subscribe</button>
        </form>
      </section>
    </>
  );
}
