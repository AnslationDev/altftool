// Imports the module stylesheet once for the hub and all seven verticals.
// Kept minimal on purpose: the visual shell (.hn-app / .hn-shell) is applied
// per page so each vertical can set its own data-accent.
import "./housingneeds.css";
import "../business-ops/business-ops.css";
import "@/app/_altf/altf-brand.css";
import HousingNeedsContextBar from "./_components/HousingNeedsContextBar";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function HousingNeedsLayout({ children }) {
  return (
    <>
      {/* With scripting disabled the reveal effect can never run, so force the
          shown state. Without this every .hn-reveal section would stay at
          opacity 0 and the pages would look empty. */}
      <noscript>
        <style>{`.hn-reveal{opacity:1 !important;transform:none !important}`}</style>
      </noscript>
      <HousingNeedsContextBar />
      {children}
    </>
  );
}
