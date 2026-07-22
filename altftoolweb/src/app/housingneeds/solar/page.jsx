import HnVerticalPage from "../_components/HnVerticalPage";
import { buildVerticalMetadata } from "../_lib/seo";

export const metadata = buildVerticalMetadata("solar");

export default function Page() {
  return <HnVerticalPage slug="solar" />;
}
