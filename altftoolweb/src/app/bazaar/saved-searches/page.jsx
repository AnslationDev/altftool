import BazaarShell from "../components/BazaarShell";
import { Breadcrumbs } from "../components/primitives";
import SavedSearchesClient from "./SavedSearchesClient";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import "../bazaar.css";

/**
 * Saved searches — /bazaar/saved-searches
 *
 * A per-visitor surface backed entirely by localStorage, so it is `noindex`
 * for the same reason /bazaar/favourites and /bazaar/my-ads are: there is no
 * shared page here for a crawler to index, only this browser's state.
 *
 * The route is not registered in `platform/navigation/siteRoutes.js` — that
 * file belongs to the navigation owner.
 */

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "AltF Bazaar", path: "/bazaar" },
  { name: "Saved searches", path: "/bazaar/saved-searches" },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "Saved searches on AltF Bazaar",
    description:
      "Every filter set you saved on AltF Bazaar, ready to re-run in one tap — brand, city, price band and condition exactly as you left them.",
    path: "/bazaar/saved-searches",
    noindex: true,
  });
}

export default function SavedSearchesPage() {
  return (
    <BazaarShell>
      <div className="section-container">
        <Breadcrumbs items={CRUMBS} />
        <header className="bzr-section-head">
          <h1 className="bzr-section-title">Saved searches</h1>
        </header>
        <SavedSearchesClient />
      </div>
    </BazaarShell>
  );
}
