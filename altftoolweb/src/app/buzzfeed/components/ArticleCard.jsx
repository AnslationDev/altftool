"use client";

import React from "react";
import { User, Clock } from "lucide-react";

export default function ArticleCard({ article, onClick }) {
  return (
    <article className="bf-card" onClick={onClick}>
      <div className="bf-card-image-wrap">
        <img src={article.image} alt={article.title} className="bf-card-image" />
        <span className={`bf-category-badge bf-badge-${article.category.toLowerCase()}`}>
          {article.category}
        </span>
      </div>
      <div className="bf-card-content">
        <h3 className="bf-card-title">{article.title}</h3>
        <p className="bf-card-excerpt">{article.excerpt}</p>
        <div className="bf-card-meta">
          <span className="bf-meta-author">
            <User size={12} />
            {article.author}
          </span>
          <span className="bf-meta-time">
            <Clock size={12} />
            {article.readTime}
          </span>
        </div>
      </div>
    </article>
  );
}
