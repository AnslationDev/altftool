import { Plane, Wallet, Languages, CloudSun, MapPin } from "lucide-react";
import { getMonthName } from "../../lib/dateMath";
import { getCountryName } from "../../data/countryNames";

const CATEGORY_TIPS = {
  religious: [
    "Dress modestly when visiting temples, mosques, or shrines during observances.",
    "Many venues get crowded at peak prayer or ceremony times — arrive early.",
  ],
  cultural: [
    "Book accommodation well ahead — cultural festivals draw large crowds.",
    "Street celebrations can involve dense crowds; keep valuables secure.",
  ],
  national: [
    "Government offices and public transport schedules may change on national holidays.",
    "Expect flags, parades, and road closures near city centres.",
  ],
  harvest: [
    "Rural and regional areas often host the most authentic celebrations.",
    "Seasonal produce and street food are usually at their best.",
  ],
  seasonal: ["Weather can shift quickly around seasonal transitions — pack layers."],
  music: ["Ticketed events sell out early for headline performances."],
  food: ["Come hungry — tastings and stalls are usually the highlight."],
  "international-days": ["Many observances are marked by local community events rather than public holidays."],
  traditional: ["Ask locally about the best neighbourhood or district to experience it."],
  "new-year": ["Transport and hospitality prices often peak around New Year celebrations — book early."],
};

export default function TravelInfoSection({ festival, countries }) {
  const primary = countries?.[0];
  const tips = CATEGORY_TIPS[festival.category] || [];

  return (
    <section className="festival-section festival-section--tint">
      <div className="festival-section-inner">
        <div className="section-header">
          <div>
            <p className="section-label">Plan Your Visit</p>
            <h2>Travel Information</h2>
          </div>
        </div>

        <div className="festival-travel-grid">
          <div className="festival-travel-fact">
            <CloudSun size={18} />
            <div>
              <h4>Best time to plan around</h4>
              <p>Typically celebrated in {getMonthName(festival.month)}.</p>
            </div>
          </div>
          <div className="festival-travel-fact">
            <MapPin size={18} />
            <div>
              <h4>Where to go</h4>
              <p>{festival.countryCodes.map(getCountryName).join(", ")}</p>
            </div>
          </div>
          {primary?.currencies ? (
            <div className="festival-travel-fact">
              <Wallet size={18} />
              <div>
                <h4>Currency</h4>
                <p>{Object.values(primary.currencies).map((c) => c.name).join(", ")}</p>
              </div>
            </div>
          ) : null}
          {primary?.languages ? (
            <div className="festival-travel-fact">
              <Languages size={18} />
              <div>
                <h4>Primary language</h4>
                <p>{Object.values(primary.languages).slice(0, 2).join(", ")}</p>
              </div>
            </div>
          ) : null}
          {primary?.capital ? (
            <div className="festival-travel-fact">
              <Plane size={18} />
              <div>
                <h4>Gateway city</h4>
                <p>{primary.capital[0]}</p>
              </div>
            </div>
          ) : null}
        </div>

        {tips.length ? (
          <ul className="festival-travel-tips">
            {tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
