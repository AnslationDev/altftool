import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("cityhop-movers");

export default function CityHopMoversLayout({ children }) {
  return children;
}
