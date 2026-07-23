import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("pest-killer");

export default function PestKillerLayout({ children }) {
  return children;
}
