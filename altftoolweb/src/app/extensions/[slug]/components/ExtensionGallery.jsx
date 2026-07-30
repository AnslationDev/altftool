"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";

function isLocalScreenshot(src) {
  return typeof src === "string" && src.startsWith("/");
}

export default function ExtensionGallery({ screenshots }) {
  const galleryItems = Array.isArray(screenshots) ? screenshots : [];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Initialize Embla Carousel with loop option
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  // Custom Autoplay (5s delay, pauses on hover)
  useEffect(() => {
    if (!emblaApi || isHovered) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [emblaApi, isHovered]);

  if (galleryItems.length === 0) return null;

  return (
    <section className="space-y-6" aria-label="Extension Screenshot Gallery">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] tracking-tight flex items-center gap-2.5">
          <Eye className="w-5 h-5 text-[var(--primary)]" />
          <span>Product Screenshots</span>
        </h2>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
          {galleryItems.length} Images
        </span>
      </div>

      <div className="relative group/gallery">
        {/* Main Large Viewport Carousel */}
        <div
          className="overflow-hidden rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-md shadow-black/5"
          ref={emblaRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex">
            {galleryItems.map((src, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 relative aspect-[16/9] w-full bg-white">
                <Image
                  src={src}
                  alt={`Screenshot ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  priority={index === 0}
                  loading={index === 0 ? undefined : "lazy"}
                  className="object-contain"
                  unoptimized={!isLocalScreenshot(src)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Previous Button */}
        <button
          type="button"
          onClick={scrollPrev}
          aria-label="Previous screenshot"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[var(--card)]/90 backdrop-blur-xs border border-[var(--border)] text-[var(--foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 flex items-center justify-center shadow-md transition-all opacity-0 group-hover/gallery:opacity-100 focus:opacity-100"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Next Button */}
        <button
          type="button"
          onClick={scrollNext}
          aria-label="Next screenshot"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[var(--card)]/90 backdrop-blur-xs border border-[var(--border)] text-[var(--foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 flex items-center justify-center shadow-md transition-all opacity-0 group-hover/gallery:opacity-100 focus:opacity-100"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Thumbnail Navigation Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {galleryItems.map((src, index) => {
          const isActive = index === selectedIndex;
          return (
            <button
              key={index}
              type="button"
              onClick={() => emblaApi && emblaApi.scrollTo(index)}
              aria-label={`Go to screenshot ${index + 1}`}
              aria-current={isActive ? "true" : undefined}
              className={`relative w-20 h-12 md:w-28 md:h-16 rounded-xl overflow-hidden bg-[var(--muted)] border transition-all hover:scale-[1.02] active:scale-[0.98] ${
                isActive
                  ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20"
                  : "border-[var(--border)] hover:border-[var(--muted-foreground)]/30"
              }`}
            >
              <Image
                src={src}
                alt={`Thumbnail ${index + 1}`}
                fill
                sizes="(max-width: 768px) 80px, 112px"
                loading="lazy"
                className="object-cover opacity-80 hover:opacity-100 transition-opacity"
                unoptimized={!isLocalScreenshot(src)}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
