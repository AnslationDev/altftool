"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from './components/SearchBar';
import { SearchResults } from './components/SearchResults';
import { useSearchDataSource } from './hooks/useSearchDataSource';
import ManagedImage from '@/components/ui/ManagedImage';
import {
  performSmartSearch,
  normalizeQueryForURL,
  normalizeQueryFromURL,
} from './lib/searchEngine';
import './search-eng.css';

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// (Clean Google-like layout)

// ─── MAIN CONTENT ─────────────────────────────────────────────────────────────
function SearchEngineContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const rawQuery     = searchParams.get('q') || '';
  const query        = normalizeQueryFromURL(rawQuery);

  const { dataset, loading: dataLoading } = useSearchDataSource();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchMeta, setSearchMeta] = useState({ total: 0, time: '0.00' });
  const [searchType, setSearchType] = useState('all'); // State for Tabs
  const isResultPage = !!query;

  // ── Search execution (runs after dataset is ready) ──
  useEffect(() => {
    if (!query) {
      setResults([]);
      setSearchMeta({ total: 0, time: '0.00' });
      setIsLoading(false);
      return;
    }

    if (dataLoading) {
      // Dataset still loading from Firebase — show skeleton
      setIsLoading(true);
      return;
    }

    setIsLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const startTime = Date.now();

    const executeSearch = async () => {
      // 1. Web Search API (Exclusive Source)
      try {
        const res = await fetch(`https://eng-backend-tc06.onrender.com/search?q=${encodeURIComponent(query)}&type=${searchType}`);
        if (res.ok) {
          const data = await res.json();
          const webItems = data.results || [];
          
          setResults(webItems);
          setSearchMeta({ 
            total: data.meta?.total || webItems.length, 
            time: ((Date.now() - startTime) / 1000).toFixed(2) 
          });
        }
      } catch (err) {
        console.error('Web Search Error (Backend might be sleeping or CORS blocked):', err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      executeSearch();
    }, 200);
    return () => clearTimeout(timer);
  }, [query, dataset, dataLoading, searchType]);

  // ── Dynamic SEO title ──
  useEffect(() => {
    document.title = query
      ? `${query} - AltFTool Search`
      : 'AltFTool Search – Premium Digital Toolkit';
  }, [query]);

  // ── Navigation handler ──
  // ── Trending uses dataset titles when loaded ──
  const handleLucky = () => {
    if (!dataset.length) return;
    const r = dataset[Math.floor(Math.random() * dataset.length)];
    handleSearch(r.tags?.[1] || r.title);
  };

  const handleSearch = (newQuery) => {
    if (!newQuery?.trim()) return;
    router.push(`/search-eng?q=${normalizeQueryForURL(newQuery)}`);
  };

  // ── Image Results Handler ──
  const handleImageResults = (imageResults) => {
    setResults(imageResults);
    setSearchMeta({ total: imageResults.length, time: '0.00' });
    setSearchType('all'); // Use web layout to render image results
    setIsLoading(false);
    router.push('/search-eng?q=[image-search]');
  };

  return (
    <div className="se-root">
      <AnimatePresence mode="wait">

        {/* ══ RESULTS PAGE ════════════════════════════════════════════════════ */}
        {isResultPage ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="se-results-layout"
          >
            <header className="se-results-header">
              <div className="se-results-header-inner">
                <div className="se-header-bar-wrap">
                  <SearchBar initialValue={query} onSearch={handleSearch} onImageResults={handleImageResults} isResultPage dataset={dataset} />
                </div>
              </div>

              {/* Google-style Tabs */}
              <div className="se-results-tabs">
                <div className="se-results-tabs-inner">
                  {['All', 'Images', 'News', 'Videos'].map((tab) => {
                    const value = tab.toLowerCase();
                    return (
                      <button 
                        key={tab}
                        onClick={() => setSearchType(value)}
                        className={`se-tab ${searchType === value ? 'active' : ''}`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>
              </div>
            </header>

            {/* Main results area */}
            <main className="se-results-main">
              <div className="se-results-inner">
                <SearchResults
                  results={results}
                  query={query}
                  isLoading={isLoading}
                  searchTime={searchMeta.time}
                  onTagSearch={handleSearch}
                  searchType={searchType}
                />
              </div>
            </main>
          </motion.div>

        ) : (

          /* ══ LANDING PAGE ═════════════════════════════════════════════════ */
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="se-landing"
          >
            {/* Hero */}
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 180 }}
              className="se-hero"
            >
              <ManagedImage src="/assets/logo3.png" alt="AltFTool" loading="eager" className="se-hero-logo" />
            </motion.div>

            {/* Search bar section */}
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.18, duration: 0.45 }}
              className="se-search-section"
            >
              <SearchBar onSearch={handleSearch} onImageResults={handleImageResults} isResultPage={false} dataset={dataset} />

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── EXPORT WITH SUSPENSE ─────────────────────────────────────────────────────
export default function SearchEngine() {
  return (
    <Suspense
      fallback={
        <div className="se-suspense">
          <div className="se-suspense-spinner" />
          <p className="se-suspense-text">Loading Search Engine…</p>
        </div>
      }
    >
      <SearchEngineContent />
    </Suspense>
  );
}
