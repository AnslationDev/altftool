// src/app/tradeon/workspace/page.jsx
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import WorkspaceClient from "../components/workspace/WorkspaceClient";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Multi-Screen Workspace — Tradeon",
    description:
      "A professional multi-screen trading workstation: split into up to 16 fully independent charts, each with its own asset, timeframe, indicators and prediction.",
    path: "/tradeon/workspace",
    keywords: ["multi-screen charts", "trading workstation", "independent charts", "multi chart layout"],
    type: "website",
  });
}

export default function TradeonWorkspacePage() {
  return <WorkspaceClient />;
}
