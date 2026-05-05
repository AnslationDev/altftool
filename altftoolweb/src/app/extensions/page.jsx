import ExtensionClient from "./ExtensionClient";

export async function generateMetadata() {
  return {
    title: "Best Chrome Extensions & Browser AddOns | AltFTool Extensions",
    description:
      "Explore must have Chrome extensions and top browser addons on AltFTool. Find useful extensions for productivity, browsing, SEO, games, and more.",
  };
}

export default function Page() {
  return <ExtensionClient />;
}