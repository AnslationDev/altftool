"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getFestivalsByMonth } from "../../lib/getFestivals";
import { getMonthName, resolveEstimatedDate } from "../../lib/dateMath";
import { getCountryName } from "../../data/countryNames";
import FestivalGrid from "../shared/FestivalGrid";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const VISIBLE_COUNT = 6;

export default function MonthlyCalendarSection() {
  const now = useMemo(() => new Date(), []);
  const [activeMonth, setActiveMonth] = useState(now.getMonth() + 1);
  const [photos, setPhotos] = useState({});

  const festivals = getFestivalsByMonth(activeMonth);
  const visibleFestivals = festivals.slice(0, VISIBLE_COUNT);
  const dates = useMemo(() => {
    const map = {};
    festivals.forEach((f) => {
      map[f.slug] = resolveEstimatedDate(f, { now });
    });
    return map;
  }, [festivals, now]);

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      visibleFestivals.map(async (festival) => {
        if (photos[festival.slug]) return [festival.slug, photos[festival.slug]];
        try {
          // wikipediaTitle lets the route fall back to the festival's Wikipedia
          // image when no photo-provider key is configured.
          const res = await fetch(
            `/api/lookouts/festival/photos?query=${encodeURIComponent(festival.unsplashQuery)}` +
              `&wikipediaTitle=${encodeURIComponent(festival.wikipediaTitle || "")}`,
          );
          const data = await res.json();
          return [festival.slug, data?.photos?.[0] || null];
        } catch {
          return [festival.slug, null];
        }
      }),
    ).then((entries) => {
      if (cancelled) return;
      setPhotos((current) => ({ ...current, ...Object.fromEntries(entries) }));
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMonth]);

  return (
    <section className="festival-section festival-section--tint" id="calendar">
      <div className="festival-section-inner">
        <div className="section-header">
          <div>
            <p className="section-label">Festival Calendar</p>
            <h2>Monthly Festival Calendar</h2>
          </div>
          <Link href="/lookouts/festival/calendar" className="see-all">
            Full calendar
          </Link>
        </div>

        <div className="festival-month-tabs">
          {MONTHS.map((month) => (
            <button
              key={month}
              type="button"
              className={`festival-month-tab${month === activeMonth ? " is-active" : ""}`}
              onClick={() => setActiveMonth(month)}
            >
              {getMonthName(month).slice(0, 3)}
            </button>
          ))}
        </div>

        <FestivalGrid festivals={visibleFestivals} dates={dates} photos={photos} />
        {festivals.length ? (
          <p className="festival-calendar-hint">
            Showing festivals typically celebrated in {getMonthName(activeMonth)}
            {festivals[0] ? ` across ${getCountryName(festivals[0].countryCodes[0])} and more` : ""}.
          </p>
        ) : null}
      </div>
    </section>
  );
}
