import PageView from "./PageView";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";

const DESCRIPTION =
  "Watch calming window views from around the world and save a private draft submission in this browser. Videos are embedded from third-party sources.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "WindowSwap – Open a Window Somewhere in the World",
    description: DESCRIPTION,
    path: "/windowswap",
  });
}

export default function Page(props) {
  return (
    <>
      {/*
        SoftwareApplication/WebApplication + BreadcrumbList. The page is a
        player: PageView swaps between window loops in place, it does not list
        anything a visitor can navigate to, so WebApplication rather than
        CollectionPage or ItemList.

        VideoObject was considered and dropped for all fifteen loops in
        videos.js. Google requires an uploadDate and a thumbnailUrl on that
        entity and createVideoJsonLd enforces both; neither exists here. The
        entries carry a `dateLabel` ("MAY 2026") and a `timeLabel` ("08:14"),
        which are captions printed over the player, not an upload timestamp,
        and the videos are third-party Vimeo embeds with no thumbnail asset in
        this repo. A `contributor` is a bare first name, so no authorship
        either.
      */}
      <JsonLd
        id="windowswap-schema"
        data={[
          createToolJsonLd({
            slug: "windowswap",
            path: "/windowswap",
            tool: {
              name: "WindowSwap",
              description: DESCRIPTION,
              category: ["Relaxation", "Video"],
              topics: ["window views", "video loops", "relaxation"],
            },
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "WindowSwap", path: "/windowswap" },
          ]),
        ]}
      />
      {/*
        PageView and everything under it is "use client", and none of that tree
        contained an h1 at all: the visible "WindowSwap" wordmark is a <span>
        inside HeroSection, the largest text on screen is a <button>, and both
        sit behind `{!isPlaying && ...}`. Declaring the heading here keeps it in
        the server-rendered markup and out of reach of the player state that
        swaps the landing page away. sr-only because the hero is a full-bleed
        video wall with no room for a heading — promoting the wordmark instead
        would move pixels and still leave it inside the client boundary.
      */}
      <h1 className="sr-only">
        WindowSwap: Open a Real Window Somewhere in the World
      </h1>
      <PageView {...props} />
    </>
  );
}
