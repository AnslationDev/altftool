import { Megaphone } from "lucide-react";

import AdCard from "./AdCard";
import { Note, SectionHead } from "./primitives";
import { T } from "../i18n/T";

/**
 * Promoted shelf.
 *
 * A horizontal rail rather than a grid, so paid placement reads as a distinct
 * strip instead of quietly occupying the top row of the organic results. The
 * note is not boilerplate: if a slot is sold, the page has to say so, and it
 * also has to say what is *not* sold — otherwise the disclosure implies the
 * whole page is pay-to-rank.
 *
 * @param {{ listings: Array<object> }} props
 */
export default function HomeSpotlightRail({ listings = [] }) {
  if (listings.length === 0) return null;

  return (
    <section className="bzr-section" aria-label="Spotlight ads">
      <div className="section-container">
        <SectionHead title={<T id="home.spotlight.title" fallback="Spotlight ads" />} />

        <Note icon={Megaphone}>
          These are promoted placements — sellers pay to appear in this strip. Everything below,
          in Fresh recommendations, is ordered by how recently it was posted and cannot be bought.
        </Note>

        <div className="bzr-rail mt-4">
          {listings.map((listing) => (
            <AdCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  );
}
