import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RELIGIONS } from "../../data/religions";
import { getFestivalsByReligion } from "../../lib/getFestivals";
import { getIcon } from "../shared/iconMap";
import Reveal from "../shared/Reveal";

export default function ReligionGrid() {
  return (
    <section className="festival-section" id="religions">
      <div className="festival-section-inner">
        <div className="section-header">
          <div>
            <p className="section-label">By Faith</p>
            <h2>Religion-Based Festivals</h2>
          </div>
          <Link href="/lookouts/festival/calendar" className="see-all">
            Explore all religions <ArrowRight size={14} />
          </Link>
        </div>

        <div className="religion-grid">
          {RELIGIONS.map((religion, index) => {
            const Icon = getIcon(religion.icon);
            const festivals = getFestivalsByReligion(religion.slug);
            const countryCount = new Set(festivals.flatMap((f) => f.countryCodes)).size;

            return (
              <Reveal key={religion.slug} delay={index * 0.03}>
                <Link href={`/lookouts/festival/religion/${religion.slug}`} className="religion-card">
                  <div className="religion-card-top">
                    <span className={`religion-icon religion-icon--${religion.tint}`}>
                      <Icon size={20} />
                    </span>
                    <span className="religion-count">{festivals.length}+</span>
                  </div>
                  <h3>{religion.name}</h3>
                  <p>{countryCount} countries celebrating</p>
                  <ul>
                    {festivals.slice(0, 3).map((f) => (
                      <li key={f.slug}>
                        <span className={`dot dot--${religion.tint}`} /> {f.name}
                      </li>
                    ))}
                  </ul>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
