import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("tiletrend-bath");

export default function TileTrendBathLayout({ children }) {
  return children;
}
