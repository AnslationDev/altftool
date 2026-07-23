import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("panecraft");

export default function PaneCraftLayout({ children }) {
  return children;
}
