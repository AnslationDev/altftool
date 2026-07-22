import books from "@/app/wattpad/data/books.json";
import chapters from "@/app/wattpad/data/chapters.json";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";
import { notFound } from "next/navigation";

import Link from "next/link";
import TextToSpeech from "@/app/wattpad/components/TextToSpeech";

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
    return {
      title: "Chapter Not Found",
      robots: { index: false, follow: true },
    };
  }

  return createPageMetadata({
    title: `${currentChapter.title} - ${book.title}`,
    description: `${book.title}, chapter ${currentChapter.chapterNumber}: ${currentChapter.title}.`,
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

  return (
    <div className="min-h-screen bg-background">
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
