import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import { getAllFestivals, getFestivalsByCountry, getUpcomingFestivals } from "../../lib/getFestivals";
import { getCountryName } from "../../data/countryNames";
import { countryCodeToFlagEmoji } from "../../lib/flagEmoji";
import Reveal from "../shared/Reveal";

function topCountries(limit = 8) {
  const counts = new Map();
  for (const festival of getAllFestivals()) {
    for (const code of festival.countryCodes) {
      counts.set(code, (counts.get(code) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([code, count]) => ({ code, count }));
}

export default function CountryGrid() {
  const countries = topCountries();
  const upcoming = getUpcomingFestivals({ limit: getAllFestivals().length });

  return (
    <section className="festival-section festival-section--tint" id="countries">
      <div className="festival-section-inner">
        <div className="section-header">
          <div>
            <p className="section-label">Around the World</p>
            <h2>Country-Based Festivals</h2>
          </div>
          <Link href="/lookouts/festival/calendar" className="see-all">
            Browse all countries <ArrowRight size={14} />
          </Link>
        </div>

        <div className="country-grid">
          {countries.map(({ code, count }, index) => {
            const festivals = getFestivalsByCountry(code);
            const categoryCounts = festivals.reduce((acc, f) => {
              acc[f.category] = (acc[f.category] || 0) + 1;
              return acc;
            }, {});
            const nextUp = upcoming.find((f) => f.countryCodes.includes(code));

            return (
              <Reveal key={code} delay={index * 0.03}>
                <Link href={`/lookouts/festival/country/${code.toLowerCase()}`} className="country-card">
                  <div className="country-card-top">
                    <span className="country-flag">{countryCodeToFlagEmoji(code)}</span>
                    <div>
                      <h3>{getCountryName(code)}</h3>
                      <p>{count} festivals total</p>
                    </div>
                  </div>
                  <div className="chip-list">
                    {Object.entries(categoryCounts)
                      .slice(0, 3)
                      .map(([category, catCount]) => (
                        <span key={category} className="chip">
                          {catCount} {category.replace(/-/g, " ")}
                        </span>
                      ))}
                  </div>
                  {nextUp ? (
                    <div className="country-upcoming">
                      <CalendarClock size={14} />
                      Upcoming: <strong>{nextUp.name}</strong>
                    </div>
                  ) : null}
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
