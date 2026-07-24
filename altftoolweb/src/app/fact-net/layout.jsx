import "./fact-net.css";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "Fact Hub",
  description:
    "Explore an original Fact-Net hub with owned topic pages, generated local images, fast search, and export-friendly fact guides.",
  path: "/fact-net",
  keywords: ["facts", "fact guides", "topic facts", "Fact-Net"],
});

import Footer from "@/platform/navigation/Footer";

export default function FactNetLayout({ children }) {
  return (
    <>
      <div className="fn-scope">{children}</div>
      <Footer />
    </>
  );
}
