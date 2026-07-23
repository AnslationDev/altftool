import "./index.css";
import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("siding-pros");

export default function SidingLayout({ children }) {
  return children;
}
