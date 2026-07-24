import HnVerticalRoute from "@/app/bops/housingneeds/_components/HnVerticalRoute";
import { buildVerticalMetadata } from "@/app/bops/housingneeds/_lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildVerticalMetadata("kitchen");

export default function KitchenVerticalPage() {
  return <HnVerticalRoute slug="kitchen" />;
}
