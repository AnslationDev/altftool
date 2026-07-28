import { ThreadView } from "../../../../components/community/Views";

export default async function ThreadPage({ params }) {
  const { thread } = await params;
  return <ThreadView slug={thread} />;
}
