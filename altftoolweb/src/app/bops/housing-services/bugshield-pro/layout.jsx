import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("bugshield-pro");

export default function BugShieldProLayout({ children }) {
  return children;
}
