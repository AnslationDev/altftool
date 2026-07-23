import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("airflow-masters");

export default function AirFlowMastersLayout({ children }) {
  return children;
}
