// Single server layout: carries the lander stylesheet plus the shared
// noindex metadata (the old client layout.js could not export metadata).
import "./index.css";
import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("pest-control");

export default function PestControlLayout({ children }) {
  // The wrapper index.css scopes its design tokens to. Without it those
  // tokens sat at :root and repainted every page visited after this one.
  return <div className="pest-control-page">{children}</div>;
}
