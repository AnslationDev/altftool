import { buildServiceMetadata } from "../../_lib/seo";
import "./index.css";

export const metadata = buildServiceMetadata("pest-control", "pest-control");

export default function PestControlLayout({ children }) {
  return <div className="pest-control-route">{children}</div>;
}
