import HnVerticalRoute from "../_components/HnVerticalRoute";
import { buildVerticalMetadata } from "../_lib/seo";

// Vertical pages fetch admin quote config per request, as the originals do.
export const dynamic = "force-dynamic";
export const metadata = buildVerticalMetadata("flooring");

export default function FlooringVerticalPage() {
  return <HnVerticalRoute slug="flooring" />;
}
