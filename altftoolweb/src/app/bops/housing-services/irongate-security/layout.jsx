import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("irongate-security");

export default function IronGateSecurityLayout({ children }) {
  return children;
}
