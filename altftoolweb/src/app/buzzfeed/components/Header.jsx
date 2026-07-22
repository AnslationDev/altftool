"use client";

import React, { useState } from "react";
import { Search, Bookmark, Sun, Moon, Menu, X, Trash2, Newspaper } from "lucide-react";

export default function Header({
  activeCategory,
  onCategorySelect,
  searchQuery,
  onSearchChange,
  darkMode,
  toggleDarkMode,
  bookmarks,
  onRemoveBookmark,
  onOpenArticle,
  categories
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

  return (
    <header className="bf-header">
      <div className="bf-header-main">
        <div className="bf-header-left">
          <button
            className="bf-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <button type="button" className="bf-logo-container" onClick={() => { onCategorySelect("All"); onSearchChange(""); }} aria-label="Return to AltF Pulse home">
            <span className="bf-logo"><Newspaper size={20} aria-hidden="true" /></span>
            <span className="bf-logo-wordmark">AltF Pulse</span>
            <span className="bf-logo-edition">WORLD</span>
          </button>
        </div>

        {/* Desktop Navigation Categories */}
        <nav className="bf-desktop-nav">
          {categories.map((category) => (
            <button
              key={category}
              className={`bf-nav-item bf-cat-${category.toLowerCase()} ${
                activeCategory === category && !searchQuery ? "active" : ""
              }`}
              onClick={() => {
                onCategorySelect(category);
                onSearchChange("");
              }}
            >
              {category}
            </button>
          ))}
        </nav>

        <div className="bf-header-right">
          {/* Search bar */}
          <div className="bf-search-box">
            <Search className="bf-search-icon" size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bf-search-input"
            />
            {searchQuery && (
              <button type="button" aria-label="Clear search" className="bf-search-clear" onClick={() => onSearchChange("")}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            className={`bf-header-icon-btn ${isBookmarksOpen ? "active" : ""}`}
            onClick={() => setIsBookmarksOpen(!isBookmarksOpen)}
            title="Saved Bookmarks"
          >
            <Bookmark size={20} />
            {bookmarks.length > 0 && (
              <span className="bf-badge">{bookmarks.length}</span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            className="bf-header-icon-btn"
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="bf-mobile-menu">
          <nav className="bf-mobile-nav">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={`bf-mobile-nav-item ${
                  activeCategory === category && !searchQuery ? "active" : ""
                }`}
                onClick={() => {
                  onCategorySelect(category);
                  onSearchChange("");
                  setIsMobileMenuOpen(false);
                }}
              >
                {category}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Bookmarks Drawer Overlay */}
      {isBookmarksOpen && (
        <>
          <div className="bf-drawer-backdrop" onClick={() => setIsBookmarksOpen(false)} />
          <div className="bf-bookmarks-drawer">
            <div className="bf-drawer-header">
              <h3>Saved Articles ({bookmarks.length})</h3>
              <button type="button" aria-label="Close saved articles" className="bf-close-btn" onClick={() => setIsBookmarksOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="bf-drawer-body">
              {bookmarks.length === 0 ? (
                <div className="bf-empty-bookmarks">
                  <Bookmark size={48} className="bf-empty-icon" />
                  <p>No bookmarked articles yet.</p>
                  <span className="bf-empty-subtext">Click the bookmark icon inside any article to save it here.</span>
                </div>
              ) : (
                <div className="bf-bookmark-list">
                  {bookmarks.map((article) => (
                    <div key={article.id} className="bf-bookmark-item">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="bf-bookmark-thumb"
                        onClick={() => {
                          onOpenArticle(article);
                          setIsBookmarksOpen(false);
                        }}
                      />
                      <div className="bf-bookmark-details">
                        <span className={`bf-category-tag bf-tag-${article.category.toLowerCase()}`}>
                          {article.category}
                        </span>
                        <h4 onClick={() => {
                          onOpenArticle(article);
                          setIsBookmarksOpen(false);
                        }} className="bf-bookmark-title">
                          {article.title}
                        </h4>
                      </div>
                      <button
                        className="bf-bookmark-remove-btn"
                        onClick={() => onRemoveBookmark(article.id)}
                        title="Remove Bookmark"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
