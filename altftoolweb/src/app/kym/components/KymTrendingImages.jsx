"use client";

import { useEffect, useMemo, useState } from "react";
import { Bookmark, Download, X } from "lucide-react";

function savedKey(src) {
  return `kym-saved-image:${src}`;
}

export default function KymTrendingImages({ images }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [savedImages, setSavedImages] = useState([]);
  const activeImage = activeIndex === null ? null : images[activeIndex];

  useEffect(() => {
    setIsReady(true);

    const saved = images
      .filter((image) => window.localStorage.getItem(savedKey(image.src)) === "true")
      .map((image) => image.src);

    setSavedImages(saved);
  }, [images]);

  useEffect(() => {
    if (activeIndex === null) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("kym-modal-open");

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("kym-modal-open");
    };
  }, [activeIndex]);

  const isSaved = useMemo(
    () => (activeImage ? savedImages.includes(activeImage.src) : false),
    [activeImage, savedImages],
  );

  function toggleSave() {
    if (!activeImage) {
      return;
    }

    const key = savedKey(activeImage.src);
    const nextSaved = !isSaved;

    window.localStorage.setItem(key, String(nextSaved));
    setSavedImages((current) =>
      nextSaved
        ? [...new Set([...current, activeImage.src])]
        : current.filter((src) => src !== activeImage.src),
    );
  }

  return (
    <>
      <div className="kym-masonry">
        {images.map((image, index) => (
          <button
            className="kym-trending-thumb"
            key={`${image.src}-${index}`}
            type="button"
            disabled={!isReady}
            onClick={() => setActiveIndex(index)}
          >
            <img src={image.src} alt={`Trending meme ${index + 1}`} />
          </button>
        ))}
      </div>

      {activeImage ? (
        <div className="kym-image-modal" role="dialog" aria-modal="true" aria-label="Trending image preview">
          <button className="kym-image-modal__backdrop" type="button" onClick={() => setActiveIndex(null)} />
          <div className="kym-image-modal__panel">
            <div className="kym-image-modal__toolbar">
              <strong>Trending Image</strong>
              <div>
                <button type="button" onClick={toggleSave}>
                  <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
                  {isSaved ? "Saved" : "Save"}
                </button>
                <a href={activeImage.src} download={`kym-trending-${activeIndex + 1}`}>
                  <Download size={16} />
                  Download
                </a>
                <button type="button" aria-label="Close preview" onClick={() => setActiveIndex(null)}>
                  <X size={18} />
                </button>
              </div>
            </div>
            <img className="kym-image-modal__image" src={activeImage.src} alt="Selected trending meme" />
          </div>
        </div>
      ) : null}
    </>
  );
}
