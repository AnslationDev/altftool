import SketchFlow from "./SketchFlowClient";

export const metadata = {
  title: "SketchFlow - Free Online Whiteboard and Hand-Drawn Diagram Maker",
  description:
    "Use SketchFlow by AltFTool to draw diagrams, flowcharts, notes, arrows, shapes, text, and images on an infinite hand-drawn whiteboard. Export your work as PNG, SVG, or SketchFlow JSON.",
  keywords: [
    "SketchFlow",
    "online whiteboard",
    "Excalidraw alternative",
    "diagram maker",
    "flowchart tool",
    "hand drawn whiteboard",
    "online sketch tool",
    "AltFTool",
  ],
  alternates: {
    canonical: "/sketchflow",
  },
  openGraph: {
    title: "SketchFlow - Free Online Whiteboard and Diagram Maker",
    description:
      "Create hand-drawn diagrams, notes, arrows, shapes, text, and image-based sketches on a fast infinite canvas.",
    url: "/sketchflow",
    siteName: "AltFTool",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SketchFlow - Free Online Whiteboard and Diagram Maker",
    description:
      "Draw, write, upload images, and export your infinite canvas sketches directly in the browser.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SketchFlowStandalonePage() {
  return <SketchFlow />;
}
