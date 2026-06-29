import "./fact-net.css";

export const metadata = {
  metadataBase: new URL("https://altftool.com"),
  title: {
    default: "Fact Hub | AltFTool",
    template: "%s | Fact-Net",
  },
  description:
    "Explore an original Fact-Net hub with owned topic pages, generated local images, fast search, and export-friendly fact guides.",
  alternates: {
    canonical: "/fact-net",
  },
};

import Footer from "@/platform/navigation/Footer";

export default function FactNetLayout({ children }) {
  return (
    <>
      <div className="fn-scope">{children}</div>
      <Footer />
    </>
  );
}
