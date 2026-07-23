import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("pipeworks-pro");

export default function PipeWorksProLayout({ children }) {
  return children;
}
