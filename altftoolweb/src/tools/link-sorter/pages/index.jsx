"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Copy, ExternalLink, Link as LinkIcon, Check, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import Features from '../components/Features';

export default function ToolHome() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentUrls, setRecentUrls] = useState([]);
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();
  const abortControllerRef = useRef(null);

  useEffect(() => () => abortControllerRef.current?.abort(), []);

  const normalizeUrl = (url) => {
    const trimmed = url.trim();
    if (!trimmed || trimmed.includes(' ')) return null;

    // Anything that looks like `scheme:...` (mailto:, tel:, ftp:, etc.) is only
    // acceptable when the scheme is http/https - other schemes are rejected
    // outright instead of getting a nonsensical "https://" prepended to them.
    const schemeMatch = trimmed.match(/^([a-z][a-z0-9+-]*):/i);
    if (schemeMatch) {
      const scheme = schemeMatch[1].toLowerCase();
      if (scheme !== 'http' && scheme !== 'https') return null;
      const rest = trimmed.slice(schemeMatch[0].length).replace(/^\/\//, '');
      return rest.includes('.') ? trimmed : null;
    }

    return trimmed.includes('.') ? 'https://' + trimmed : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalized = normalizeUrl(longUrl);

    if (!normalized) {
      setError('Please enter a valid URL (e.g. example.com, www.site.com, https://site.com)');
      return;
    }

    // Cancel any still-in-flight request before starting a new one, and let
    // Clear cancel this one too so a resolved response can never resurrect a
    // result the user already dismissed.
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError('');
    resetCopyState();
    setShortUrl('');

    const trimmed = normalized;

    try {
      const response = await fetch(`https://cleanuri.com/api/v1/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `url=${encodeURIComponent(trimmed)}`,
        signal: controller.signal
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to shorten URL');
      }

      const shortened = data.result_url;
      if (typeof shortened !== 'string' || !shortened.startsWith('http')) {
        throw new Error('Invalid response');
      }

      setShortUrl(shortened);
      setOriginalUrl(trimmed);

      setRecentUrls(prev => [
        {
          original: trimmed,
          shortened,
          date: new Date().toLocaleDateString('en-IN'),
          id: Date.now()
        },
        ...prev.slice(0, 4)
      ]);
    } catch (err) {
      if (err.name === 'AbortError') return;
      try {
        const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal
        });
        if (!res.ok) throw new Error('something went wrong');
        const tiny = await res.text();
        if (!tiny.startsWith('https://')) throw new Error('Invalid response');

        setShortUrl(tiny);
        setOriginalUrl(trimmed);
        setRecentUrls(prev => [
          {
            original: trimmed,
            shortened: tiny,
            date: new Date().toLocaleDateString('en-IN'),
            id: Date.now()
          },
          ...prev.slice(0, 4)
        ]);
      } catch (fallbackErr) {
        if (fallbackErr.name === 'AbortError') return;
        setError('Could not shorten URL. Please check your internet connection and try again.');
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  };

  const handleCopy = (url, id = 'main') => {
    copy(id, url, { label: 'shortened URL' });
  };

  const handleClear = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLongUrl('');
    setShortUrl('');
    setOriginalUrl('');
    setError('');
    resetCopyState();
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: "'Sora', 'Segoe UI', sans-serif" }} className="bg-(--background) p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="heading animate-fade-up">Link Shortener</h1>
          <p className="description pt-2 animate-fade-up">Paste any long URL and get a short, shareable link instantly</p>
        </div>

        {/* Main Card */}
        <div className="bg-(--card) rounded-2xl p-4 sm:p-6 md:p-8 mb-6">
          <form onSubmit={handleSubmit}>
            <label htmlFor="link-sorter-url" className="block text-sm font-medium text-(--foreground) mb-2 tag tracking-widest subheading">
              Enter Your URL
            </label>

            {/* Input + Buttons: stacked on mobile, row on sm+ */}
            <div className="flex flex-col gap-3 mb-3">
              <input
                id="link-sorter-url"
                type="text"
                value={longUrl}
                onChange={(e) => { setLongUrl(e.target.value); setError(''); }}
                placeholder="example.com or https://site.com/path..."
                className="url-input bg-(--background) w-full px-4 py-3.5 rounded-xl text-sm sm:text-base border border-(--border) min-w-0"
              />
              <div className="flex gap-2 w-full">
                <Button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer flex-1 flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <><RefreshCw className="w-4 h-4 scissor-spin shrink-0" /> <span>Shortening...</span></>
                  ) : (
                    <><LinkIcon className="w-4 h-4 shrink-0" /> <span>Shorten</span></>
                  )}
                </Button>
                {(longUrl || shortUrl) && (
                  <Button
                    type="button"
                    onClick={handleClear}
                    className="bg-red-500 cursor-pointer hover:bg-red-500/80 text-white transition-colors shrink-0"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {error && (
              <div role="alert" className="mt-3 text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-lg fade-in">
                ⚠️ {error}
              </div>
            )}
          </form>

          {/* Result */}
          {shortUrl && (
            <div className="mt-6 fade-in" aria-live="polite" role="status">
              <div className="bg-(--background) border border-indigo-500/30 rounded-xl p-4">
                {/* Result header: label + action buttons */}
                <div className="flex flex-col gap-3 mb-3">
                  <span className="tag text-(--foreground)">✓ Shortened URL</span>
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => handleCopy(shortUrl)}
                      aria-label={isCopied('main') ? 'Copied the shortened URL to clipboard' : 'Copy shortened URL'}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 flex-1 bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition-colors hover:bg-gray-400"
                    >
                      {isCopied('main')
                        ? <><Check className="w-3.5 h-3.5 shrink-0" /> <span>Copied!</span></>
                        : <><Copy className="w-3.5 h-3.5 shrink-0" /> <span>Copy</span></>
                      }
                    </button>
                    <a
                      href={shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 px-3 py-2 flex-1 bg-emerald-600 hover:bg-emerald-600/80 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" /> <span>Visit</span>
                    </a>
                  </div>
                </div>

                {/* Short URL display */}
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-(--foreground) text-sm sm:text-base font-medium break-all block underline-offset-4 hover:underline transition-colors"
                >
                  {shortUrl}
                </a>
                <p className="text-slate-500 text-xs mt-2 break-all">
                  Original: {originalUrl}
                </p>
              </div>
            </div>
          )}
          <span className="sr-only" role="status" aria-live="polite">
            {announcement}
          </span>
        </div>

        {/* History */}
        {recentUrls.length > 0 && (
          <div className="bg-(--card) rounded-2xl p-4 sm:p-6 fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="subheading">Recent URLs</h2>
              <Button
                variant="danger"
                onClick={() => setRecentUrls([])}
                className="flex cursor-pointer items-center gap-1.5 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear all
              </Button>
            </div>

            <div className="space-y-3">
              {recentUrls.map((url) => (
                <div
                  key={url.id}
                  className="bg-(--background) rounded-xl p-4 border border-(--border) hover:border-indigo-500/30 transition-colors"
                >
                  {/* URL info */}
                  <div className="mb-3 min-w-0">
                    <p className="text-(--muted-foreground) text-xs mb-1 break-all line-clamp-1 overflow-hidden">
                      {url.original}
                    </p>
                    <a
                      href={url.shortened}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-(--foreground) hover:text-indigo-600 font-medium text-sm hover:underline underline-offset-4 transition-colors break-all"
                    >
                      {url.shortened}
                    </a>
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-(--muted-foreground) text-xs shrink-0">{url.date}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(url.shortened, url.id)}
                        aria-label={isCopied(url.id) ? 'Copied shortened URL to clipboard' : 'Copy shortened URL'}
                        className="text-(--foreground) transition-colors p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
                        title="Copy"
                      >
                        {isCopied(url.id)
                          ? <Check className="w-4 h-4 text-emerald-400" />
                          : <Copy className="w-4 h-4" />
                        }
                      </button>
                      <a
                        href={url.shortened}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-(--muted-foreground) hover:text-emerald-400 transition-colors p-1.5 rounded-lg hover:bg-white/10"
                        title="Open link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <Features/>
      </div>
    </div>
  );
}