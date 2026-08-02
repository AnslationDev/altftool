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

export default function Page(props) {
  return (
    <>
      {/*
        /altpintrest served zero <h1>. PageView's two H1s are both behind client
        state — the pin-detail modal and the "Your saved Ideas" view — and the
        landing it renders by default starts at <h2>, so the document had no
        top-level heading at all. Both of those are now H2s, and the route
        supplies the single H1 server-side.
      */}
      <h1 className="sr-only">Visual inspiration feed — browse and save ideas</h1>
      <PageView {...props} />
    </>
  );
}
