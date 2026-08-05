import { Star } from "lucide-react";

export default function TraditionsSection({ festival }) {
  return (
    <section className="festival-section festival-section--tint" id="traditions">
      <div className="festival-section-inner festival-detail-narrow">
        <div className="section-header">
          <div>
            <p className="section-label">
              <Star size={13} style={{ display: "inline", marginRight: 6 }} />
              Customs &amp; Practices
            </p>
            <h2>Traditions</h2>
          </div>
        </div>
        <p className="festival-detail-body">
          The customs practised during {festival.name} vary by region, but these are the most widely recognised.
        </p>
        <div className="chip-list festival-food-chips">
          {festival.traditions.map((tradition) => (
            <span key={tradition} className="chip">
              {tradition}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
