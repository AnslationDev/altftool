import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("freshcoat-interiors");

export default function FreshCoatInteriorsLayout({ children }) {
  return children;
}
