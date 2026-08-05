import { Globe, CalendarDays, Landmark, Flag, Sun, Sparkles } from "lucide-react";
import { CATEGORIES } from "../../data/categories";

export default function StatsBand({ stats }) {
  const items = [
    { icon: Globe, value: stats.countries, label: "Countries Covered" },
    { icon: CalendarDays, value: `${stats.festivals}+`, label: "Festivals Listed" },
    { icon: Landmark, value: stats.religions, label: "Religions Covered" },
    { icon: Flag, value: CATEGORIES.length, label: "Categories" },
    { icon: Sun, value: stats.festivals, label: "Real, Verified Entries" },
    { icon: Sparkles, value: "Live", label: "Dates & Data" },
  ];

  return (
    <section className="festival-stats-band">
      <div className="festival-section-inner">
        <p className="section-label festival-stats-label">By the Numbers</p>
        <h2 className="festival-stats-heading">World Festival Hub in Numbers</h2>
        <div className="festival-stats-grid">
          {items.map(({ icon: Icon, value, label }) => (
            <div key={label} className="festival-stat-tile">
              <span className="festival-stat-icon">
                <Icon size={20} />
              </span>
              <strong>{value}</strong>
              <label>{label}</label>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
