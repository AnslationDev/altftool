import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltPinterest – Discover & Save Visual Inspiration",
    description:
      "Browse a masonry feed of AI tools, websites, prompts, and ideas on AltPinterest, then save, download, and share the pins you love.",
    path: "/altpintrest",
  });
}

function PageHeading() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Discover and save visual inspiration with AltF Pinboard
      </h1>
      <p className="mt-3 max-w-2xl text-base text-muted-foreground">
        Browse ideas, tools and designs, then save the pins worth revisiting.
      </p>
    </>
  );
}

export default function Page(props) {
  return (
    <PageView {...props}>
      <PageHeading />
    </PageView>
  );
}
