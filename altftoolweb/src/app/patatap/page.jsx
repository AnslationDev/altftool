import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";
import PatatapClient from "./PatatapClient";

const PATH = "/patatap";
const NAME = "KeyCanvas - Keyboard Animation and Sound Kit";
const DESCRIPTION =
  "A fullscreen keyboard-driven animation and sound canvas. Press A-Z or tap the stage to trigger colourful visuals and synthesized sounds, right in your browser.";

/**
 * This page is KeyCanvas.
 *
 * packages/core/src/experienceCatalog.js has named it KeyCanvas for a while —
 * `name: "KeyCanvas"`, `cta: "Play KeyCanvas"` — but this route still published
 * itself as "Patatap" and targeted "Patatap clone" as a keyword. Patatap is a
 * specific work by Jono Brandel and Lullatone, so the site was presenting
 * someone else's work title as the name of its own page, and disagreeing with
 * its own catalog on every surface that reads from it.
 *
 * The name now matches the catalog and the keyword targeting no longer trades
 * on theirs. The `/patatap` slug stays: changing a live URL needs a redirect
 * decision that belongs to the owner, and the slug alone is not the claim the
 * title was making.
 */
export async function generateMetadata() {
  return createPageMetadata({
    title: NAME,
    description: DESCRIPTION,
    path: PATH,
    keywords: [
      "KeyCanvas",
      "keyboard sound generator",
      "keyboard animation",
      "synesthesia",
      "interactive music",
      "canvas animation",
      "Web Audio API",
      "music keyboard",
      "AltFTool",
    ],
  });
}

export default function PatatapPage() {
  return (
    <>
      {/*
        WebApplication (via createToolJsonLd) + BreadcrumbList.

        Deliberately NOT a Game. createGameJsonLd was considered: this route is
        filed under "Play" in the experience catalog and the CTA reads "Play
        KeyCanvas", but PatatapClient.jsx has no score, no objective, no rounds
        and no win or lose state anywhere — it maps the 26 letter keys onto a
        canvas animation and a Web Audio voice. It is an instrument, and
        VideoGame would be a claim the code does not support. The category list
        below therefore avoids the literal word "games", which is what
        createToolJsonLd switches on to pick VideoGame.

        No ItemList of the 26 letters: every key is a control on this one page,
        so all 26 entries would carry the identical /patatap URL — the same
        reason /top10 dropped its list.
      */}
      <JsonLd
        id="patatap-schema"
        data={[
          createToolJsonLd({
            slug: "patatap",
            path: PATH,
            tool: {
              name: NAME,
              description: DESCRIPTION,
              category: ["Multimedia", "Music", "Animation"],
            },
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "KeyCanvas", path: PATH },
          ]),
        ]}
      />
      <h1 className="sr-only">KeyCanvas keyboard animation and sound kit</h1>
      <PatatapClient />
    </>
  );
}
