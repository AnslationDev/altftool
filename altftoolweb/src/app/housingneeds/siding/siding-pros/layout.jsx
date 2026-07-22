import "./index.css";
import { buildServiceMetadata } from "../../_lib/seo";

export const metadata = buildServiceMetadata("siding", "siding-pros");

export default function SidingLayout({ children }) {
  return <div className="siding-pros-route">{children}</div>;
}
