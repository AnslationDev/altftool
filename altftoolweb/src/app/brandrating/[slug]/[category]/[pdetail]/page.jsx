import JsonLd from "@/platform/seo/JsonLd";
import VerificationPreview from "@/app/brandrating/(components)/VerificationPreview";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { resolveBrandDetailRoute } from "../../catalog";

/**
 * Both leading segments were decorative, so one brand had unlimited indexable
 * URLs: /brandrating/home-and-lifestyle/mattresses/nectar (the canonical URL) and
 * /brandrating/mattresses/pdetail/nectar (what the hub actually links) shipped
 * byte-identical titles, descriptions and bodies, each with its own
 * self-referencing canonical, and /brandrating/zzz/pdetail/nectar minted
 * another. catalog.js resolves a brand to one stable canonical path.
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
    brandName: brand?.name || "Brand",
    subcategoryName: brand?.subcategoryName || "",
    subcategoryPath: brand
      ? `/brandrating/${brand.categorySlug}/${brand.subcategorySlug}`
      : "",
    path: brand?.canonicalPath || `/brandrating/${slug}/${category}/${pdetail}`,
  };
}

export async function generateMetadata({ params }) {
  const { brandName, path } = await resolve(params);

  return createPageMetadata({
    title: `${brandName} Source Verification Preview | AltFTool`,
    description: `Source verification preview for ${brandName} brand information on AltFTool.`,
    path,
    // The route stays out of search until its source pipeline is complete.
    noindex: true,
    follow: true,
  });
}

export default async function Page(props) {
  const { pdetail, brandName, subcategoryName, subcategoryPath, path } = await resolve(props.params);

  return (
    <>
      {/* Breadcrumb only. The compatibility screen intentionally exposes no
          Product, Review, AggregateRating, offer, or recommendation data. */}
      <JsonLd
        id={`brandrating-${pdetail}-schema`}
        data={createBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Brand Rating", path: "/brandrating" },
          subcategoryName
            ? { name: subcategoryName, path: subcategoryPath }
            : null,
          { name: brandName, path },
        ])}
      />
      <VerificationPreview entityName={brandName} entityType="brand" />
    </>
  );
}
