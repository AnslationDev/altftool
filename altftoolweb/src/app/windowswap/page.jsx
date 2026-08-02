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
