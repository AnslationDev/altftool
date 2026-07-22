import HnVerticalPage from "../_components/HnVerticalPage";
import { buildVerticalMetadata } from "../_lib/seo";

export const metadata = buildVerticalMetadata("siding");

export default function Page() {
  return <HnVerticalPage slug="siding" />;
}
