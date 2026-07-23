import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("ecovolt-solar");

export default function EcoVoltSolarLayout({ children }) {
  return children;
}
