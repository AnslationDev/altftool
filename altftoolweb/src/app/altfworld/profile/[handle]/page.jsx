import { ProfileView } from "../../components/community/Views";
import { buildAltfWorldMetadata, formatAltfWorldSlug } from "../../seo";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const handle = resolvedParams.handle || "user";
  const label = formatAltfWorldSlug(handle);

  return buildAltfWorldMetadata({
    title: `${label} — AltfWorld Profile`,
    description: `View ${label}'s AltfWorld community profile, builder context, and shared activity.`,
    path: `/altfworld/profile/${handle}`,
    keywords: [label, "AltfWorld profile"],
    // One of ~5,000 procedurally generated mock profiles — must not be
    // indexed as if it were a real person.
    noindex: true,
  });
}

export default async function UserProfilePage({ params }) {
  const resolvedParams = await params;
  return <ProfileView handle={resolvedParams.handle} />;
}
