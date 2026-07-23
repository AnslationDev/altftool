import HnVerticalPage from "./HnVerticalPage";
import "../housingneeds.css";
import "@/app/_altf/altf-brand.css";

/**
 * Mounts a HousingNeeds vertical as a route. Carries the two things the old
 * /housingneeds layout provided — the module stylesheet and the no-JS reveal
 * fallback — so each vertical can now live at its own /bops/housingneeds path
 * without a shared layout.
 */
export default function HnVerticalRoute({ slug }) {
  return (
    <>
      {/* Without scripting the scroll-reveal never runs; force the shown state
          so sections aren't stuck at opacity 0. */}
      <noscript>
        <style>{`.hn-reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>
      <HnVerticalPage slug={slug} />
    </>
  );
}
