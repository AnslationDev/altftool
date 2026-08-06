import Link from "next/link";
import { ArrowLeft, Check, X } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { STATS } from "@altftool/core/detour";
import {
  CATEGORIES_BY_FAMILY,
  TIME_BANDS,
} from "@altftool/core/detour/taxonomy";
import SubmitForm from "./SubmitForm";

export const revalidate = 86400;

/* Only the fields the form renders cross into the client bundle. */
const FORM_FAMILIES = CATEGORIES_BY_FAMILY.map((family) => ({
  id: family.id,
  name: family.name,
  categories: family.categories.map((category) => ({
    id: category.id,
    name: category.name,
  })),
}));

const FORM_TIME_BANDS = TIME_BANDS.map((band) => ({
  id: band.id,
  label: band.label,
  hint: band.hint,
}));

const description =
  "Suggest a website for the AltF Detour directory. Two rules: it has to be worth somebody's time, and it has to still be online.";

const YES = [
  "Personal projects and one-page oddities",
  "Archives somebody has maintained for years",
  "Tools that are unreasonably good for free",
  "Things that do exactly one strange thing well",
  "Sites that were great in 2009 and still load",
];

const NO = [
  "Anything that needs a paid account to do the main thing",
  "Link farms, AI-generated filler and SEO shells",
  "Shock sites, gore, or anything targeting a real person",
  "Sites that have not been reachable for months",
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "Suggest a site — AltF Detour",
    description,
    path: "/detour/submit",
    keywords: [
      "submit a website",
      "suggest a website",
      "add site to directory",
    ],
  });
}

export default async function SubmitPage() {
  const breadcrumb = createBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Detour", path: "/detour" },
    { name: "Suggest a site", path: "/detour/submit" },
  ]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <JsonLd data={breadcrumb} />

      <Link
        href="/detour"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Detour
      </Link>

      <header className="mt-5">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Suggest a site
        </h1>
        <p className="mt-3 text-pretty text-lg text-muted-foreground">
          There are {STATS.sites.toLocaleString("en-GB")} sites in here and the
          internet is considerably larger than that. If we have missed something,
          tell us.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Especially welcome</h2>
          <ul className="mt-3 space-y-2">
            {YES.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <Check
                  className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
                  style={{ color: "var(--dtr-accent)" }}
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Not a fit</h2>
          <ul className="mt-3 space-y-2">
            {NO.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <X
                  className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="mt-10 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold">Tell us about it</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Only the address is required. Everything else just saves us working it
          out.
        </p>
        <div className="mt-6">
          <SubmitForm families={FORM_FAMILIES} timeBands={FORM_TIME_BANDS} />
        </div>
      </section>
    </main>
  );
}
