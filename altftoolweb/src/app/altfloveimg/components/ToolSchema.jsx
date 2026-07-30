// Server component — emits the route-authored SoftwareApplication +
// BreadcrumbList pair for one Altf LoveImg tool page. Must stay server-only
// (no "use client"): the nodes belong in the HTML, not the client bundle.
//
// Every /altfloveimg tool route is indexable but carried only the layout's
// Organization and WebSite nodes, so it described no software at all — while
// the directly comparable /altflovepdf and /altfcalculators tool pages both
// ship this pair. These routes are static segments, not one dynamic segment,
// so each page renders <ToolSchema slug="…" /> and the schema logic lives here
// once instead of in 13 near-identical files.

import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";
import { BASE, getTool } from "../data/tools";

// The registry's `category` ("organize" | "convert" | "create" | "ai") is a UI
// filter bucket, not something an answer engine can use, so the schema values
// live here: applicationCategory is the schema.org term that is true of every
// tool in this family, and applicationSubCategory carries the per-tool detail.
// Keeping these strings out of data/tools.js keeps them out of the client
// bundle — data/tools.js is imported by client components.
const APPLICATION_CATEGORY = "MultimediaApplication";

const SCHEMA_META = {
  compress: {
    subCategory: "Image Compression",
    topics: ["compress image", "reduce image file size"],
  },
  resize: {
    subCategory: "Image Resizing",
    topics: ["resize image", "change image dimensions"],
  },
  crop: {
    subCategory: "Image Cropping",
    topics: ["crop image", "social media image sizes"],
  },
  rotate: {
    subCategory: "Image Rotation",
    topics: ["rotate image", "flip image"],
  },
  "jpg-to-png": {
    subCategory: "Image Conversion",
    topics: ["jpg to png", "convert jpg to png"],
  },
  "png-to-jpg": {
    subCategory: "Image Conversion",
    topics: ["png to jpg", "convert png to jpg"],
  },
  "webp-to-jpg": {
    subCategory: "Image Conversion",
    topics: ["webp to jpg", "convert webp to jpg"],
  },
  "jpg-to-webp": {
    subCategory: "Image Conversion",
    topics: ["jpg to webp", "convert jpg to webp"],
  },
  watermark: {
    subCategory: "Image Watermarking",
    topics: ["watermark image", "add a logo to a photo"],
  },
  editor: {
    subCategory: "Photo Editing",
    topics: ["image editor", "adjust brightness and contrast"],
  },
  meme: {
    subCategory: "Meme Creation",
    topics: ["meme generator", "add text to an image"],
  },
  "background-remover": {
    subCategory: "Background Removal",
    topics: ["remove image background", "transparent png"],
    // The registry copy sells the roadmap ("AI-ready architecture"); schema has
    // to describe what the shipped route actually does.
    description:
      "Remove image backgrounds on your device and export a transparent PNG. Nothing is uploaded.",
  },
  upscaler: {
    subCategory: "Image Upscaling",
    topics: ["upscale image", "enlarge image"],
    description:
      "Upscale and sharpen images up to 4× on your device, compare before and after, then download.",
  },
};

export default function ToolSchema({ slug }) {
  const tool = getTool(slug);
  if (!tool) return null;

  const meta = SCHEMA_META[slug] || {};
  const path = `${BASE}/${slug}`;

  return (
    <JsonLd
      id={`altfloveimg-schema-${slug}`}
      data={[
        createToolJsonLd({
          slug,
          path,
          tool: {
            name: tool.name,
            description: meta.description || tool.description,
            category: [APPLICATION_CATEGORY, meta.subCategory].filter(Boolean),
            topics: meta.topics,
          },
        }),
        createBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Image Tools", path: BASE },
          { name: tool.name, path },
        ]),
      ]}
    />
  );
}
