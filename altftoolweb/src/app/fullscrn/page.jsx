import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createHowToJsonLd,
  createPageMetadata,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";
import FullscrnClient from "./FullscrnClient";

const PATH = "/fullscrn";
const NAME = "Fullscreen Text Display";
const DESCRIPTION =
  "Type text and display it fullscreen with custom font size, colors, and alignment. A simple distraction-free fullscreen text and presentation tool.";

export async function generateMetadata() {
  return createPageMetadata({
    title: NAME,
    description: DESCRIPTION,
    path: PATH,
  });
}

export default function Page() {
  const relatedItems = getRelatedContentForPreset(
    {
      href: PATH,
      title: NAME,
      description: DESCRIPTION,
      tags: ["fullscreen text", "presentation tool", "text display"],
      section: "experiences",
    },
    "utility",
  );
  return (
    <main>
      {/*
        WebApplication (via createToolJsonLd) + HowTo + BreadcrumbList.

        The HowTo is not invented: every step below is a control this page
        renders. The text box and the Text tab are in components/EditorArea.jsx,
        the size / alignment / colour controls are in
        components/SettingSidebar.jsx, and the fullscreen button is in
        components/ActionFooter.jsx. The last step's shortcut and exit key are
        the literal on-screen strings from components/InfoSection.jsx — "Press
        CMD + ENTER to go fullscreen even faster" and "Press ESC to exit
        fullscreen" — and the Cmd/Ctrl+Enter binding is
        implemented in FullscrnClient.jsx (the keydown handler around line 34).

        No FAQPage: the info strip is instructions and a newsletter box, not
        questions and answers.
      */}
      <JsonLd
        id="fullscrn-schema"
        data={[
          createToolJsonLd({
            slug: "fullscrn",
            path: PATH,
            tool: {
              name: NAME,
              description: DESCRIPTION,
              category: ["Text", "Presentation", "Utility"],
            },
          }),
          createHowToJsonLd({
            path: PATH,
            name: "How to display text fullscreen",
            description: DESCRIPTION,
            steps: [
              "Type or paste your text into the editor on the left.",
              "Set the font size, alignment, text colour and background colour in the settings panel on the right.",
              "Press the fullscreen button, or use Cmd + Enter on Mac or Ctrl + Enter on Windows.",
              "Press Esc to leave fullscreen.",
            ],
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: NAME, path: PATH },
          ]),
        ]}
      />
      <FullscrnClient />
      <RelatedContentSection title="Keep exploring AltFTool" items={relatedItems} />
    </main>
  );
}
