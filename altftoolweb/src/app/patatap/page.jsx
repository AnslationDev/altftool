import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PatatapClient from "./PatatapClient";

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
    title: "KeyCanvas - Keyboard Animation and Sound Kit",
    description:
      "A fullscreen keyboard-driven animation and sound canvas. Press A-Z or tap the stage to trigger colourful visuals and synthesized sounds, right in your browser.",
    path: "/patatap",
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
      <h1 className="sr-only">KeyCanvas keyboard animation and sound kit</h1>
      <PatatapClient />
    </>
  );
}
