import { CalendarX } from "lucide-react";
import FestivalCard from "./FestivalCard";

export default function FestivalGrid({ festivals, dates = {}, photos = {} }) {
  if (!festivals.length) {
    return (
      <div className="festival-empty">
        <CalendarX size={32} />
        <h3>No festivals found</h3>
        <p>Try a different month, country, or search term.</p>
      </div>
    );
  }

  return (
    <div className="festival-grid">
      {festivals.map((festival) => (
        <FestivalCard
          key={festival.slug}
          festival={festival}
          dateIso={dates[festival.slug]}
          photoUrl={photos[festival.slug]?.url}
          photoAlt={photos[festival.slug]?.alt}
        />
      ))}
    </div>
  );
}
