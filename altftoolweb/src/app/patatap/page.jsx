import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PatatapClient from "./PatatapClient";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Patatap - Portable Animation and Sound Kit",
    description:
      "A fullscreen Patatap-style portable animation and sound kit. Press A-Z or tap the stage to trigger colorful visuals and synthesized sounds.",
    path: "/patatap",
    keywords: [
      "Patatap",
      "Patatap clone",
      "synesthesia",
      "interactive music",
      "canvas animation",
      "Web Audio API",
      "music keyboard",
      "keyboard sound generator",
      "AltFTool",
    ],
  });
}

export default function PatatapPage() {
  return <PatatapClient />;
}
