import Link from "next/link";
import { PackageX } from "lucide-react";

import "../../bazaar.css";

import BazaarShell from "../../components/BazaarShell";
import { EmptyState, LinkCloud } from "../../components/primitives";
import { getAllCategories } from "../../data/categories";
import { getPopularCities } from "../../data/cities";

/**
 * Shown when an ad slug does not resolve — usually a sold or expired listing,
 * or a stale link from somewhere off-site.
 *
 * A dead end is a wasted visit, so this page offers the two things a person
 * who wanted a specific ad will accept instead: the same category, and the
 * same city.
 */
export default function ItemNotFound() {
  const categories = getAllCategories().slice(0, 12);
  const cities = getPopularCities(12);

  return (
    <BazaarShell>
      <div className="section-container px-4 pb-16 pt-8 sm:px-6">
        <EmptyState
          title="This ad is no longer available"
          message="It may have been sold, withdrawn by the seller, or removed for breaking our posting rules. Browse similar ads instead."
          action={
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <Link href="/bazaar" className="bzr-btn">
                <PackageX className="h-4 w-4" aria-hidden="true" />
                Back to AltF Bazaar
              </Link>
              <Link href="/bazaar/categories" className="bzr-btn bzr-btn-secondary">
                Browse all categories
              </Link>
            </div>
          }
        />

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          <LinkCloud
            title="Popular categories"
            links={categories.map((category) => ({
              href: `/bazaar/c/${category.slug}`,
              label: category.name,
            }))}
          />
          <LinkCloud
            title="Popular cities"
            links={cities.map((city) => ({
              href: `/bazaar/in/${city.slug}`,
              label: city.name,
            }))}
          />
        </div>
      </div>
    </BazaarShell>
  );
}
