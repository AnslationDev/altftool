"use client";

import React from "react";
import { User, Clock } from "lucide-react";

export default function HeroSection({ articles, onOpenArticle }) {
  if (!articles || articles.length === 0) return null;

  // The first article is the large featured hero
  const leadArticle = articles[0];
  // The next 3-4 articles will show up in the trending sidebar
  const sidebarArticles = articles.slice(1, 5);

  return (
    <div className="bf-hero-section">
      {/* Lead Feature Card */}
      <div
        className="bf-hero-lead"
        onClick={() => onOpenArticle(leadArticle)}
      >
        <div className="bf-hero-image-wrap">
          <img
            src={leadArticle.image}
            alt={leadArticle.title}
            className="bf-hero-image"
          />
          <span className={`bf-category-badge bf-badge-${leadArticle.category.toLowerCase()}`}>
            {leadArticle.category}
          </span>
        </div>
        <div className="bf-hero-lead-content">
          {/*
            The lead card's headline, not the page's. /buzzfeed is a feed: its
            subject is the AltF Pulse edition, which the H1 in page.jsx names.
            This card is the first item of that feed — its siblings in
            ArticleCard/QuizCard are already h3 — so as an <h1> it gave the
            route a second, article-specific heading that changed with the
            data. Level only: the class carries every box and type property
            (see .bf-hero-lead-title in buzzfeed.css) and no rule here selects
            by tag, so the render is unchanged.
          */}
          <h2 className="bf-hero-lead-title">{leadArticle.title}</h2>
          <p className="bf-hero-lead-excerpt">{leadArticle.excerpt}</p>
          <div className="bf-article-meta">
            <span className="bf-meta-item">
              <User size={14} />
              {leadArticle.author}
            </span>
            <span className="bf-meta-item">
              <Clock size={14} />
              {leadArticle.readTime}
            </span>
            <span className="bf-meta-date">{leadArticle.date}</span>
          </div>
        </div>
      </div>

      {/* Trending Sidebar */}
      <div className="bf-hero-sidebar">
        <h3 className="bf-sidebar-title">TRENDING NOW</h3>
        <div className="bf-sidebar-list">
          {sidebarArticles.map((article, index) => (
            <div
              key={article.id}
              className="bf-sidebar-item"
              onClick={() => onOpenArticle(article)}
            >
              <span className="bf-sidebar-number">{index + 1}</span>
              <div className="bf-sidebar-content">
                <span className={`bf-category-tag bf-tag-${article.category.toLowerCase()}`}>
                  {article.category}
                </span>
                <h4 className="bf-sidebar-item-title">{article.title}</h4>
                <div className="bf-sidebar-meta">
                  <span>By {article.author}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
