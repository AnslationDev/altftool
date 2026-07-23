import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("guardnest");

export default function GuardNestLayout({ children }) {
  return children;
}
