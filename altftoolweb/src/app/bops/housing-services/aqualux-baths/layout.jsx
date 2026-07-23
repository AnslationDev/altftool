import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("aqualux-baths");

export default function AquaLuxBathsLayout({ children }) {
  return children;
}
