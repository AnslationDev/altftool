import BazaarShell from "../components/BazaarShell";
import { Breadcrumbs } from "../components/primitives";
import CompareClient from "./CompareClient";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import "../bazaar.css";

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "AltF Bazaar", path: "/bazaar" },
  { name: "Compare ads", path: "/bazaar/compare" },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "Compare ads on AltF Bazaar",
    description:
      "Put up to four AltF Bazaar ads side by side — price, kilometres, year, warranty and every category spec in one matrix, with the objectively better number marked.",
    path: "/bazaar/compare",
    // Per-visitor surface: the selection lives in this browser's localStorage,
    // so there is nothing stable here for a crawler to index.
    noindex: true,
  });
}

export default function ComparePage() {
  return (
    <BazaarShell>
      <div className="section-container">
        <Breadcrumbs items={CRUMBS} />
        <header className="bzr-section-head">
          <h1 className="bzr-section-title">Compare ads</h1>
        </header>
        <CompareClient />
      </div>
    </BazaarShell>
  );
}
