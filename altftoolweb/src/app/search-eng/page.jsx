import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

const PATH = "/search-eng";
// "Premium Digital Toolkit" is the title's tagline, not the name of the thing —
// the entity is named for the application the page renders, which is the name
// PageView itself uses in its h1 and its eyebrow label.
const NAME = "AltFTool Search";
// The old copy promised "web results, images, news, and videos". News is not
// available: PageView.jsx line 37 ships that tab with `disabled: true` and a
// "Coming soon" tooltip. Live result tabs also depend on the optional backend,
// so the default local catalogue is named first and remote results are qualified.
// One string keeps the snippet and schema description from drifting apart.
const DESCRIPTION =
  "Search AltFTool tools, extensions, and curated resources in one focused interface. Optional live web, image, and video results appear when the search backend is available.";

export async function generateMetadata() {
  return createPageMetadata({
    title: `${NAME} – Premium Digital Toolkit`,
    description: DESCRIPTION,
    path: PATH,
  });
}

export default function Page(props) {
  return (
    <>
      {/*
        WebApplication (via createToolJsonLd) + BreadcrumbList.

        No WebSite node and no SearchAction here. The site already publishes
        exactly one WebSite entity with one SearchAction, built by
        createWebsiteJsonLd and mounted in the root layout; a second WebSite for
        a sub-page would compete with it for the sitelinks searchbox rather than
        add anything.

        No ItemList: results are fetched on the client per query
        (PageView.jsx executeSearch) and there is nothing server-rendered to
        enumerate.
      */}
      <JsonLd
        id="search-eng-schema"
        data={[
          createToolJsonLd({
            slug: "search-eng",
            path: PATH,
            tool: {
              name: NAME,
              description: DESCRIPTION,
              category: ["Search", "Discovery", "Utility"],
            },
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: NAME, path: PATH },
          ]),
        ]}
      />
      <PageView {...props} />
    </>
  );
}
