import ApiStressToolClient from "../../[category]/[slug]/ApiStressToolClient";
import { buildToolMetadata } from "../../toolRouteUtils";

export async function generateMetadata() {
  return buildToolMetadata("api-stress-estimator");
}

export default function Page() {
  return <ApiStressToolClient category="all" />;
}
