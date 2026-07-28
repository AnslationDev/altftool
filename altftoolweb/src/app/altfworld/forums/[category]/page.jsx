import { CategoryView } from "../../components/community/Views";
import { buildAltfWorldMetadata, formatAltfWorldSlug } from "../../seo";
import { getCategoryBySlug } from "../data/forums";

export async function generateMetadata({ params }) {
  const { category } = await params;
  const categoryMeta = getCategoryBySlug(category);
  const label = categoryMeta?.name || formatAltfWorldSlug(category);

  return buildAltfWorldMetadata({
    title: `${label} Forums — AltfWorld`,
    description: `Browse AltfWorld discussions, threads, and resources for ${label.toLowerCase()} builders and tool users.`,
    path: `/altfworld/forums/${category}`,
    keywords: [label, "AltfWorld forums"],
  });
}

export default async function CategoryPage({ params }) {
  const { category } = await params;
  return <CategoryView slug={category} />;
}
