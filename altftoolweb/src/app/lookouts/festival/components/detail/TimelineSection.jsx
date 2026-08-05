import { CalendarClock } from "lucide-react";
import { formatDateLabel } from "../../lib/dateMath";

// Distributes the festival's own traditions/foods across its real duration
// so multi-day festivals get a day-by-day feel — grounded in the actual
// dataset (not invented events), spread evenly rather than claiming
// precise historical scheduling per day.
function buildTimeline(festival) {
  const days = Math.max(1, festival.durationDays);
  const items = festival.traditions.length ? festival.traditions : [festival.tagline];

  return Array.from({ length: days }, (_, index) => {
    const tradition = items[index % items.length];
    const isFirst = index === 0;
    const isLast = index === days - 1;
    let label = `Day ${index + 1}`;
    if (days === 1) label = "The Day of Celebration";
    else if (isFirst) label = "Day 1 — Opening";
    else if (isLast) label = `Day ${days} — Closing`;

    return { label, tradition };
  });
}

export default function TimelineSection({ festival, dateIso }) {
  const timeline = buildTimeline(festival);

  return (
    <section className="festival-section festival-section--tint" id="timeline">
      <div className="festival-section-inner festival-detail-narrow">
        <div className="section-header">
          <div>
            <p className="section-label">
              <CalendarClock size={13} style={{ display: "inline", marginRight: 6 }} />
              Duration
            </p>
            <h2>{festival.name} Timeline</h2>
          </div>
        </div>

        <ol className="festival-timeline">
          {timeline.map((entry, index) => (
            <li key={entry.label} className="festival-timeline-item">
              <span className="festival-timeline-dot" />
              <div>
                <h4>
                  {entry.label}
                  {index === 0 && dateIso ? ` · ${formatDateLabel(dateIso)}` : ""}
                </h4>
                <p>{entry.tradition}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
