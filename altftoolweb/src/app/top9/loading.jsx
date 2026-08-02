import { RouteLoadingShell } from "@/components/ui/route-loading";

export default function Loading() {
  return (
    <>
      {/*
        This is the streamed fallback for the whole /top9 segment — the hub AND
        every /top9/[slug] under it, because [slug]/loading.jsx only nests an
        inner boundary, it does not replace this outer one. The fallback markup
        is flushed into the same document as the resolved page, so while this
        was an <h1> all 50 routes in the family shipped two H1s: this one plus
        the real page heading (Hero.jsx on the hub, page.jsx's title on a
        list). It also said "Top9 ranked guides ..." on top of a page about
        Call of Duty. The text stays for anyone who reaches the loading state;
        only the level drops, so the page's own heading is the single H1.
        `sr-only` is unchanged and Tailwind preflight normalises h1 and h2
        identically, so nothing moves.
      */}
      <h2 className="sr-only">
        Top9 ranked guides for entertainment, sports, tools, lifestyle, and trending topics
      </h2>
      <RouteLoadingShell variant="listing" />
    </>
  );
}
