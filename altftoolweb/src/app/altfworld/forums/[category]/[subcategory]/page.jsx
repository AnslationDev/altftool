import { CategoryView } from "../../../components/community/Views";

export default async function SubcategoryPage({ params }) {
  const { category } = await params;
  return <CategoryView slug={category} />;
}
