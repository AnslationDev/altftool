import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { BRAND, TIME_BANDS, VIBES } from "@altftool/core/detour/taxonomy";
import { STATS } from "@altftool/core/detour";

export const revalidate = 86400;

const description =
  "How AltF Detour works: what gets catalogued, how sites are sorted by time and mood, why the random button favours our own pages, and how to suggest a site.";

const FAQS = [
  {
    question: "How does the random button decide where to send me?",
    answer:
      "It picks from whatever is left after your filters, weighted so that AltF originals come up somewhat more often than their share of the catalog. That weighting is operational rather than promotional: originals are the only entries we can guarantee are still online, load in under a second and carry no third-party tracking. External sites still make up the large majority of what the button serves.",
  },
  {
    question: "Why does every site say how long it takes?",
    answer:
      "Because it is the only question that reliably changes whether a link was a good idea. A site that is brilliant over an evening is a bad answer for someone with ninety seconds. Every entry carries one of four time bands — instant, a minute, a coffee break, or a rabbit hole.",
  },
  {
    question: "What do the four icons on each card mean?",
    answer:
      "Time to be worth it, whether it is safe to open at a desk, whether it needs sound, and whether it works on a phone. Those four facts are most of why somebody picks one link over another, and most directories make you click through to find them out.",
  },
  {
    question: "Do you track which sites I open?",
    answer:
      "No. The random button remembers what it has already shown you so it does not repeat itself, and that list lives in your browser's session storage — it is never sent anywhere and it is gone when you close the tab.",
  },
  {
    question: "How do you decide what gets in?",
    answer:
      "Two rules. It has to be worth somebody's time, and it has to still be online. Beyond that we favour the parts of the web made by people rather than by engagement targets: personal projects, one-page oddities, archives, and tools that are unreasonably good for free.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "How AltF Detour works",
    description,
    path: "/detour/about",
    keywords: ["about altf detour", "how detour works", "website directory"],
  });
}

export default async function AboutPage() {
  const breadcrumb = createBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Detour", path: "/detour" },
    { name: "About", path: "/detour/about" },
  ]);

  const faq = createFaqJsonLd({ path: "/detour/about", questions: FAQS });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd data={breadcrumb} />
      {faq ? <JsonLd data={faq} /> : null}

      <Link
        href="/detour"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Detour
      </Link>

      <header className="mt-5">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          How Detour works
        </h1>
        <p className="mt-3 text-pretty text-lg text-muted-foreground">
          {BRAND.elevator}
        </p>
      </header>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="text-xl font-bold tracking-tight">What this is</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Two things that usually exist separately. There is a button that
            sends you somewhere at random, which is fun for about four presses
            and then becomes a lottery. And there are long directories of links,
            which tell you a site exists but nothing about what opening it will
            cost you.
          </p>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Detour is both, with the missing information added. Every one of the{" "}
            {STATS.sites.toLocaleString("en-GB")} entries records how long it
            takes to be worth it, whether it is safe to open at a desk, whether
            it needs sound and whether it works on a phone. You can press the
            button blind, or narrow it down first and then press it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold tracking-tight">
            The four time bands
          </h2>
          <dl className="mt-4 space-y-3">
            {TIME_BANDS.map((band) => (
              <div
                key={band.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <dt className="text-sm font-semibold">
                  <Link
                    href={`/detour/time/${band.id}`}
                    className="underline-offset-2 hover:underline"
                  >
                    {band.label}
                  </Link>
                </dt>
                <dd className="mt-1 text-sm text-muted-foreground">
                  {band.hint}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2 className="text-xl font-bold tracking-tight">
            The {VIBES.length} moods
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Moods cut across topics — a calming site might be a game, a map or an
            archive. Each entry carries up to three.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {VIBES.map((vibe) => (
              <li key={vibe.id}>
                <Link
                  href={`/detour/vibes/${vibe.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm transition-colors hover:border-[var(--dtr-accent)]"
                >
                  <span aria-hidden="true">{vibe.emoji}</span>
                  {vibe.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold tracking-tight">Questions</h2>
          <dl className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
            {FAQS.map((item) => (
              <div key={item.question} className="p-5">
                <dt className="text-sm font-semibold">{item.question}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-muted/40 p-6 text-center">
          <h2 className="text-lg font-bold">Something missing?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The directory is only as good as what is in it.
          </p>
          <Link
            href="/detour/submit"
            className="mt-4 inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold"
            style={{ background: "var(--dtr-accent)", color: "var(--dtr-accent-foreground)" }}
          >
            Suggest a site
          </Link>
        </section>
      </div>
    </main>
  );
}
