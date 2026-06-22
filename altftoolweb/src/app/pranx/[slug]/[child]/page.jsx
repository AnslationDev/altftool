import PranxApp from "../../PranxApp";

export default async function Page({ params }) {
  const { slug, child } = await params;
  return <PranxApp slug={`${slug}/${child}`} />;
}
