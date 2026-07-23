import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("topnotch-roofing");

export default function TopNotchRoofingLayout({ children }) {
  return children;
}
