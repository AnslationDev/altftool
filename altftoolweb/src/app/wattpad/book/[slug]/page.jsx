import books from "@/app/wattpad/data/books.json";
import chapters from "@/app/wattpad/data/chapters.json";
import BookTabs from "@/app/wattpad/components/BookTabs";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";
import { notFound } from "next/navigation";

import Image from "next/image";
import Link from "next/link";

import {
  Eye,
  Star,
  List,
  ChevronRight,
} from "lucide-react";

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

  return createPageMetadata({
    title: `${book.title} - Wattpad-Style Story`,
    description: book.description || book.summary,
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

  const relatedBooks = books
    .filter(
      (item) =>
        item.categoryId === book.categoryId &&
        item.id !== book.id
    )
    .slice(0, 6);

  return (
    <div className="bg-background min-h-screen">
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
                  <div className="w-10 h-10 rounded-full overflow-hidden relative bg-(--muted)">
                    <Image
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                      fill
                      alt="author"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-base text-(--foreground)">
                      {book.authorId}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-5 mt-6 text-sm text-(--muted-foreground)">
                  <div className="flex items-center gap-1.5">
                    <Eye size={18} />
                    <span>{book.stats.views}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star size={18} />
                    <span>{book.stats.totalReviews}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <List size={18} />
                    <span>{book.stats.totalChapters} parts</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-8">
                  <Link
                    href={`/wattpad/read/${book.slug}/1`}
                    className="flex-1 md:flex-none"
                  >
                    <button className="w-full md:w-[400px] h-14 rounded-full bg-(--primary) text-white font-semibold text-base hover:opacity-90 transition cursor-pointer shadow-md hover:shadow-lg">
                      Start reading
                    </button>
                  </Link>
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
                              <Eye size={16} />{item.stats.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <List size={16} /> {item.stats.totalChapters} parts
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
              <div className="overflow-hidden rounded-xl">
                <Image
                  src="https://images.unsplash.com/photo-1616418625298-baef98bc34f8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGFkdmVydGlzaW5nfGVufDB8fDB8fHww"
                  width={320}
                  height={500}
                  alt="Advertisement"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
