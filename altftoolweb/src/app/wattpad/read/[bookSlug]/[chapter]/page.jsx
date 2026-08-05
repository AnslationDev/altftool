import books from "@/app/wattpad/data/books.json";
import chapters from "@/app/wattpad/data/chapters.json";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createArticleJsonLd,
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";
import { notFound } from "next/navigation";

import Link from "next/link";
import TextToSpeech from "@/app/wattpad/components/TextToSpeech";

export const dynamic = "force-static";

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return chapters.flatMap((chapter) => {
    const book = books.find((item) => item.id === chapter.bookId);
    return book
      ? [{ bookSlug: book.slug, chapter: String(chapter.chapterNumber) }]
      : [];
  });
}

export async function generateMetadata({ params }) {
  const { bookSlug, chapter } = await params;
  const book = books.find((item) => item.slug === bookSlug);
  const currentChapter = book
    ? chapters.find((item) => item.bookId === book.id && item.chapterNumber === Number(chapter))
    : null;

  if (!book || !currentChapter) {
    // Measured on production before this change:
    // /wattpad/read/midnight-desires/1 returned 200 with
    // <link rel="canonical" href="https://www.altftool.com"> and the sitewide
    // boilerplate as its description. Returning a bare {title, robots} object
    // skips createPageMetadata, so no canonical and no description were ever
    // built and Next fell back to the site root — pointing every missing
    // chapter at the homepage as its canonical. 7 of the 8 books have no
    // chapters at all, so this branch is the common case, not the edge.
    return createPageMetadata({
      title: "Chapter Not Found",
      description:
        "This story chapter is not available on AltFTool. Browse the story's published parts or explore other Wattpad-style reads in the library.",
      path: `/wattpad/read/${encodeURIComponent(bookSlug)}/${encodeURIComponent(chapter)}`,
      noindex: true,
    });
  }

  return createPageMetadata({
    title: `${currentChapter.title} - ${book.title}`,
    description: `${book.title}, chapter ${currentChapter.chapterNumber}: ${currentChapter.title}. Read this chapter online and continue through the available story parts on AltFTool.`,
    path: `/wattpad/read/${book.slug}/${currentChapter.chapterNumber}`,
    image: book.coverImage || book.bannerImage,
    type: "article",
  });
}

export default async function ReaderPage({ params }) {
  const { bookSlug, chapter } = await params;

  const book = books.find((item) => item.slug === bookSlug);
  if (!book) notFound();

  const currentChapter = chapters.find(
    (item) =>
      item.bookId === book.id &&
      item.chapterNumber === Number(chapter)
  );

  if (!currentChapter) notFound();

  const nextChapter = Number(chapter) + 1;
  const hasNextChapter = chapters.find(
    (item) =>
      item.bookId === book.id &&
      item.chapterNumber === nextChapter
  );
  const chapterPath = `/wattpad/read/${book.slug}/${currentChapter.chapterNumber}`;
  const jsonLd = [
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Stories", path: "/wattpad" },
      { name: book.title, path: `/wattpad/book/${book.slug}` },
      { name: currentChapter.title, path: chapterPath },
    ]),
    createArticleJsonLd({
      path: chapterPath,
      headline: `${currentChapter.title} - ${book.title}`,
      description: currentChapter.content,
      image: book.coverImage || book.bannerImage,
      datePublished: currentChapter.createdAt || book.createdAt,
      author: book.authorId,
    }),
  ];

  return (
    <div className="min-h-screen bg-background">
      <JsonLd
        id={`story-${book.slug}-chapter-${currentChapter.chapterNumber}-schema`}
        data={jsonLd}
      />
      <div className="wp-reader-header">
        <div className="wp-reader-header-inner">
          <div>
            <div className="wp-reader-book-title">{book.title}</div>
            <div className="wp-reader-chapter-label">Chapter {currentChapter.chapterNumber}</div>
          </div>
          <Link
            href={`/wattpad/book/${book.slug}`}
            className="wp-reader-back"
          >
            Back to Book
          </Link>
        </div>
      </div>

      <div className="wp-reader-content">
        <h1 className="wp-reader-chapter-title">
          {currentChapter.title}
        </h1>

        <div className="wp-reader-body">
          {currentChapter.content}
        </div>

        {hasNextChapter && (
          <div className="mt-16 mb-8 flex justify-center">
            <Link href={`/wattpad/read/${book.slug}/${nextChapter}`}>
              <button className="wp-reader-btn">
                Continue to Next Part
              </button>
            </Link>
          </div>
        )}

        <TextToSpeech text={currentChapter.content} />
      </div>
    </div>
  );
}
