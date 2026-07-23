import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("sentinel-secure");

export default function SentinelSecureLayout({ children }) {
  return children;
}
