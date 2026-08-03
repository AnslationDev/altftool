"use client";

import React, { useState, useEffect } from 'react';
import { ImageOff, RotateCw } from 'lucide-react';

export default function ProgressivePinImage({
  src,
  alt = "Pin image",
  className = "",
  containerClassName = "",
  heightClass = "h-[300px]",
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setIsLoaded(false);
    setIsError(false);
    setCurrentSrc(src);
  }, [src]);

  const handleRetry = (e) => {
    e?.stopPropagation();
    setIsError(false);
    setIsLoaded(false);
    const retryUrl = src.includes('?')
      ? `${src}&retry=${Date.now()}`
      : `${src}?retry=${Date.now()}`;
    setCurrentSrc(retryUrl);
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[14.36px] bg-[var(--muted)] ${heightClass} ${containerClassName}`}
    >
      {/* Shimmer Placeholder while loading */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-zinc-800 dark:via-zinc-700/80 dark:to-zinc-800 animate-pulse">
          <div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 dark:via-zinc-600/20 to-transparent"
            style={{ animation: 'shimmer 1.8s infinite' }}
          />
        </div>
      )}

      {/* Image Error Fallback */}
      {isError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-zinc-900 text-gray-500 dark:text-gray-400 text-center">
          <ImageOff size={24} className="mb-2 opacity-60" />
          <span className="text-xs font-medium mb-2">Image unavailable</span>
          <button
            onClick={handleRetry}
            className="px-3 py-1 bg-white dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-zinc-700 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      ) : (
        /* Actual Image with Blur-Up & Fade-In Transition */
        <img
          src={currentSrc}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsError(true)}
          className={`w-full h-full object-cover block transition-all duration-400 ease-out group-hover:scale-105 ${
            isLoaded
              ? 'opacity-100 blur-0 scale-100'
              : 'opacity-0 blur-md scale-95'
          } ${className}`}
        />
      )}
    </div>
  );
}
