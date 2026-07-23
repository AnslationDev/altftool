import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("sidingworks");

export default function SidingWorksLayout({ children }) {
  return children;
}
