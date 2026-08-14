import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createHowToJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { MODELS } from "@altftool/core/persona/taxonomy";
import { specFromQuery } from "@altftool/core/persona/compose";
import StudioClient from "./StudioClient";
import { toSearchParams } from "../_components/searchParams";
import { AnswerBlock, Stamp } from "../_components/Shell";

const description =
  "Build an AI influencer that stays the same person. Six steps produce a character sheet: an identity seed, the locked descriptor line, a prompt kit for ten generators, a negative prompt, the production route your spec actually needs and a 30-day plan. Free, no account, nothing stored on a server.";

const STEPS = [
  { name: "Brief", text: "Choose the niche, platform, market, language and archetype." },
  { name: "Face", text: "Set presentation, age band, heritage, features and the distinguishing mark the prompt will anchor on." },
  { name: "Build and hair", text: "Set hair, skin and body, which carry most of the recognition at scroll speed." },
  { name: "Style", text: "Set wardrobe, palette, setting, light and camera height. None of these change the identity seed." },
  { name: "Voice", text: "Set the tone, the governing value and up to five content pillars." },
  { name: "Lock", text: "Read the character sheet: seed, locked line, prompt kits, negative prompt, route, checklist, disclosure and plan." },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "AI Influencer Studio — build a persona that stays consistent",
    description,
    path: "/persona/studio",
    keywords: [
      "ai influencer builder",
      "ai persona generator",
      "consistent ai character generator",
      "ai character sheet",
      "midjourney character consistency",
      "flux lora character",
      "free ai influencer maker",
    ],
  });
}

export default async function StudioPage({ searchParams }) {
  const initialSpec = specFromQuery(toSearchParams(await searchParams));

  return (
    <main>
      <JsonLd
        id="persona-studio-jsonld"
        data={[
          createHowToJsonLd({
            path: "/persona/studio",
            name: "How to build a consistent AI influencer persona",
            description,
            steps: STEPS,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Persona", path: "/persona" },
            { name: "Studio", path: "/persona/studio" },
          ]),
        ]}
      />

      <div className="border-b border-border psn-graticule">
        <div className="mx-auto max-w-[var(--anslation-ds-container)] px-4 py-10 sm:px-6 lg:px-8">
          <Stamp>Persona Studio</Stamp>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Make the character decisions once. Keep the face forever.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>

          <div className="mt-6 max-w-3xl">
            <AnswerBlock>
              <p>
                Nothing here is uploaded. The spec lives in your browser and in
                the address bar, which is also how you share it — copy the URL
                and the person on the other end opens the same persona, down to
                the seed. {MODELS.length} generators are covered, and the studio
                emits the consistency mechanism each one actually uses rather
                than the same prompt with a different aspect ratio.
              </p>
            </AnswerBlock>
          </div>
        </div>
      </div>

      <StudioClient initialSpec={initialSpec} />
    </main>
  );
}
