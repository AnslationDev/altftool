import BazaarShell from "../components/BazaarShell";
import { Breadcrumbs } from "../components/primitives";
import MyAdsClient from "./MyAdsClient";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import "../bazaar.css";

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "AltF Bazaar", path: "/bazaar" },
  { name: "My ads", path: "/bazaar/my-ads" },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "My ads on AltF Bazaar",
    description:
      "Manage the ads you posted on AltF Bazaar: edit the title or price, mark an item sold, or delete a listing. Stored in your browser only.",
    path: "/bazaar/my-ads",
    noindex: true,
  });
}

export default function MyAdsPage() {
  return (
    <BazaarShell>
      <div className="section-container">
        <Breadcrumbs items={CRUMBS} />
        <header className="bzr-section-head">
          <h1 className="bzr-section-title">My ads</h1>
        </header>
        <MyAdsClient />
      </div>
    </BazaarShell>
  );
}
