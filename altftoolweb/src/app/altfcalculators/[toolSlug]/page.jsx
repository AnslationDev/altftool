import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { CALCULATORS } from "../toolsData";
import PageView from "./PageView";

function formatToolName(slug) {
  return String(slug || "Calculator")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }) {
  const { toolSlug } = await params;
  const tool = CALCULATORS.find((item) => item.slug === toolSlug);
  const toolName = tool?.name || formatToolName(toolSlug);

  return createPageMetadata({
    title: `${toolName} — Free Online Calculator`,
    description:
      tool?.desc ||
      `Use the free ${toolName} online. Fast, accurate and 100% private — it runs entirely in your browser.`,
    path: `/altfcalculators/${toolSlug}`,
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
