import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import SectionDivider from './SectionDivider';
import './BottomSections.css';
import ArticleCard from './ArticleCard';
import { articlesData, trendingData } from '../data';
import { playbuzzAds } from '../ads';

const PlaybuzzAdPlacement = ({ ads, className = '' }) => {
  if (!ads?.length) return null;

  return (
    <aside className={`playbuzz-ad-placement ${className}`} aria-label="Sponsored advertisements">
      <span className="playbuzz-ad-heading">Sponsored</span>
      <div className="playbuzz-ad-stack">
        {ads.map((ad) => (
          <a
            key={ad.id}
            href={ad.href}
            target="_blank"
            rel="noopener noreferrer"
            className="playbuzz-ad-card"
          >
            <img
              src={ad.image}
              alt={ad.alt || 'Advertisement'}
              className="playbuzz-ad-image"
            />
            {ad.label && <span className="playbuzz-ad-label">{ad.label}</span>}
          </a>
        ))}
      </div>
    </aside>
  );
};

const BottomSections = ({ category }) => {
  const LOAD_BATCH_SIZE = 6;
  const [visibleCount, setVisibleCount] = useState(LOAD_BATCH_SIZE);
  const loadMoreRef = useRef(null);
  const popularPool = useMemo(
    () => articlesData.filter((article) => article.showInPopular !== false),
    []
  );

  const allPopularArticles = useMemo(() => {
    // In NEW tab, show a mixed feed from all categories.
    if (category === 'NEW') return popularPool;

    let filtered = popularPool.filter((article) => article.category === category);
    if (filtered.length === 0) {
      filtered = popularPool.slice(0, LOAD_BATCH_SIZE);
    } else if (filtered.length < LOAD_BATCH_SIZE) {
      const others = popularPool.filter((a) => a.category !== category);
      filtered = [...filtered, ...others].slice(0, LOAD_BATCH_SIZE);
    }
    return filtered;
  }, [category, popularPool]);

  const sidebarAds = useMemo(() => {
    if (!playbuzzAds?.length) return [];
    // Only display vertical, rectangle or square ads in the sidebar
    return playbuzzAds.filter(ad => ad.type === 'vertical' || ad.type === 'rectangle' || ad.type === 'square');
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setVisibleCount(LOAD_BATCH_SIZE);
  }, [category]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (category !== 'NEW') return;
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first.isIntersecting) return;
        setVisibleCount((prev) => Math.min(prev + LOAD_BATCH_SIZE, allPopularArticles.length));
      },
      { rootMargin: '180px 0px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [category, allPopularArticles.length]);

  const popularArticles =
    category === 'NEW' ? allPopularArticles.slice(0, visibleCount) : allPopularArticles;

  return (
    <div className="bottom-sections">
      <div className="main-articles">
        <SectionDivider title="MOST POPULAR" />
        <div className="popular-grid">
          {popularArticles.map(article => (
            <div key={article.id} className="popular-item">
              <ArticleCard
                id={article.id}
                image={article.image}
                title={article.title}
                author={article.author}
                plays={article.plays}
              />
            </div>
          ))}
        </div>
        {category === 'NEW' && visibleCount < allPopularArticles.length && (
          <div ref={loadMoreRef} className="popular-load-trigger" aria-hidden="true" />
        )}
        <PlaybuzzAdPlacement ads={sidebarAds} className="mobile-ad-placement" />
      </div>

      <div className="sidebar">
        <SectionDivider title="TRENDING" />
        <div className="trending-list">
          {trendingData.map(article => (
            <Link key={article.id} href={`/playbuzz/quiz-play?id=${article.id}`} className="trending-card">
              <div className="trending-image-container">
                <img src={article.image} alt={article.title} className="trending-image" />
              </div>
              <div className="trending-content">
                <h4 className="trending-title">{article.title}</h4>
                <span className="trending-author">{article.author}</span>
              </div>
            </Link>
          ))}
        </div>
        <PlaybuzzAdPlacement ads={sidebarAds} className="sidebar-ad-placement" />
      </div>
    </div>
  );
};

export default BottomSections;
