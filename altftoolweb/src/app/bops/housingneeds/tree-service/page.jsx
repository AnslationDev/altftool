import HnVerticalRoute from "@/app/bops/housingneeds/_components/HnVerticalRoute";
import { buildVerticalMetadata } from "@/app/bops/housingneeds/_lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildVerticalMetadata("tree-service");

export default function TreeServiceVerticalPage() {
  return <HnVerticalRoute slug="tree-service" />;
}
