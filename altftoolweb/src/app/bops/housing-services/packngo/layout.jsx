import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("packngo");

export default function PackNGoLayout({ children }) {
  return children;
}
