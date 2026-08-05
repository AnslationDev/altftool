import { MapPin, ExternalLink } from "lucide-react";
import { countryCodeToFlagEmoji } from "../../lib/flagEmoji";
import { getCountryCentroid } from "../../data/countryCentroids";
import { getCountryName } from "../../data/countryNames";

function buildOsmEmbedUrl(lat, lng, delta = 6) {
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}

export default function LocationMapSection({ festival, countries }) {
  const primaryCode = festival.countryCodes[0];
  const primaryLive = countries?.[0] || null;
  // The map only needs coordinates, which a small static lookup already
  // covers — no reason to leave it blank just because the (now keyed) REST
  // Countries call didn't run. Live data still wins when it's available.
  const [liveLat, liveLng] = primaryLive?.latlng || [];
  const [lat, lng] = Number.isFinite(liveLat) && Number.isFinite(liveLng)
    ? [liveLat, liveLng]
    : getCountryCentroid(primaryCode) || [];
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const primaryName = primaryLive?.name?.common || getCountryName(primaryCode);

  return (
    <section className="festival-section" id="location">
      <div className="festival-section-inner">
        <div className="section-header">
          <div>
            <p className="section-label">Where It's Celebrated</p>
            <h2>Location &amp; Country Details</h2>
          </div>
        </div>

        <div className="festival-location-grid">
          <div className="festival-map-embed">
            {hasCoords ? (
              <iframe
                title={`Map of ${primaryName || festival.regionLabel}`}
                src={buildOsmEmbedUrl(lat, lng)}
                loading="lazy"
              />
            ) : (
              <div className="festival-card-placeholder" aria-hidden="true">
                <span>🗺️</span>
              </div>
            )}
          </div>

          <div className="festival-location-facts">
            <h3>
              <MapPin size={16} /> Celebrated In
            </h3>
            <div className="chip-list">
              {festival.countryCodes.map((code) => (
                <span key={code} className="chip">
                  {countryCodeToFlagEmoji(code)} {getCountryName(code)}
                </span>
              ))}
            </div>

            {countries?.length ? (
              countries.map((country) => (
                <dl key={country.cca2} className="festival-country-facts">
                  <div>
                    <dt>Country</dt>
                    <dd>{country.name?.common}</dd>
                  </div>
                  <div>
                    <dt>Capital</dt>
                    <dd>{country.capital?.[0] || "—"}</dd>
                  </div>
                  <div>
                    <dt>Region</dt>
                    <dd>{country.region}{country.subregion ? ` · ${country.subregion}` : ""}</dd>
                  </div>
                  <div>
                    <dt>Languages</dt>
                    <dd>{country.languages ? Object.values(country.languages).join(", ") : "—"}</dd>
                  </div>
                  <div>
                    <dt>Currency</dt>
                    <dd>
                      {country.currencies
                        ? Object.values(country.currencies)
                            .map((c) => `${c.name} (${c.symbol || ""})`)
                            .join(", ")
                        : "—"}
                    </dd>
                  </div>
                </dl>
              ))
            ) : (
              <p className="festival-location-note">
                Primarily celebrated in {festival.regionLabel}. Detailed country facts (capital, currency, languages)
                need a REST Countries API key configured — see .env.example.
              </p>
            )}

            <a
              className="read-more"
              href={`https://www.google.com/maps/search/${encodeURIComponent(`${festival.name} ${primaryName || ""}`)}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              Open in Google Maps <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
