import PageView from "./PageView";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { resolveBrandDetailRoute } from "../../catalog";

function formatBrandName(slug) {
  return String(slug || "Brand")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// Path segments the UI hard-codes in its own links (/brandrating/categories/…).
// They are not category names, so they never become a breadcrumb level.
const LINK_SEGMENTS = new Set(["categories", "subcategories", "pdetail"]);

/**
 * Both leading segments were decorative, so one brand had unlimited indexable
 * URLs: /brandrating/home-and-lifestyle/mattresses/nectar (the sitemap URL) and
 * /brandrating/mattresses/pdetail/nectar (what the hub actually links) shipped
 * byte-identical titles, descriptions and bodies, each with its own
 * self-referencing canonical, and /brandrating/zzz/pdetail/nectar minted
 * another. catalog.js exists to resolve a brand to the single path the sitemap
 * advertises; nothing had imported it.
 *
 * Resolved URLs now all canonicalise onto that one path, and anything the
 * catalogue does not recognise is noindex. Nothing 404s — the legacy shapes are
 * still linked from the UI, so they keep answering.
 */
async function resolve(params) {
  const { slug, category, pdetail } = await params;
  const { status, brand } = await resolveBrandDetailRoute({ slug, category, pdetail });
  return {
    slug,
    category,
    pdetail,
    status,
    brandName: brand?.name || formatBrandName(pdetail),
    path: brand?.canonicalPath || `/brandrating/${slug}/${category}/${pdetail}`,
  };
}

export async function generateMetadata({ params }) {
  const { status, brandName, path } = await resolve(params);

  return createPageMetadata({
    title: `${brandName} Review, Rating & Alternatives | AltFTool`,
    description: `Review ${brandName} ratings, features, comparisons, alternatives, and FAQs on AltFTool before you choose.`,
    path,
    // "unavailable" means the catalogue could not be read, so a real brand and
    // a made-up one are indistinguishable here — noindex covers both.
    noindex: status !== "ok",
  });
}

export default async function Page(props) {
  const { slug, category, pdetail, brandName, path } = await resolve(props.params);

  return (
    <>
      {/* Breadcrumb only. Everything this page shows about the brand — score,
          features, comparison table — is fetched client-side from Firestore and
          is editorial, and the review strip is the same static
          (data)/reviews.json used by every brand route. Emitting Product,
          Review or AggregateRating here would be markup we cannot substantiate.
          The first path segment is skipped: /brandrating/[slug] has no page. */}
      <JsonLd
        id={`brandrating-${pdetail}-schema`}
        data={createBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Brand Rating", path: "/brandrating" },
          LINK_SEGMENTS.has(String(category).toLowerCase())
            ? null
            : {
                name: formatBrandName(category),
                path: `/brandrating/${slug}/${category}`,
              },
          { name: brandName, path },
        ])}
      />
      <PageView {...props} />
    </>
  );
}
