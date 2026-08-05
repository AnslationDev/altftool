import { Landmark, Sparkle, MapPin, Clock, Users } from "lucide-react";
import { getReligion } from "../../data/religions";
import { getCategory } from "../../data/categories";
import { getCountryName } from "../../data/countryNames";

export default function FestivalOverviewSection({ festival }) {
  const religion = getReligion(festival.religion);
  const category = getCategory(festival.category);

  const facts = [
    { icon: Landmark, label: "Religion", value: religion?.name || festival.religion },
    { icon: Sparkle, label: "Category", value: category?.name || festival.category },
    { icon: MapPin, label: "Celebrated in", value: festival.countryCodes.map(getCountryName).join(", ") },
    { icon: Clock, label: "Duration", value: `${festival.durationDays} day${festival.durationDays > 1 ? "s" : ""}` },
    { icon: Users, label: "Reach", value: festival.regionLabel },
  ];

  return (
    <section className="festival-section" id="overview">
      <div className="festival-section-inner festival-detail-narrow">
        <div className="section-header">
          <div>
            <p className="section-label">Festival Overview</p>
            <h2>What is {festival.name}?</h2>
          </div>
        </div>

        <p className="festival-detail-body">{festival.tagline}</p>

        <div className="festival-overview-facts">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="festival-overview-fact">
              <Icon size={16} />
              <div>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
