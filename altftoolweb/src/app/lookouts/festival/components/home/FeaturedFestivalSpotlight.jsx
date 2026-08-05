import Link from "next/link";
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";
import { formatDateLabel } from "../../lib/dateMath";
import Reveal from "../shared/Reveal";

export default function FeaturedFestivalSpotlight({ festival, dateIso, photo, historyExtract }) {
  return (
    <section className="festival-section" id="featured">
      <div className="festival-section-inner">
        <div className="section-header">
          <div>
            <p className="section-label">Festival Spotlight</p>
            <h2>Featured Festival</h2>
          </div>
        </div>

        <Reveal>
          <Link href={`/lookouts/festival/${festival.slug}`} className="featured-festival">
            <div className="featured-hero">
              {photo?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo.url} alt={photo.alt || festival.name} />
              ) : (
                <div className="festival-card-placeholder" aria-hidden="true">
                  <span>✨</span>
                </div>
              )}
              <div className="featured-hero-overlay" />
              <div className="featured-hero-content">
                <div className="featured-tags">
                  <span className="tag tag--accent">{festival.category.replace(/-/g, " ")}</span>
                  <span className="tag">{festival.religion.replace(/-/g, " ")}</span>
                </div>
                <h3>{festival.name}</h3>
                <p>{festival.tagline}</p>
                <div className="featured-meta">
                  <span>
                    <CalendarDays size={15} /> {formatDateLabel(dateIso) || "Date varies"}
                  </span>
                  <span>
                    <MapPin size={15} /> {festival.regionLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="featured-details">
              <div className="featured-col">
                <h4>Traditions</h4>
                <div className="chip-list">
                  {festival.traditions.slice(0, 6).map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="featured-col">
                <h4>Traditional Foods</h4>
                <div className="chip-list">
                  {festival.foods.slice(0, 6).map((f) => (
                    <span key={f} className="chip">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="featured-col">
                <h4>History &amp; Origin</h4>
                <p className="featured-history">
                  {historyExtract || festival.tagline}
                </p>
                <span className="read-more">
                  Read full history <ArrowRight size={12} />
                </span>
              </div>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
