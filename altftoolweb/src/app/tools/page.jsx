import MicrotoolClient from "./MicrotoolClient";

export async function generateMetadata() {
  return {
    title: "Micro Tools – 100+ Free Daily Use Online Tools",
    description:
      "Access 100+ free micro tools for everyday tasks including calculators, converters, generators, and productivity utilities on AltFTool.",
  };
}

export default function Page() {
  return <MicrotoolClient />;
}