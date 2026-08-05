"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";

export default function FestivalGallery({ photos, festivalName }) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!photos?.length) return null;

  const displayPhotos = photos.slice(0, 9);

  function close() {
    setActiveIndex(null);
  }

  function step(delta) {
    setActiveIndex((current) => {
      if (current === null) return current;
      const next = (current + delta + displayPhotos.length) % displayPhotos.length;
      return next;
    });
  }

  return (
    <section className="festival-section festival-section--tint">
      <div className="festival-section-inner">
        <div className="section-header">
          <div>
            <p className="section-label">
              <Images size={13} style={{ display: "inline", marginRight: 6 }} />
              Gallery
            </p>
            <h2>Photos of {festivalName}</h2>
          </div>
        </div>

        <div className="festival-gallery-masonry">
          {displayPhotos.map((photo, index) => (
            <button
              key={photo.url || index}
              type="button"
              className={`festival-gallery-thumb festival-gallery-thumb--${index % 3}`}
              onClick={() => setActiveIndex(index)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.thumbUrl || photo.url} alt={photo.alt || festivalName} loading="lazy" />
              <span className="festival-gallery-thumb-overlay" aria-hidden="true" />
            </button>
          ))}
        </div>

        {activeIndex !== null ? (
          <div className="festival-lightbox" role="dialog" aria-modal="true">
            <button type="button" className="festival-lightbox-close" onClick={close} aria-label="Close gallery">
              <X size={20} />
            </button>
            <button type="button" className="festival-lightbox-nav festival-lightbox-nav--prev" onClick={() => step(-1)} aria-label="Previous photo">
              <ChevronLeft size={24} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="festival-lightbox-image"
              src={displayPhotos[activeIndex].url}
              alt={displayPhotos[activeIndex].alt || festivalName}
            />
            <button type="button" className="festival-lightbox-nav festival-lightbox-nav--next" onClick={() => step(1)} aria-label="Next photo">
              <ChevronRight size={24} />
            </button>
            <p className="festival-lightbox-credit">
              Photo by {displayPhotos[activeIndex].credit} on {displayPhotos[activeIndex].source === "pexels" ? "Pexels" : "Unsplash"}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
