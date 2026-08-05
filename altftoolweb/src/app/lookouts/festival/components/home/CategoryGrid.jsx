import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "../../data/categories";
import { getFestivalsByCategory } from "../../lib/getFestivals";
import { getIcon } from "../shared/iconMap";
import Reveal from "../shared/Reveal";

export default function CategoryGrid() {
  return (
    <section className="festival-section festival-section--tint" id="categories">
      <div className="festival-section-inner">
        <div className="section-header">
          <div>
            <p className="section-label">Browse By Type</p>
            <h2>Festival Categories</h2>
          </div>
          <Link href="/lookouts/festival/calendar" className="see-all">
            See all categories <ArrowRight size={14} />
          </Link>
        </div>

        <div className="category-grid">
          {CATEGORIES.map((category, index) => {
            const Icon = getIcon(category.icon);
            const count = getFestivalsByCategory(category.slug).length;
            return (
              <Reveal key={category.slug} delay={index * 0.04}>
                <Link href={`/lookouts/festival/category/${category.slug}`} className="category-card">
                  <span className={`category-icon category-icon--${category.tint}`}>
                    <Icon size={20} />
                  </span>
                  <h3>{category.name}</h3>
                  <p>{count} festivals</p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
