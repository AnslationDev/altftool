import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  LANGUAGES,
  MARKETS,
  PLATFORMS,
} from "@altftool/core/persona/taxonomy";
import { DISCLAIMER } from "@altftool/core/persona/disclosure";
import DisclosureClient from "./DisclosureClient";
import { toSearchParams } from "../_components/searchParams";
import {
  AnswerBlock,
  FaqList,
  PersonaSection,
  SectionHeading,
  Stamp,
} from "../_components/Shell";

const description =
  "What you have to disclose when an AI influencer posts, in eight markets and twelve languages — the synthetic-creator label and the commercial label, which are two separate obligations. Generates the exact wording and tells you where on each platform it has to sit.";

const FAQS = [
  {
    question: "Do you legally have to disclose an AI influencer?",
    answer:
      "In every market on this page there is a rule that reaches it, though they arrive from different directions. The EU AI Act's Article 50 transparency obligations require synthetic media to be marked and deep-fake content disclosed. The FTC's rules on endorsements and fake reviews make a testimonial from a person who does not exist actionable. ASCI requires a prominent label in the post's own language, and India has moved separately to require labelling of synthetically generated information. Platforms add their own labels on top. This is a plain-language summary rather than legal advice.",
  },
  {
    question: "Is one disclosure enough if the post is also sponsored?",
    answer:
      "No. They are two separate obligations: that the depicted creator is synthetic, and that the post is commercial. An #ad label says nothing about whether the person is real, and an AI label says nothing about whether money changed hands. Both, at the front, in the language of the post.",
  },
  {
    question: "Can I put the disclosure in my bio instead of the post?",
    answer:
      "The bio is necessary and not sufficient. Regulators consistently test whether the audience saw the disclosure before engaging with the content, and a viewer arriving on a single reel from a feed has not read your bio. Put it in both.",
  },
  {
    question: "What happens if I strip the metadata to avoid the platform's AI label?",
    answer:
      "That is the one action on this page that turns a disclosure question into a deception question. Platform labels are largely driven by provenance metadata written by the generator, and people who have chosen to see fewer AI images are relying on it. Removing it to defeat that choice is a materially different act from forgetting a hashtag.",
  },
  {
    question: "Which language should the disclosure be in?",
    answer:
      "The language of the post. ASCI is explicit about this, and the same reasoning applies everywhere: a disclosure the audience cannot read has not disclosed anything. An English '#ad' on a Hindi reel is a finding against you rather than a defence.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "AI influencer disclosure — rules, wording and placement",
    description,
    path: "/persona/disclosure",
    keywords: [
      "ai influencer disclosure",
      "do you have to disclose ai generated content",
      "eu ai act article 50 disclosure",
      "ftc ai endorsement rules",
      "asci ai influencer guidelines",
      "ai generated content label",
    ],
  });
}

export default async function DisclosurePage({ searchParams }) {
  const params = toSearchParams(await searchParams);
  const pick = (key, list, keyName = "id") => {
    const value = params.get(key);
    return list.some((entry) => entry[keyName] === value) ? value : undefined;
  };
  const initial = {
    market: pick("market", MARKETS),
    platform: pick("platform", PLATFORMS),
    language: pick("language", LANGUAGES),
  };

  return (
    <main>
      <JsonLd
        id="persona-disclosure-jsonld"
        data={[
          createFaqJsonLd({ path: "/persona/disclosure", questions: FAQS }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Persona", path: "/persona" },
            { name: "Disclosure", path: "/persona/disclosure" },
          ]),
        ]}
      />

      <div className="border-b border-border">
        <div className="mx-auto max-w-[var(--anslation-ds-container)] px-4 py-10 sm:px-6 lg:px-8">
          <Stamp>Disclosure</Stamp>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Two obligations, not one
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>

          <div className="mt-6 max-w-3xl">
            <AnswerBlock>
              <p>
                <strong>One:</strong> that the depicted creator is synthetic.{" "}
                <strong>Two:</strong> that the post is commercial, where it is.
                An #ad label says nothing about whether the person is real, and
                an AI label says nothing about whether money changed hands.
                Satisfying one has never satisfied the other.
              </p>
              <p>
                Both belong at the front of the caption, in the language of the
                post, plus whatever first-party control the platform provides.
                {" "}
                {MARKETS.length} markets are covered below.
              </p>
            </AnswerBlock>
          </div>
        </div>
      </div>

      <DisclosureClient initial={initial} />

      <PersonaSection tone="plate">
        <SectionHeading
          eyebrow="By market"
          title="Who enforces this, and under what"
          lede="One paragraph each, in plain language, naming the instrument rather than gesturing at 'regulations'."
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {MARKETS.map((market) => (
            <div key={market.id} className="psn-sheet rounded-xl p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {market.label}
                </h3>
                <span className="psn-stamp">{market.regulator}</span>
              </div>
              <p className="mt-1 text-sm font-medium" style={{ color: "var(--psn-accent-text)" }}>
                {market.rule}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {market.summary}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-6 rounded-lg border border-dashed border-border p-4 text-xs leading-relaxed text-muted-foreground">
          {DISCLAIMER}
        </p>
      </PersonaSection>

      <PersonaSection>
        <SectionHeading eyebrow="Questions" title="Frequently asked" />
        <FaqList items={FAQS} />
      </PersonaSection>
    </main>
  );
}
