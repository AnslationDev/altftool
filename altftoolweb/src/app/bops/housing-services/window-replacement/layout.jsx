import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("window-replacement");

export default function WindowReplacementLayout({ children }) {
  return children;
}
