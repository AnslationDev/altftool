import { Utensils } from "lucide-react";

export default function FoodSection({ festival }) {
  if (!festival.foods.length) return null;

  return (
    <section className="festival-section" id="food">
      <div className="festival-section-inner festival-detail-narrow">
        <div className="section-header">
          <div>
            <p className="section-label">
              <Utensils size={13} style={{ display: "inline", marginRight: 6 }} />
              Flavours of the Celebration
            </p>
            <h2>Food &amp; Culture</h2>
          </div>
        </div>
        <p className="festival-detail-body">
          No {festival.name} celebration is complete without its signature dishes, shared with family and community
          throughout the festivities.
        </p>
        <div className="chip-list festival-food-chips">
          {festival.foods.map((food) => (
            <span key={food} className="chip">
              {food}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
