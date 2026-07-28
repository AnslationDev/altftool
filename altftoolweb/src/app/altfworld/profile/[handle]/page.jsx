import { ProfileView } from "../../components/community/Views";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  return {
    title: `${resolvedParams.handle || "User"} — AltfWorld Profile`,
  };
}

export default async function UserProfilePage({ params }) {
  const resolvedParams = await params;
  return <ProfileView handle={resolvedParams.handle} />;
}
