import { buildServiceMetadata } from "../../_lib/seo";

export const metadata = buildServiceMetadata("windows", "window-replacement");

export default function WindowReplacementLayout({ children }) {
  return <div className="window-replacement-route">{children}</div>;
}
