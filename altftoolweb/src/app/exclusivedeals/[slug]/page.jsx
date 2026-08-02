// No generateMetadata here on purpose. layout.jsx already resolves the
// record and builds metadata from the category name; Next takes the deepest
// segment's metadata, so the hardcoded title that used to live here
// overrode all of it and every URL in this family shipped the same one.

import dealData from "../(data)/db.json";

import PageView from "./PageView";

function findCategory(slug) {
  return (dealData.categories || []).find((category) => category.slug === slug);
}

export default async function Page(props) {
  const { slug } = await props.params;
  const category = findCategory(slug);

  // The body of this route is CategoryBrand.jsx, whose highest heading is the
  // sidebar's "STORE CATEGORIES" <h2> — so every one of these category URLs
  // shipped with no <h1> at all. It is rendered here, on the server, from the
  // same db.json record layout.jsx builds the title from, so it is present for
  // crawlers that never run the client component.
  return (
    <>
      {category ? (
        <header className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 md:pt-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-(--foreground)">
            {category.categoryName} Deals, Coupons &amp; Offers
          </h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-(--muted-foreground)">
            Browse {(category.brands || []).length} {category.categoryName.toLowerCase()}{" "}
            brands with coupons and deals listed on AltFTool.
          </p>
        </header>
      ) : null}
      <PageView {...props} />
    </>
  );
}
