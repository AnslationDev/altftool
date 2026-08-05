import { Sparkles, Clock, Users, Utensils } from "lucide-react";

export default function CelebrationHighlights({ festival }) {
  const highlights = [
    {
      icon: Clock,
      title: `${festival.durationDays} day${festival.durationDays > 1 ? "s" : ""} of celebration`,
      body:
        festival.durationDays > 1
          ? `Observances stretch across ${festival.durationDays} days of rituals and gatherings.`
          : "A single, focused day of observance and celebration.",
    },
    {
      icon: Sparkles,
      title: festival.traditions[0] || "Signature ritual",
      body: `The most recognisable custom of ${festival.name}.`,
    },
    {
      icon: Users,
      title: festival.regionLabel,
      body: `Communities across ${festival.countryCodes.length} countr${festival.countryCodes.length > 1 ? "ies" : "y"} take part.`,
    },
    ...(festival.foods.length
      ? [
          {
            icon: Utensils,
            title: festival.foods[0],
            body: "A signature dish closely associated with the celebration.",
          },
        ]
      : []),
  ];

  return (
    <section className="festival-section festival-section--tint">
      <div className="festival-section-inner">
        <div className="section-header">
          <div>
            <p className="section-label">At a Glance</p>
            <h2>Celebration &amp; Rituals</h2>
          </div>
        </div>

        <div className="festival-highlights-grid">
          {highlights.map(({ icon: Icon, title, body }) => (
            <div key={title} className="festival-highlight-card">
              <span className="religion-icon">
                <Icon size={18} />
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
