import { ThreadView } from "../../../../components/community/Views";
import { buildAltfWorldMetadata, formatAltfWorldSlug } from "../../../../seo";

export async function generateMetadata({ params }) {
  const { category, subcategory, thread } = await params;
  const threadLabel = formatAltfWorldSlug(thread);
  const subcategoryLabel = formatAltfWorldSlug(subcategory);

  return buildAltfWorldMetadata({
    title: `${threadLabel} — AltfWorld Thread`,
    description: `Read the AltfWorld discussion thread about ${threadLabel.toLowerCase()} in ${subcategoryLabel.toLowerCase()}.`,
    path: `/altfworld/forums/${category}/${subcategory}/${thread}`,
    keywords: [threadLabel, subcategoryLabel, "AltfWorld discussion"],
    // One of ~30,000 procedurally generated mock threads with deterministic
    // filler content — must not be indexed as if it were real discussion.
    noindex: true,
  });
}

export default async function ThreadPage({ params }) {
  const { thread } = await params;
  return <ThreadView slug={thread} />;
}
