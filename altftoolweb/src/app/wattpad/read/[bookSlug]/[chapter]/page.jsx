import books from "@/app/wattpad/data/books.json";
import chapters from "@/app/wattpad/data/chapters.json";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { notFound } from "next/navigation";

import Link from "next/link";
import TextToSpeech from "@/app/wattpad/components/TextToSpeech";

export function generateStaticParams() {
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

  // Find book
  const book = books.find((item) => item.slug === bookSlug);

  if (!book) notFound();

  // Find chapter
  const currentChapter = chapters.find(
    (item) =>
      item.bookId === book.id &&
      item.chapterNumber === Number(chapter)
  );

  if (!currentChapter) notFound();

  // Next chapter
  const nextChapter = Number(chapter) + 1;

  const hasNextChapter = chapters.find(
    (item) =>
      item.bookId === book.id &&
      item.chapterNumber === nextChapter
  );

  return (
    <div className=" min-h-screen bg-(background)">

      {/* Top */}
      <div className="border-b border-(--border) sticky top-0 bg-(--card) backdrop-blur-xl z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">

          <div>
            <div className="font-bold text-lg">
              {book.title}
            </div>

            <div className="text-sm text(--muted-foreground)-500">
              Chapter {currentChapter.chapterNumber}
            </div>
          </div>

          <Link
            href={`/wattpad/book/${book.slug}`}
            className="text-sm text-(--primary) font-medium cursor-pointer"
          >
            Back to Book
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="section max-w-[800px] mx-auto px-4 py-12 ">

        <h1 className="text-3xl md:text-5xl font-bold mb-10 leading-tight">
          {currentChapter.title}
        </h1>

        <div className="text-[17px] leading-9 text-(--muted-foreground) whitespace-pre-line">
          {currentChapter.content}
        </div>

       

        {/* Continue Button */}
        {hasNextChapter && (
          <div className="mt-16 mb-8 flex justify-center">
            <Link
              href={`/wattpad/read/${book.slug}/${nextChapter}`}
            >
              <button className="bg-(--primary) transition px-8 py-4 rounded-full text-white font-semibold cursor-pointer">
                Continue to Next Part
              </button>
            </Link>
          </div>
        )}

           <TextToSpeech
        text={currentChapter.content}
      />

      </div>
      
    </div>
  );
}
