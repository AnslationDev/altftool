import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { specFromQuery } from "@altftool/core/persona/compose";
import CaptionsClient from "./CaptionsClient";
import { toSearchParams } from "../_components/searchParams";
import { AnswerBlock, FaqList, PersonaSection, SectionHeading, Stamp } from "../_components/Shell";

const description =
  "Opening lines and caption structure in your persona's own register, with the AI disclosure built into the shape rather than bolted on at the end. Free, no account, twelve languages.";

const FAQS = [
  {
    question: "Why does this give me a caption structure instead of a caption?",
    answer:
      "Because a tool that writes the finished caption produces captions that sound like a caption tool, and an audience can hear that in about four words. The hook is the exception — a first line is a rhetorical shape rather than a claim, so a bank of them is genuinely useful. Everything after the hook is beats you fill in, because you know the subject and the generator does not.",
  },
  {
    question: "Where does the AI disclosure go in a caption?",
    answer:
      "At the front, above the fold, in the same language as the post. A disclosure below a 'more' link has not reached the person who scrolled past, and in most of the markets this site covers that is the test — whether the audience saw it before engaging, not whether it existed somewhere on the page.",
  },
  {
    question: "Do I need a separate ad label as well?",
    answer:
      "Yes. They are two obligations and one does not satisfy the other: that the creator is synthetic, and that the post is commercial. Turn on the paid toggle and both appear in the generated line, in your post's language.",
  },
  {
    question: "How long should a caption be?",
    answer:
      "Shorter than the field allows, always. The character counts here are platform limits rather than targets — the counter is there to catch the case where a structure that fits Instagram silently overruns an X post.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "AI influencer caption and hook writer",
    description,
    path: "/persona/captions",
    keywords: [
      "ai influencer captions",
      "hook generator social media",
      "instagram caption structure",
      "ai disclosure caption",
      "content hook ideas free",
    ],
  });
}

export default async function CaptionsPage({ searchParams }) {
  const initialSpec = specFromQuery(toSearchParams(await searchParams));

  return (
    <main>
      <JsonLd
        id="persona-captions-jsonld"
        data={[
          createFaqJsonLd({ path: "/persona/captions", questions: FAQS }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Persona", path: "/persona" },
            { name: "Captions", path: "/persona/captions" },
          ]),
        ]}
      />

      <div className="border-b border-border">
        <div className="mx-auto max-w-[var(--anslation-ds-container)] px-4 py-10 sm:px-6 lg:px-8">
          <Stamp>Captions</Stamp>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            The first line, and the shape of everything after it
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>

          <div className="mt-6 max-w-3xl">
            <AnswerBlock>
              <p>
                Arriving from the studio? Your persona&rsquo;s archetype, niche
                and language are already loaded — the spec travels in the address
                bar. The disclosure line updates with the language, because ASCI
                and most of its counterparts require the label to be in the same
                language as the post rather than in the language of your
                dashboard.
              </p>
            </AnswerBlock>
          </div>
        </div>
      </div>

      <CaptionsClient initialSpec={initialSpec} />

      <PersonaSection tone="plate">
        <SectionHeading eyebrow="Questions" title="Frequently asked" />
        <FaqList items={FAQS} />
      </PersonaSection>
    </main>
  );
}
