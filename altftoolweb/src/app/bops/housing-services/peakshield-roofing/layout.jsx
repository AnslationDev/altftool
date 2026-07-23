import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("peakshield-roofing");

export default function PeakShieldRoofingLayout({ children }) {
  return children;
}
