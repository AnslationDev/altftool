import { createPageMetadata } from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import ToolFacts from "../components/ToolFacts";
import { buildToolJsonLd } from "../seo";
import MemeClient from "./MemeClient";
import RelatedToolsBand from "../components/RelatedToolsBand";

export async function generateMetadata() {
  return createPageMetadata({
  title: "Meme Generator — Top & Bottom Text",
  description:
    "Create classic memes with customizable fonts, colors and outline. Live preview and one-click export. Free and in-browser.",
  path: "/altfloveimg/meme",
});
}

export default function Page() {
  return (
    <>
      <JsonLd id="altfloveimg-meme-jsonld" data={buildToolJsonLd("meme")} />
      <MemeClient />
      <ToolFacts slug="meme" />
      <RelatedToolsBand slug="meme" />
    </>
  );
}
