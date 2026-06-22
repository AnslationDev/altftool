import React from 'react';
import Link from 'next/link';
import './ArticleCard.css';

const ArticleCard = ({ id = 1, image, title, author, plays, layout = 'vertical' }) => {
  return (
    <Link href={`/playbuzz/quiz-play?id=${id}`} className={`article-card ${layout === 'horizontal' ? 'layout-horizontal' : ''}`}>
      <div className="article-image-container">
        <img src={image} alt={title} className="article-image" />
        <div className="share-overlay">
          <span className="share-btn fb">f</span>
          <span className="share-btn tw">t</span>
          <span className="share-btn wa">w</span>
        </div>
      </div>
      <div className="article-content">
        <h3 className="article-title">{title}</h3>
        <p className="article-meta">
          {author} <span className="meta-dot">·</span> {plays}
        </p>
      </div>
    </Link>
  );
};

export default ArticleCard;
