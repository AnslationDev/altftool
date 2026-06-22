import AppsListingClient from "./components/AppsListingClient";
import { apps } from "./data/apps";

export const metadata = {
  title: "Android Apps - Download Official APKs",
  description:
    "Browse and download official AltFTool Android APKs for speed testing, storage cleanup, grammar help, and PDF OCR scanning.",
  alternates: {
    canonical: "/apps",
  },
};

export default async function AppsPage({ searchParams }) {
  const params = await searchParams;
  const searchQuery = typeof params?.q === "string" ? params.q : "";

  return <AppsListingClient apps={apps} searchQuery={searchQuery} />;
}
