import BazaarShell from "../components/BazaarShell";
import { Breadcrumbs } from "../components/primitives";
import FavouritesClient from "./FavouritesClient";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import "../bazaar.css";

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "AltF Bazaar", path: "/bazaar" },
  { name: "Saved ads", path: "/bazaar/favourites" },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "Saved ads on AltF Bazaar",
    description:
      "Every ad you saved on AltF Bazaar in one grid, so you can compare prices and localities before you message a seller.",
    path: "/bazaar/favourites",
    noindex: true,
  });
}

export default function FavouritesPage() {
  return (
    <BazaarShell>
      <div className="section-container">
        <Breadcrumbs items={CRUMBS} />
        <header className="bzr-section-head">
          <h1 className="bzr-section-title">Saved ads</h1>
        </header>
        <FavouritesClient />
      </div>
    </BazaarShell>
  );
}
