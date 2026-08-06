import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";
import RadioGardenClient from "./RadioGardenClient";

const PATH = "/radio-garden";
const NAME = "OpenAir Garden";
const DESCRIPTION =
  "Explore live radio stations around the world on an interactive globe and tune in to broadcasts by location.";

export async function generateMetadata() {
  return createPageMetadata({
    title: NAME,
    description: DESCRIPTION,
    path: PATH,
  });
}

export default function RadioGardenPage() {
  return (
    <>
      {/*
        WebApplication (via createToolJsonLd) + BreadcrumbList. The player, the
        globe, search, favorites and playlists are all one application at one
        URL — there is no per-station route to collect, so CollectionPage would
        describe a listing this route does not publish.

        The "live radio stations" wording is safe to repeat in the entity:
        RadioGardenClient.jsx queries the real radio-browser.info API
        (RADIO_API, line 41) and plays the station's own stream URL. It is not
        seeded catalogue data.

        No ItemList and no RadioStation/BroadcastService nodes: the station set
        is fetched at runtime and differs per query, so nothing here is a stable
        server-rendered fact, and every station opens in place on /radio-garden
        rather than at its own URL.
      */}
      <JsonLd
        id="radio-garden-schema"
        data={[
          createToolJsonLd({
            slug: "radio-garden",
            path: PATH,
            tool: {
              name: NAME,
              description: DESCRIPTION,
              category: ["Radio", "Music", "Audio Streaming"],
            },
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: NAME, path: PATH },
          ]),
        ]}
      />
      <h1 className="sr-only">OpenAir Garden live global radio explorer</h1>
      <RadioGardenClient />
    </>
  );
}
