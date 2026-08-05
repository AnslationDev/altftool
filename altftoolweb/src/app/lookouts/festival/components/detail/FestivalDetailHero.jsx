"use client";

import { CalendarDays, MapPin, Landmark } from "lucide-react";
import { LiveCountdown } from "../shared/LiveCountdown";
import BookmarkButton from "../shared/BookmarkButton";
import Breadcrumbs from "./Breadcrumbs";
import { formatDateLabel } from "../../lib/dateMath";
import { getReligion } from "../../data/religions";
import { getCategory } from "../../data/categories";

export default function FestivalDetailHero({ festival, dateIso, photo, dateSource }) {
  const religion = getReligion(festival.religion);
  const category = getCategory(festival.category);

  return (
    <section className="festival-detail-hero">
      <div className="festival-hero-bg">
        {photo?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.url} alt={photo.alt || festival.name} />
        ) : (
          <div className="festival-hero-bg-fallback" aria-hidden="true" />
        )}
      </div>
      <div className="festival-hero-overlay" />

      <div className="festival-detail-hero-content">
        <Breadcrumbs
          items={[
            { label: "Festivals", href: "/lookouts/festival" },
            { label: "Calendar", href: "/lookouts/festival/calendar" },
            { label: festival.name },
          ]}
        />

        <div className="featured-tags">
          <span className="tag tag--accent">{category?.name || festival.category}</span>
          <span className="tag">{religion?.name || festival.religion}</span>
        </div>

        <h1>{festival.name}</h1>
        <p className="festival-detail-tagline">{festival.tagline}</p>

        <div className="featured-meta">
          <span>
            <CalendarDays size={15} /> {dateIso ? formatDateLabel(dateIso) : "Date varies"}
            {dateSource === "live" ? " · official date" : " · estimated"}
          </span>
          <span>
            <MapPin size={15} /> {festival.regionLabel}
          </span>
          <span>
            <Landmark size={15} /> {festival.durationDays} day{festival.durationDays > 1 ? "s" : ""}
          </span>
        </div>

        {dateIso ? (
          <div className="countdown countdown--detail">
            <LiveCountdown targetIso={dateIso} />
            <BookmarkButton slug={festival.slug} className="bookmark-btn" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
