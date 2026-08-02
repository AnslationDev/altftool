"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import Header from "./components/Header";
import TrendingTicker from "./components/TrendingTicker";
import HeroSection from "./components/HeroSection";
import ArticleCard from "./components/ArticleCard";
import QuizCard from "./components/QuizCard";
import QuizRunner from "./components/QuizRunner";
import ArticleReader from "./components/ArticleReader";
import NewsletterBanner from "./components/NewsletterBanner";
import { ARTICLES_DATA, CATEGORIES } from "./data/buzzfeedData";
import "./buzzfeed.css";

export default function AltFPulsePage() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarks, setBookmarks] = useState([]);

  // Modal viewer states
  const [activeArticle, setActiveArticle] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);

  // Feed layout and load-more pagination
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isAddingMore, setIsAddingMore] = useState(false);

  // Restore saved articles on mount.
  useEffect(() => {
    // Check bookmarks
    const savedBookmarks = localStorage.getItem("bf-bookmarks");
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error("Failed parsing bookmarks from localstorage", e);
      }
    }

    // Dynamic SEO setup
    document.title = "AltF Pulse | Stories, Quizzes and Culture";
  }, []);

  // Bookmark actions
  const handleToggleBookmark = (article) => {
    let updated;
    const exists = bookmarks.some((b) => b.id === article.id);
    if (exists) {
      updated = bookmarks.filter((b) => b.id !== article.id);
    } else {
      updated = [...bookmarks, article];
    }
    setBookmarks(updated);
    localStorage.setItem("bf-bookmarks", JSON.stringify(updated));
  };

  const handleRemoveBookmark = (id) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    localStorage.setItem("bf-bookmarks", JSON.stringify(updated));
  };

  // Simulate short loading skeleton when switching categories/searching
  useEffect(() => {
    setIsLoadingFeed(true);
    const timer = setTimeout(() => {
      setIsLoadingFeed(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [activeCategory, searchQuery]);

  // Load more articles simulator
  const handleLoadMore = () => {
    setIsAddingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 4);
      setIsAddingMore(false);
    }, 600);
  };

  // Filter content based on Category and Search Query
  const getFilteredItems = () => {
    let list = [...ARTICLES_DATA];

    // 1. Search Query filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.excerpt.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }
    // 2. Category tab filter (only apply if not searching)
    else if (activeCategory !== "All") {
      list = list.filter(
        (item) => item.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    return list;
  };

  const filteredItems = getFilteredItems();

  // Determine whether to display a HeroSection
  // Editorial logic: only show Hero if there's no search query and we have items
  const showHero = searchQuery.trim() === "" && filteredItems.length > 0;

  // If Hero is shown, the remaining items form the grid
  const gridItems = showHero ? filteredItems.slice(5) : filteredItems;
  const slicedGridItems = gridItems.slice(0, visibleCount);

  // Items visible in the Hero Section (up to 5 items: 1 lead + 4 sidebar)
  const heroItems = showHero ? filteredItems.slice(0, Math.min(filteredItems.length, 5)) : [];

  return (
    <div className={`buzzfeed-app ${resolvedTheme === "dark" ? "bf-dark" : ""}`}>
      {/*
        The one H1 for this route. The masthead is a wordmark and the feed has
        no visible page heading to promote, so it stays screen-reader-only —
        but it now names what the page is rather than just repeating the
        wordmark, and it is the only H1 here: the hero lead and the reader
        overlay were both demoted to h2. Rendered on the server (no state
        gate), so a crawler that runs no JS still sees it.
      */}
      <h1 className="sr-only">AltF Pulse: stories, quizzes and culture</h1>

      {/* Header */}
      <Header
        activeCategory={activeCategory}
        onCategorySelect={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        darkMode={resolvedTheme === "dark"}
        toggleDarkMode={toggleTheme}
        bookmarks={bookmarks}
        onRemoveBookmark={handleRemoveBookmark}
        onOpenArticle={(art) => {
          if (art.type === "quiz") setActiveQuiz(art);
          else setActiveArticle(art);
        }}
        categories={CATEGORIES}
      />

      {/* Trending Ticker */}
      <TrendingTicker onTrendingClick={setSearchQuery} />

      {/* Main Layout Area */}
      <main className="bf-container" style={{ minHeight: "80vh", paddingBottom: "60px" }}>

        {/* Render Skeleton Loader */}
        {isLoadingFeed ? (
          <div style={{ marginTop: "24px" }}>
            <div className="bf-skeleton-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bf-skeleton-card">
                  <div className="bf-skeleton-image" />
                  <div className="bf-skeleton-content">
                    <div className="bf-skeleton-line title" />
                    <div className="bf-skeleton-line desc1" />
                    <div className="bf-skeleton-line desc2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* 1. Hero / Lead Section */}
            {showHero && heroItems.length > 0 && (
              <HeroSection
                articles={heroItems}
                onOpenArticle={(art) => {
                  if (art.type === "quiz") setActiveQuiz(art);
                  else setActiveArticle(art);
                }}
              />
            )}

            {/* Title Section */}
            <div className="bf-feed-title-section" style={{ marginTop: showHero ? "0px" : "24px" }}>
              <h2>
                {searchQuery
                  ? `Search Results for "${searchQuery}" (${filteredItems.length})`
                  : activeCategory === "All"
                    ? "Latest Stories & Quizzes"
                    : `${activeCategory} Feed`}
              </h2>
            </div>

            {/* 2. Grid Feed */}
            {filteredItems.length === 0 ? (
              <div className="bf-no-results" style={{ textAlign: "center", padding: "80px 20px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "8px" }}>
                  No results found
                </h3>
                <p style={{ color: "var(--bf-text-muted)", fontSize: "14px" }}>
                  We couldn't find anything matching your search. Try checking your spelling or looking up another category.
                </p>
                <button
                  className="bf-load-more-btn"
                  style={{ marginTop: "20px" }}
                  onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="bf-feed-grid">
                  {slicedGridItems.map((item, index) => {
                    const cardElement = item.type === "quiz" ? (
                      <QuizCard
                        key={item.id}
                        quiz={item}
                        onClick={() => setActiveQuiz(item)}
                      />
                    ) : (
                      <ArticleCard
                        key={item.id}
                        article={item}
                        onClick={() => setActiveArticle(item)}
                      />
                    );

                    // Insert Newsletter Banner inside grid after 3 items to make the page look like a premium publisher
                    if (index === 2) {
                      return (
                        <React.Fragment key={`wrap-${item.id}`}>
                          {cardElement}
                          <div style={{ gridColumn: "1 / -1" }} key="newsletter-banner">
                            <NewsletterBanner />
                          </div>
                        </React.Fragment>
                      );
                    }

                    return cardElement;
                  })}
                </div>

                {/* 3. Pagination Load More */}
                {gridItems.length > visibleCount && (
                  <div className="bf-load-more-section">
                    <button
                      className="bf-load-more-btn"
                      onClick={handleLoadMore}
                      disabled={isAddingMore}
                    >
                      {isAddingMore ? "LOADING..." : "LOAD MORE STORIES"}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Reader overlay modal */}
      {activeArticle && (
        <ArticleReader
          article={activeArticle}
          onClose={() => setActiveArticle(null)}
          bookmarks={bookmarks}
          onToggleBookmark={handleToggleBookmark}
        />
      )}

      {/* Quiz player modal */}
      {activeQuiz && (
        <QuizRunner
          quiz={activeQuiz}
          onClose={() => setActiveQuiz(null)}
        />
      )}

      {/* Footer */}
      <footer className="bf-footer">
        <div className="bf-container">
          <div className="bf-footer-logo"><Newspaper size={18} aria-hidden="true" /><strong>AltF Pulse</strong></div>

          <div className="bf-footer-links">
            <Link href="/policypages/about" className="bf-footer-link">About Us</Link>
            <Link href="/policypages/privacy" className="bf-footer-link">Privacy Policy</Link>
            <Link href="/policypages/termsandconditions" className="bf-footer-link">Terms</Link>
            <Link href="/policypages/contact" className="bf-footer-link">Contact</Link>
            <Link href="/site-map" className="bf-footer-link">Site Map</Link>
          </div>

          <div className="bf-footer-copyright">
            <p>© {new Date().getFullYear()} AltFTool. AltF Pulse is an AltFTool editorial experience.</p>
            <p style={{ marginTop: "8px", fontSize: "10px", opacity: 0.7 }}>
              Stories and quizzes are provided for discovery and entertainment.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
