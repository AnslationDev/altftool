import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import SectionDivider from './SectionDivider';
import ArticleCard from './ArticleCard';
import { articlesData, trendingData } from '../data';
import { playbuzzAds } from '../ads';

const PlaybuzzAdPlacement = ({ ads, className = '' }) => {
  if (!ads?.length) return null;

  return (
    <aside className={`w-full mt-4 ${className}`} aria-label="Sponsored advertisements">
      <span
        className="block mb-1.5 text-[10px] font-extrabold tracking-wider text-center uppercase"
        style={{ color: 'var(--muted-foreground)' }}
      >
        Sponsored
      </span>
      <div className="flex flex-col gap-3">
        {ads.map((ad) => (
          <a
            key={ad.id}
            href={ad.href}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block overflow-hidden border border-border rounded-md bg-card no-underline transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
            style={{ boxShadow: 'var(--anslation-ds-shadow-sm)' }}
          >
            <img
              src={ad.image}
              alt={ad.alt || 'Advertisement'}
              className="block w-full object-cover"
              style={{
                height: 'min(58vh, 560px)',
                minHeight: '360px',
                backgroundColor: 'var(--muted)',
              }}
            />
            {ad.label && (
              <span
                className="absolute top-2 left-2 text-[10px] font-semibold tracking-wide text-white px-2 py-0.5 rounded"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
              >
                {ad.label}
              </span>
            )}
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
    [],
  );

  const allPopularArticles = useMemo(() => {
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
    return playbuzzAds.filter(
      (ad) => ad.type === 'vertical' || ad.type === 'rectangle' || ad.type === 'square',
    );
  }, []);

  useEffect(() => {
    setVisibleCount(LOAD_BATCH_SIZE);
  }, [category]);

  useEffect(() => {
    if (category !== 'NEW') return;
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first.isIntersecting) return;
        setVisibleCount((prev) =>
          Math.min(prev + LOAD_BATCH_SIZE, allPopularArticles.length),
        );
      },
      { rootMargin: '180px 0px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [category, allPopularArticles.length]);

  const popularArticles =
    category === 'NEW'
      ? allPopularArticles.slice(0, visibleCount)
      : allPopularArticles;

  return (
    <div className="flex gap-4 mb-12 mt-12 items-stretch max-lg:flex-col max-lg:mt-8">
      <div className="flex-1 min-w-0">
        <SectionDivider title="MOST POPULAR" />
        <div className="grid grid-cols-2 max-md:grid-cols-1 gap-3">
          {popularArticles.map((article) => (
            <div key={article.id}>
              <ArticleCard
                id={article.id}
                image={article.image}
                title={article.title}
              />
            </div>
          ))}
        </div>
        {category === 'NEW' && visibleCount < allPopularArticles.length && (
          <div ref={loadMoreRef} className="w-full h-0.5" aria-hidden="true" />
        )}
        <div className="hidden max-lg:block mt-6">
          <PlaybuzzAdPlacement ads={sidebarAds} />
        </div>
      </div>

      <div className="w-80 shrink-0 max-lg:w-full">
        <SectionDivider title="TRENDING" />
        <div className="flex flex-col gap-2">
          {trendingData.map((article) => (
            <Link
              key={article.id}
              href={`/playbuzz/quiz-play?id=${article.id}`}
              className="flex gap-2.5 items-start border border-border bg-card rounded-md p-2 no-underline cursor-pointer transition-all hover:border-[var(--primary)] hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
              style={{ color: 'inherit' }}
            >
              <div className="w-20 h-14 shrink-0 overflow-hidden rounded">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4
                  className="text-xs font-extrabold leading-tight m-0"
                  style={{ color: 'var(--foreground)' }}
                >
                  {article.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
        <div className="hidden max-lg:block sticky top-24">
          <PlaybuzzAdPlacement ads={sidebarAds} />
        </div>
      </div>
    </div>
  );
};

export default BottomSections;
