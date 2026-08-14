import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { getStats } from "@altftool/core/persona";
import {
  AnswerBlock,
  FaqList,
  PersonaSection,
  SectionHeading,
  Stamp,
} from "../_components/Shell";

const description =
  "AltF Persona is free. The studio, cast, shot library, planner, disclosure generator, and zero-based budget worksheet need no account or credits because their output is text.";

const FAQS = [
  {
    question: "Is AltF Persona really free?",
    answer:
      "Yes, and there is no trial behind it. There is nothing to meter here: the output is a specification, and a specification costs the same to produce whether you make one or forty. What costs money is generating images and video, and you pay whoever does that for you — which is the same bill you were already paying before you found this page.",
  },
  {
    question: "What will I actually spend?",
    answer:
      "That depends on the current prices of the image, video, storage, and training services you choose, plus the value of your production time. AltF Persona does not guess those prices. The budget worksheet starts at zero so you can enter current provider quotes and your own assumptions.",
  },
  {
    question: "How does this compare to a hosted AI influencer product?",
    answer:
      "Compare the current quote, included renders, export rights, cancellation terms, and portability of each product. AltF Persona produces portable text: it can be handed to a collaborator or versioned in a repository, but it does not replace the generation service you choose.",
  },
  {
    question: "Will you add a paid tier later?",
    answer:
      "Nothing on this page is a promise about the future, so the honest answer is that we do not know. What we can say is that the design decision underneath it — that the artefact is portable text you own rather than a render on our server — is not the kind of decision a pricing change reverses. If we ever host generation, the sheet still works without it.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "Pricing — AltF Persona is free",
    description,
    path: "/persona/pricing",
    keywords: [
      "free ai influencer generator",
      "ai persona builder pricing",
      "ai influencer cost",
      "ai ugc cost per post",
    ],
  });
}

export default function PricingPage() {
  const stats = getStats();

  const included = [
    `The studio — all six steps, ${stats.shots} shot recipes`,
    `${stats.personas} ready-made character sheets`,
    "Prompt kits for ten generators",
    "The 30-day planner and batched shot list",
    "Hook and caption structure in twelve languages",
    "Disclosure wording for eight markets",
    "A zero-based quote and production-budget worksheet",
    "Shareable sheets — the spec lives in the URL",
  ];

  return (
    <main>
      <JsonLd
        id="persona-pricing-jsonld"
        data={[
          createFaqJsonLd({ path: "/persona/pricing", questions: FAQS }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Persona", path: "/persona" },
            { name: "Pricing", path: "/persona/pricing" },
          ]),
        ]}
      />

      <div className="psn-graticule border-b border-border">
        <div className="mx-auto max-w-[var(--anslation-ds-container)] px-4 py-12 sm:px-6 lg:px-8">
          <Stamp>Pricing</Stamp>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            It is free, and the interesting part is why
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>

          <div className="mt-8 max-w-3xl">
            <AnswerBlock>
              <p>
                Products in this category meter credits because their cost is
                GPU time. Ours is not. A character sheet is text, and text costs
                the same to produce whether you make one or forty — so there is
                nothing here that would be honest to charge for by the unit.
              </p>
            </AnswerBlock>
          </div>
        </div>
      </div>

      {/* ---------------------------- Free plan --------------------------- */}
      <PersonaSection>
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="psn-accent-panel rounded-xl p-6">
            <Stamp style={{ color: "var(--psn-accent-text)" }}>Everything</Stamp>
            <p className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
              $0
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              No account. No trial. No credits.
            </p>

            <ul className="mt-6 space-y-2.5">
              {included.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-foreground">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: "var(--psn-accent)" }}
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/persona/studio"
              prefetch={false}
              className="mt-8 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{ background: "var(--psn-accent)" }}
            >
              Open the studio
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div>
            <SectionHeading
              eyebrow="What you will actually spend"
              title="Use current provider prices and your own time value"
              lede="Generation services, training, storage, revision volume, and labour vary. The worksheet starts at zero and only totals what you enter."
            />

            <div className="psn-sheet rounded-xl p-5">
              <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <li>Check the generation provider&rsquo;s current plan and credit rules.</li>
                <li>Record one-off training or setup charges separately.</li>
                <li>Include storage, revisions, and the value of production time.</li>
                <li>Recheck the assumptions when a provider or workflow changes.</li>
              </ul>
            </div>

            <Link
              href="/persona/rates"
              prefetch={false}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: "var(--psn-accent-text)" }}
            >
              Run these against your own volume
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </PersonaSection>

      {/* --------------------------- Compare options ---------------------- */}
      <PersonaSection tone="plate">
        <SectionHeading
          eyebrow="Compare options"
          title="Read the current terms, not an old price table"
          lede="Provider prices and allowances change. Compare the same scope and record the date you checked it."
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="psn-sheet rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground">
              A hosted product
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Check today&rsquo;s subscription, included generations, overage
              policy, output licence, data handling, and cancellation terms.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Export a copy of anything the product lets you own, and verify
              what remains accessible after cancellation.
            </p>
          </div>

          <div className="psn-sheet rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground">
              A character sheet
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              You get text you own: a seed, a locked line, a negative prompt and
              a kit per generator. It works on whatever you already pay for, it
              survives you switching models, and it can be pasted into a brief,
              handed to a freelancer or committed to a repository.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The trade is that you have to run the generation yourself, and on
              the trained route that is a real afternoon of work rather than a
              button.
            </p>
          </div>
        </div>
      </PersonaSection>

      <PersonaSection>
        <SectionHeading eyebrow="Questions" title="Frequently asked" />
        <FaqList items={FAQS} />
      </PersonaSection>
    </main>
  );
}
