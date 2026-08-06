import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { getManifest } from "@altftool/core/ideas/corpus";
import ScorerTool from "./ScorerTool";

export const revalidate = 86400;

const description =
  "Score your own startup idea on the same six signals AltF Ideas uses, then see where it would rank against 117,000 alternatives. Free, no account, runs in your browser.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Startup idea scorer — rate your idea on six signals",
    description,
    path: "/ideas/tools/score-my-idea",
    keywords: [
      "startup idea scorer",
      "rate my startup idea",
      "startup idea evaluation tool",
      "business idea score",
    ],
  });
}

const FAQS = [
  {
    question: "How does the startup idea scorer work?",
    answer:
      "You rate your idea from 1 to 5 on six signals — demand, moat, monetisation, feasibility, timing and open field. Those become a 0-100 score using the same weighted formula applied to every idea in the AltF corpus, so the result is directly comparable to 117,264 alternatives.",
  },
  {
    question: "Is my idea stored or sent anywhere?",
    answer:
      "No. The whole tool runs in your browser. Nothing is uploaded, logged, or saved, and there is no account.",
  },
  {
    question: "What does the percentile mean?",
    answer:
      "It is where your score would sit within the real corpus distribution. The median idea scores 59, so a 65 is roughly the 75th percentile. A raw score means very little on its own — the comparison is the useful part.",
  },
  {
    question: "Should I abandon an idea that scores badly?",
    answer:
      "No. A low score usually points at one weak signal rather than a bad idea, and the weakest link is the cheapest thing to fix. Reshape the wedge, change the buyer, or narrow the first version, then score it again.",
  },
];

export default async function ScorerPage() {
  const manifest = await getManifest();

  return (
    <>
      <JsonLd
        id="altf-ideas-scorer"
        data={[
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "AltF Startup Idea Scorer",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Any",
            description,
            url: absoluteUrl("/ideas/tools/score-my-idea"),
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          },
          createFaqJsonLd({ path: "/ideas/tools/score-my-idea", questions: FAQS }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Ideas", path: "/ideas" },
            { name: "Tools", path: "/ideas/tools" },
            { name: "Score my idea", path: "/ideas/tools/score-my-idea" },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 py-5 font-mono text-xs text-muted-foreground">
          <Link href="/ideas" className="hover:text-primary">Ideas</Link>
          <span aria-hidden="true" className="opacity-40">/</span>
          <Link href="/ideas/tools" className="hover:text-primary">Tools</Link>
          <span aria-hidden="true" className="opacity-40">/</span>
          <span className="text-foreground">Score my idea</span>
        </nav>

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Free tool
          </span>
          <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            Score your own idea
          </h1>
          <p className="mt-4 max-w-[62ch] text-[clamp(1rem,1.3vw,1.0625rem)] leading-relaxed text-muted-foreground">
            Answer six questions and get the same opportunity score every idea in the corpus
            carries, plus where yours would rank against{" "}
            {manifest.total.toLocaleString("en-US")} alternatives. Change the weighting to match how
            you build. Nothing leaves your browser.
          </p>
        </header>

        <section className="py-8">
          <ScorerTool corpusSize={manifest.total} />
        </section>

        <section className="border-t border-border py-8">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
            Common questions
          </h2>
          <div className="max-w-3xl">
            {FAQS.map((faq, i) => (
              <details key={faq.question} className="border-b border-border" open={i === 0}>
                <summary className="cursor-pointer list-none py-4 text-[0.9375rem] font-medium text-foreground marker:hidden hover:text-primary">
                  {faq.question}
                </summary>
                <div className="pb-4 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
