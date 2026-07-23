import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("sunyield-solar");

export default function SunYieldSolarLayout({ children }) {
  return children;
}
