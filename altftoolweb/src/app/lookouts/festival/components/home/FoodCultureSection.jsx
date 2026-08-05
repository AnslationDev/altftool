import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FOOD_CULTURE } from "../../data/foodCulture";
import { getFestivalBySlug } from "../../lib/getFestivals";
import { countryCodeToFlagEmoji } from "../../lib/flagEmoji";
import Reveal from "../shared/Reveal";

export default function FoodCultureSection({ photos = {} }) {
  return (
    <section className="festival-section" id="food">
      <div className="festival-section-inner">
        <div className="section-header">
          <div>
            <p className="section-label">Flavours of Celebration</p>
            <h2>Festival Foods &amp; Culture</h2>
          </div>
          <Link href="/lookouts/festival/calendar" className="see-all">
            Explore food traditions <ArrowRight size={14} />
          </Link>
        </div>

        <div className="food-culture-grid">
          {FOOD_CULTURE.map((item, index) => {
            const festival = getFestivalBySlug(item.festivalSlug);
            const photo = photos[item.food];
            return (
              <Reveal key={item.food} delay={index * 0.03}>
                <Link href={`/lookouts/festival/${item.festivalSlug}`} className="food-culture-card">
                  <div className="food-culture-image">
                    {photo?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo.url} alt={photo.alt || item.food} />
                    ) : (
                      <div className="festival-card-placeholder" aria-hidden="true">
                        <span>🍽️</span>
                      </div>
                    )}
                  </div>
                  <div className="food-culture-body">
                    <h3>{item.food}</h3>
                    <p>
                      {countryCodeToFlagEmoji(item.countryCode)} {festival?.name}
                    </p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
