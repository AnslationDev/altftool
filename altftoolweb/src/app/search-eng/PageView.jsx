"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Image as ImageIcon,
  Newspaper,
  PlayCircle,
  Sparkles,
  FileText,
  Wand2,
  Puzzle,
  Calculator,
  Gamepad2,
} from 'lucide-react';
import { BrandLogo } from '@altftool/ui';
import SearchBar from './components/SearchBar';
import { SearchResults } from './components/SearchResults';
import { useSearchDataSource } from './hooks/useSearchDataSource';
import {
  performSmartSearch,
  mergeSearchResults,
  normalizeQueryForURL,
  normalizeQueryFromURL,
} from './lib/searchEngine';
import './search-eng.css';

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const SEARCH_BACKEND_URL = (process.env.NEXT_PUBLIC_SEARCH_BACKEND_URL || '').replace(/\/$/, '');

const RESULT_TABS = [
  { label: 'All', value: 'all', Icon: Search },
  { label: 'Images', value: 'images', Icon: ImageIcon },
  { label: 'News', value: 'news', Icon: Newspaper },
  { label: 'Videos', value: 'videos', Icon: PlayCircle },
];

const QUICK_TOPICS = [
  { label: 'PDF Tools', query: 'pdf tools', Icon: FileText },
  { label: 'AI Generators', query: 'ai generator', Icon: Wand2 },
  { label: 'Extensions', query: 'chrome extension', Icon: Puzzle },
  { label: 'Calculators', query: 'calculator', Icon: Calculator },
  { label: 'Games', query: 'games', Icon: Gamepad2 },
];

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
      let webItems = [];

      // Prefer live web results when the optional backend is configured.
      try {
        if (SEARCH_BACKEND_URL) {
          const controller = new AbortController();
          const timeout = window.setTimeout(() => controller.abort(), 5000);
          const res = await fetch(
            `${SEARCH_BACKEND_URL}/search?q=${encodeURIComponent(query)}&type=${searchType}`,
            { signal: controller.signal },
          );
          window.clearTimeout(timeout);

          if (!res.ok) throw new Error(`Search backend returned ${res.status}`);
          const data = await res.json();
          webItems = Array.isArray(data.results) ? data.results : [];
        }
      } catch (err) {
        if (err?.name !== 'AbortError') {
          console.warn('[SearchEngine] Live backend unavailable; using local index.', err);
        }
      }

      const local = performSmartSearch(dataset, query).items;
      const filteredLocal = searchType === 'all'
        ? local
        : local.filter((item) => item.category?.toLowerCase().includes(searchType));
      const mergedResults = mergeSearchResults(filteredLocal, webItems);

      setResults(mergedResults);

      setSearchMeta({
        total: mergedResults.length,
        time: ((Date.now() - startTime) / 1000).toFixed(2),
      });
      setIsLoading(false);
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

  // ── "Surprise me" pulls a random entry from the live dataset ──
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
                <Link href="/search-eng" className="se-header-brand" aria-label="AltFTool Search home">
                  <BrandLogo decorative />
                </Link>
                <div className="se-header-bar-wrap">
                  <SearchBar initialValue={query} onSearch={handleSearch} onImageResults={handleImageResults} isResultPage dataset={dataset} />
                </div>
              </div>

              {/* Category tabs */}
              <div className="se-results-tabs">
                <div className="se-results-tabs-inner" role="tablist" aria-label="Result categories">
                  {RESULT_TABS.map(({ label, value, Icon }) => (
                    <button
                      key={value}
                      role="tab"
                      aria-selected={searchType === value}
                      onClick={() => setSearchType(value)}
                      className={`se-tab ${searchType === value ? 'active' : ''}`}
                    >
                      <Icon size={15} aria-hidden="true" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </header>

            {/* Main results area */}
            <main className="se-results-main">
              <div className="se-results-inner">
                {!isLoading && results.length > 0 && (
                  <p className="se-results-meta">
                    About {searchMeta.total} results ({searchMeta.time} seconds)
                  </p>
                )}
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
            {/* Eyebrow */}
            <motion.span
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="se-eyebrow"
            >
              <span className="se-eyebrow-dot" aria-hidden="true" />
              AltFTool Search
            </motion.span>

            {/* Hero brand */}
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 180 }}
              className="se-hero"
            >
              <BrandLogo className="se-hero-logo" label="AltFTool Search" />
            </motion.div>

            <motion.p
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="se-tagline"
            >
              One search across <strong>tools, docs, extensions</strong> and the web —
              fast, focused, distraction-free.
            </motion.p>

            {/* Search bar section */}
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.18, duration: 0.45 }}
              className="se-search-section"
            >
              <SearchBar onSearch={handleSearch} onImageResults={handleImageResults} isResultPage={false} dataset={dataset} />

              <div className="se-cta-group">
                <button
                  type="button"
                  className="se-cta-btn se-cta-btn--primary"
                  onClick={handleLucky}
                  disabled={!dataset.length}
                >
                  <Sparkles size={15} aria-hidden="true" />
                  Surprise Me
                </button>
                <Link href="/tools" className="se-cta-btn">
                  Explore All Tools
                </Link>
              </div>
            </motion.div>

            {/* Quick topics */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.45 }}
              className="se-chip-row"
            >
              <span className="se-chip-label">Trending on AltFTool</span>
              {QUICK_TOPICS.map(({ label, query: topicQuery, Icon }) => (
                <button
                  key={label}
                  type="button"
                  className="se-chip"
                  onClick={() => handleSearch(topicQuery)}
                >
                  <Icon size={14} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </motion.div>

            <p className="se-landing-hint">
              Instant answers from the AltFTool universe ·{' '}
              <Link href="/">Back to AltFTool</Link>
            </p>
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
