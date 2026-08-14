import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { formatUsd } from "@altftool/core/ideas";
import { VERTICALS } from "@altftool/core/ideas/taxonomy";
import { getFacets, getManifest } from "@altftool/core/ideas/corpus";

const description =
  "Startup ideas grouped by industry, with software market size, category growth, and how much open field is left in each.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Startup ideas by industry — 60 verticals mapped and scored",
    description,
    path: "/ideas/verticals",
    keywords: ["startup ideas by industry", "vertical SaaS ideas", "industry software opportunities"],
  });
}

export default async function VerticalsIndexPage() {
  const [facets, manifest] = await Promise.all([getFacets(), getManifest()]);

  const rows = VERTICALS.map((v) => ({
    ...v,
    count: facets.vertical[v.slug] ?? 0,
  })).sort((a, b) => b.count - a.count);

  return (
    <>
      <JsonLd
        id="altf-ideas-verticals"
        data={[
          createCollectionPageJsonLd({
            path: "/ideas/verticals",
            name: "Startup ideas by industry",
            description,
          }),
          createItemListJsonLd({
            path: "/ideas/verticals",
            name: "Industries covered by AltF Ideas",
            items: rows.map((v) => ({ name: v.name, path: `/ideas/verticals/${v.slug}` })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Ideas", path: "/ideas" },
            { name: "Verticals", path: "/ideas/verticals" },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 py-5 font-mono text-xs text-muted-foreground">
          <Link href="/ideas" className="hover:text-primary">Ideas</Link>
          <span aria-hidden="true" className="opacity-40">/</span>
          <span className="text-foreground">Verticals</span>
        </nav>

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            By industry
          </span>
          <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            {VERTICALS.length} industries, all mapped
          </h1>
          <p className="mt-4 max-w-[62ch] text-[clamp(1rem,1.3vw,1.0625rem)] leading-relaxed text-muted-foreground">
            AltF Ideas covers {manifest.total.toLocaleString("en-US")} startup ideas across{" "}
            {VERTICALS.length} industries. Open field is the inverse of crowding — a high score means
            incumbents have not covered the workflows properly, which is usually where a small team
            can still win.
          </p>
        </header>

        <section className="py-8">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">Industries by number of scored ideas</caption>
              <thead>
                <tr className="bg-canvas">
                  {["Industry", "Ideas", "Software TAM", "Growth", "Open field"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-3.5 py-3 text-left font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((v) => (
                  <tr key={v.slug} className="border-t border-border hover:bg-surface-soft">
                    <td className="px-3.5 py-3">
                      <Link
                        href={`/ideas/verticals/${v.slug}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {v.name}
                      </Link>
                    </td>
                    <td className="px-3.5 py-3 font-mono tabular-nums text-muted-foreground">
                      {v.count.toLocaleString("en-US")}
                    </td>
                    <td className="px-3.5 py-3 font-mono tabular-nums text-muted-foreground">
                      {formatUsd(v.tam)}
                    </td>
                    <td className="px-3.5 py-3 font-mono tabular-nums text-muted-foreground">
                      {v.cagr}%
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="flex items-center gap-2">
                        <span className="afi-signal-row__track w-20">
                          <span
                            className="afi-signal-row__fill"
                            style={{ background: "var(--afi-competition)", width: `${v.o}%` }}
                          />
                        </span>
                        <span className="font-mono text-xs tabular-nums text-muted-foreground">
                          {v.o}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
