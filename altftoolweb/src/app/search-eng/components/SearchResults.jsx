"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import ManagedImage from '@/components/ui/ManagedImage';

// ─── SAFE URL HELPER ──────────────────────────────────────────────────────────
const safeHostname = (url) => {
  try { return new URL(url).hostname; }
  catch { return 'altftool.com'; }
};

// ─── RESULT CARD ──────────────────────────────────────────────────────────────
export function ResultCard({ result, index, query, onTagSearch }) {
  const isExternal = result.isExternal;
  const hostname = safeHostname(result.url);

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.02, duration: 0.15 }}
      className="result-card"
    >
      {/* ── Left: Content ── */}
      <div className="result-card-content" style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '652px', marginBottom: '28px' }}>
        {/* Source row */}
        <div className="result-source-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px 4px 4px', borderRadius: '100px', cursor: 'pointer', transition: 'background-color 0.2s' }} className="source-hover-wrap">
            <div style={{ width: '28px', height: '28px', backgroundColor: 'var(--google-light-gray)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--google-border)' }}>
              <ManagedImage
                src={result.favicon || `https://www.google.com/s2/favicons?domain=${hostname}&sz=16`} 
                alt="" 
                style={{ width: '16px', height: '16px', borderRadius: '50%' }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--google-text)', lineHeight: '1', marginBottom: '2px' }}>
                {result.displayUrl?.split(' > ')[0] || hostname}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--google-gray)', lineHeight: '1' }}>
                {result.displayUrl?.replace(/ > /g, ' › ')}
              </span>
            </div>
          </div>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '50%', color: 'var(--google-gray)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="more-btn-hover">
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* Title */}
        <Link
          href={result.url}
          target={isExternal ? '_blank' : '_self'}
          rel={isExternal ? 'noopener noreferrer' : ''}
          style={{ fontSize: '20px', color: 'var(--google-blue)', textDecoration: 'none', lineHeight: '1.3', fontWeight: '400', display: 'inline-block' }}
          className="result-title-link hover-underline"
        >
          {result.title}
        </Link>

        {/* Description */}
        <p style={{ fontSize: '14px', color: 'var(--google-gray)', lineHeight: '1.58', margin: '2px 0 0 0', wordWrap: 'break-word' }}>
          {/* Highlight search terms if present */}
          {result.description}
        </p>
      </div>
    </motion.article>
  );
}

// ─── SKELETON LOADER ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-body">
        <div className="skeleton-source">
          <div className="skeleton-circle" />
          <div className="skeleton-line skeleton-line-md" />
        </div>
        <div className="skeleton-line skeleton-line-lg" />
        <div className="skeleton-line skeleton-line-full" />
        <div className="skeleton-line skeleton-line-sm" />
      </div>
      <div className="skeleton-thumb" />
    </div>
  );
}

// ─── SEARCH RESULTS CONTAINER ─────────────────────────────────────────────────
export function SearchResults({ results, query, isLoading, searchTime, onTagSearch, searchType = 'all' }) {
  const [pagination, setPagination] = useState({ query, count: 5 });
  const visibleCount = pagination.query === query ? pagination.count : 5;

  if (isLoading) {
    return (
      <div className="results-container">
        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!isLoading && results.length === 0 && query) {
    return (
      <div className="no-results-container">
        <div className="no-results-message">
          <span>No results for </span>
          <strong className="no-results-query">&quot;{query}&quot;</strong>
        </div>
        <p className="no-results-hint">Try different keywords or check spelling.</p>
        <div className="no-results-suggestions">
          <p className="no-results-suggestions-label">Try searching for:</p>
          <div className="no-results-chips">
            {['pdf tool', 'ai generator', 'chrome extension', 'calculator', 'converter'].map(s => (
              <button key={s} onClick={() => onTagSearch(s)} className="no-results-chip">{s}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const visible = results.slice(0, visibleCount);

  return (
    <div className="results-container">
      {/* Cards / Grids Based on searchType */}
      <div className={`results-list type-${searchType}`}>
        
        {/* ALL (WEB) LAYOUT */}
        {searchType === 'all' && visible.map((result, idx) => (
          <ResultCard key={result.id} result={result} index={idx} query={query} onTagSearch={onTagSearch} />
        ))}

        {/* IMAGES LAYOUT */}
        {searchType === 'images' && (
          <div className="se-images-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px', paddingTop: '10px' }}>
            {visible.map((result, idx) => (
              <a key={result.id} href={result.url} target="_blank" rel="noopener noreferrer" className="se-image-card" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '8px', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
                <div style={{ borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--google-light-gray)', border: '1px solid var(--google-border)', aspectRatio: '4/3', position: 'relative' }}>
                  <ManagedImage
                    src={result.image || `https://picsum.photos/seed/${result.id}/300/200`} 
                    fallbackSrc="https://via.placeholder.com/300x200?text=No+Image"
                    alt={result.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                  />
                </div>
                <div style={{ padding: '0 4px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--google-gray)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <ManagedImage src={result.favicon || `https://www.google.com/s2/favicons?domain=${safeHostname(result.url)}&sz=16`} alt="" style={{ width: '14px', height: '14px', borderRadius: '50%' }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{result.displayUrl}</span>
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--google-blue)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>
                    {result.title}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* NEWS LAYOUT */}
        {searchType === 'news' && (
          <div className="se-news-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '10px', maxWidth: '700px' }}>
            {visible.map((result, idx) => (
              <div key={result.id} className="se-news-card" style={{ display: 'flex', gap: '20px', padding: '16px 0', borderBottom: '1px solid var(--google-border)' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <ManagedImage src={result.favicon || `https://www.google.com/s2/favicons?domain=${safeHostname(result.url)}&sz=16`} alt="" style={{ width: '16px', height: '16px', borderRadius: '4px' }} />
                    <span style={{ fontSize: '12px', color: 'var(--google-text)', fontWeight: '500' }}>{result.displayUrl}</span>
                    <span style={{ fontSize: '12px', color: 'var(--google-gray)' }}>• 2 hours ago</span>
                  </div>
                  <a href={result.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '20px', color: 'var(--google-blue)', textDecoration: 'none', fontWeight: '400', lineHeight: '1.3', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {result.title}
                  </a>
                  <p style={{ fontSize: '14px', color: 'var(--google-gray)', margin: 0, lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {result.description}
                  </p>
                </div>
                <div style={{ width: '130px', height: '130px', flexShrink: 0, borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--google-light-gray)', border: '1px solid var(--google-border)' }}>
                  <ManagedImage
                    src={result.image || `https://picsum.photos/seed/${result.id}news/200/200`} 
                    alt="" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIDEOS LAYOUT */}
        {searchType === 'videos' && (
          <div className="se-videos-list" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '10px', maxWidth: '700px' }}>
            {visible.map((result, idx) => (
              <div key={result.id} className="se-video-card" style={{ display: 'flex', gap: '20px' }}>
                <a href={result.url} target="_blank" rel="noopener noreferrer" style={{ position: 'relative', width: '200px', height: '118px', flexShrink: 0, backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', display: 'block', border: '1px solid var(--google-border)' }}>
                  <ManagedImage src={`https://picsum.photos/seed/${result.id}video/400/225`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85, transition: 'opacity 0.2s' }} />
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '36px', height: '36px', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
                    <div style={{ width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '11px solid white', marginLeft: '3px' }}></div>
                  </div>
                  <div style={{ position: 'absolute', bottom: '6px', right: '6px', backgroundColor: 'rgba(0,0,0,0.8)', color: 'white', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>
                    10:24
                  </div>
                </a>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--google-text)' }}>{result.displayUrl}</span>
                    <span style={{ fontSize: '13px', color: 'var(--google-gray)' }}>• 1 day ago</span>
                  </div>
                  <a href={result.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '18px', color: 'var(--google-blue)', textDecoration: 'none', lineHeight: '1.3', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {result.title}
                  </a>
                  <p style={{ fontSize: '14px', color: 'var(--google-gray)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                    {result.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Pagination */}
      {visibleCount < results.length && (
        <div className="se-pagination">
          <button onClick={() => setPagination({ query, count: visibleCount + 10 })} className="se-page-next">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
