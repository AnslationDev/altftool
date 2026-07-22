import "./index.css";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
  title: "EliteShield Siding Solutions",
  description:
    "Premium siding installation, replacement, materials comparison, project gallery, and estimate request experience.",
  path: "/Siding",
});
}

export default function SidingLayout({ children }) {
  return <div className="siding-route">{children}</div>;
}
