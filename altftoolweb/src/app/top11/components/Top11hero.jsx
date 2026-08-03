import React from "react";
import Link from "next/link";
import ManagedImage from "@/components/ui/ManagedImage";
import categoryData from "../data/categoryData";

/**
 * Short grid labels. The full `title` in categoryData is a sentence ("Best VPN
 * Services of 2026") and reads badly under a tile, so each slug gets a label
 * here. A slug with no entry falls back to its own words, which means adding a
 * category can never leave a tile blank.
 */
const GRID_LABELS = {
  management: "Management",
  "online-degrees": "Online Degrees",
  vpn: "VPN",
  crm: "CRM",
  voip: "VOIP",
  "web-hosting": "Web Hosting",
  "tv-services": "TV Services",
  "car-selling": "Car Selling",
  "home-warranty": "Home Warranty",
  "online-therapy": "Online Therapy",
};

function labelFor(slug) {
  return (
    GRID_LABELS[slug] ||
    slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

/*
  The grid is derived from categoryData, not from a second hand-maintained
  array. The old copy of this list had drifted from the data in both
  directions: it linked /top11/walk-in-tubs, which has no entry and so returned
  a 404 from the section's primary navigation, and it omitted /top11/vpn, which
  does exist. Deriving the list makes both states unrepresentable.

  Each tile is a real <a> (via next/link) rather than a div with a router.push
  handler. The old version was unreachable by keyboard, exposed no link
  semantics to assistive tech, and gave crawlers nothing to follow — which
  matters more now that the category pages rely on being followed rather than
  indexed.
*/
const categories = Object.keys(categoryData).map((slug) => ({
  slug,
  name: labelFor(slug),
  image: categoryData[slug].banner,
}));

export default function CompareSection() {
  return (
    <section className="w-full py-20 bg-[var(--background)]">
      <div className="max-w-6xl mx-auto px-6 text-center">

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] leading-tight">
          Compare Products &amp; Services by Category
        </h1>

        {/*
          Answer-first, and honest about the process. The old subtitle read
          "Our experts vet, rank, and review the best solutions" — there is no
          expert panel, no vetting and no review behind these pages, and the
          count is now read from the category list rather than asserted.
        */}
        <p className="mt-5 text-[var(--muted-foreground)] max-w-2xl mx-auto">
          {categories.length} categories, each listing a short set of options in
          a fixed editorial order. AltFTool does not test, score or rate the
          products listed.
        </p>

        {/* Grid */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">

          {categories.map((item) => (
            <Link
              key={item.slug}
              href={`/top11/${item.slug}`}
              className="group rounded-xl p-6 flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 motion-reduce:transition-none motion-reduce:transform-none motion-reduce:hover:translate-y-0"
            >
              {/* Image */}
              <div className="w-52 h-35 mb-3 flex items-center justify-center">
                <ManagedImage
                  src={item.image}
                  alt=""
                  className="w-45 h-45 object-cover"
                />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-[var(--foreground)] text-center group-hover:text-[var(--primary)]">
                {item.name}
              </h3>
            </Link>
          ))}

        </div>
      </div>
    </section>
  );
}
