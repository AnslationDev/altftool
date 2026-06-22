import React from 'react';
import ArticleCard from './ArticleCard';
import { articlesData } from '../data';
import './FeaturedSection.css';

const FeaturedSection = ({ category }) => {
  const featuredPool = articlesData.filter((article) => article.showInFeatured !== false);

  // Filter by category. If there are fewer than 3, fallback to some default ones just to fill the grid.
  let filteredArticles = featuredPool.filter(article => article.category === category);
  
  if (filteredArticles.length === 0) {
    // If no specific category articles, just show the first 3
    filteredArticles = featuredPool.slice(0, 3);
  } else if (filteredArticles.length < 3) {
    // Pad with other articles if we don't have enough to fill the 3 slots
    const others = featuredPool.filter(a => a.category !== category);
    filteredArticles = [...filteredArticles, ...others].slice(0, 3);
  } else {
    filteredArticles = filteredArticles.slice(0, 3);
  }

  return (
    <section className="featured-section">
      <div className="featured-grid">
        {filteredArticles.map(article => (
          <ArticleCard 
            key={article.id}
            id={article.id}
            image={article.image}
            title={article.title}
            author={article.author}
            plays={article.plays}
          />
        ))}
      </div>
    </section>
  );
};

export default FeaturedSection;
