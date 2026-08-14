import "../globals.css";
import React from "react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";

import AltfLauncher from "@/app/_altf/AltfLauncher";
import "@/app/_altf/altf-brand.css";

// Shared by the metadata and the JSON-LD so the snippet and the schema always
// describe the same thing.
const DESCRIPTION =
  "Run fictional cinematic terminal interfaces for demos, streams, and harmless creative play.";
const TOPICS = [
  "terminal simulator",
  "cinematic code screen",
  "fake terminal",
  "creative simulator",
];

export const metadata = createPageMetadata({
  title: "AltF Code Theater | Cinematic Terminal Simulator",
  description: DESCRIPTION,
  path: "/geektyper",
  keywords: TOPICS,
  pageType: "interactive-experience",
});

export default function CodeTheaterLayout({ children }) {
  // The JSON-LD lives here rather than in page.jsx because page.jsx is
  // "use client" and this layout wraps exactly one URL — /geektyper has no
  // subroutes.
  //
  // SoftwareApplication/WebApplication + BreadcrumbList. The description keeps
  // the word "fictional": the modules in data/INDUSTRIAL_MATRIX.js are named
  // after intrusion tools and print scripted output, so the entity has to say
  // plainly that nothing here does what it depicts.
  //
  // No ItemList of the twelve modules — ModuleLoader opens each one inside this
  // same page, none has a URL of its own.
  return (
    <div
      className="geek2-root-sandbox flex min-h-screen w-screen flex-col justify-between overflow-hidden bg-background text-primary antialiased selection:bg-primary/30"
      style={{ colorScheme: "dark" }}
    >
      <JsonLd
        id="geektyper-schema"
        data={[
          createToolJsonLd({
            slug: "geektyper",
            path: "/geektyper",
            tool: {
              name: "AltF Code Theater",
              description: DESCRIPTION,
              category: ["Entertainment", "Simulator"],
              topics: TOPICS,
            },
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "AltF Code Theater", path: "/geektyper" },
          ]),
        ]}
      />
      {/* Main viewport only; global footer comes from the root layout. */}
      <div className="flex-1 w-full relative min-h-0">{children}</div>
      <AltfLauncher />
    </div>
  );
}
