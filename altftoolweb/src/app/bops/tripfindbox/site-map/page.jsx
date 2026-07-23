import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/app/bops/tripfindbox/components/HeroSection";
import ResultsHeader from "@/app/bops/tripfindbox/components/ResultsHeader";
import { getTripFindBoxContactInfo } from "@/app/bops/tripfindbox/lib/contactInfo";
import { sitemapSections, slugifyPageTitle } from "@/app/bops/tripfindbox/lib/sitemapPages";
import { tfbPath } from "@/app/bops/tripfindbox/lib/tfbLink";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Sitemap | TripFindBox",
    description: "Explore TripFindBox flight routes, travel deal categories, and helpful planning pages.",
    path: "/bops/tripfindbox/site-map",
  });
}

export default async function SiteMapPage() {
  const contact = await getTripFindBoxContactInfo();

  return (
    <main className="sitemap-page">
      <ResultsHeader initialContact={contact} />
      <section className="sitemap-hero" style={{ width: "min(1120px, calc(100% - 48px))", maxWidth: "1120px", marginInline: "auto" }}>
        <h1>Sitemap</h1>
        <p>Explore TripFindBox flight routes, travel deal categories, and helpful planning pages.</p>
      </section>
      <div className="sitemap-content">
        {sitemapSections.map((section) => (
          <section className="sitemap-section" key={section.title}>
            <div className="sitemap-inner" style={{ width: "min(1120px, calc(100% - 48px))", maxWidth: "1120px", marginInline: "auto" }}>
              <details className="sitemap-group" open>
                <summary>
                  <span>{section.title}</span>
                </summary>
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>
                      <ChevronRight size={15} />
                      <Link href={tfbPath(`/${slugifyPageTitle(item)}`)}>{item}</Link>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </section>
        ))}
      </div>
      <Footer />
    </main>
  );
}
