import { createPageMetadata } from "@/platform/seo/generateMetadata";
import MemeClient from "./MemeClient";

export async function generateMetadata() {
  return createPageMetadata({
  title: "Meme Generator — Top & Bottom Text",
  description:
    "Create classic memes with customizable fonts, colors and outline. Live preview and one-click export. Free and in-browser.",
  path: "/altfloveimg/meme",
});
}

export default function Page() {
  return <MemeClient />;
}
