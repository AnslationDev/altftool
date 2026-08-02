import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "WindowSwap – Open a Window Somewhere in the World",
    description:
      "Relax with WindowSwap and watch calming, immersive window views from around the world, with ambient sounds and the ability to share your own.",
    path: "/windowswap",
  });
}

export default function Page(props) {
  return (
    <>
      {/*
        PageView is a fullscreen video experience with its own chrome and no
        heading anywhere in it, so /windowswap served zero <h1>. Same sr-only
        pattern the /flightradar route already uses: the page gets a real,
        crawlable, screen-reader-announced heading without putting text over a
        full-bleed video.
      */}
      <h1 className="sr-only">
        Window views from around the world — watch a live-feel window somewhere
        else
      </h1>
      <PageView {...props} />
    </>
  );
}
