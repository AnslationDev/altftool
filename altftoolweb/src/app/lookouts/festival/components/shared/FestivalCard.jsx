"use client";

import Link from "next/link";
import Image from "next/image";
import { Bookmark } from "lucide-react";
import { CompactCountdown } from "./LiveCountdown";
import { countryCodeToFlagEmoji } from "../../lib/flagEmoji";
import { getCountryName } from "../../data/countryNames";
import { formatDateLabel } from "../../lib/dateMath";
import useFestivalFavorites from "../../hooks/useFestivalFavorites";

function CardMedia({ festival, photoUrl, photoAlt }) {
  if (photoUrl) {
    return <Image src={photoUrl} alt={photoAlt || festival.name} fill sizes="(max-width: 640px) 100vw, 320px" style={{ objectFit: "cover" }} />;
  }

  const flag = countryCodeToFlagEmoji(festival.countryCodes[0]);
  return (
    <div className="festival-card-placeholder" aria-hidden="true">
      <span>{flag}</span>
    </div>
  );
}

export default function FestivalCard({ festival, dateIso, photoUrl, photoAlt }) {
  const { isFavorite, toggleFavorite } = useFestivalFavorites();
  const favorited = isFavorite(festival.slug);

  return (
    <article className="festival-card">
      <Link href={`/lookouts/festival/${festival.slug}`} className="festival-card-image">
        <CardMedia festival={festival} photoUrl={photoUrl} photoAlt={photoAlt} />
        <div className="festival-card-image-overlay" />
        <span className="festival-card-type">{festival.category.replace(/-/g, " ")}</span>
        {dateIso ? <CompactCountdown targetIso={dateIso} /> : null}

        <button
          type="button"
          className="favorite-btn"
          aria-label={favorited ? "Remove bookmark" : "Bookmark this festival"}
          aria-pressed={favorited}
          onClick={(event) => {
            event.preventDefault();
            toggleFavorite(festival.slug);
          }}
        >
          <Bookmark size={15} fill={favorited ? "currentColor" : "none"} />
        </button>

        <div className="festival-card-content">
          <p className="festival-card-meta">
            {countryCodeToFlagEmoji(festival.countryCodes[0])} {getCountryName(festival.countryCodes[0])}
            {dateIso ? ` · ${formatDateLabel(dateIso, { year: undefined })}` : ""}
          </p>
          <h3>{festival.name}</h3>
        </div>
      </Link>
    </article>
  );
}
