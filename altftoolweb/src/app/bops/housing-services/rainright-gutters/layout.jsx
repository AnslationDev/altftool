import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("rainright-gutters");

export default function RainRightGuttersLayout({ children }) {
  return children;
}
