"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { LiveCountdown } from "../shared/LiveCountdown";
import BookmarkButton from "../shared/BookmarkButton";
import { formatDateLabel } from "../../lib/dateMath";

export default function UpcomingFestivalsSection({ items }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start", dragFree: false }, [
    Autoplay({ delay: 3200, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback((api) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return undefined;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    return () => emblaApi.off("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="festival-section" id="upcoming">
      <div className="festival-section-inner">
        <div className="section-header">
          <div>
            <p className="section-label">Live Countdown</p>
            <h2>Festivals Happening Soon</h2>
          </div>
          <Link href="/lookouts/festival/calendar" className="see-all">
            View all upcoming <ArrowRight size={14} />
          </Link>
        </div>

        <div className="festival-upcoming-carousel" ref={emblaRef}>
          <div className="festival-upcoming-track">
            {items.map(({ festival, dateIso, photo, statusLabel }) => (
              <div className="festival-upcoming-slide" key={festival.slug}>
                <Link href={`/lookouts/festival/${festival.slug}`} className="festival-upcoming-card">
                  <div className="upcoming-card-image">
                    {photo?.url ? (
                      // next/image, not a bare <img>: the Wikipedia fallback
                      // hands back the raw upload, which is routinely several
                      // MB. The optimizer resizes it to the slide width and
                      // serves AVIF/WebP; a plain tag would ship the original.
                      <Image
                        src={photo.url}
                        alt={photo.alt || festival.name}
                        fill
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div className="festival-card-placeholder" aria-hidden="true">
                        <span>🎉</span>
                      </div>
                    )}
                    <span className="upcoming-card-badge">{festival.religion.replace(/-/g, " ")}</span>
                    <span className="upcoming-card-status">{statusLabel}</span>
                  </div>

                  <div className="upcoming-card-content">
                    <div className="upcoming-card-meta">
                      <span>{festival.regionLabel}</span>
                      {formatDateLabel(dateIso) ? <span>· {formatDateLabel(dateIso)}</span> : null}
                    </div>
                    <h3>{festival.name}</h3>
                    <div className="countdown">
                      <LiveCountdown targetIso={dateIso} />
                      <BookmarkButton slug={festival.slug} />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="festival-upcoming-dots" aria-hidden="true">
          {items.map(({ festival }, index) => (
            <button
              key={festival.slug}
              type="button"
              tabIndex={-1}
              className={`festival-upcoming-dot${index === selectedIndex ? " is-active" : ""}`}
              onClick={() => emblaApi?.scrollTo(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
