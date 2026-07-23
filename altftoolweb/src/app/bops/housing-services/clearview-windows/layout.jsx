import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("clearview-windows");

export default function ClearViewWindowsLayout({ children }) {
  return children;
}
