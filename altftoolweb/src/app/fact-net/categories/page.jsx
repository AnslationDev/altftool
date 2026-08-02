import Categories from "../pages/Categories";
import { getAllCategories } from "../data/factNetData";
import { toMetaSnippet } from "../metaSnippet";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  // "Browse 5 categories from the original AltFTool Fact Hub catalog." was 64
  // characters served — below the 70 a snippet needs, and it named none of the
  // five. Listing the real category names comes straight from the catalog, so
  // it stays true if a category is added or renamed, and toMetaSnippet clips at
  // a comma rather than mid-word if the list ever outgrows the 158-char budget.
  const names = getAllCategories().map((category) => category.name);
  const list =
    names.length > 1
      ? `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`
      : names[0] || "";

  return createPageMetadata({
    title: "Fact Hub Categories",
    description: toMetaSnippet(
      `Browse all ${names.length} Fact Hub categories: ${list}.`,
    ),
    path: "/fact-net/categories",
  });
}

export default function Page() {
  return <Categories />;
}
