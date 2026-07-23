import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("kairos");

export default function KairosPestControlLayout({ children }) {
  return children;
}
