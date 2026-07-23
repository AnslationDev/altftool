import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("gutterflow-pros");

export default function GutterFlowProsLayout({ children }) {
  return children;
}
