import PatatapClient from "./PatatapClient";

export const metadata = {
  title: "Patatap - Portable Animation and Sound Kit",
  description:
    "A fullscreen Patatap-style portable animation and sound kit. Press A-Z or tap the stage to trigger colorful visuals and synthesized sounds.",
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
  alternates: {
    canonical: "/patatap",
  },
};

export default function PatatapPage() {
  return <PatatapClient />;
}
