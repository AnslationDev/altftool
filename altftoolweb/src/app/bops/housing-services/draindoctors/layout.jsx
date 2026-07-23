import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("draindoctors");

export default function DrainDoctorsLayout({ children }) {
  return children;
}
