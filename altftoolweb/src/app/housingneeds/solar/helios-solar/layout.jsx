import { buildServiceMetadata } from "../../_lib/seo";

export const metadata = buildServiceMetadata("solar", "helios-solar");

export default function HeliosSolarLayout({ children }) {
  return children;
}
