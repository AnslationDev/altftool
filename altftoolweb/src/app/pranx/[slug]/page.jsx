import PranxApp from "../PranxApp";

export default async function Page({ params }) {
  const { slug } = await params;
  return <PranxApp slug={slug} />;
}
