import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/app/tripfindbox/components/HeroSection";
import ResultsHeader from "@/app/tripfindbox/components/ResultsHeader";
import { sitemapSections, slugifyPageTitle } from "@/app/tripfindbox/lib/sitemapPages";
import { tfbPath } from "@/app/tripfindbox/lib/tfbLink";

export default function SiteMapPage() {
  return (
    <main className="sitemap-page">
      <ResultsHeader />
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
