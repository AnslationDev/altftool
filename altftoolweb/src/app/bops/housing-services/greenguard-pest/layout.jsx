import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("greenguard-pest");

export default function GreenGuardPestLayout({ children }) {
  return children;
}
