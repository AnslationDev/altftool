"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Mic, Camera, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { getAutoSuggestions } from '../lib/searchEngine';

// ─── HIGHLIGHT MATCHING KEYWORDS ──────────────────────────────────────────────
function HighlightText({ text, query }) {
  if (!query || !text) return <span>{text}</span>;
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return <span>{text}</span>;
  const regex = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        words.includes(part.toLowerCase())
          ? <mark key={i} className="search-mark">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
}

// ─── SEARCH BAR COMPONENT ─────────────────────────────────────────────────────
const BACKEND_URL = process.env.NEXT_PUBLIC_SEARCH_BACKEND_URL || 'https://eng-backend-tc06.onrender.com';

export default function SearchBar({ initialValue = "", onSearch, onImageResults, isResultPage = false, dataset = [] }) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isImageSearching, setIsImageSearching] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const recognitionRef = useRef(null);

  // ── Voice Search ──
  const startListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setQuery(transcript);
        submitSearch(transcript);
      }
    };
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert("Microphone permission denied. Please allow microphone access.");
      } else if (event.error === 'network') {
        alert("Voice search failed due to a network error. Note: Some browsers (like Brave or Chromium) block voice search by default. Please try using Google Chrome, Safari, or Edge.");
      }
    };
    recognition.onend = () => setIsListening(false);

    try {
      recognition.start();
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      setIsListening(false);
    }
  };

  // ── Reverse Image Search ──
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImageSearching(true);
    setShowSuggestions(false);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${BACKEND_URL}/search/reverse-image`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      const data = await res.json();
      const imageResults = data.results || [];

      if (onImageResults) {
        onImageResults(imageResults);
      }
    } catch (err) {
      console.error('Reverse image search failed:', err);
      alert('Image search failed. Please try again.');
    } finally {
      setIsImageSearching(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    setQuery(initialValue);
    setActiveIndex(-1);
    setSuggestions([]);
    setShowSuggestions(false);
  }, [initialValue]);

  // Debounced suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = query.trim();
      if (trimmed.length >= 2) {
        const results = getAutoSuggestions(dataset, trimmed);
        setSuggestions(results);
        if (document.activeElement === inputRef.current) {
          setShowSuggestions(results.length > 0);
        }
        setActiveIndex(-1);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [query, dataset]);

  // Outside click handler
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const submitSearch = useCallback((text) => {
    const trimmed = text?.trim();
    if (!trimmed) return;
    setShowSuggestions(false);
    setActiveIndex(-1);
    setIsFocused(false);
    inputRef.current?.blur(); // Blur input to prevent dropdown reopening
    onSearch(trimmed);
  }, [onSearch]);

  const handleSubmit = (e) => { e?.preventDefault(); submitSearch(query); };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length) setActiveIndex(p => Math.min(p + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(p => Math.max(p - 1, -1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        const selected = suggestions[activeIndex].text;
        setQuery(selected);
        submitSearch(selected);
      } else {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveIndex(-1);
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (text) => {
    setQuery(text);
    submitSearch(text);
  };

  return (
    <div ref={wrapperRef} className={`search-bar-wrapper ${isResultPage ? 'result-page-width' : 'landing-page-width'}`}>
      {/* ── Search Input Form ── */}
      <form
        onSubmit={handleSubmit}
        className={`search-bar-form ${isResultPage ? 'search-bar-compact' : 'search-bar-large'} ${(isFocused && showSuggestions && suggestions.length > 0) ? 'search-bar-focused' : ''}`}
      >
        {/* Search Icon Button */}
        <button type="submit" className="search-bar-icon-btn" aria-label="Search">
          <Search size={isResultPage ? 17 : 20} />
        </button>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { setIsFocused(true); suggestions.length > 0 && setShowSuggestions(true); }}
          placeholder="Search tools, docs, extensions..."
          className="search-bar-input"
          autoFocus={!isResultPage}
          autoComplete="off"
          spellCheck="false"
        />

        {/* Right Actions */}
        <div className="search-bar-actions">
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.12 }}
                type="button"
                onClick={handleClear}
                className="search-bar-clear-btn"
                aria-label="Clear search"
              >
                <X size={15} />
              </motion.button>
            )}
          </AnimatePresence>
          <div className="search-bar-icon-group">
            <button 
              type="button" 
              onClick={startListening}
              className={`search-bar-util-btn ${isListening ? 'listening-active' : ''}`} 
              title="Voice Search" 
              aria-label="Voice search"
            >
              <Mic size={16} color={isListening ? "#ea4335" : "currentColor"} />
            </button>
            <button 
              type="button" 
              onClick={() => !isImageSearching && fileInputRef.current?.click()}
              className={`search-bar-util-btn ${isImageSearching ? 'image-searching-active' : ''}`} 
              title={isImageSearching ? 'Searching...' : 'Search by Image'} 
              aria-label="Image search"
              disabled={isImageSearching}
            >
              {isImageSearching 
                ? <span className="img-search-spinner" />
                : <Camera size={16} />}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
          </div>
        </div>
      </form>

      {/* ── Suggestion Dropdown ── */}
      <AnimatePresence>
        {isFocused && showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="search-suggestions-dropdown"
          >
            <ul className="py-1.5">
              {suggestions.map((s, index) => (
                <li
                  key={s.id}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => handleSuggestionClick(s.text)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`search-suggestion-item ${index === activeIndex ? 'search-suggestion-active' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Search size={13} className="search-suggestion-icon" />
                    <span className="search-suggestion-text">
                      <HighlightText text={s.text} query={query} />
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
