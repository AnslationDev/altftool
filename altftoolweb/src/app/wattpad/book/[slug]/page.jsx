import books from "@/app/wattpad/data/books.json";
import chapters from "@/app/wattpad/data/chapters.json";
import BookTabs from "@/app/wattpad/components/BookTabs";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBookJsonLd,
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";
import { notFound } from "next/navigation";

import Image from "next/image";
import Link from "next/link";

import { List } from "lucide-react";

// Chapter counts are derived from chapters.json so the page can only ever show
// the number of parts that actually exist. The catalogue carries no rating,
// review-count, view-count or price data, so none is displayed.
function countChapters(bookId) {
  return chapters.filter((chapter) => chapter.bookId === bookId).length;
}

export const dynamic = "force-static";

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return books.map((book) => ({ slug: book.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const book = books.find((item) => item.slug === slug);

  if (!book) {
    return {
      title: "Story Not Found",
      robots: { index: false, follow: true },
    };
  }

  const storyDescription = book.description || book.summary || "";
  return createPageMetadata({
    title: `${book.title} - Wattpad-Style Story`,
    description: `${storyDescription} Read ${book.title} online, browse its available chapters, and discover related stories in AltFTool's browser reading library.`,
    path: `/wattpad/book/${book.slug}`,
    image: book.coverImage || book.bannerImage,
    type: "book",
  });
}

export default async function BookDetailPage({ params }) {
  const { slug } = await params;

  const book = books.find((item) => item.slug === slug);
  if (!book) notFound();

  const bookChapters = chapters.filter(
    (chapter) => chapter.bookId === book.id
  );
  const firstChapter = bookChapters
    .slice()
    .sort((a, b) => a.chapterNumber - b.chapterNumber)[0];

  const relatedBooks = books
    .filter(
      (item) =>
        item.categoryId === book.categoryId &&
        item.id !== book.id
    )
    .slice(0, 6);
  const bookPath = `/wattpad/book/${book.slug}`;
  const jsonLd = [
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Stories", path: "/wattpad" },
      { name: book.title, path: bookPath },
    ]),
    createBookJsonLd({ book, path: bookPath }),
  ];

  return (
    <main className="min-h-screen bg-background">
      <JsonLd id={`story-${book.slug}-schema`} data={jsonLd} />
      <div className="wp-section pt-8 lg:pt-12">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-10 items-start">
          <div className="min-w-0">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="shrink-0 mx-auto md:mx-0">
                <div className="relative w-[210px] h-[315px] rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src={book.coverImage}
                    fill
                    alt={book.title}
                    sizes="210px"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-3xl md:text-4xl leading-tight tracking-tight font-extrabold text-(--foreground)">
                  {book.title}
                </h1>

                <div className="flex items-center gap-3 mt-4">
                  <div>
                    <p className="font-medium text-base text-(--foreground)">
                      {book.authorId}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-5 mt-6 text-sm text-(--muted-foreground)">
                  <div className="flex items-center gap-1.5">
                    <List size={18} />
                    <span>
                      {bookChapters.length} {bookChapters.length === 1 ? "part" : "parts"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-8">
                  {firstChapter ? (
                    <Link
                      href={`/wattpad/read/${book.slug}/${firstChapter.chapterNumber}`}
                      className="flex h-14 flex-1 items-center justify-center rounded-full bg-(--primary) text-base font-semibold text-primary-foreground shadow-md transition hover:opacity-90 hover:shadow-lg md:w-[400px] md:flex-none"
                    >
                      Start reading
                    </Link>
                  ) : (
                    <p className="flex h-14 flex-1 items-center justify-center rounded-full border border-(--border) bg-(--muted) text-base font-semibold text-(--muted-foreground) md:w-[400px] md:flex-none">
                      No parts published yet
                    </p>
                  )}
                </div>
              </div>
            </div>

            <BookTabs book={book} bookChapters={bookChapters} />

            {relatedBooks.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-extrabold tracking-tight mb-6 text-(--foreground)">
                  You may also like
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {relatedBooks.map((item, index) => (
                    <Link
                      key={item.id}
                      href={`/wattpad/book/${item.slug}`}
                    >
                      <div className="wp-related-card">
                        <div className="wp-related-cover">
                          <Image
                            src={item.coverImage}
                            width={170}
                            height={260}
                            alt={item.title}
                            className="w-full h-[170px] sm:h-[190px] md:h-[220px] object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                        <div className="flex flex-col justify-start pt-1">
                          <h3 className="wp-related-title">
                            <span className="wp-related-number">{index + 1}.</span> {item.title}
                          </h3>
                          <p className="wp-related-author">{item.authorId}</p>
                          <div className="wp-related-stats">
                            <span className="flex items-center gap-1">
                              <List size={16} /> {countChapters(item.id)} parts
                            </span>
                          </div>
                          <p className="wp-related-summary">{item.summary}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.tags?.slice(0, 3).map((tag) => (
                              <span key={tag} className="wp-book-tag text-xs py-1">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="hidden xl:block wp-sticky-sidebar">
            <div>
              <p className="text-sm text-(--muted-foreground) text-center mb-3">
                Advertisement
              </p>
              <div className="relative aspect-[16/25] w-full overflow-hidden rounded-xl">
                <Image
                  src="https://images.unsplash.com/photo-1616418625298-baef98bc34f8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGFkdmVydGlzaW5nfGVufDB8fDB8fHww"
                  fill
                  sizes="320px"
                  alt="Advertisement"
                  className="object-cover"
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
