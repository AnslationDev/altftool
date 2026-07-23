import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("helios-solar");

export default function HeliosSolarLayout({ children }) {
  return children;
}
