import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

const PATH = "/bharat-virasat";
const NAME = "Bharat Virasat – India's Heritage Sites";
const DESCRIPTION =
  "Explore India's rich cultural heritage through an interactive showcase of historic sites, monuments, and landmarks with galleries and detailed information.";

export async function generateMetadata() {
  return createPageMetadata({
    title: NAME,
    description: DESCRIPTION,
    path: PATH,
  });
}

export default function Page(props) {
  return (
    <>
      {/*
        CollectionPage + BreadcrumbList only.

        An ItemList of the heritage sites was considered and dropped for the
        same reason /top10 dropped one: App.jsx renders all 42 entries of
        data/sites.js as sections of a single endless-scroll page, so every
        ListItem would have carried the identical /bharat-virasat URL. There is
        no per-site route to point at.

        No Place, TouristAttraction or geo node either: sites.js stores a name,
        a free-text `place` ("Agra, Uttar Pradesh") and a UNESCO inscription
        `year` as a string, with no coordinates and no address fields. A Place
        entity would have to invent the parts schema.org actually wants.
      */}
      <JsonLd
        id="bharat-virasat-collection-schema"
        data={[
          createCollectionPageJsonLd({
            path: PATH,
            name: NAME,
            description: DESCRIPTION,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Bharat Virasat", path: PATH },
          ]),
        ]}
      />
      <PageView {...props} />
    </>
  );
}
