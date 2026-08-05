'use client';

import { useState } from 'react';
import Image from 'next/image';
import { photo, fallbackPhoto, fallbackStyle } from '../lib/images.js';
import { initials } from '../lib/format.js';

/**
 * Photography wrapper used everywhere in /top49.
 *
 * Renders a next/image against the Unsplash CDN and, if the remote image ever
 * fails or is missing, swaps to a verified fallback photo or tinted initials plate.
 */
export default function T49Image({
  id,
  alt = '',
  name = '',
  ratio = '16-10',
  sizes = '100vw',
  width = 1200,
  priority = false,
  className = '',
  rounded = false,
  shadow = false,
  children,
}) {
  const [failed, setFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  const seed = name || id || alt;
  const primarySrc = id ? photo(id, { w: width }) : null;

  const currentSrc = (!failed && primarySrc) ? primarySrc : fallbackPhoto(seed, { w: width });
  const showInitials = fallbackFailed || (!currentSrc);

  const handleImageError = () => {
    if (!failed && primarySrc) {
      setFailed(true);
    } else {
      setFallbackFailed(true);
    }
  };

  return (
    <div
      className={[
        't49-media',
        ratio === 'fill' ? '' : `t49-media--${ratio}`,
        rounded ? 't49-media--rounded' : '',
        shadow ? 't49-media--shadow' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={showInitials && ratio !== 'fill' ? fallbackStyle(seed) : undefined}
    >
      {showInitials && ratio === 'fill' ? null : showInitials ? (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            fontFamily: 'var(--t49-font-display)',
            fontSize: 'clamp(28px, 8cqw, 56px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            opacity: 0.62,
          }}
        >
          {initials(seed)}
        </div>
      ) : (
        <Image
          src={currentSrc}
          alt={alt || name}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          onError={handleImageError}
          unoptimized
        />
      )}
      {children}
    </div>
  );
}
