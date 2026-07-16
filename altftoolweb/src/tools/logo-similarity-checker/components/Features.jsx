"use client";

import { Image, Palette, Shapes, Type, Eye, FileDown, BarChart3, Grid3X3, Layers, SlidersHorizontal, ZoomIn, Shield, Zap, RefreshCw, Columns, SplitSquareHorizontal, Download, Printer } from "lucide-react";

const features = [
  { icon: Image, title: "Upload Logos", description: "Upload PNG, SVG, JPG, WEBP. Drag & drop, browse, or paste image URLs." },
  { icon: Palette, title: "Color Analysis", description: "Extract dominant colors, compare palettes, get HEX/RGB values with coverage percentages." },
  { icon: Shapes, title: "Shape Detection", description: "Detect circles, squares, triangles, curves, lines. Analyze geometry and complexity." },
  { icon: Type, title: "Typography Analysis", description: "Detect text presence, estimate font style, boldness, spacing, and alignment." },
  { icon: Eye, title: "Visual Comparison", description: "Side-by-side, overlay with opacity, difference heatmap, and split view with draggable divider." },
  { icon: BarChart3, title: "Similarity Scores", description: "Animated circular scores for overall, shape, color, layout, edge, symmetry, and more." },
  { icon: Layers, title: "Difference Heatmap", description: "Pixel-level difference highlighting shows exactly where logos diverge." },
  { icon: Grid3X3, title: "Image Quality", description: "Analyze resolution, transparency, sharpness, noise, and compression." },
  { icon: SlidersHorizontal, title: "Opacity Slider", description: "Adjust overlay opacity in real-time to compare logo alignment." },
  { icon: ZoomIn, title: "Zoom & Pan", description: "Zoom in/out and pan across logos for detailed inspection." },
  { icon: Columns, title: "Multiple Views", description: "Switch between side-by-side, overlay, split, and difference modes." },
  { icon: SplitSquareHorizontal, title: "Split View", description: "Drag the split divider to compare left/right halves of each logo." },
  { icon: Download, title: "PDF Reports", description: "Generate professional PDF reports with all analysis results and disclaimers." },
  { icon: Printer, title: "Print & Share", description: "Print reports or share results directly from the browser." },
  { icon: RefreshCw, title: "Swap Logos", description: "Instantly swap Logo A and Logo B to reverse the comparison." },
  { icon: Shield, title: "100% Private", description: "All image processing happens in your browser. Nothing is uploaded." },
  { icon: Zap, title: "Fast Processing", description: "Optimized pixel-level algorithms run in milliseconds." },
  { icon: Eye, title: "Design Style", description: "Classify logos as Modern, Minimal, Corporate, Playful, Luxury, Flat, or Gradient." },
];

export default function Features() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-[--foreground]">Compare two logos using AI-powered visual analysis</h2>
          <p className="mt-2 text-[--muted]">Advanced browser-based logo comparison with shape, color, layout, and typography analysis</p>
        </div>
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-xs text-amber-800">
          <p>This tool estimates visual similarity between two uploaded logos. It is intended for design comparison only and should not be used as legal or trademark advice.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="group rounded-xl border border-[--border] bg-[--surface] p-4 transition-all hover:border-primary/30 hover:shadow-md">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-[--foreground]">{f.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-[--muted]">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
