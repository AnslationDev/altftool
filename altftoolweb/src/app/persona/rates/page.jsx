import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import RatesClient from "./RatesClient";
import { AnswerBlock, FaqList, PersonaSection, SectionHeading, Stamp } from "../_components/Shell";

const description =
  "Build a transparent creator quote and production budget from your own current numbers. No unsourced market rates, hidden multipliers, or currency conversion.";

const FAQS = [
  {
    question: "How much should an AI influencer charge per post?",
    answer:
      "There is no single reliable number across platforms, countries, niches, deliverables, usage terms, and campaign goals. Use current evidence from your own negotiations or named market sources, then enter the creative fee, rights, exclusivity, expenses, and other agreed items separately in the worksheet.",
  },
  {
    question: "Why is the AI persona priced lower than a human creator?",
    answer:
      "Do not assume it should be. Production inputs, audience value, rights, and results are separate questions. A synthetic persona also cannot truthfully claim a lived product experience, so the brief must avoid fabricated testimonials regardless of price.",
  },
  {
    question: "Is an AI influencer cheaper than hiring a creator?",
    answer:
      "It may or may not be. Compare like with like using current quotes: the same assets, revision scope, usage rights, exclusivity, production time, and expected outcome. This worksheet deliberately does not invent the other side of that comparison.",
  },
  {
    question: "What are usage rights worth?",
    answer:
      "The contract determines the scope and value. Record duration, channels, territory, paid amplification, edit rights, and exclusivity explicitly, then enter the amount you negotiated. Get professional advice for material contracts.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "Creator quote and production budget worksheet",
    description,
    path: "/persona/rates",
    keywords: [
      "creator quote worksheet",
      "content production budget",
      "usage rights quote",
      "creator cost calculator",
    ],
  });
}

export default function RatesPage() {
  return (
    <main>
      <JsonLd
        id="persona-rates-jsonld"
        data={[
          createFaqJsonLd({ path: "/persona/rates", questions: FAQS }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Persona", path: "/persona" },
            { name: "Rates", path: "/persona/rates" },
          ]),
        ]}
      />

      <div className="border-b border-border">
        <div className="mx-auto max-w-[var(--anslation-ds-container)] px-4 py-10 sm:px-6 lg:px-8">
          <Stamp>Rates</Stamp>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Build a quote from numbers you can defend
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>

          <div className="mt-6 max-w-3xl">
            <AnswerBlock>
              <p>
                The worksheet starts at zero. Add only the amounts you chose,
                negotiated, or verified from a named current source. The result
                is transparent arithmetic, not a claim about the market.
              </p>
            </AnswerBlock>
          </div>
        </div>
      </div>

      <RatesClient />

      <PersonaSection tone="plate">
        <SectionHeading eyebrow="Questions" title="Frequently asked" />
        <FaqList items={FAQS} />
      </PersonaSection>
    </main>
  );
}
