import "../globals.css";
import React from "react";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

import AltfLauncher from "@/app/_altf/AltfLauncher";
import "@/app/_altf/altf-brand.css";
export const metadata = createPageMetadata({
  title: "AltF Code Theater | Cinematic Terminal Simulator",
  description: "Run fictional cinematic terminal interfaces for demos, streams, and harmless creative play.",
  path: "/geektyper",
  keywords: ["terminal simulator", "cinematic code screen", "fake terminal", "creative simulator"],
  pageType: "interactive-experience",
});

export default function CodeTheaterLayout({ children }) {
  return (
    <div
      className="geek2-root-sandbox flex min-h-screen w-screen flex-col justify-between overflow-hidden bg-background text-primary antialiased selection:bg-primary/30"
      style={{ colorScheme: "dark" }}
    >
      {/* Main viewport only; global footer comes from the root layout. */}
      <div className="flex-1 w-full relative min-h-0">{children}</div>
      <AltfLauncher />
    </div>
  );
}
