import HnVerticalRoute from "@/app/bops/housingneeds/_components/HnVerticalRoute";
import { buildVerticalMetadata } from "@/app/bops/housingneeds/_lib/seo";

// Vertical pages fetch admin quote config per request, as they did at /housingneeds.
export const dynamic = "force-dynamic";
export const metadata = buildVerticalMetadata("siding");

export default function SidingVerticalPage() {
  return <HnVerticalRoute slug="siding" />;
}
