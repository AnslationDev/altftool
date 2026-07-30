import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";
import { getRelatedContent, RelatedContentSection } from "@/platform/linking";
import { TOOLS } from "../toolsData";
import PageView from "./PageView";

const TITLE_SUFFIX = {
  "Page Tools": "Free Online PDF Tool",
  Convert: "Free Online Converter",
  Enhance: "Free Online PDF Editor",
  Security: "Free PDF Security Tool",
  Inspect: "Free Online PDF Checker",
  "Image Tools": "Free Online Image Tool",
  Advanced: "Free Online PDF Tool",
};

const DESCRIPTION_SUFFIX = {
  "Page Tools":
    "Runs free in your browser — drop in a file, adjust the pages, then download the new PDF.",
  Convert:
    "Converts free in your browser — nothing is uploaded and the result downloads instantly.",
  Enhance:
    "Free in your browser at AltFTool — no signup or install, and your document is never uploaded.",
  Security:
    "Free in your browser at AltFTool — passwords and page content stay on your device.",
  Inspect:
    "Free in your browser at AltFTool — open a file and read the results, nothing uploaded.",
  "Image Tools":
    "Free in your browser at AltFTool — the image is processed on your device, then downloads.",
  Advanced:
    "Free in your browser at AltFTool — no signup, no install, and files are processed on your device.",
};

function getToolLabel(tool) {
  return tool.name.replace(/→/g, "to").replace(/\s+/g, " ").trim();
}

function buildKeywords(tool) {
  const label = getToolLabel(tool).toLowerCase();
  const slugWords = tool.slug.replace(/-/g, " ");
  const scope = tool.category === "Image Tools" ? "free image tools" : "free pdf tools";

  return [
    ...new Set([
      label,
      `${label} online`,
      `free ${label}`,
      `online ${slugWords} tool`,
      slugWords,
      scope,
    ]),
  ];
}

export async function generateMetadata({ params }) {
  const { toolSlug } = await params;
  const tool = TOOLS.find((item) => item.slug === toolSlug);
  const path = `/altflovepdf/${toolSlug}`;

  if (!tool) {
    return createPageMetadata({
      title: "PDF Tool Not Found",
      description:
        "This PDF tool does not exist. Browse the full AltFTool PDF toolkit to merge, split, convert, compress, protect and edit your files.",
      path,
      noindex: true,
    });
  }

  const label = getToolLabel(tool);
  const suffix = TITLE_SUFFIX[tool.sidebarCategory] || "Free Online PDF Tool";

  return createPageMetadata({
    title: `${label} — ${suffix}`,
    description: `${tool.desc} ${DESCRIPTION_SUFFIX[tool.sidebarCategory] || DESCRIPTION_SUFFIX.Advanced}`,
    keywords: buildKeywords(tool),
    path,
  });
}

export default async function Page(props) {
  const { toolSlug } = await props.params;
  const tool = TOOLS.find((item) => item.slug === toolSlug);
  const relatedItems = tool
    ? getRelatedContent({
        source: {
          href: `/altflovepdf/${toolSlug}`,
          title: tool.name,
          description: tool.desc,
          tags: [tool.category, tool.sidebarCategory].filter(Boolean),
          section: "pdfTools",
        },
        slots: [
          { sections: ["blogs", "top9"], limit: 2 },
          { sections: ["tools", "calculators", "imageTools"], limit: 2 },
          { sections: ["experiences", "hubs"], limit: 2, minScore: 0 },
        ],
      })
    : [];

  return (
    <>
      {/* These pages had an ItemList from the related-content band but no
          entity describing the tool itself, so an answer engine could see what
          a PDF page links to and not what it does. */}
      {tool ? (
        <JsonLd
          id={`altflovepdf-schema-${toolSlug}`}
          data={[
            createToolJsonLd({
              slug: toolSlug,
              path: `/altflovepdf/${toolSlug}`,
              tool: {
                name: getToolLabel(tool),
                description: tool.desc,
                category: tool.category || "PDF",
              },
            }),
            createBreadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "PDF Tools", path: "/altflovepdf" },
              { name: getToolLabel(tool), path: `/altflovepdf/${toolSlug}` },
            ]),
          ]}
        />
      ) : null}
      <PageView {...props} />
      <RelatedContentSection
        title="Related tools & guides"
        items={relatedItems}
        path={`/altflovepdf/${toolSlug}`}
        jsonLdName="Related tools & guides"
      />
    </>
  );
}
