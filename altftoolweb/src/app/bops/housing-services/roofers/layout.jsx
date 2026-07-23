import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("roofers");

export default function RoofersLayout({ children }) {
  return children;
}
