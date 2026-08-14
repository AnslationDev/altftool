import { SubcategoryView } from "../../../components/community/Views";
import { buildAltfWorldMetadata, formatAltfWorldSlug } from "../../../seo";

export async function generateMetadata({ params }) {
  const { category, subcategory } = await params;
  const categoryLabel = formatAltfWorldSlug(category);
  const subcategoryLabel = formatAltfWorldSlug(subcategory);

  return buildAltfWorldMetadata({
    title: `${subcategoryLabel} — ${categoryLabel} Forums | AltfWorld`,
    description: `Explore AltfWorld ${subcategoryLabel.toLowerCase()} conversations inside the ${categoryLabel.toLowerCase()} forum category.`,
    path: `/altfworld/forums/${category}/${subcategory}`,
    keywords: [categoryLabel, subcategoryLabel, "AltfWorld threads"],
    // Procedurally generated mock-data listing page — keep it out of search results.
    noindex: true,
  });
}

export default async function SubcategoryPage({ params }) {
  const { category, subcategory } = await params;
  return <SubcategoryView categorySlug={category} subcategorySlug={subcategory} />;
}
