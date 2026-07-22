import "./globals.css";
import { buildServiceMetadata } from "../../_lib/seo";

export const metadata = buildServiceMetadata("hvac", "climatech");

export default function HVACLayout({ children }) {
  return (
    <div className="climatech-route antialiased">
      {children}
    </div>
  );
}
