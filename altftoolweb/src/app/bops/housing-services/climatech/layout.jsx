import "./globals.css";
import { buildHousingServiceMetadata } from "@/app/bops/housing-services/_lib/metadata";

export const metadata = buildHousingServiceMetadata("climatech");

export default function HVACLayout({ children }) {
  return (
    <div className="antialiased">
      {children}
    </div>
  );
}
