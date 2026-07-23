import LandingPage from "./pages/LandingPage.jsx";
import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("plumber");

export default function PlumbingLandingPage() {
  return <LandingPage />;
}
