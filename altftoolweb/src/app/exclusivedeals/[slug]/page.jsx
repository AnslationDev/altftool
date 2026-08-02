// No generateMetadata here on purpose. layout.jsx already resolves the
// record and builds metadata from the category name; Next takes the deepest
// segment's metadata, so the hardcoded title that used to live here
// overrode all of it and every URL in this family shipped the same one.

import dealData from "../(data)/db.json";
import PageView from "./PageView";

/**
 * Route-level name for the heading when the slug matches no category.
 * The slug is always in the URL, so the H1 never depends on a lookup that can
 * miss — an unnamed page is worse than one named from its own path.
 */
function categoryNameFromSlug(slug = "") {
  const words = String(slug)
    .split("-")
    .filter(Boolean)
    .map((word) => (word.length <= 2 ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1)));
  return words.length ? words.join(" ") : "Exclusive";
}

export default async function Page(props) {
  const { slug } = await props.params;
  const category = (dealData.categories || []).find((item) => item.slug === slug);
  const headingName = category?.categoryName || categoryNameFromSlug(slug);

  return (
    <>
      {/* All 12 category URLs shipped no H1 at all: the highest heading in
          CategoryBrand.jsx is the sidebar's "STORE CATEGORIES" H2. Rendered on
          the server so it does not wait on the client view, and visually
          hidden because the layout has no title slot to put it in. */}
      <h1 className="sr-only">{headingName} deals, coupons and brand offers</h1>
      <PageView {...props} />
    </>
  );
}
