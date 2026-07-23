import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("cladco-exteriors");

export default function CladCoExteriorsLayout({ children }) {
  return children;
}
