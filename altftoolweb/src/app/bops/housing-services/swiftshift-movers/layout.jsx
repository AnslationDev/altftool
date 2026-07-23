import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("swiftshift-movers");

export default function SwiftShiftMoversLayout({ children }) {
  return children;
}
