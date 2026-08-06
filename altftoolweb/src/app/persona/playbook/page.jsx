import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { WEEK_ARC } from "@altftool/core/persona/plan";
import { specFromQuery } from "@altftool/core/persona/compose";
import PlaybookClient from "./PlaybookClient";
import { toSearchParams } from "../_components/searchParams";
import { AnswerBlock, FaqList, PersonaSection, SectionHeading, Stamp } from "../_components/Shell";

const description =
  "A 30-day content plan for an AI influencer, generated from the persona rather than from a template. Four weeks with an argument behind them, filtered to what your production route can afford, and batched into a shot list so a month is produced in one sitting.";

const FAQS = [
  {
    question: "How often should an AI influencer post?",
    answer:
      "Use the platform's own rhythm rather than a universal number: seven times a week on TikTok, five on Instagram and Shorts, three on LinkedIn, once on long-form YouTube. The planner spaces posts evenly across the month rather than clustering them, because an account that posts five times on Monday and nothing until Friday teaches the feed to stop showing it.",
  },
  {
    question: "Why does the plan have rest days in it?",
    answer:
      "Because a calendar that fills every square is a calendar nobody finishes. The rest days are the difference between a plan and a wish, and they are also where the batching happens — one setup session covers a week of posts.",
  },
  {
    question: "What is the four-week arc?",
    answer:
      "Week one says what the account is for. Week two shows the method working. Week three puts it against the alternatives, which is what people search for and what brands read as commercial intent. Week four answers the questions the first three weeks generated. A plan that picks pillars at random produces thirty unrelated posts, which is what most calendar tools ship and what nobody can grow on.",
  },
  {
    question: "Why is the shot list sorted by setup rather than by date?",
    answer:
      "Because batching is the entire operational advantage of a synthetic persona and almost nobody uses it. If six posts across the month use the same framing, that is one setup and six generations — not six separate sittings a week apart, each starting from scratch.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "30-day AI influencer content plan generator",
    description,
    path: "/persona/playbook",
    keywords: [
      "ai influencer content plan",
      "30 day content calendar generator",
      "ai ugc content calendar",
      "content pillars planner",
      "social media plan generator free",
    ],
  });
}

export default async function PlaybookPage({ searchParams }) {
  const initialSpec = specFromQuery(toSearchParams(await searchParams));

  return (
    <main>
      <JsonLd
        id="persona-playbook-jsonld"
        data={[
          createFaqJsonLd({ path: "/persona/playbook", questions: FAQS }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Persona", path: "/persona" },
            { name: "30-day plan", path: "/persona/playbook" },
          ]),
        ]}
      />

      <div className="border-b border-border">
        <div className="mx-auto max-w-[var(--anslation-ds-container)] px-4 py-10 sm:px-6 lg:px-8">
          <Stamp>The 30-day plan</Stamp>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            A month with an argument behind it
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>

          <div className="mt-6 max-w-3xl">
            <AnswerBlock>
              <p>
                Arriving from the studio? The plan below is already built from
                your persona — the spec travels in the address bar. Otherwise it
                plans against a default persona you can change with the controls.
              </p>
            </AnswerBlock>
          </div>

          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {WEEK_ARC.map((week) => (
              <li key={week.index} className="psn-sheet rounded-lg p-4">
                <Stamp>Week {week.index}</Stamp>
                <p className="mt-1 font-semibold text-foreground">{week.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {week.goal}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <PlaybookClient initialSpec={initialSpec} />

      <PersonaSection tone="plate">
        <SectionHeading eyebrow="Questions" title="Frequently asked" />
        <FaqList items={FAQS} />
      </PersonaSection>
    </main>
  );
}
