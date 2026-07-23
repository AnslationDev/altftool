import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("nightwatch-security");

export default function NightWatchSecurityLayout({ children }) {
  return children;
}
