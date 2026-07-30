import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { BASE, TOOLS } from "./data/tools";
import { FAQS } from "./data/faqs";
import HomeClient from "./components/home/HomeClient";

// Every node below mirrors an array this page already renders server-side:
// FAQS is the copy in components/home/FAQ.jsx and TOOLS is the grid in
// components/home/ToolsShowcase.jsx. The hub previously carried only the root
// layout's Organization and WebSite nodes, so the 13 tools it links to and the
// six answers it publishes described nothing an answer engine could cite.
const toolItems = TOOLS.map((tool) => ({
  name: tool.name,
  path: `${BASE}/${tool.slug}`,
}));

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltFLoveImg — Free In-Browser Image Tools",
    description:
      "Compress, convert, resize, crop, rotate, watermark and edit images right in your browser. Private, fast and free image tools.",
    path: "/altfloveimg",
  });
}

export default function AltfLoveImgPage() {
  return (
    <>
      <JsonLd
        id="altfloveimg-home-schema"
        data={[
          createFaqJsonLd({ path: BASE, questions: FAQS }),
          createItemListJsonLd({
            path: BASE,
            name: "ALTF Love IMG browser image tools",
            items: toolItems,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Image Tools", path: BASE },
          ]),
        ]}
      />
      <HomeClient />
    </>
  );
}
