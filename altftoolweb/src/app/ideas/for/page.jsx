import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { PERSONAS, MODIFIERS } from "@altftool/core/ideas/personas";

const description =
  "Startup ideas ranked for who you are and how you build — solo founders, bootstrappers, non-technical founders — plus filtered views by budget, effort, mechanism and market.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Startup ideas for every kind of founder",
    description,
    path: "/ideas/for",
    keywords: [
      "startup ideas for solo founders",
      "startup ideas for non-technical founders",
      "startup ideas for students",
      "startup ideas by budget",
    ],
  });
}

const KIND_LABEL = {
  budget: "Budget",
  skill: "Skill",
  effort: "Effort",
  model: "Business model",
  mechanism: "Technology",
  market: "Market",
  speed: "Speed",
};

export default function ForIndexPage() {
  const grouped = MODIFIERS.reduce((acc, m) => {
    (acc[m.kind] ||= []).push(m);
    return acc;
  }, {});

  return (
    <>
      <JsonLd
        id="altf-ideas-for-index"
        data={[
          createCollectionPageJsonLd({ path: "/ideas/for", name: "Startup ideas by founder type", description }),
          createItemListJsonLd({
            path: "/ideas/for",
            name: "Founder types and filters",
            items: [...PERSONAS, ...MODIFIERS].map((e) => ({
              name: e.name,
              path: `/ideas/for/${e.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Ideas", path: "/ideas" },
            { name: "For", path: "/ideas/for" },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 py-5 font-mono text-xs text-muted-foreground">
          <Link href="/ideas" className="hover:text-primary">Ideas</Link>
          <span aria-hidden="true" className="opacity-40">/</span>
          <span className="text-foreground">For</span>
        </nav>

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Find your angle
          </span>
          <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            Startup ideas for how you actually build
          </h1>
          <p className="mt-4 max-w-[62ch] text-[clamp(1rem,1.3vw,1.0625rem)] leading-relaxed text-muted-foreground">
            A persona hub does not just filter the list — it re-scores the whole corpus using a
            weighting tuned to that situation. A solo founder sees feasibility weighted more than
            twice as heavily as moat; a venture-track founder sees the opposite. Same six signals,
            different question.
          </p>
        </header>

        <section className="py-8">
          <h2 className="mb-4 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
            By who you are
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PERSONAS.map((persona) => (
              <Link
                key={persona.slug}
                href={`/ideas/for/${persona.slug}`}
                className="afi-card flex min-h-40 flex-col gap-2 rounded-lg border border-card-border bg-card p-5"
              >
                <span className="font-mono text-[0.6875rem] uppercase tracking-wide text-primary">
                  {persona.intent}
                </span>
                <span className="text-[1.0625rem] font-semibold tracking-tight text-foreground">
                  {persona.name}
                </span>
                <p className="line-clamp-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
                  {persona.lede}
                </p>
                <span className="mt-auto font-mono text-xs text-muted-foreground">
                  See the ranking →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {Object.entries(grouped).map(([kind, items]) => (
          <section key={kind} className="border-t border-border py-8">
            <h2 className="mb-4 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
              By {KIND_LABEL[kind] ?? kind}
            </h2>
            <div className="flex flex-wrap gap-2">
              {items.map((m) => (
                <Link
                  key={m.slug}
                  href={`/ideas/for/${m.slug}`}
                  className="rounded-sm border border-border bg-surface-soft px-3 py-1.5 font-mono text-xs text-muted-foreground transition hover:border-border-strong hover:text-foreground"
                >
                  Ideas {m.name}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
