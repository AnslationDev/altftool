import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { GUIDES } from "./guides";
import { AnswerBlock, PersonaSection, SectionHeading, Stamp } from "../_components/Shell";

const description =
  "Six guides on running an AI influencer properly: why the face drifts, how to pick a distinguishing mark, what the trained route really costs, how to batch a month in one sitting, what you must disclose, and which niches make a synthetic creator dishonest.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "AI influencer guides — consistency, production and disclosure",
    description,
    path: "/persona/learn",
    keywords: [
      "ai influencer guide",
      "consistent ai character tutorial",
      "ai persona best practices",
      "ai influencer ethics",
    ],
  });
}

export default function LearnPage() {
  return (
    <main>
      <JsonLd
        id="persona-learn-jsonld"
        data={[
          createCollectionPageJsonLd({
            path: "/persona/learn",
            name: "AltF Persona guides",
            description,
          }),
          createItemListJsonLd({
            path: "/persona/learn",
            name: "Guides",
            items: GUIDES.map((guide) => ({
              name: guide.title,
              path: `/persona/learn/${guide.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Persona", path: "/persona" },
            { name: "Guides", path: "/persona/learn" },
          ]),
        ]}
      />

      <div className="border-b border-border">
        <div className="mx-auto max-w-[var(--anslation-ds-container)] px-4 py-10 sm:px-6 lg:px-8">
          <Stamp>Guides</Stamp>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            The parts that are not a button
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>

          <div className="mt-6 max-w-3xl">
            <AnswerBlock>
              <p>
                Each of these is allowed to say the unflattering thing. A guide
                where the answer is always &ldquo;yes, and it is easy&rdquo; is
                marketing wearing a guide&rsquo;s clothes, and you can tell
                within a paragraph.
              </p>
            </AnswerBlock>
          </div>
        </div>
      </div>

      <PersonaSection>
        <SectionHeading eyebrow={`${GUIDES.length} guides`} title="Start anywhere" />

        <div className="grid gap-4 lg:grid-cols-2">
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/persona/learn/${guide.slug}`}
              prefetch={false}
              className="psn-sheet flex flex-col gap-3 rounded-xl p-6 transition hover:border-[var(--psn-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Stamp>{guide.minutes} min read</Stamp>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {guide.title}
              </h2>
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                {guide.dek}
              </p>
              <ul className="mt-auto space-y-1 pt-2">
                {guide.takeaways.slice(0, 3).map((item) => (
                  <li key={item} className="flex gap-2 text-xs text-muted-foreground">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                      style={{ background: "var(--psn-accent)" }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </PersonaSection>
    </main>
  );
}
