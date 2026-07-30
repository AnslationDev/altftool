import books from "@/app/wattpad/data/books.json";
import categories from "@/app/wattpad/data/categories.json";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";
import { notFound } from "next/navigation";
import CategoryStoryList from "@/app/wattpad/components/CategoryStoryList";

import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-static";

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = categories.find((cat) => cat.slug === slug);

  if (!category) {
    return {
      title: "Story Category Not Found",
      robots: { index: false, follow: true },
    };
  }

  const categoryDescription =
    category.description || `${category.name} stories and related reads`;
  return createPageMetadata({
    title: `${category.name} Stories - Wattpad-Style Reads`,
    description: `${categoryDescription}. Explore ${category.name.toLowerCase()} stories, popular chapters, and related reads in AltFTool's browser story library.`,
    path: `/wattpad/category/${category.slug}`,
    image: category.coverImage,
  });
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;

  const category = categories.find(
    (cat) => cat.slug === slug
  );

  if (!category) notFound();

  const filteredBooks = books.filter(
    (book) => book.categoryId === category.id
  );
  const categoryPath = `/wattpad/category/${category.slug}`;
  const jsonLd = [
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Stories", path: "/wattpad" },
      { name: `${category.name} Stories`, path: categoryPath },
    ]),
    createCollectionPageJsonLd({
      path: categoryPath,
      name: `${category.name} Stories`,
      description:
        category.description || `${category.name} stories and related reads`,
    }),
    // The stories this category actually lists, in the order they render.
    createItemListJsonLd({
      path: categoryPath,
      name: `${category.name} stories`,
      items: filteredBooks.map((book) => ({
        name: book.title,
        path: `/wattpad/book/${book.slug}`,
      })),
    }),
  ];

  return (
    <div className="wp-section min-h-screen">
      <JsonLd id={`story-category-${category.slug}-schema`} data={jsonLd} />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
        <div>
          <div className="mb-8">
            <h1 className="wp-section-title">
              {category.name} Stories
            </h1>
            <p className="wp-section-subtitle">
              Explore trending {category.name.toLowerCase()} stories
            </p>
          </div>

          {filteredBooks.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl md:text-2xl font-bold text-(--foreground)">
                Hottest Wattpad Originals
              </h2>
              <p className="text-(--muted-foreground) mt-2 text-sm">
                Read the stories we love
              </p>

              <div className="flex gap-3 overflow-x-auto mt-6 wp-no-scrollbar pb-2">
                {filteredBooks.slice(0, 8).map((book) => (
                  <Link
                    key={book.id}
                    href={`/wattpad/book/${book.slug}`}
                    className="shrink-0"
                  >
                    <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <Image
                        src={book.coverImage}
                        width={180}
                        height={260}
                        alt={book.title}
                        className="w-[120px] h-[180px] sm:w-[140px] sm:h-[210px] md:w-[160px] md:h-[240px] object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <div className="mt-2">
                      <span className="wp-book-tag text-xs py-1 px-3">{book.tags?.[0]}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <CategoryStoryList books={filteredBooks} />
        </div>

        <div className="hidden lg:block">
          <div className="wp-sticky-sidebar space-y-5">
            <p className="text-sm text-(--muted-foreground) text-center mb-2">
              Advertisement
            </p>
            <div className="overflow-hidden rounded-xl">
              <Image
                src="https://images.unsplash.com/photo-1616418625298-baef98bc34f8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGFkdmVydGlzaW5nfGVufDB8fDB8fHww"
                width={400}
                height={700}
                alt="Premium"
                className="w-full h-auto object-cover"
                aria-label="Advertisement"
              />
            </div>
            <p className="text-sm text-(--muted-foreground) text-center mb-2">
              Advertisement
            </p>
            <div className="overflow-hidden rounded-xl">
              <Image
                src="https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200"
                width={400}
                height={700}
                alt="Premium"
                className="w-full h-auto object-cover"
                aria-label="Advertisement"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
