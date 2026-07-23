import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("polarflame");

export default function PolarFlameLayout({ children }) {
  return children;
}
